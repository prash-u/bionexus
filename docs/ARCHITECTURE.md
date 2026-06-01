# Architecture

BioNexus is a standalone React, TypeScript, Vite and Tailwind PWA. It has no backend, no accounts, no telemetry and no tracking.

## Layers

- `src/lib/ontology`: shared biological contracts and graph helpers.
- `src/data/scenarios`: scenario presets for the body-scale sandbox.
- `src/data/demo/parkinsons`: optional seed data for the Parkinson's motor-circuit preset and legacy ontology examples.
- `src/lib/storage`: localStorage-backed preferences and first-launch acknowledgement.
- `src/lib/sandbox`: localStorage-backed `SandboxState`, active scenario, body systems, layer selection and module outputs.
- `src/lib/molecular`: live import helpers, import adapters and validators for source-backed molecular payloads.
- `src/lib/network`: Network Pulse Analyzer-style CSV parsing, hub ranking and pathway signal normalization.
- `src/lib/neural`: Neural Pulse Play-style basal ganglia and DBS sandbox engine with local stimulation state, derived metrics and body-state projection.
- `src/lib/workspace`: localStorage-backed editable ontology workspace state and actions.
- `src/modules`: route-level product surfaces.
- `src/components`: reusable layout, graph, card, report, safety and workspace components.

## Design Principle

Every future module should speak through the shared ontology and `SandboxState` first. This keeps reports, simulations, graph views, body atlas views and workspace reasoning interoperable.

## Molecular Import Boundary

BioNexus is local-first, so runtime database access is optional. The app currently supports curated source-backed molecular edges and a browser-side Reactome reaction import path.

- Reactome Content Service reaction records, normalized into local `MolecularEdge` payloads.
- Reactome participating physical entities as a future enrichment path.
- WikiPathways GPML pathway diagrams and interaction structure.
- ChEBI molecule identity normalization.

The UI must distinguish `database_exact`, `source_backed` and `curated_approximation` payloads. Exactness is a provenance claim and should be validated before display or report export.

Imported molecular edges are stored only in `SandboxState.importedMolecularEdges` and merged with curated scenario edges during simulation. Import snapshots are reportable provenance records; they do not create an account, backend record, telemetry event or clinical data object.

## Network Pulse Import Boundary

Network Pulse-style imports accept compact local CSV tables:

- genes: `symbol,name,log2FC,pAdj`
- interaction edges: `source,target,score`
- pathways: `name,source,pValue,genes`

Imports are stored in `SandboxState.networkPulseImports`, selected by `activeNetworkPulseImportId`, and merged into simulation backtracing. Overlapping curated and imported genes are combined so reports preserve both curated reasoning and imported evidence provenance.

## Neural Pulse Module Boundary

The Neural Circuit module is one sandbox module, not the center of the product. It adapts the tested Neural Pulse Play idea into a pure local engine:

- Presets describe generic motor-loop, Parkinsonian, underpowered DBS, educational window and overdriven DBS states.
- Stimulation controls model amplitude, frequency, pulse width, field radius, noise severity and on/off state.
- Derived metrics include tremor index, network synchrony, overload risk, suppression score, firing rate, stimulation dose and network entropy.
- `neuralStateToBodyPatch` projects local neural state into Body Sandbox parameters such as neural synchrony and exploratory oxidative load.

This bridge is educational and exploratory. It is not a clinical programming tool, clinical decision system, diagnostic device or treatment recommendation system.
