import { useMemo, useState } from "react";
import { EntityCard } from "@/components/cards/EntityCard";
import { RelationshipCard } from "@/components/cards/RelationshipCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { abstractionLayers } from "@/data/ontology/entityTypes";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function StructuredGraph() {
  const { workspace, selectEntity } = useWorkspace();
  const [selectedId, setSelectedId] = useState(workspace.selectedEntityId);
  const selected = workspace.entities.find((entity) => entity.id === selectedId);
  const relationships = useMemo(
    () => workspace.relationships.filter((relationship) => relationship.sourceId === selectedId || relationship.targetId === selectedId),
    [selectedId, workspace.relationships]
  );
  const connected = useMemo(
    () =>
      relationships
        .map((relationship) =>
          relationship.sourceId === selectedId
            ? workspace.entities.find((entity) => entity.id === relationship.targetId)
            : workspace.entities.find((entity) => entity.id === relationship.sourceId)
        )
        .filter((entity) => Boolean(entity)),
    [relationships, selectedId, workspace.entities]
  );

  const choose = (id: string) => {
    setSelectedId(id);
    selectEntity(id);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
      <GlassCard>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {abstractionLayers.map((layer) => {
            const entities = workspace.entities.filter((entity) => entity.type === layer);
            return (
              <div key={layer} className="rounded-lg border border-slate-700/35 bg-slate-950/30 p-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{layer}</p>
                <div className="space-y-2">
                  {entities.map((entity) => (
                    <button
                      key={entity.id}
                      onClick={() => choose(entity.id)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                        selectedId === entity.id
                          ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-50"
                          : "border-slate-700/40 bg-slate-900/45 text-slate-300 hover:border-violet-300/40"
                      }`}
                    >
                      {entity.shortName ?? entity.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
      <div className="space-y-5">
        {selected ? <EntityCard entity={selected} /> : null}
        <GlassCard>
          <h3 className="text-base font-semibold text-white">Connected entities</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {connected.map((entity) => (
              <button
                key={entity?.id}
                onClick={() => entity ? choose(entity.id) : undefined}
                className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100"
              >
                {entity?.shortName ?? entity?.name}
              </button>
            ))}
          </div>
        </GlassCard>
        <div className="space-y-3">
          {relationships.map((relationship) => (
            <RelationshipCard key={relationship.id} relationship={relationship} />
          ))}
        </div>
      </div>
    </div>
  );
}
