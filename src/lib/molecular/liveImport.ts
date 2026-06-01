import type { BodyRegionId, MolecularEdge, MolecularImportSnapshot } from "@/lib/ontology/types";
import {
  normalizeReactomeReaction,
  reactomeQueryUrl,
  validateMolecularEdge,
  type ReactomeReactionRecord
} from "@/lib/molecular/importAdapters";

export type FetchReactomeReactionEdgeInput = {
  stableId: string;
  scenarioId: string;
  sourceRegionId: BodyRegionId;
  targetRegionId: BodyRegionId;
  edgeKind: MolecularEdge["edgeKind"];
  pathwayContext: string;
  fetcher?: typeof fetch;
};

export class MolecularImportError extends Error {
  snapshot: MolecularImportSnapshot;

  constructor(message: string, snapshot: MolecularImportSnapshot) {
    super(message);
    this.name = "MolecularImportError";
    this.snapshot = snapshot;
  }
}

export async function fetchReactomeReactionEdge(input: FetchReactomeReactionEdgeInput): Promise<{ edge: MolecularEdge; snapshot: MolecularImportSnapshot }> {
  const stableId = normalizeStableId(input.stableId);
  const importedAt = new Date().toISOString();

  try {
    const response = await (input.fetcher ?? fetch)(reactomeQueryUrl(stableId), {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Reactome returned ${response.status} for ${stableId}.`);
    }

    const record = asReactomeReactionRecord(await response.json(), stableId);
    const edge = normalizeReactomeReaction(record, {
      id: reactomeEdgeId(stableId, input.scenarioId),
      scenarioIds: [input.scenarioId],
      sourceRegionId: input.sourceRegionId,
      targetRegionId: input.targetRegionId,
      edgeKind: input.edgeKind,
      pathwayContext: input.pathwayContext.trim() || record.displayName
    });
    const issues = validateMolecularEdge(edge);
    if (issues.length) throw new Error(issues.join(" "));

    return {
      edge: {
        ...edge,
        notes: `${edge.notes} Imported locally into BioNexus; no remote account or BioNexus backend is used.`
      },
      snapshot: {
        id: `snapshot-${edge.id}-${Date.parse(importedAt)}`,
        source: "Reactome",
        query: stableId,
        label: record.displayName,
        status: "ready",
        importedAt,
        edgeIds: [edge.id],
        message: "Reaction participants normalized into molecule-carrying sandbox edge payloads."
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reactome import failed.";
    throw new MolecularImportError(message, {
      id: `snapshot-reactome-${stableId.toLowerCase()}-${Date.parse(importedAt)}`,
      source: "Reactome",
      query: stableId,
      label: `Reactome ${stableId}`,
      status: "failed",
      importedAt,
      edgeIds: [],
      message
    });
  }
}

function asReactomeReactionRecord(value: unknown, stableId: string): ReactomeReactionRecord {
  if (!isRecord(value)) throw new Error(`Reactome response for ${stableId} was not an object.`);
  const stId = stringValue(value.stId) ?? stableId;
  const displayName = stringValue(value.displayName);
  if (!displayName) throw new Error(`Reactome response for ${stableId} is missing displayName.`);
  return {
    stId,
    displayName,
    input: reactomeParticipants(value.input),
    output: reactomeParticipants(value.output),
    compartment: reactomeCompartments(value.compartment),
    literatureReference: Array.isArray(value.literatureReference)
      ? value.literatureReference.filter(isRecord).map((item) => ({
          pubMedIdentifier: numberValue(item.pubMedIdentifier),
          title: stringValue(item.title),
          year: numberValue(item.year)
        }))
      : undefined
  };
}

function reactomeParticipants(value: unknown): ReactomeReactionRecord["input"] {
  if (!Array.isArray(value)) return undefined;
  return value.filter(isRecord).map((item) => ({
    dbId: numberValue(item.dbId),
    displayName: stringValue(item.displayName) ?? "Unnamed Reactome participant",
    stId: stringValue(item.stId),
    name: Array.isArray(item.name) ? item.name.filter((name): name is string => typeof name === "string") : undefined,
    schemaClass: stringValue(item.schemaClass),
    compartment: reactomeCompartments(item.compartment)
  }));
}

function reactomeCompartments(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value.filter(isRecord).map((item) => ({
    displayName: stringValue(item.displayName),
    name: stringValue(item.name)
  }));
}

function reactomeEdgeId(stableId: string, scenarioId: string) {
  return `reactome-${scenarioId}-${stableId}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

function normalizeStableId(stableId: string) {
  const normalized = stableId.trim().toUpperCase();
  if (!/^R-[A-Z]{3}-\d+$/u.test(normalized)) {
    throw new Error("Use a Reactome stable reaction id such as R-HSA-74716.");
  }
  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : undefined;
}
