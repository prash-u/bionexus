# BioNexus

BioNexus is a privacy-first biological reasoning workspace for exploring how genes, proteins, pathways, cell types, tissues, organs, systems, phenotypes, diseases, interventions and reports connect.

It is the foundation for a future biological translation layer: a local-first workspace for education, hypothesis generation, simulation, systems thinking and scientific communication.

## What It Is Not

This platform is for education, biological reasoning, simulation, hypothesis generation and scientific communication. It is not a diagnostic device, clinical decision system, treatment recommendation engine, or substitute for qualified professional judgement.

## Current Demo Scope

Version 0.1 proves the architecture through a static Parkinson's disease / parkinsonism vertical slice. The demo connects Parkinson's-related genes, proteins, pathways, neural systems, affected tissues/organs, phenotypes, exploratory perturbations and generated reports.

The data is curated demo data and does not imply clinical accuracy.

## Local Development

```bash
npm install
npm run dev
npm run build
```

## Future Module Integration Plan

Future imports from Network Pulse Analyzer, Neural Pulse Play, Live Vision Model Lab and BioBody Insights should map their concepts into the shared ontology contracts in `src/lib/ontology/types.ts` before adding module-specific UI.

## Reference Repositories

- https://github.com/prash-u/persona-hub
- https://github.com/prash-u/live-vision-model-lab
- https://github.com/prash-u/neural-pulse-play
- https://github.com/prash-u/network-pulse-analyzer
- https://github.com/prash-u/biobody-insights
