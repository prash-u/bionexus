import { describe, expect, it } from "vitest";
import { scenarioPresets } from "@/data/scenarios/presets";
import { molecularEdges } from "@/data/scenarios/molecularEdges";
import { normalizeReactomeReaction, reactomeParticipantsUrl, reactomeQueryUrl, validateMolecularEdge, wikiPathwaysGpmlUrl } from "@/lib/molecular/importAdapters";
import { fetchReactomeReactionEdge } from "@/lib/molecular/liveImport";
import { createNeuralCircuitState, neuralStateToBodyPatch, updateNeuralStimulationState } from "@/lib/neural/neuralEngine";
import { createNetworkPulseImport, rankNetworkGenes } from "@/lib/network/networkPulseImport";
import { buildSandboxSimulationResult, defaultParameters } from "@/lib/sandbox/simulation";
import type { MolecularEdge, NetworkPulseImport } from "@/lib/ontology/types";

const build = (presetId: string, overrides: Partial<typeof defaultParameters> = {}, importedMolecularEdges: MolecularEdge[] = [], activeNetworkPulseImport?: NetworkPulseImport) => {
  const preset = scenarioPresets.find((item) => item.id === presetId) ?? scenarioPresets[0];
  return buildSandboxSimulationResult({
    preset,
    parameters: { ...defaultParameters, ...overrides },
    selectedRegionId: preset.affectedRegions[0],
    predispositions: preset.predispositions,
    perturbations: preset.perturbations,
    interventions: preset.interventions.slice(0, 1),
    pathwayTuning: {},
    importedMolecularEdges,
    activeNetworkPulseImport
  });
};

describe("sandbox simulation", () => {
  it("creates molecular edges and upstream backtrace candidates for every preset", () => {
    scenarioPresets.forEach((preset) => {
      const result = build(preset.id);

      expect(result.organEffects.length).toBeGreaterThan(0);
      expect(result.backtraceCandidates.length).toBeGreaterThan(0);
      expect(result.molecularEdges.length).toBeGreaterThan(0);
      expect(result.summary).toContain(preset.shortTitle);
    });
  });

  it("reacts to changed body attributes", () => {
    const baseline = build("metabolic-dysfunction");
    const perturbed = build("metabolic-dysfunction", {
      insulinSensitivity: 0.18,
      metabolicLoad: 0.84,
      inflammation: 0.62
    });

    const baselineGlucose = baseline.observables.find((item) => item.id === "glucosePressure")?.current ?? 0;
    const perturbedGlucose = perturbed.observables.find((item) => item.id === "glucosePressure")?.current ?? 0;

    expect(perturbedGlucose).toBeGreaterThan(baselineGlucose);
    expect(perturbed.backtraceCandidates[0]?.geneSymbol).toBeTruthy();
  });

  it("keeps molecular payloads source-referenced", () => {
    const result = build("inflammatory-activation", { immuneActivation: 0.9 });
    const payloads = result.molecularEdges.flatMap((edge) => edge.payloads);

    expect(payloads.some((payload) => payload.molecule === "IL-6")).toBe(true);
    expect(payloads.every((payload) => payload.sources.length > 0)).toBe(true);
    expect(payloads.every((payload) => payload.ratio.length > 0)).toBe(true);
    expect(payloads.every((payload) => payload.provenance)).toBe(true);
    expect(payloads.every((payload) => payload.ratioBasis)).toBe(true);
  });

  it("validates molecular edge provenance claims", () => {
    const issues = molecularEdges.flatMap(validateMolecularEdge);
    const exactPayloads = molecularEdges.flatMap((edge) => edge.payloads).filter((payload) => payload.provenance === "database_exact");

    expect(issues).toEqual([]);
    expect(exactPayloads.length).toBeGreaterThan(0);
    expect(exactPayloads.every((payload) => payload.ratioBasis === "database_stoichiometry")).toBe(true);
  });

  it("normalizes a Reactome reaction record into exact payloads", () => {
    const edge = normalizeReactomeReaction(
      {
        stId: "R-HSA-TEST",
        displayName: "Demo reaction",
        input: [
          { displayName: "D-glucose [cytosol]", stId: "R-HSA-GLUCOSE", schemaClass: "SimpleEntity" },
          { displayName: "D-glucose [cytosol]", stId: "R-HSA-GLUCOSE", schemaClass: "SimpleEntity" }
        ],
        output: [{ displayName: "L-lactate [cytosol]", stId: "R-HSA-LACTATE", schemaClass: "SimpleEntity" }]
      },
      {
        id: "edge-reactome-test",
        scenarioIds: ["metabolic-dysfunction"],
        sourceRegionId: "muscle",
        targetRegionId: "liver",
        edgeKind: "reaction",
        pathwayContext: "Adapter unit test"
      }
    );

    expect(edge.payloads[0].ratio).toBe("2 D-glucose input");
    expect(edge.payloads.every((payload) => payload.provenance === "database_exact")).toBe(true);
    expect(validateMolecularEdge(edge)).toEqual([]);
    expect(reactomeQueryUrl("R-HSA-TEST")).toContain("/data/query/R-HSA-TEST");
    expect(reactomeParticipantsUrl("R-HSA-TEST")).toContain("/participatingPhysicalEntities");
    expect(wikiPathwaysGpmlUrl("WP481")).toContain("WP481.gpml");
  });

  it("imports a Reactome reaction edge and merges it into the sandbox simulation", async () => {
    const fetcher: typeof fetch = async () =>
      new Response(JSON.stringify({
        stId: "R-HSA-74716",
        displayName: "Insulin binds the insulin receptor",
        input: [
          { dbId: 74675, displayName: "Insulin receptor [plasma membrane]", stId: "R-HSA-74675", schemaClass: "EntityWithAccessionedSequence" },
          { dbId: 74702, displayName: "Insulin [extracellular region]", stId: "R-HSA-74702", schemaClass: "EntityWithAccessionedSequence" }
        ],
        output: [
          { dbId: 74703, displayName: "Insulin:Insulin receptor [plasma membrane]", stId: "R-HSA-74703", schemaClass: "Complex" }
        ],
        compartment: [{ displayName: "external side of plasma membrane" }]
      }), { status: 200, headers: { "Content-Type": "application/json" } });

    const { edge, snapshot } = await fetchReactomeReactionEdge({
      stableId: "r-hsa-74716",
      scenarioId: "metabolic-dysfunction",
      sourceRegionId: "pancreas",
      targetRegionId: "muscle",
      edgeKind: "endocrine",
      pathwayContext: "Insulin receptor binding test import",
      fetcher
    });
    const result = build("metabolic-dysfunction", {}, [edge]);

    expect(snapshot.status).toBe("ready");
    expect(edge.payloads.map((payload) => payload.molecule)).toContain("Insulin");
    expect(result.molecularEdges.some((item) => item.id === edge.id)).toBe(true);
  });

  it("imports Network Pulse-style gene, edge and pathway tables into backtrace candidates", () => {
    const imported = createNetworkPulseImport({
      label: "Metabolic signal",
      scenarioId: "metabolic-dysfunction",
      genesCsv: `symbol,name,log2FC,pAdj
INSR,Insulin receptor,-2.4,1e-8
IRS1,Insulin receptor substrate 1,-1.8,2e-7
SLC2A4,GLUT4 glucose transporter,-2.1,5e-8`,
      edgesCsv: `source,target,score
INSR,IRS1,0.95
IRS1,SLC2A4,0.91`,
      pathwaysCsv: `name,source,pValue,genes
Insulin signalling,Reactome,1e-9,INSR|IRS1|SLC2A4`
    });
    const result = build("metabolic-dysfunction", {}, [], imported);
    const ranked = rankNetworkGenes(imported);

    expect(imported.summary).toContain("3 genes");
    expect(ranked[0].degree).toBeGreaterThan(0);
    expect(result.backtraceCandidates[0]?.evidenceIds).toContain("network-pulse-import");
    expect(result.pathwayDeltas["Insulin signalling"]).toBeGreaterThan(0);
  });

  it("maps Neural Pulse-style DBS state into body sandbox parameters", () => {
    const baseline = createNeuralCircuitState("parkinsonian");
    const tuned = updateNeuralStimulationState(baseline, {
      enabled: true,
      amplitude: 0.86,
      frequency: 128,
      pulseWidth: 94,
      radius: 0.42
    });
    const bodyPatch = neuralStateToBodyPatch(tuned);

    expect(tuned.metrics.suppressionScore).toBeGreaterThan(baseline.metrics.suppressionScore);
    expect(bodyPatch.parameters.neuralSynchrony).toBeGreaterThanOrEqual(0);
    expect(bodyPatch.parameters.neuralSynchrony).toBeLessThanOrEqual(1);
    expect(bodyPatch.summary).toContain("Neural state sent to Body Sandbox");
  });
});
