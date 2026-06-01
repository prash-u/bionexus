import { StructuredGraph } from "@/components/graph/StructuredGraph";
import { GlassCard } from "@/components/ui/GlassCard";

export function KnowledgeGraphPage() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Knowledge graph</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Parkinson's relationship map</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Select any entity to inspect connected biological objects, first-class relationships, demo confidence, and evidence framing.
        </p>
      </GlassCard>
      <StructuredGraph />
    </div>
  );
}
