# BioNexus

BioNexus is a privacy-first body-scale biological reasoning sandbox for exploring how genes, proteins, pathways, cell types, tissues, organs, systems, phenotypes, scenarios, interventions and reports connect.

It is the foundation for a future biological translation layer: a local-first sandbox for education, hypothesis generation, simulation, systems thinking and scientific communication.

## What It Is Not

This platform is for education, biological reasoning, simulation, hypothesis generation and scientific communication. It is not a diagnostic device, clinical decision system, treatment recommendation engine, clinical programming tool, or substitute for qualified professional judgement.

## Current Demo Scope

Version 1.1 reframes BioNexus around the Body Sandbox. Parkinson's is now one optional preset scenario alongside metabolic dysfunction, retinal degeneration and inflammatory activation.

The seed data is curated demo data and does not imply clinical accuracy, prediction or recommendation.

## What You Can Do

- Choose a biological scenario preset.
- Configure baseline assumptions, predispositions, perturbations and interventions.
- Explore a whole-body consequence map with affected organs and systems.
- Toggle biological layers from genes to phenotypes.
- Add biological objects across the shared ontology.
- Connect objects with first-class relationships.
- Build and edit a reasoning trail.
- Save hypotheses linked to selected entities and relationships.
- Generate reports from the current SandboxState.
- Export, import and reset local workspace JSON.

## Local Development

```bash
npm install
npm run dev
npm run build
```

## Future Module Integration Plan

Future imports from Network Pulse Analyzer, Neural Pulse Play, Live Vision Model Lab and BioBody Insights should map their concepts into the shared ontology contracts in `src/lib/ontology/types.ts`, the local sandbox model in `src/lib/sandbox/sandboxState.tsx`, and the scenario presets in `src/data/scenarios/presets.ts` before adding module-specific UI.

## Reference Repositories

- https://github.com/prash-u/persona-hub
- https://github.com/prash-u/live-vision-model-lab
- https://github.com/prash-u/neural-pulse-play
- https://github.com/prash-u/network-pulse-analyzer
- https://github.com/prash-u/biobody-insights
