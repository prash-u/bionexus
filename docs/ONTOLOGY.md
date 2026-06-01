# Ontology

BioNexus treats biological objects and relationships as first-class typed data.

## Core Objects

- BioEntity
- Gene
- Protein
- Pathway
- CellType
- Tissue
- Organ
- BodySystem
- Phenotype
- Disease
- Intervention
- Evidence
- Publication
- Relationship
- DiseaseProgram
- SimulationState
- ReportPayload
- UserMode
- ComplexityLevel

## Relationship Contract

Each relationship includes:

- `id`
- `sourceId`
- `targetId`
- `type`
- `label`
- `confidence`
- `evidenceIds`
- `notes`

Examples include `encoded_by`, `participates_in`, `affects`, `impacts`, `modulates`, `associated_with`, `supports`, `expressed_in`, `manifests_as` and `targets`.
