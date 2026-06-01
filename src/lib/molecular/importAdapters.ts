import type { BodyRegionId, MolecularEdge, MolecularPayload, MolecularSource } from "@/lib/ontology/types";

export type ReactomePhysicalEntityRecord = {
  dbId?: number;
  displayName: string;
  stId?: string;
  name?: string[];
  schemaClass?: string;
  compartment?: Array<{ displayName?: string; name?: string }>;
};

export type ReactomeReactionRecord = {
  stId: string;
  displayName: string;
  input?: ReactomePhysicalEntityRecord[];
  output?: ReactomePhysicalEntityRecord[];
  compartment?: Array<{ displayName?: string; name?: string }>;
  literatureReference?: Array<{ pubMedIdentifier?: number; title?: string; year?: number }>;
};

export type ReactomeImportOptions = {
  id: string;
  scenarioIds: string[];
  sourceRegionId: BodyRegionId;
  targetRegionId: BodyRegionId;
  edgeKind: MolecularEdge["edgeKind"];
  pathwayContext: string;
};

const reactomeSource = (stableId: string, label: string): MolecularSource => ({
  database: "Reactome",
  id: stableId,
  label,
  url: `https://reactome.org/content/detail/${stableId}`
});

export const reactomeQueryUrl = (stableId: string) =>
  `https://reactome.org/ContentService/data/query/${encodeURIComponent(stableId)}`;

export const reactomeParticipantsUrl = (stableId: string) =>
  `https://reactome.org/ContentService/data/event/${encodeURIComponent(stableId)}/participatingPhysicalEntities`;

export const wikiPathwaysGpmlUrl = (wpid: string) =>
  `https://www.wikipathways.org/wikipathways-assets/pathways/${encodeURIComponent(wpid)}/${encodeURIComponent(wpid)}.gpml`;

export const chebiEntityUrl = (chebiId: string) =>
  `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${encodeURIComponent(chebiId)}`;

export function normalizeReactomeReaction(record: ReactomeReactionRecord, options: ReactomeImportOptions): MolecularEdge {
  const inputPayloads = normalizeParticipants(record.input ?? [], "input", record);
  const outputPayloads = normalizeParticipants(record.output ?? [], "output", record);
  const payloads = [...inputPayloads, ...outputPayloads];

  return {
    id: options.id,
    scenarioIds: options.scenarioIds,
    sourceRegionId: options.sourceRegionId,
    targetRegionId: options.targetRegionId,
    label: record.displayName,
    edgeKind: options.edgeKind,
    pathwayContext: options.pathwayContext,
    payloads,
    baseFlux: payloads.length ? Math.min(0.85, 0.35 + payloads.length * 0.08) : 0.25,
    scenarioModifier: 0,
    notes: `Imported from Reactome reaction ${record.stId}; participant counts are interpreted from reaction input/output records.`
  };
}

export function validateMolecularEdge(edge: MolecularEdge) {
  const issues: string[] = [];
  if (!edge.payloads.length) issues.push(`${edge.id} has no molecular payloads.`);
  edge.payloads.forEach((payload) => {
    if (!payload.sources.length) issues.push(`${edge.id}:${payload.molecule} has no source.`);
    if (!payload.ratio.trim()) issues.push(`${edge.id}:${payload.molecule} has no ratio.`);
    if (payload.provenance === "database_exact" && payload.ratioBasis !== "database_stoichiometry") {
      issues.push(`${edge.id}:${payload.molecule} claims database exactness without database stoichiometry basis.`);
    }
    if (payload.provenance === "database_exact" && !payload.sources.some((source) => source.database === "Reactome" || source.database === "ChEBI" || source.database === "WikiPathways")) {
      issues.push(`${edge.id}:${payload.molecule} claims database exactness without a database source.`);
    }
    if (payload.provenance === "curated_approximation" && payload.ratioBasis === "database_stoichiometry") {
      issues.push(`${edge.id}:${payload.molecule} mixes curated approximation with database stoichiometry.`);
    }
  });
  return issues;
}

export function molecularProvenanceLabel(payload: Pick<MolecularPayload, "provenance">) {
  if (payload.provenance === "database_exact") return "Database exact";
  if (payload.provenance === "source_backed") return "Source backed";
  return "Curated approximation";
}

function normalizeParticipants(
  participants: ReactomePhysicalEntityRecord[],
  role: "input" | "output",
  record: ReactomeReactionRecord
): MolecularPayload[] {
  const grouped = new Map<string, { entity: ReactomePhysicalEntityRecord; count: number }>();
  participants.forEach((entity) => {
    const key = `${cleanDisplayName(entity.displayName)}:${entity.stId ?? entity.dbId ?? entity.schemaClass ?? role}`;
    const existing = grouped.get(key);
    grouped.set(key, { entity, count: (existing?.count ?? 0) + 1 });
  });

  return Array.from(grouped.values()).map(({ entity, count }) => {
    const molecule = cleanDisplayName(entity.displayName);
    const compartment = entity.compartment?.[0]?.displayName ?? entity.compartment?.[0]?.name ?? record.compartment?.[0]?.displayName ?? "Reactome compartment";
    return {
      molecule,
      moleculeClass: moleculeClass(entity),
      direction: role === "input" ? "source_to_target" : "target_to_source",
      ratio: `${count} ${molecule} ${role}`,
      ratioBasis: "database_stoichiometry",
      provenance: "database_exact",
      unit: "Reactome participant count",
      sourceCompartment: role === "input" ? compartment : "reaction output",
      targetCompartment: role === "input" ? "reaction input" : compartment,
      sources: [reactomeSource(entity.stId ?? record.stId, entity.displayName), reactomeSource(record.stId, record.displayName)],
      confidence: 0.86,
      assumptions: [
        "Imported from Reactome Content Service reaction participant fields",
        "Participant count is interpreted as reaction-level stoichiometric count where explicit duplication is present",
        "Sandbox visualization remains educational and non-clinical"
      ]
    };
  });
}

function moleculeClass(entity: ReactomePhysicalEntityRecord): MolecularPayload["moleculeClass"] {
  const schema = entity.schemaClass ?? "";
  const name = entity.displayName.toLowerCase();
  if (schema.includes("EntityWithAccessionedSequence")) return "protein";
  if (schema.includes("Complex") || schema.includes("GenomeEncodedEntity")) return "protein";
  if (name.includes("interleukin") || name.includes("tnf") || name.includes("cytokine")) return "cytokine";
  if (name.includes("dopamine")) return "neurotransmitter";
  if (name.includes("oxygen") || name.includes("carbon dioxide")) return "gas";
  return "small_molecule";
}

function cleanDisplayName(displayName: string) {
  return displayName.replace(/\s*\[[^\]]+\]\s*$/u, "").trim();
}
