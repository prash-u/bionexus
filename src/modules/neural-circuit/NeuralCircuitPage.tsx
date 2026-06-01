import { Activity, RadioTower, Send, Video } from "lucide-react";
import { NeuralModulationPanel } from "@/components/neural/NeuralModulationPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiveVisionInputPanel } from "@/components/vision/LiveVisionInputPanel";
import { Link } from "react-router-dom";
import { useSandbox } from "@/lib/sandbox/sandboxState";

const neuralPresets = [
  { id: "parkinsonism-motor-circuit", label: "Parkinson's motor circuit", summary: "Dopamine pathway and basal ganglia loop instability." },
  { id: "generic-motor", label: "Generic motor pathway", summary: "Cortex, basal ganglia, thalamus and motor output flow." },
  { id: "neural-modulation", label: "Neural modulation demo", summary: "Stimulation as a circuit perturbation, not a clinical programming tool." }
];

export function NeuralCircuitPage() {
  const { sandbox, activePreset, selectPreset, setModuleIncluded } = useSandbox();
  const neuralOutput = sandbox.moduleOutputs.find((output) => output.moduleId === "neural-circuit");

  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-violet-200">Neural Circuit Module</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Neural modulation is one sandbox module, not the whole product</h1>
        <p className="mt-2 max-w-3xl text-slate-400">Explore motor-circuit storytelling, DBS-style modulation and future privacy-first input layers while keeping the body sandbox as the source of truth.</p>
      </GlassCard>
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Neural presets</h2>
          <div className="mt-4 space-y-3">
            {neuralPresets.map((preset) => (
              <button
                key={preset.id}
                className={`w-full rounded-lg border p-4 text-left transition ${activePreset.id === preset.id ? "border-cyan-300/60 bg-cyan-300/10" : "border-slate-700/40 bg-slate-950/35 hover:border-violet-300/40"}`}
                onClick={() => preset.id === "parkinsonism-motor-circuit" ? selectPreset(preset.id) : undefined}
              >
                <span className="block font-semibold text-white">{preset.label}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-400">{preset.summary}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <Link className="nexus-button" to="/body-sandbox"><Send className="h-4 w-4" /> Send neural state to Body Sandbox</Link>
            <button className="nexus-button-secondary" onClick={() => setModuleIncluded("neural-circuit", !(neuralOutput?.includedInReport ?? false))}>
              Include neural state in report: {neuralOutput?.includedInReport ? "on" : "off"}
            </button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-slate-700/40 bg-slate-950/50 p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_50%_70%,rgba(34,211,238,0.14),transparent_36%)]" />
            <svg viewBox="0 0 640 380" className="relative h-full min-h-[370px] w-full">
              {[
                ["Cortex", 150, 90, "#22d3ee"],
                ["Striatum", 310, 145, "#8b5cf6"],
                ["Thalamus", 455, 96, "#38bdf8"],
                ["STN", 350, 232, "#fbbf24"],
                ["Motor output", 500, 285, "#34d399"]
              ].map(([label, x, y, color]) => (
                <g key={label}>
                  <circle cx={Number(x)} cy={Number(y)} r="38" fill={String(color)} opacity="0.16" />
                  <circle cx={Number(x)} cy={Number(y)} r="24" fill={String(color)} opacity="0.82" />
                  <text x={Number(x)} y={Number(y) + 54} fill="#e2e8f0" fontSize="16" textAnchor="middle">{label}</text>
                </g>
              ))}
              {["M 174 100 C 230 115, 250 134, 286 142", "M 334 138 C 378 112, 402 98, 431 96", "M 333 164 C 352 184, 360 203, 354 220", "M 374 240 C 420 258, 454 276, 475 285"].map((d) => (
                <path key={d} d={d} fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 10" opacity="0.7" />
              ))}
              <circle cx="350" cy="232" r="62" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.45" />
            </svg>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Metric icon={Activity} label="Motor synchrony" value={activePreset.category === "neural" ? "elevated" : "reference"} />
            <Metric icon={RadioTower} label="DBS modulation" value="exploratory" />
            <Metric icon={Video} label="Future input" value="Live Vision hand/tremor layer" />
          </div>
        </GlassCard>
      </div>
      <NeuralModulationPanel />
      <LiveVisionInputPanel />
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-3">
      <Icon className="mb-2 h-4 w-4 text-cyan-200" />
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
