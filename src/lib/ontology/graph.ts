import { parkinsonsDemo } from "@/data/demo/parkinsons/program";
import type { AnyBioEntity, Relationship } from "@/lib/ontology/types";

export const entitiesById = new Map(parkinsonsDemo.entities.map((entity) => [entity.id, entity]));
export const evidenceById = new Map(parkinsonsDemo.evidence.map((evidence) => [evidence.id, evidence]));

export function getEntity(id: string): AnyBioEntity | undefined {
  return entitiesById.get(id);
}

export function getRelationshipsForEntity(entityId: string): Relationship[] {
  return parkinsonsDemo.relationships.filter(
    (relationship) => relationship.sourceId === entityId || relationship.targetId === entityId
  );
}

export function getConnectedEntities(entityId: string): AnyBioEntity[] {
  return getRelationshipsForEntity(entityId)
    .map((relationship) =>
      relationship.sourceId === entityId ? getEntity(relationship.targetId) : getEntity(relationship.sourceId)
    )
    .filter((entity): entity is AnyBioEntity => Boolean(entity));
}
