import { WholeBodyVisualization } from "@/components/sandbox/WholeBodyVisualization";
import { GlassCard } from "@/components/ui/GlassCard";
import { bodyRegionLabels } from "@/data/scenarios/presets";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function BodyAtlasPage() {
  const { activePreset } = useSandbox();
  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Body Atlas</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Whole-body visual reasoning layer</h1>
        <p className="mt-2 max-w-3xl text-slate-400">Clickable body regions show scenario-linked intensity, organ effects and system status.</p>
      </GlassCard>
      <WholeBodyVisualization />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activePreset.organEffects.map((effect) => (
          <GlassCard key={effect.organ}>
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">{bodyRegionLabels[effect.organ]}</p>
            <h2 className="mt-2 text-lg font-semibold text-white">{effect.label}</h2>
            <p className="mt-2 text-sm text-slate-400">Direction: {effect.direction}. Confidence: {Math.round(effect.confidence * 100)}%.</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-cyan-300" style={{ width: `${effect.magnitude}%` }} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
