import type { RelationshipType } from "@/lib/ontology/types";

export const relationshipTypeLabels: Record<RelationshipType, string> = {
  participates_in: "participates in",
  encoded_by: "encoded by",
  affects: "affects",
  impacts: "impacts",
  modulates: "modulates",
  associated_with: "associated with",
  supports: "supports",
  expressed_in: "expressed in",
  manifests_as: "manifests as",
  targets: "targets"
};
