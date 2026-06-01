import { Activity, Gauge, RadioTower, ShieldAlert, Target, Zap } from "lucide-react";
import { useMemo, useState } from "react";

type Settings = {
  amplitude: number;
  frequency: number;
  pulseWidth: number;
  radius: number;
  noiseSeverity: number;
};

const defaultSettings: Settings = {
  amplitude: 0.86,
  frequency: 128,
  pulseWidth: 94,
  radius: 0.42,
  noiseSeverity: 0.64
};

export function NeuralModulationPanel() {
  const [settings, setSettings] = useState(defaultSettings);
  const analysis = useMemo(() => {
    const amplitudeWindow = windowScore(settings.amplitude, 0.68, 0.96, 1.2);
    const frequencyWindow = windowScore(settings.frequency, 95, 130, 165);
    const pulseWindow = windowScore(settings.pulseWidth, 65, 95, 130);
    const radiusWindow = windowScore(settings.radius, 0.26, 0.42, 0.62);
    const effectiveness = (amplitudeWindow + frequencyWindow + pulseWindow + radiusWindow) / 4;
    const overloadDrive = Math.max(0, settings.amplitude - 1.0) * 0.55 + Math.max(0, settings.frequency - 145) / 120 + Math.max(0, settings.radius - 0.5);
    const tremorIndex = clamp(settings.noiseSeverity * (1 - effectiveness * 0.55) + overloadDrive * 0.25, 0, 1);
    const suppressionScore = clamp(effectiveness * (1 - overloadDrive * 0.52) * (1 - tremorIndex * 0.35), 0, 1);
    const synchrony = clamp(settings.noiseSeverity * 0.62 + overloadDrive * 0.28 - effectiveness * 0.18, 0, 1);
    return { effectiveness, overloadDrive: clamp(overloadDrive, 0, 1), tremorIndex, suppressionScore, synchrony };
  }, [settings]);

  const update = (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch }));

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Neural Pulse framework</p>
        <h3 className="mt-1 text-lg font-semibold text-white">DBS-style modulation controls</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">Conceptual control vocabulary ported from Neural Pulse Play. This is a sandbox modulation model, not programming guidance.</p>
        <div className="mt-4 space-y-4">
          <Slider label="Stimulation amplitude" value={settings.amplitude} min={0.2} max={1.5} step={0.02} display={settings.amplitude.toFixed(2)} onChange={(value) => update({ amplitude: value })} />
          <Slider label="Frequency" value={settings.frequency} min={20} max={185} step={1} display={`${Math.round(settings.frequency)} Hz`} onChange={(value) => update({ frequency: value })} />
          <Slider label="Pulse width" value={settings.pulseWidth} min={30} max={180} step={2} display={`${Math.round(settings.pulseWidth)} us`} onChange={(value) => update({ pulseWidth: value })} />
          <Slider label="Electrode radius" value={settings.radius} min={0.16} max={0.84} step={0.01} display={settings.radius.toFixed(2)} onChange={(value) => update({ radius: value })} />
          <Slider label="Noise / tremor severity" value={settings.noiseSeverity} min={0.1} max={1} step={0.01} display={`${Math.round(settings.noiseSeverity * 100)}%`} onChange={(value) => update({ noiseSeverity: value })} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Metric icon={ShieldAlert} label="Tremor index" value={`${Math.round(analysis.tremorIndex * 100)}%`} />
          <Metric icon={RadioTower} label="Network synchrony" value={`${Math.round(analysis.synchrony * 100)}%`} />
          <Metric icon={Gauge} label="Overload risk" value={`${Math.round(analysis.overloadDrive * 100)}%`} />
          <Metric icon={Target} label="Suppression score" value={`${Math.round(analysis.suppressionScore * 100)}%`} />
        </div>
        <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="h-4 w-4 text-cyan-200" />
            Effect pipeline
          </div>
          <div className="mt-4 space-y-3">
            <EffectBar label="Recruitment" value={analysis.effectiveness} color="linear-gradient(90deg, #4da2ff, #7ce8ff)" />
            <EffectBar label="Suppression potential" value={analysis.suppressionScore} color="linear-gradient(90deg, #44d6a8, #8df0c4)" />
            <EffectBar label="Overload drive" value={analysis.overloadDrive} color="linear-gradient(90deg, #ff934d, #ff5b47)" />
          </div>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          Educational modulation only. Send the state to Body Sandbox as context; do not interpret these sliders as clinical parameters.
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm text-slate-300"><strong className="text-white">{label}</strong><span>{display}</span></span>
      <input className="mt-2 w-full" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
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
      <div className="mb-1 flex justify-between text-xs text-slate-400"><span>{label}</span><span>{Math.round(value * 100)}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full" style={{ width: `${value * 100}%`, background: color }} /></div>
    </div>
  );
}

function windowScore(value: number, low: number, ideal: number, high: number) {
  if (value <= low) return clamp(value / low, 0, 0.72);
  if (value <= ideal) return 0.72 + ((value - low) / (ideal - low)) * 0.28;
  if (value <= high) return 1 - ((value - ideal) / (high - ideal)) * 0.32;
  return Math.max(0.2, 0.68 - (value - high) / high);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
