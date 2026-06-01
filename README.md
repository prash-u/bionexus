# BioNexus

BioNexus is a privacy-first body-scale biological reasoning sandbox for exploring how genes, proteins, pathways, cell types, tissues, organs, systems, phenotypes, scenarios, interventions and reports connect.

It is the foundation for a future biological translation layer: a local-first sandbox for education, hypothesis generation, simulation, systems thinking and scientific communication.

## What It Is Not

This platform is for education, biological reasoning, simulation, hypothesis generation and scientific communication. It is not a diagnostic device, clinical decision system, treatment recommendation engine, clinical programming tool, or substitute for qualified professional judgement.

## Current Demo Scope

Version 1.5 reframes BioNexus around the Body Sandbox. Parkinson's is now one optional preset scenario alongside metabolic dysfunction, retinal degeneration and inflammatory activation, with local-first Reactome reaction imports, Network Pulse-style gene/pathway imports and a Neural Pulse Play-style circuit module.

The seed data is curated demo data and does not imply clinical accuracy, prediction or recommendation.

## What You Can Do

- Choose a biological scenario preset.
- Configure baseline assumptions, predispositions, perturbations and interventions.
- Explore a whole-body consequence map with affected organs and systems.
- Inspect molecule-carrying edges with ratios, compartments, source references and provenance labels.
- Import Reactome reaction records into the active scenario as local molecular edges.
- Import compact Network Pulse Analyzer-style gene, interaction-edge and pathway tables.
- Explore a Neural Pulse Play-style DBS/motor-circuit sandbox and send neural state back into Body Sandbox.
- Backtrace changed body states into plausible upstream genes and pathways.
- Toggle biological layers from genes to phenotypes.
- Add biological objects across the shared ontology.
- Connect objects with first-class relationships.
- Build and edit a reasoning trail.
- Save hypotheses linked to selected entities and relationships.
- Generate reports from the current SandboxState.
- Export, import and reset local workspace JSON.

## Local Development

Node 20+ is recommended for the cleanest install experience because the current secure Vitest release declares Node 20 or newer.

```bash
npm install
npm run dev
npm run build
npm test
```

In GitHub Codespaces, first confirm Node is 20 or newer:

```bash
node -v
```

If it is older, switch before running Vite:

```bash
nvm install 20
nvm use 20
npm install
npm run dev:host
```

## Future Module Integration Plan

Future imports from Live Vision Model Lab and deeper BioBody Insights concepts should map their concepts into the shared ontology contracts in `src/lib/ontology/types.ts`, the local sandbox model in `src/lib/sandbox/sandboxState.tsx`, and the scenario presets in `src/data/scenarios/presets.ts` before adding module-specific UI. Network Pulse-style signal import and Neural Pulse-style circuit state are now implemented as data-to-sandbox bridges.

## Reference Repositories

- https://github.com/prash-u/persona-hub
- https://github.com/prash-u/live-vision-model-lab
- https://github.com/prash-u/neural-pulse-play
- https://github.com/prash-u/network-pulse-analyzer
- https://github.com/prash-u/biobody-insights
