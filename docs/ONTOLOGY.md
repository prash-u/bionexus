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
- SandboxState
- MolecularEdge
- MolecularPayload
- MolecularImportSnapshot
- NetworkGeneSignal
- NetworkInteractionEdge
- NetworkPathwaySignal
- NetworkPulseImport
- NeuralCircuitPresetId
- NeuralStimulationSettings
- NeuralCircuitMetrics
- NeuralCircuitAnalysis
- NeuralCircuitState
- BacktraceCandidate
- ObservableSeries
- SandboxSimulationResult

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

## Molecular Edge Contract

Body-atlas edges are typed biological edges, not decorative lines. Each `MolecularEdge` connects source and target body regions and carries one or more `MolecularPayload` records.

Every payload must include:

- molecule name and class
- direction
- ratio
- ratio basis
- provenance
- unit
- source and target compartment
- source database references
- confidence
- assumptions

`provenance` must be one of:

- `database_exact`: imported or directly represented from database stoichiometry.
- `source_backed`: grounded in source databases, but represented as a relative or mechanism-level sandbox signal.
- `curated_approximation`: explicitly educational placeholder or approximation.

BioNexus should never present relative physiological flux as exact patient-specific molecular concentration.

## Molecular Import Snapshot

Every live or adapter-based molecular import should produce a `MolecularImportSnapshot` with source, query, label, status, imported time, edge IDs and an optional message. Snapshots are provenance breadcrumbs for local reports, not remote persistence or audit logs.

## Backtrace Contract

Backtracing works from current body state back toward plausible upstream biology. A `BacktraceCandidate` ranks genes and pathways that may explain the selected exploratory body state.

Backtrace candidates must include linked pathways, body regions, phenotypes, score, confidence, evidence IDs, reasoning text and assumptions. They are hypothesis-generating candidates, not causal conclusions.

## Network Pulse Import Contract

`NetworkPulseImport` represents a local evidence slice from Network Pulse Analyzer-style work:

- `NetworkGeneSignal`: symbol, name, log2 fold-change, adjusted p-value and direction.
- `NetworkInteractionEdge`: source gene, target gene and confidence/interaction score.
- `NetworkPathwaySignal`: pathway name, source, p-value and overlap genes.

The sandbox ranks imported genes by fold-change magnitude, retained network degree and pathway membership. Imported candidates can merge with curated scenario candidates by gene symbol so provenance is additive rather than duplicated.

## Neural Circuit Contract

`NeuralCircuitState` represents the local Neural Pulse-style module output that can be included in Body Sandbox and reports.

It includes:

- selected neural preset
- stimulation settings
- derived circuit metrics
- parameter-level analysis
- teaching points
- optional timestamp showing the state was sent to Body Sandbox

`NeuralStimulationSettings` are educational sandbox parameters only: amplitude, frequency, pulse width, field radius, noise severity, enabled state, mode and electrode id.

`NeuralCircuitMetrics` summarize the local model as firing rate, synchrony, tremor index, stimulation dose, overload risk, suppression score and network entropy. These metrics are not clinical measurements or programming guidance.

When sent to Body Sandbox, neural state is converted into ordinary sandbox parameters through `neuralStateToBodyPatch`, so reports can explain how a neural module perturbs body-scale reasoning without making patient-specific claims.
