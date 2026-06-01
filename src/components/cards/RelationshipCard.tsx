import { relationshipTypeLabels } from "@/data/ontology/relationshipTypes";
import type { Relationship } from "@/lib/ontology/types";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function RelationshipCard({ relationship }: { relationship: Relationship }) {
  const { workspace } = useWorkspace();
  const source = workspace.entities.find((entity) => entity.id === relationship.sourceId);
  const target = workspace.entities.find((entity) => entity.id === relationship.targetId);
  return (
    <div className="rounded-lg border border-slate-600/30 bg-slate-950/40 p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-cyan-100">{source?.shortName ?? source?.name}</span>
        <span className="rounded-full bg-violet-400/15 px-2 py-1 text-xs text-violet-100">
          {relationshipTypeLabels[relationship.type]}
        </span>
        <span className="font-semibold text-emerald-100">{target?.shortName ?? target?.name}</span>
      </div>
      <p className="mt-2 text-sm text-slate-400">{relationship.notes}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-300" style={{ width: `${relationship.confidence * 100}%` }} />
      </div>
    </div>
  );
}
