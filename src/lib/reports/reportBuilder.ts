import { parkinsonsDemo } from "@/data/demo/parkinsons/program";
import type { ReportPayload } from "@/lib/ontology/types";

const sharedFooter =
  "Intended use: education, biological reasoning, simulation, hypothesis generation and scientific communication only. Not diagnostic, clinical decision support, treatment recommendation, or a substitute for qualified professional judgement.";

export function buildReport(mode: ReportPayload["mode"]): ReportPayload {
  const titleMap = {
    learner: "Learner Report",
    researchBrief: "Research Brief",
    executiveSummary: "Executive Summary",
    investorDemo: "Investor Demonstration"
  };
  const entitySummary = parkinsonsDemo.entities
    .slice(0, 10)
    .map((entity) => `- ${entity.layer}: ${entity.shortName ?? entity.name} - ${entity.description}`)
    .join("\n");
  const relationshipSummary = parkinsonsDemo.relationships
    .slice(0, 8)
    .map((relationship) => `- ${relationship.label} (${Math.round(relationship.confidence * 100)}% demo confidence)`)
    .join("\n");

  const markdown = `# ${titleMap[mode]}: ${parkinsonsDemo.program.name}

## Scope
BioNexus v0.1 demonstrates a privacy-first biological reasoning workspace through a static Parkinson's / parkinsonism vertical slice.

## Key Biological Objects
${entitySummary}

## Reasoning Trail
${parkinsonsDemo.program.defaultReasoningTrail.map((step) => `- ${step}`).join("\n")}

## Relationship Highlights
${relationshipSummary}

## Interpretation
This report explains biological relationships and exploratory perturbations. It does not diagnose, predict disease, recommend treatment, or provide clinical guidance.

## Safety
${sharedFooter}
`;

  return {
    id: `report-${mode}-parkinsons`,
    mode,
    title: titleMap[mode],
    markdown,
    generatedFromProgramId: parkinsonsDemo.program.id
  };
}

export const reportModes: ReportPayload["mode"][] = [
  "learner",
  "researchBrief",
  "executiveSummary",
  "investorDemo"
];
