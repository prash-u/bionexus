import { Activity, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { parameterControls } from "@/lib/sandbox/simulation";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function ParameterControlPanel() {
  const { sandbox, setParameter, resetSandbox } = useSandbox();

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-200" />
          <h2 className="text-lg font-semibold text-white">Body attributes</h2>
        </div>
        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-600/40 bg-slate-950/40 text-slate-300 hover:border-cyan-300/40 hover:text-cyan-100" onClick={resetSandbox} aria-label="Reset sandbox">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {parameterControls.map((control) => {
          const value = sandbox.parameters[control.id];
          return (
            <label key={control.id} className="block rounded-lg border border-slate-700/40 bg-slate-950/35 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">{control.label}</span>
                <span className="font-mono text-xs text-cyan-200">{Math.round(value * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={value}
                onChange={(event) => setParameter(control.id, Number(event.target.value))}
                className="mt-3 w-full accent-cyan-300"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                <span>{control.lowLabel}</span>
                <span>{control.highLabel}</span>
              </div>
            </label>
          );
        })}
      </div>
    </GlassCard>
  );
}
