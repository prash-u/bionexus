import type { MolecularImportSpec } from "@/lib/ontology/types";

export const molecularImportSpecs: MolecularImportSpec[] = [
  {
    id: "reactome-content-service-reaction",
    source: "Reactome",
    endpoint: "https://reactome.org/ContentService/data/query/{stableId}",
    description: "Fetches a Reactome reaction/pathway/event record with input, output, compartment and literature-reference fields when available.",
    supportedPayloads: ["reaction_participants", "physical_entities"],
    offlinePolicy: "optional_live_fetch"
  },
  {
    id: "reactome-content-service-participants",
    source: "Reactome",
    endpoint: "https://reactome.org/ContentService/data/event/{stableId}/participatingPhysicalEntities",
    description: "Fetches participating physical entities for a Reactome event, useful for molecule/protein identity and compartment labels.",
    supportedPayloads: ["physical_entities"],
    offlinePolicy: "optional_live_fetch"
  },
  {
    id: "wikipathways-gpml-assets",
    source: "WikiPathways",
    endpoint: "https://www.wikipathways.org/wikipathways-assets/pathways/{WPID}/{WPID}.gpml",
    description: "Fetches GPML for pathway nodes, interactions and diagram structure. BioNexus should parse this into visual pathway context, not clinical conclusions.",
    supportedPayloads: ["gpml_interactions"],
    offlinePolicy: "optional_live_fetch"
  },
  {
    id: "chebi-identity-normalization",
    source: "ChEBI",
    endpoint: "https://www.ebi.ac.uk/chebi/searchId.do?chebiId={CHEBI_ID}",
    description: "Normalizes small-molecule identity and stable ChEBI IDs for payload labels, synonyms and source links.",
    supportedPayloads: ["molecule_identity"],
    offlinePolicy: "curated_snapshot_required"
  }
];
