import type { EntityType } from "@/lib/ontology/types";

export const entityTypeLabels: Record<EntityType, string> = {
  gene: "Gene",
  protein: "Protein",
  pathway: "Pathway",
  cellType: "Cell Type",
  tissue: "Tissue",
  organ: "Organ",
  bodySystem: "System",
  phenotype: "Phenotype",
  disease: "Disease",
  intervention: "Intervention"
};

export const abstractionLayers: EntityType[] = [
  "gene",
  "protein",
  "pathway",
  "cellType",
  "tissue",
  "organ",
  "bodySystem",
  "phenotype",
  "disease",
  "intervention"
];
