import type { BioWorkspaceState, ReportPayload, SandboxState, ScenarioPreset } from "@/lib/ontology/types";
import { molecularProvenanceLabel } from "@/lib/molecular/importAdapters";
import { intendedUseStatement } from "@/lib/safety/intendedUse";

export function buildReport(mode: ReportPayload["mode"], workspace: BioWorkspaceState, sandbox: SandboxState, activePreset: ScenarioPreset): ReportPayload {
  const titleMap = {
    learner: "Learner Report",
    educatorSummary: "Educator Summary",
    researchBrief: "Research Brief",
    investorDemo: "Investor Demonstration",
    scenarioExport: "Scenario Export"
  };
  const entitySummary = workspace.entities
    .slice(0, 14)
    .map((entity) => `- ${entity.layer}: ${entity.shortName ?? entity.name} - ${entity.description}`)
    .join("\n");
  const relationshipSummary = workspace.relationships
    .slice(0, 12)
    .map((relationship) => `- ${relationship.label} (${Math.round(relationship.confidence * 100)}% demo confidence)`)
    .join("\n");
  const hypothesisSummary = workspace.hypotheses
    .map((hypothesis) => `- ${hypothesis.title} [${hypothesis.status.replace(/_/g, " ")}]: ${hypothesis.question}`)
    .join("\n") || "- No user-authored hypotheses yet.";
  const selectedInterventions = sandbox.scenario.interventions.map((item) => `- ${item.label}: ${item.expectedDirection} ${item.affectedPathwayOrSystem}; uncertainty ${item.uncertainty}%`).join("\n") || "- No interventions selected.";
  const bodySummary = sandbox.simulationResult.organEffects.map((effect) => `- ${effect.organ}: ${effect.label} (${effect.direction}, ${effect.magnitude}%)`).join("\n");
  const observableSummary = sandbox.simulationResult.observables.map((observable) => `- ${observable.label}: ${Math.round(observable.current * 100)}% (${observable.delta >= 0 ? "+" : ""}${observable.delta.toFixed(2)} ${observable.unit})`).join("\n");
  const molecularSummary = sandbox.simulationResult.molecularEdges.map((edge) => `- ${edge.label}: ${edge.payloads.map((payload) => `${payload.molecule} [${payload.ratio}; ${molecularProvenanceLabel(payload)}; ${payload.ratioBasis.replace(/_/g, " ")}]`).join("; ")}`).join("\n");
  const molecularImportSummary = sandbox.molecularImportSnapshots.length
    ? sandbox.molecularImportSnapshots.map((snapshot) => `- ${snapshot.source} ${snapshot.query}: ${snapshot.status} - ${snapshot.label}${snapshot.message ? ` (${snapshot.message})` : ""}`).join("\n")
    : "- No live molecular imports recorded for this sandbox state.";
  const activeNetworkImport = sandbox.networkPulseImports.find((item) => item.id === sandbox.activeNetworkPulseImportId);
  const networkImportSummary = activeNetworkImport
    ? [
        `- Label: ${activeNetworkImport.label}`,
        `- Source: ${activeNetworkImport.source}`,
        `- Summary: ${activeNetworkImport.summary}`,
        `- Top imported genes: ${activeNetworkImport.genes.slice(0, 8).map((gene) => `${gene.symbol} ${gene.log2FC >= 0 ? "+" : ""}${gene.log2FC.toFixed(2)}`).join(", ")}`,
        `- Imported pathways: ${activeNetworkImport.pathways.slice(0, 8).map((pathway) => `${pathway.name} (${pathway.source}, p=${pathway.pValue.toExponential(1)})`).join("; ")}`
      ].join("\n")
    : "- No Network Pulse-style import is active.";
  const neuralSummary = [
    `- Preset: ${sandbox.neuralCircuitState.label}`,
    `- State: ${sandbox.neuralCircuitState.analysis.stateLabel}`,
    `- Tremor index: ${Math.round(sandbox.neuralCircuitState.metrics.tremorIndex * 100)}%`,
    `- Synchrony: ${Math.round(sandbox.neuralCircuitState.metrics.synchrony * 100)}%`,
    `- Overload risk: ${Math.round(sandbox.neuralCircuitState.metrics.overloadRisk * 100)}%`,
    `- Suppression score: ${Math.round(sandbox.neuralCircuitState.metrics.suppressionScore * 100)}%`,
    `- Stimulation: ${sandbox.neuralCircuitState.stimulation.enabled ? "enabled" : "disabled"}, amplitude ${sandbox.neuralCircuitState.stimulation.amplitude.toFixed(2)}, frequency ${Math.round(sandbox.neuralCircuitState.stimulation.frequency)} Hz, pulse width ${Math.round(sandbox.neuralCircuitState.stimulation.pulseWidth)} us`,
    `- Sent to Body Sandbox: ${sandbox.neuralCircuitState.sentToBodyAt ? "yes" : "no"}`,
    ...sandbox.neuralCircuitState.analysis.teachingPoints.map((point) => `- Teaching point: ${point}`)
  ].join("\n");
  const backtraceSummary = sandbox.simulationResult.backtraceCandidates.map((candidate) => `- ${candidate.geneSymbol}: ${candidate.reasoning} Score ${Math.round(candidate.score * 100)}%, confidence ${Math.round(candidate.confidence * 100)}%.`).join("\n");
  const moduleSummary = sandbox.moduleOutputs
    .filter((output) => output.includedInReport)
    .map((output) => `- ${output.title}: ${output.summary}`)
    .join("\n");

  const markdown = `# ${titleMap[mode]}: ${sandbox.scenario.title}

## Scope
BioNexus is a privacy-first body-scale biological reasoning sandbox. This report summarizes the current configured scenario, assumptions, biological consequence map and explanatory trail.

## Selected Scenario
- Preset: ${activePreset.title}
- Category: ${activePreset.category}
- Description: ${activePreset.description}

## Baseline Assumptions
${sandbox.scenario.baselineProfile.assumptions.map((item) => `- ${item}`).join("\n")}

## Predispositions
${sandbox.scenario.predispositions.map((item) => `- ${item.label}: ${item.description}`).join("\n")}

## Perturbations
${sandbox.scenario.perturbations.map((item) => `- ${item.label}: ${item.direction} at ${item.targetLayer}; ${item.description}`).join("\n")}

## Interventions / Modulators
${selectedInterventions}

## Affected Systems
${activePreset.affectedSystems.map((item) => `- ${item}`).join("\n")}

## Body Consequence Map
${bodySummary}

## Observable State
${observableSummary}

## Molecular Edge Payloads
${molecularSummary || "- No molecule-carrying edges selected for this scenario."}

## Local Molecular Import Trail
${molecularImportSummary}

## Network Pulse Import
${networkImportSummary}

## Neural Circuit Module
${neuralSummary}

## Backtraced Biological Hypotheses
${backtraceSummary || "- No upstream candidates computed."}

## Key Biological Objects
${entitySummary}

## Reasoning Trail
${activePreset.reasoningTrail.steps.map((step) => `- ${step}`).join("\n")}

## Relationship Highlights
${relationshipSummary}

## Hypotheses
${hypothesisSummary}

## Included Module Outputs
${moduleSummary || "- No module outputs selected."}

## Limitations
${activePreset.limitations.map((item) => `- ${item}`).join("\n")}

## Interpretation
This report explains educational biological relationships and exploratory model consequences. It does not provide clinical conclusions, patient-specific medical advice, care plans, or professional guidance.

## Safety
${intendedUseStatement}
`;

  return {
    id: `report-${mode}-${sandbox.activeScenarioId}`,
    mode,
    title: titleMap[mode],
    markdown,
    generatedFromProgramId: sandbox.activeScenarioId
  };
}

export const reportModes: ReportPayload["mode"][] = [
  "learner",
  "educatorSummary",
  "researchBrief",
  "investorDemo",
  "scenarioExport"
];
