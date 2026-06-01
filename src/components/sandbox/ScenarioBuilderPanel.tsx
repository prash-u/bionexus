import { SlidersHorizontal } from "lucide-react";
import { ComplexitySelector } from "@/components/ui/ComplexitySelector";
import { GlassCard } from "@/components/ui/GlassCard";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function ScenarioBuilderPanel() {
  const { sandbox, activePreset, selectPreset, togglePredisposition, togglePerturbation, toggleIntervention } = useSandbox();
  const activePredispositions = new Set(sandbox.scenario.predispositions.map((item) => item.id));
  const activePerturbations = new Set(sandbox.scenario.perturbations.map((item) => item.id));
  const activeInterventions = new Set(sandbox.scenario.interventions.map((item) => item.id));

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-cyan-200" />
        <h2 className="text-lg font-semibold text-white">Scenario builder</h2>
      </div>
      <div className="space-y-5">
        <label className="block text-sm text-slate-300">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">Preset scenario</span>
          <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={sandbox.activeScenarioId} onChange={(event) => selectPreset(event.target.value)}>
            {sandbox.presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.title}</option>)}
          </select>
        </label>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Baseline profile</p>
          <div className="rounded-lg border border-slate-700/50 bg-slate-950/40 p-3">
            <p className="text-sm font-semibold text-white">{sandbox.scenario.baselineProfile.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{sandbox.scenario.baselineProfile.description}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Complexity level</p>
          <ComplexitySelector />
        </div>
        <ToggleList title="Predispositions" items={activePreset.predispositions} active={activePredispositions} onToggle={togglePredisposition} />
        <ToggleList title="Perturbations" items={activePreset.perturbations} active={activePerturbations} onToggle={togglePerturbation} />
        <ToggleList title="Interventions" items={activePreset.interventions} active={activeInterventions} onToggle={toggleIntervention} />
      </div>
    </GlassCard>
  );
}

function ToggleList<T extends { id: string; label: string; description?: string }>({
  title,
  items,
  active,
  onToggle
}: {
  title: string;
  items: T[];
  active: Set<string>;
  onToggle: (item: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            className={`w-full rounded-md border p-3 text-left transition ${
              active.has(item.id)
                ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-50"
                : "border-slate-700/50 bg-slate-950/35 text-slate-300 hover:border-violet-300/40"
            }`}
            onClick={() => onToggle(item)}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            {item.description ? <span className="mt-1 block text-xs leading-5 text-slate-400">{item.description}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
