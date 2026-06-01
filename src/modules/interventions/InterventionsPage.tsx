import { GlassCard } from "@/components/ui/GlassCard";
import { scenarioPresets } from "@/data/scenarios/presets";

const categories = ["Drug", "DBS / stimulation", "Gene therapy", "CRISPR / genetic engineering", "Exercise", "Diet", "Sleep", "Prosthetic / neural interface", "Environmental modifier", "Experimental"];

export function InterventionsPage() {
  const interventions = scenarioPresets.flatMap((preset) => preset.interventions.map((intervention) => ({ ...intervention, preset: preset.shortTitle })));
  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-emerald-200">Perturbation library</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Interventions as exploratory perturbations</h1>
        <p className="mt-2 max-w-3xl text-slate-400">These examples support reasoning and simulation. They are not recommendations or clinical guidance.</p>
      </GlassCard>
      <GlassCard>
        <h2 className="text-lg font-semibold text-white">Categories</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => <span key={category} className="rounded-full border border-slate-600/40 bg-slate-950/40 px-3 py-1 text-sm text-slate-300">{category}</span>)}
        </div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2">
        {interventions.map((entity) => (
          <GlassCard key={entity.id}>
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">{entity.category}</span>
            <h2 className="mt-4 text-xl font-semibold text-white">{entity.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Target layer: {entity.targetLayer}. Affected pathway/system: {entity.affectedPathwayOrSystem}. Demo direction: {entity.expectedDirection}.</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-violet-300" style={{ width: `${100 - entity.uncertainty}%` }} /></div>
            <p className="mt-2 text-xs text-slate-500">Related preset: {entity.preset}. Uncertainty: {entity.uncertainty}%.</p>
            <p className="mt-4 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">{entity.safetyLanguage}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
