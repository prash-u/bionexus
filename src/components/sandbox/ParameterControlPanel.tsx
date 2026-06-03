import { Activity, Info, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { parameterControls } from "@/lib/sandbox/simulation";
import { useSandbox } from "@/lib/sandbox/sandboxState";
import type { ParameterControlDefinition } from "@/lib/ontology/types";

const parameterGroups: Array<{ id: NonNullable<ParameterControlDefinition["group"]>; label: string; description: string }> = [
  { id: "neural", label: "Neural", description: "Circuit excitability and motor/sensory signalling." },
  { id: "immune", label: "Immune", description: "Inflammation and immune activation state." },
  { id: "metabolic", label: "Metabolic", description: "Glucose, lipid and insulin-response load." },
  { id: "cellular", label: "Cellular stress", description: "Energy reserve and oxidative stress load." },
  { id: "ocular", label: "Ocular", description: "Retinal and visual-system stress." }
];

export function ParameterControlPanel() {
  const { sandbox, setParameter, resetSandbox } = useSandbox();

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-200" />
          <div>
            <h2 className="text-lg font-semibold text-white">Model Parameters</h2>
            <p className="text-xs leading-5 text-slate-400">Tune the sandbox state. Values are illustrative, not clinical measurements.</p>
          </div>
        </div>
        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-600/40 bg-slate-950/40 text-slate-300 hover:border-cyan-300/40 hover:text-cyan-100" onClick={resetSandbox} aria-label="Reset sandbox">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        {parameterGroups.map((group) => {
          const controls = parameterControls.filter((control) => control.group === group.id);
          if (!controls.length) return null;

          return (
            <section key={group.id} className="rounded-xl border border-slate-700/40 bg-slate-950/30 p-3">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">{group.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p>
              </div>
              <div className="space-y-3">
                {controls.map((control) => {
                  const value = sandbox.parameters[control.id];
                  return (
                    <label key={control.id} className="group/control block rounded-lg border border-slate-700/45 bg-slate-950/45 p-3 transition hover:border-cyan-300/35">
                      <div className="flex items-start justify-between gap-3 text-sm">
                        <span>
                          <span className="flex items-center gap-2 font-semibold text-white">
                            {control.label}
                            <InfoTooltip control={control} />
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-400">{control.description}</span>
                        </span>
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2 py-1 font-mono text-xs text-cyan-100">{Math.round(value * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={value}
                        onChange={(event) => setParameter(control.id, Number(event.target.value))}
                        className="mt-3 w-full accent-cyan-300"
                        aria-label={control.label}
                      />
                      <div className="mt-1 flex justify-between gap-3 text-[11px] leading-4 text-slate-500">
                        <span>{control.lowDescriptor ?? control.lowLabel}</span>
                        <span className="text-right">{control.highDescriptor ?? control.highLabel}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </GlassCard>
  );
}

function InfoTooltip({ control }: { control: ParameterControlDefinition }) {
  return (
    <span className="relative inline-flex">
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
        tabIndex={0}
        aria-label={`${control.label} context`}
      >
        <Info className="h-3 w-3" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-6 z-30 hidden w-64 -translate-x-1/2 rounded-lg border border-cyan-300/25 bg-slate-950/95 p-3 text-xs font-normal leading-5 text-slate-300 shadow-[0_18px_50px_rgba(2,6,23,0.75)] group-hover/control:block group-focus-within/control:block">
        <strong className="mb-1 block text-cyan-100">How to think about it</strong>
        {control.realWorldContext}
      </span>
    </span>
  );
}
