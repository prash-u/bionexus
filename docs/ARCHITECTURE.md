# Architecture

BioNexus is a standalone React, TypeScript, Vite and Tailwind PWA. It has no backend, no accounts, no telemetry and no tracking.

## Layers

- `src/lib/ontology`: shared biological contracts and graph helpers.
- `src/data/scenarios`: scenario presets for the body-scale sandbox.
- `src/data/demo/parkinsons`: optional seed data for the Parkinson's motor-circuit preset and legacy ontology examples.
- `src/lib/storage`: localStorage-backed preferences and first-launch acknowledgement.
- `src/lib/sandbox`: localStorage-backed `SandboxState`, active scenario, body systems, layer selection and module outputs.
- `src/lib/workspace`: localStorage-backed editable ontology workspace state and actions.
- `src/modules`: route-level product surfaces.
- `src/components`: reusable layout, graph, card, report, safety and workspace components.

## Design Principle

Every future module should speak through the shared ontology and `SandboxState` first. This keeps reports, simulations, graph views, body atlas views and workspace reasoning interoperable.
