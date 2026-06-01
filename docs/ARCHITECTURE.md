# Architecture

BioNexus is a standalone React, TypeScript, Vite and Tailwind PWA. It has no backend, no accounts, no telemetry and no tracking.

## Layers

- `src/lib/ontology`: shared biological contracts and graph helpers.
- `src/data/demo/parkinsons`: curated static v0.1 vertical slice.
- `src/lib/storage`: localStorage-backed preferences and first-launch acknowledgement.
- `src/modules`: route-level product surfaces.
- `src/components`: reusable layout, graph, card, report, safety and workspace components.

## Design Principle

Every future module should speak through the shared ontology first. This keeps reports, simulations, graph views and workspace reasoning interoperable.
