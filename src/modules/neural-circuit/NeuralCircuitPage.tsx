import { BrainCircuit, Gauge, RadioTower, Send, ShieldAlert, SlidersHorizontal, Target, Video, Zap, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { LiveVisionInputPanel } from "@/components/vision/LiveVisionInputPanel";
import { neuralCircuitPresets, neuralEdges, neuralNodes } from "@/lib/neural/neuralEngine";
import type { NeuralStimulationSettings } from "@/lib/ontology/types";
import { useSandbox } from "@/lib/sandbox/sandboxState";

const pct = (value: number) => `${Math.round(value * 100)}%`;

export function NeuralCircuitPage() {
  const {
    sandbox,
    activePreset,
    selectPreset,
    applyNeuralCircuitPreset,
    updateNeuralStimulation,
    sendNeuralStateToBodySandbox,
    setModuleIncluded
  } = useSandbox();
  const neural = sandbox.neuralCircuitState;
  const neuralOutput = sandbox.moduleOutputs.find((output) => output.moduleId === "neural-circuit");

  return (
    <div className="space-y-6">
      <GlassCard className="overflow-hidden">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-violet-200">Neural Circuit Module</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Basal ganglia modulation sandbox connected to the body model</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              This module uses the tested Neural Pulse Play control framework: stimulation presets, pulse parameters, tremor pressure, synchrony, overload and suppression are real local state that can be sent back to Body Sandbox.
            </p>
          </div>
          <div className="rounded-lg border border-violet-300/20 bg-violet-300/[0.07] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-100">Current neural state</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{neural.summary}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <div className="space-y-5">
          <GlassCard>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-violet-200" />
              <h2 className="text-lg font-semibold text-white">Neural presets</h2>
            </div>
            <div className="mt-4 space-y-3">
              {neuralCircuitPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    neural.presetId === preset.id
                      ? "border-violet-300/60 bg-violet-300/12"
                      : "border-slate-700/40 bg-slate-950/35 hover:border-violet-300/40"
                  }`}
                  onClick={() => applyNeuralCircuitPreset(preset.id)}
                >
                  <span className="block font-semibold text-white">{preset.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">{preset.summary}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <button type="button" className="nexus-button w-full justify-center" onClick={sendNeuralStateToBodySandbox}>
                <Send className="h-4 w-4" />
                Send neural state to Body Sandbox
              </button>
              <button className="nexus-button-secondary w-full justify-center" onClick={() => setModuleIncluded("neural-circuit", !(neuralOutput?.includedInReport ?? false))}>
                Include neural state in report: {neuralOutput?.includedInReport ? "on" : "off"}
              </button>
              {activePreset.id !== "parkinsonism-motor-circuit" ? (
                <button className="nexus-button-secondary w-full justify-center" onClick={() => selectPreset("parkinsonism-motor-circuit")}>
                  Load Parkinson's body preset
                </button>
              ) : (
                <Link className="nexus-button-secondary w-full justify-center" to="/body-sandbox">Open Body Sandbox</Link>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-200">DBS controls</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Pulse engine</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Educational modulation controls only. They model circuit perturbation and communication, not clinical programming.</p>
            <div className="mt-4 space-y-4">
              <Slider label="Stimulation amplitude" value={neural.stimulation.amplitude} min={0.2} max={1.5} step={0.02} display={neural.stimulation.amplitude.toFixed(2)} onChange={(value) => updateNeuralStimulation({ amplitude: value })} />
              <Slider label="Frequency" value={neural.stimulation.frequency} min={20} max={185} step={1} display={`${Math.round(neural.stimulation.frequency)} Hz`} onChange={(value) => updateNeuralStimulation({ frequency: value })} />
              <Slider label="Pulse width" value={neural.stimulation.pulseWidth} min={30} max={180} step={2} display={`${Math.round(neural.stimulation.pulseWidth)} us`} onChange={(value) => updateNeuralStimulation({ pulseWidth: value })} />
              <Slider label="Electrode radius" value={neural.stimulation.radius} min={0.16} max={0.84} step={0.01} display={neural.stimulation.radius.toFixed(2)} onChange={(value) => updateNeuralStimulation({ radius: value })} />
              <Slider label="Noise / tremor severity" value={neural.stimulation.noiseSeverity} min={0.1} max={1} step={0.01} display={pct(neural.stimulation.noiseSeverity)} onChange={(value) => updateNeuralStimulation({ noiseSeverity: value })} />
              <div className="grid grid-cols-2 gap-2">
                {(["tremor", "stabilized"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateNeuralStimulation({ mode })}
                    className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                      neural.stimulation.mode === mode ? "border-violet-300/45 bg-violet-300/15 text-violet-100" : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                    }`}
                  >
                    {mode === "tremor" ? "Tremor noise" : "Stabilized"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => updateNeuralStimulation({ enabled: !neural.stimulation.enabled })}
                className={neural.stimulation.enabled ? "nexus-button w-full justify-center" : "nexus-button-secondary w-full justify-center"}
              >
                <Zap className="h-4 w-4" />
                {neural.stimulation.enabled ? "Stimulation on" : "Stimulation off"}
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard className="overflow-hidden p-0">
            <NeuralNetworkView stimulation={neural.stimulation} stateLabel={neural.analysis.stateLabel} />
          </GlassCard>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Metric icon={ShieldAlert} label="Tremor index" value={pct(neural.metrics.tremorIndex)} />
            <Metric icon={RadioTower} label="Network synchrony" value={pct(neural.metrics.synchrony)} />
            <Metric icon={Gauge} label="Overload risk" value={pct(neural.metrics.overloadRisk)} />
            <Metric icon={Target} label="Suppression score" value={pct(neural.metrics.suppressionScore)} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <GlassCard>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <SlidersHorizontal className="h-4 w-4 text-violet-200" />
                Effect pipeline
              </div>
              <div className="mt-4 space-y-3">
                <EffectBar label="Recruitment" value={neural.analysis.effectiveness} color="linear-gradient(90deg, #4da2ff, #7ce8ff)" />
                <EffectBar label="Suppression potential" value={neural.analysis.suppressionPotential} color="linear-gradient(90deg, #44d6a8, #8df0c4)" />
                <EffectBar label="Overload drive" value={neural.analysis.overloadDrive} color="linear-gradient(90deg, #ff934d, #ff5b47)" />
              </div>
            </GlassCard>
            <GlassCard>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">What the sandbox is teaching</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                {neural.analysis.teachingPoints.map((point) => <p key={point}>{point}</p>)}
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Parameter interpretation</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {neural.analysis.parameterEffects.map((effect) => (
                <div key={effect.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{effect.label}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${effect.status === "good" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : effect.status === "high" ? "border-rose-300/30 bg-rose-300/10 text-rose-100" : "border-amber-300/30 bg-amber-300/10 text-amber-100"}`}>
                      {effect.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{effect.detail}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-cyan-200" />
          <h2 className="text-lg font-semibold text-white">Future privacy-first input layer</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Live Vision hand pose and tremor inputs remain client-side concepts. The placeholder below marks the bridge for future movement observations into this neural module.
        </p>
      </GlassCard>
      <LiveVisionInputPanel />
    </div>
  );
}

function NeuralNetworkView({ stimulation, stateLabel }: { stimulation: NeuralStimulationSettings; stateLabel: string }) {
  const nodeMap = new Map(neuralNodes.map((node) => [node.id, node]));
  const electrode = nodeMap.get(stimulation.electrodeId) ?? nodeMap.get("dbs");
  const project = (node: { x: number; y: number }) => ({ x: 340 + node.x * 260, y: 230 + node.y * 300 });
  const pulseOpacity = stimulation.enabled ? 0.55 : 0.16;

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-violet-300/15 bg-[#050917]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(168,85,247,0.2),transparent_32%),radial-gradient(circle_at_50%_75%,rgba(34,211,238,0.14),transparent_40%)]" />
      <div className="absolute inset-x-5 top-5 z-10 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-xs text-slate-200">Educational sandbox</span>
        <span className={`rounded-full border px-3 py-1 text-xs ${stateLabel === "suppressed" ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100" : stateLabel === "overdriven" ? "border-rose-300/35 bg-rose-300/10 text-rose-100" : "border-violet-300/35 bg-violet-300/10 text-violet-100"}`}>
          {stateLabel.replace(/-/g, " ")}
        </span>
      </div>
      <svg viewBox="0 0 680 500" className="relative h-full min-h-[560px] w-full">
        <defs>
          <radialGradient id="neuralStimGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(248,113,113,0.84)" />
            <stop offset="100%" stopColor="rgba(248,113,113,0)" />
          </radialGradient>
          <radialGradient id="neuralSuppressGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.36)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
        </defs>
        {electrode ? (
          <>
            <circle {...project(electrode)} r={stimulation.radius * 175} fill={stateLabel === "suppressed" ? "url(#neuralSuppressGlow)" : "url(#neuralStimGlow)"} opacity={pulseOpacity} />
            {stimulation.enabled ? (
              <>
                <circle {...project(electrode)} r={stimulation.radius * 105} fill="none" stroke="rgba(248,113,113,0.62)" strokeWidth="3" opacity="0.75" className="animate-pulse-soft" />
                <circle {...project(electrode)} r={stimulation.radius * 62} fill="none" stroke="rgba(125,211,252,0.62)" strokeWidth="2" opacity="0.7" className="animate-pulse-glow" />
              </>
            ) : null}
          </>
        ) : null}

        {neuralEdges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          const start = project(from);
          const end = project(to);
          return <line key={`${edge.from}-${edge.to}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(125,211,252,0.36)" strokeWidth={1.2 + edge.weight * 6} strokeLinecap="round" />;
        })}

        {neuralNodes.map((node) => {
          const point = project(node);
          const isElectrode = node.id === stimulation.electrodeId;
          const isMotor = node.id === "motor" || node.id === "thalamus";
          const activation = Math.min(1, stimulation.noiseSeverity * node.sensitivity * (isMotor ? 1.08 : 0.72));
          const color = isElectrode ? "#f87171" : isMotor && stateLabel === "suppressed" ? "#5eead4" : stateLabel === "overdriven" && activation > 0.6 ? "#fb7185" : "#67e8f9";
          return (
            <g key={node.id}>
              <circle cx={point.x} cy={point.y} r={28 + activation * 9} fill={color} opacity="0.12" />
              <circle cx={point.x} cy={point.y} r={15 + activation * 7} fill={color} opacity="0.88" stroke={isElectrode ? "#fff" : "#0f172a"} strokeWidth={isElectrode ? 3 : 1.5} />
              <text x={point.x} y={point.y - 34} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="700">{node.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Slider({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between gap-3 text-sm text-slate-300"><strong className="text-white">{label}</strong><span>{display}</span></span>
      <input className="mt-2 w-full accent-violet-300" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-4">
      <Icon className="mb-2 h-4 w-4 text-cyan-200" />
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function EffectBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400"><span>{label}</span><span>{pct(value)}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full transition-[width]" style={{ width: pct(value), background: color }} /></div>
    </div>
  );
}
