import { parkinsonsDemo } from "@/data/demo/parkinsons/program";
import { getEntity } from "@/lib/ontology/graph";

export function buildReasoningTrail(steps = parkinsonsDemo.program.defaultReasoningTrail) {
  return steps;
}

export function describeRelationship(sourceId: string, targetId: string) {
  const relationship = parkinsonsDemo.relationships.find(
    (item) => item.sourceId === sourceId && item.targetId === targetId
  );
  const source = getEntity(sourceId);
  const target = getEntity(targetId);
  if (!relationship || !source || !target) return "No direct relationship found.";
  return `${source.shortName ?? source.name} ${relationship.label.toLowerCase()} ${target.shortName ?? target.name}.`;
}
