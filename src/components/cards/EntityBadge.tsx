import { entityTypeLabels } from "@/data/ontology/entityTypes";
import type { EntityType } from "@/lib/ontology/types";

export function EntityBadge({ type }: { type: EntityType }) {
  return (
    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-100">
      {entityTypeLabels[type]}
    </span>
  );
}
