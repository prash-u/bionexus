import type { BioWorkspaceState, ReportPayload, SandboxState, ScenarioPreset } from "@/lib/ontology/types";
import { intendedUseStatement } from "@/lib/safety/intendedUse";

export function buildReport(mode: ReportPayload["mode"], workspace: BioWorkspaceState, sandbox: SandboxState, activePreset: ScenarioPreset): ReportPayload {
  const titleMap = {
    learner: "Learner Report",
    educatorSummary: "Educator Summary",
    researchBrief: "Research Brief",
    investorDemo: "Investor Demonstration",
    scenarioExport: "Scenario Export"
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
  const selectedInterventions = sandbox.scenario.interventions.map((item) => `- ${item.label}: ${item.expectedDirection} ${item.affectedPathwayOrSystem}; uncertainty ${item.uncertainty}%`).join("\n") || "- No interventions selected.";
  const bodySummary = activePreset.organEffects.map((effect) => `- ${effect.organ}: ${effect.label} (${effect.direction}, ${effect.magnitude}%)`).join("\n");
  const moduleSummary = sandbox.moduleOutputs
    .filter((output) => output.includedInReport)
    .map((output) => `- ${output.title}: ${output.summary}`)
    .join("\n");

  const markdown = `# ${titleMap[mode]}: ${sandbox.scenario.title}

## Scope
BioNexus is a privacy-first body-scale biological reasoning sandbox. This report summarizes the current configured scenario, assumptions, biological consequence map and explanatory trail.

## Selected Scenario
- Preset: ${activePreset.title}
- Category: ${activePreset.category}
- Description: ${activePreset.description}

## Baseline Assumptions
${sandbox.scenario.baselineProfile.assumptions.map((item) => `- ${item}`).join("\n")}

## Predispositions
${sandbox.scenario.predispositions.map((item) => `- ${item.label}: ${item.description}`).join("\n")}

## Perturbations
${sandbox.scenario.perturbations.map((item) => `- ${item.label}: ${item.direction} at ${item.targetLayer}; ${item.description}`).join("\n")}

## Interventions / Modulators
${selectedInterventions}

## Affected Systems
${activePreset.affectedSystems.map((item) => `- ${item}`).join("\n")}

## Body Consequence Map
${bodySummary}

## Key Biological Objects
${entitySummary}

## Reasoning Trail
${activePreset.reasoningTrail.steps.map((step) => `- ${step}`).join("\n")}

## Relationship Highlights
${relationshipSummary}

## Hypotheses
${hypothesisSummary}

## Included Module Outputs
${moduleSummary || "- No module outputs selected."}

## Limitations
${activePreset.limitations.map((item) => `- ${item}`).join("\n")}

## Interpretation
This report explains educational biological relationships and exploratory model consequences. It does not provide clinical conclusions, patient-specific medical advice, care plans, or professional guidance.

## Safety
${intendedUseStatement}
`;

  return {
    id: `report-${mode}-${sandbox.activeScenarioId}`,
    mode,
    title: titleMap[mode],
    markdown,
    generatedFromProgramId: sandbox.activeScenarioId
  };
}

export const reportModes: ReportPayload["mode"][] = [
  "learner",
  "educatorSummary",
  "researchBrief",
  "investorDemo",
  "scenarioExport"
];
