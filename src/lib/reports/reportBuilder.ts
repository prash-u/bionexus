import { parkinsonsDemo } from "@/data/demo/parkinsons/program";
import type { BioWorkspaceState, ReportPayload } from "@/lib/ontology/types";

const sharedFooter =
  "Intended use: education, biological reasoning, simulation, hypothesis generation and scientific communication only. Not diagnostic, clinical decision support, treatment recommendation, or a substitute for qualified professional judgement.";

export function buildReport(mode: ReportPayload["mode"], workspace: BioWorkspaceState): ReportPayload {
  const titleMap = {
    learner: "Learner Report",
    researchBrief: "Research Brief",
    executiveSummary: "Executive Summary",
    investorDemo: "Investor Demonstration"
  };
  const entitySummary = workspace.entities
    .slice(0, 14)
    .map((entity) => `- ${entity.layer}: ${entity.shortName ?? entity.name} - ${entity.description}`)
    .join("\n");
  const relationshipSummary = workspace.relationships
    .slice(0, 12)
    .map((relationship) => `- ${relationship.label} (${Math.round(relationship.confidence * 100)}% demo confidence)`)
    .join("\n");
  const hypothesisSummary = workspace.hypotheses
    .map((hypothesis) => `- ${hypothesis.title} [${hypothesis.status.replace(/_/g, " ")}]: ${hypothesis.question}`)
    .join("\n") || "- No user-authored hypotheses yet.";

  const markdown = `# ${titleMap[mode]}: ${parkinsonsDemo.program.name}

## Scope
BioNexus 1.0 demonstrates a privacy-first biological reasoning workspace through an editable Parkinson's / parkinsonism vertical slice.

## Key Biological Objects
${entitySummary}

## Reasoning Trail
${workspace.reasoningTrail.map((step) => `- ${step}`).join("\n")}

## Relationship Highlights
${relationshipSummary}

## Hypotheses
${hypothesisSummary}

## Simulation Snapshot
- Tremor amplitude: ${workspace.simulationSettings.tremorAmplitude}
- Dopamine tone: ${workspace.simulationSettings.dopamineTone}
- Proteostasis stress: ${workspace.simulationSettings.proteostasisStress}
- DBS modulation: ${workspace.simulationSettings.dbsModulation}

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
    generatedFromProgramId: workspace.programId
  };
}

export const reportModes: ReportPayload["mode"][] = [
  "learner",
  "researchBrief",
  "executiveSummary",
  "investorDemo"
];
