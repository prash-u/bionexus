import { EntityBadge } from "@/components/cards/EntityBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import type { AnyBioEntity } from "@/lib/ontology/types";

export function EntityCard({ entity, onSelect }: { entity: AnyBioEntity; onSelect?: (id: string) => void }) {
  return (
    <button className="h-full w-full text-left" onClick={() => onSelect?.(entity.id)}>
      <GlassCard className="h-full transition hover:border-cyan-300/45 hover:shadow-glow">
        <div className="mb-3 flex items-center justify-between gap-3">
          <EntityBadge type={entity.type} />
          <span className="text-xs text-slate-500">{entity.layer}</span>
        </div>
        <h3 className="text-base font-semibold text-white">{entity.shortName ?? entity.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{entity.description}</p>
      </GlassCard>
    </button>
  );
}
