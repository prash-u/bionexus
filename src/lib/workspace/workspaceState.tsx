/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { parkinsonsDemo } from "@/data/demo/parkinsons/program";
import type {
  AnyBioEntity,
  BioWorkspaceState,
  EntityType,
  ReasoningHypothesis,
  Relationship,
  RelationshipType,
  WorkspaceSimulationSettings
} from "@/lib/ontology/types";

const storageKey = "bionexus:workspace-state:v1";

type NewEntityInput = {
  type: EntityType;
  name: string;
  shortName?: string;
  description: string;
  tags?: string;
};

type NewRelationshipInput = {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label: string;
  notes: string;
  confidence: number;
};

type NewHypothesisInput = {
  title: string;
  question: string;
  rationale: string;
  linkedEntityIds: string[];
};

interface WorkspaceContextValue {
  workspace: BioWorkspaceState;
  selectedEntity?: AnyBioEntity;
  selectedRelationships: Relationship[];
  addEntity: (input: NewEntityInput) => void;
  addRelationship: (input: NewRelationshipInput) => void;
  addHypothesis: (input: NewHypothesisInput) => void;
  updateHypothesisStatus: (id: string, status: ReasoningHypothesis["status"]) => void;
  selectEntity: (id: string) => void;
  addTrailStep: (step: string) => void;
  removeTrailStep: (index: number) => void;
  updateSimulation: (settings: Partial<WorkspaceSimulationSettings>) => void;
  resetWorkspace: () => void;
  exportWorkspace: () => string;
  importWorkspace: (json: string) => { ok: true } | { ok: false; error: string };
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const now = () => new Date().toISOString();
const slug = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "node";

const defaultWorkspace = (): BioWorkspaceState => ({
  version: "1.0",
  programId: parkinsonsDemo.program.id,
  entities: parkinsonsDemo.entities,
  relationships: parkinsonsDemo.relationships,
  hypotheses: [
    {
      id: "hypothesis-proteostasis-circuit",
      title: "Proteostasis stress as a bridge to motor circuit instability",
      question: "How might cellular clearance stress connect molecular biology to circuit-level motor phenotypes?",
      rationale:
        "The demo map links SNCA, GBA1 and proteostasis to dopaminergic neurons, then to basal ganglia circuitry and motor phenotypes. This is a reasoning scaffold, not a clinical claim.",
      linkedEntityIds: ["gene-snca", "gene-gba1", "pathway-proteostasis", "tissue-basal-ganglia", "phenotype-tremor"],
      linkedRelationshipIds: ["rel-snca-pathway", "rel-gcase-pathway", "rel-proteostasis-neuron"],
      status: "active",
      createdAt: now(),
      updatedAt: now()
    }
  ],
  reasoningTrail: parkinsonsDemo.program.defaultReasoningTrail,
  selectedEntityId: "pathway-proteostasis",
  simulationSettings: {
    tremorAmplitude: 58,
    dopamineTone: 42,
    proteostasisStress: 64,
    dbsModulation: 36
  },
  updatedAt: now()
});

const readWorkspace = () => {
  if (typeof window === "undefined") return defaultWorkspace();
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return defaultWorkspace();
  try {
    const parsed = JSON.parse(raw) as BioWorkspaceState;
    if (parsed.version !== "1.0" || !Array.isArray(parsed.entities) || !Array.isArray(parsed.relationships)) {
      return defaultWorkspace();
    }
    return parsed;
  } catch {
    return defaultWorkspace();
  }
};

const makeEntity = (input: NewEntityInput): AnyBioEntity => {
  const base = {
    id: `user-${input.type}-${slug(input.name)}-${Date.now().toString(36)}`,
    name: input.name,
    shortName: input.shortName || undefined,
    layer: input.type,
    description: input.description,
    tags: input.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? ["user-authored"]
  };

  switch (input.type) {
    case "gene":
      return { ...base, type: "gene", symbol: input.shortName || input.name.toUpperCase().slice(0, 8) };
    case "protein":
      return { ...base, type: "protein", encodedByGeneId: "" };
    case "pathway":
      return { ...base, type: "pathway", pathwayClass: "User-authored" };
    case "cellType":
      return { ...base, type: "cellType", lineage: "User-authored" };
    case "tissue":
      return { ...base, type: "tissue" };
    case "organ":
      return { ...base, type: "organ" };
    case "bodySystem":
      return { ...base, type: "bodySystem" };
    case "phenotype":
      return { ...base, type: "phenotype" };
    case "disease":
      return { ...base, type: "disease", demoScope: "User-authored reasoning object" };
    case "intervention":
      return { ...base, type: "intervention", category: "Experimental", framing: "exploratory" };
  }
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState(readWorkspace);

  const persist = (next: BioWorkspaceState) => {
    const stamped = { ...next, updatedAt: now() };
    window.localStorage.setItem(storageKey, JSON.stringify(stamped));
    setWorkspace(stamped);
  };

  const value = useMemo<WorkspaceContextValue>(() => {
    const selectedEntity = workspace.entities.find((entity) => entity.id === workspace.selectedEntityId);
    const selectedRelationships = workspace.relationships.filter(
      (relationship) =>
        relationship.sourceId === workspace.selectedEntityId || relationship.targetId === workspace.selectedEntityId
    );

    return {
      workspace,
      selectedEntity,
      selectedRelationships,
      addEntity(input) {
        const entity = makeEntity(input);
        persist({ ...workspace, entities: [...workspace.entities, entity], selectedEntityId: entity.id });
      },
      addRelationship(input) {
        const relationship: Relationship = {
          id: `user-rel-${Date.now().toString(36)}`,
          sourceId: input.sourceId,
          targetId: input.targetId,
          type: input.type,
          label: input.label,
          confidence: input.confidence / 100,
          evidenceIds: ["ev-demo-hypothesis"],
          notes: input.notes
        };
        persist({ ...workspace, relationships: [...workspace.relationships, relationship], selectedRelationshipId: relationship.id });
      },
      addHypothesis(input) {
        const hypothesis: ReasoningHypothesis = {
          id: `hypothesis-${Date.now().toString(36)}`,
          title: input.title,
          question: input.question,
          rationale: input.rationale,
          linkedEntityIds: input.linkedEntityIds,
          linkedRelationshipIds: workspace.relationships
            .filter((relationship) => input.linkedEntityIds.includes(relationship.sourceId) || input.linkedEntityIds.includes(relationship.targetId))
            .map((relationship) => relationship.id),
          status: "draft",
          createdAt: now(),
          updatedAt: now()
        };
        persist({ ...workspace, hypotheses: [hypothesis, ...workspace.hypotheses] });
      },
      updateHypothesisStatus(id, status) {
        persist({
          ...workspace,
          hypotheses: workspace.hypotheses.map((hypothesis) =>
            hypothesis.id === id ? { ...hypothesis, status, updatedAt: now() } : hypothesis
          )
        });
      },
      selectEntity(id) {
        persist({ ...workspace, selectedEntityId: id });
      },
      addTrailStep(step) {
        persist({ ...workspace, reasoningTrail: [...workspace.reasoningTrail, step] });
      },
      removeTrailStep(index) {
        persist({ ...workspace, reasoningTrail: workspace.reasoningTrail.filter((_, itemIndex) => itemIndex !== index) });
      },
      updateSimulation(settings) {
        persist({ ...workspace, simulationSettings: { ...workspace.simulationSettings, ...settings } });
      },
      resetWorkspace() {
        const next = defaultWorkspace();
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        setWorkspace(next);
      },
      exportWorkspace() {
        return JSON.stringify(workspace, null, 2);
      },
      importWorkspace(json) {
        try {
          const parsed = JSON.parse(json) as BioWorkspaceState;
          if (parsed.version !== "1.0" || !Array.isArray(parsed.entities) || !Array.isArray(parsed.relationships)) {
            return { ok: false, error: "The file does not look like a BioNexus 1.0 workspace." };
          }
          persist(parsed);
          return { ok: true };
        } catch {
          return { ok: false, error: "Could not parse the workspace JSON." };
        }
      }
    };
  }, [workspace]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return value;
}
