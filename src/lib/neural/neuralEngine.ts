import type {
  NeuralCircuitAnalysis,
  NeuralCircuitMetrics,
  NeuralCircuitPresetId,
  NeuralCircuitState,
  NeuralStimulationSettings,
  ParameterControlId
} from "@/lib/ontology/types";

export type NeuralNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  sensitivity: number;
};

export type NeuralEdge = {
  from: string;
  to: string;
  weight: number;
};

export interface NeuralCircuitPreset {
  id: NeuralCircuitPresetId;
  label: string;
  summary: string;
  description: string;
  stimulation: NeuralStimulationSettings;
}

export const neuralNodes: NeuralNode[] = [
  { id: "cortex-l", label: "Cortex L", x: -0.72, y: 0.22, sensitivity: 0.72 },
  { id: "cortex-r", label: "Cortex R", x: 0.72, y: 0.22, sensitivity: 0.72 },
  { id: "striatum-l", label: "Striatum L", x: -0.42, y: -0.02, sensitivity: 0.88 },
  { id: "striatum-r", label: "Striatum R", x: 0.42, y: -0.02, sensitivity: 0.88 },
  { id: "gpe-l", label: "GPe L", x: -0.2, y: -0.2, sensitivity: 0.88 },
  { id: "gpe-r", label: "GPe R", x: 0.2, y: -0.2, sensitivity: 0.88 },
  { id: "gpi-l", label: "GPi L", x: -0.08, y: -0.38, sensitivity: 1.04 },
  { id: "gpi-r", label: "GPi R", x: 0.08, y: -0.38, sensitivity: 1.04 },
  { id: "stn", label: "STN", x: 0, y: -0.08, sensitivity: 1.04 },
  { id: "thalamus", label: "Thalamus", x: 0, y: 0.26, sensitivity: 1.18 },
  { id: "motor", label: "Motor", x: 0, y: 0.58, sensitivity: 1.18 },
  { id: "dbs", label: "DBS", x: 0, y: -0.32, sensitivity: 1.18 }
];

const neuralEdgeTuples: Array<[string, string, number]> = [
  ["cortex-l", "striatum-l", 0.22],
  ["cortex-r", "striatum-r", 0.22],
  ["striatum-l", "gpe-l", 0.18],
  ["striatum-r", "gpe-r", 0.18],
  ["gpe-l", "stn", 0.16],
  ["gpe-r", "stn", 0.16],
  ["stn", "gpi-l", 0.25],
  ["stn", "gpi-r", 0.25],
  ["gpi-l", "thalamus", 0.22],
  ["gpi-r", "thalamus", 0.22],
  ["thalamus", "motor", 0.28],
  ["motor", "cortex-l", 0.18],
  ["motor", "cortex-r", 0.18],
  ["dbs", "stn", 0.4],
  ["dbs", "gpi-l", 0.3],
  ["dbs", "gpi-r", 0.3]
];

export const neuralEdges: NeuralEdge[] = neuralEdgeTuples.map(([from, to, weight]) => ({ from, to, weight }));

export const neuralCircuitPresets: NeuralCircuitPreset[] = [
  {
    id: "parkinsonian",
    label: "Parkinsonian tremor",
    summary: "High tremor load with stimulation off",
    description: "A noisy basal ganglia loop state for exploring motor-circuit instability before modulation.",
    stimulation: {
      enabled: false,
      mode: "tremor",
      noiseSeverity: 0.86,
      amplitude: 0.62,
      frequency: 80,
      pulseWidth: 70,
      radius: 0.34,
      electrodeId: "dbs"
    }
  },
  {
    id: "generic-motor",
    label: "Generic motor pathway",
    summary: "Reference cortex-basal ganglia-thalamus-motor loop",
    description: "A calmer motor pathway preset that can still be perturbed or modulated.",
    stimulation: {
      enabled: false,
      mode: "stabilized",
      noiseSeverity: 0.34,
      amplitude: 0.48,
      frequency: 90,
      pulseWidth: 62,
      radius: 0.28,
      electrodeId: "dbs"
    }
  },
  {
    id: "underpowered",
    label: "Under-tuned DBS",
    summary: "Stimulation is active but too weak to calm the loop",
    description: "Shows why simply turning stimulation on does not guarantee a stable circuit state.",
    stimulation: {
      enabled: true,
      mode: "tremor",
      noiseSeverity: 0.72,
      amplitude: 0.48,
      frequency: 62,
      pulseWidth: 54,
      radius: 0.24,
      electrodeId: "dbs"
    }
  },
  {
    id: "therapeutic-window",
    label: "Therapeutic-window demo",
    summary: "Near the suppressive sweet spot in the educational model",
    description: "A balanced parameter mix showing reduced tremor load without high overload.",
    stimulation: {
      enabled: true,
      mode: "tremor",
      noiseSeverity: 0.64,
      amplitude: 0.86,
      frequency: 128,
      pulseWidth: 94,
      radius: 0.42,
      electrodeId: "dbs"
    }
  },
  {
    id: "overdriven",
    label: "Overdriven DBS",
    summary: "Aggressive stimulation pushes off-target overload",
    description: "Demonstrates that more amplitude, frequency or pulse width is not automatically better.",
    stimulation: {
      enabled: true,
      mode: "tremor",
      noiseSeverity: 0.68,
      amplitude: 1.34,
      frequency: 178,
      pulseWidth: 154,
      radius: 0.7,
      electrodeId: "dbs"
    }
  }
];

export function createNeuralCircuitState(presetId: NeuralCircuitPresetId = "parkinsonian"): NeuralCircuitState {
  const preset = neuralCircuitPresets.find((item) => item.id === presetId) ?? neuralCircuitPresets[0];
  return buildNeuralCircuitState(preset.id, preset.stimulation);
}

export function buildNeuralCircuitState(presetId: NeuralCircuitPresetId, stimulation: NeuralStimulationSettings, sentToBodyAt?: string): NeuralCircuitState {
  const preset = neuralCircuitPresets.find((item) => item.id === presetId) ?? neuralCircuitPresets[0];
  const analysis = analyzeNeuralStimulation(stimulation);
  const metrics = computeNeuralCircuitMetrics(stimulation, analysis);
  return {
    presetId,
    label: preset.label,
    summary: `${preset.label}: tremor ${Math.round(metrics.tremorIndex * 100)}%, synchrony ${Math.round(metrics.synchrony * 100)}%, overload ${Math.round(metrics.overloadRisk * 100)}%, suppression ${Math.round(metrics.suppressionScore * 100)}%.`,
    stimulation: { ...stimulation },
    metrics,
    analysis,
    sentToBodyAt,
    updatedAt: new Date().toISOString()
  };
}

export function applyNeuralPreset(id: NeuralCircuitPresetId) {
  return createNeuralCircuitState(id);
}

export function updateNeuralStimulationState(state: NeuralCircuitState, patch: Partial<NeuralStimulationSettings>) {
  return buildNeuralCircuitState(state.presetId, { ...state.stimulation, ...patch }, state.sentToBodyAt);
}

export function analyzeNeuralStimulation(stimulation: NeuralStimulationSettings): NeuralCircuitAnalysis {
  const amplitudeWindow = gradeWindow(stimulation.amplitude, 0.68, 0.96, 1.14);
  const frequencyWindow = gradeWindow(stimulation.frequency, 95, 130, 160);
  const pulseWidthWindow = gradeWindow(stimulation.pulseWidth, 65, 95, 125);
  const radiusWindow = gradeWindow(stimulation.radius, 0.26, 0.42, 0.56);
  const enabledFactor = stimulation.enabled ? 1 : 0;

  const effectiveness = enabledFactor * clamp(
    amplitudeWindow.goodness * 0.28 +
      frequencyWindow.goodness * 0.34 +
      pulseWidthWindow.goodness * 0.22 +
      radiusWindow.goodness * 0.16,
    0,
    1
  );

  const overloadDrive = enabledFactor * clamp(
    amplitudeWindow.excess * 0.32 +
      frequencyWindow.excess * 0.3 +
      pulseWidthWindow.excess * 0.18 +
      Math.max(0, stimulation.noiseSeverity - 0.72) * 0.16 +
      Math.max(0, radiusWindow.excess - 0.15) * 0.1,
    0,
    1
  );

  const suppressionPotential = clamp(
    effectiveness * (1 - overloadDrive * 0.55) * (0.92 - Math.max(0, stimulation.noiseSeverity - 0.72) * 0.28),
    0,
    1
  );

  const teachingPoints = [
    !stimulation.enabled
      ? "Stimulation is off, so the network is only showing baseline tremor noise."
      : frequencyWindow.goodness < 0.45
        ? "Frequency is the main limiter right now. The loop is not being rhythmically entrained strongly enough."
        : null,
    amplitudeWindow.goodness < 0.4 ? "Amplitude is too low to recruit a stable suppressive field." : null,
    overloadDrive > 0.45 ? "The current parameter mix is trading suppression for overload. Lower amplitude, frequency or pulse width in the sandbox to explore the contrast." : null,
    suppressionPotential > 0.62 && overloadDrive < 0.3 ? "The educational model is close to a suppressive window: enough rhythmic drive to calm tremor without destabilising the loop." : null
  ].filter(Boolean) as string[];

  const stateLabel =
    !stimulation.enabled ? "underpowered"
    : suppressionPotential > 0.62 && overloadDrive < 0.32 ? "suppressed"
    : overloadDrive > 0.48 ? "overdriven"
    : effectiveness > 0.48 ? "therapeutic"
    : "underpowered";

  return {
    stateLabel,
    effectiveness: round(effectiveness),
    suppressionPotential: round(suppressionPotential),
    overloadDrive: round(overloadDrive),
    parameterEffects: [
      describeParameter("Amplitude", amplitudeWindow, "Enough current to recruit the loop", "Too much current pushes the loop toward overload"),
      describeParameter("Frequency", frequencyWindow, "Rhythmic entrainment matches suppressive DBS cadence in this model", "High-frequency driving is becoming destabilising"),
      describeParameter("Pulse width", pulseWidthWindow, "Pulse width is wide enough to engage the target", "Very wide pulses broaden the field beyond the target"),
      describeParameter("Radius", radiusWindow, "Field spread covers the intended pathway", "Field spread is broad enough to touch off-target regions")
    ],
    teachingPoints: teachingPoints.length ? teachingPoints : ["The loop is in a reference exploratory state."]
  };
}

export function computeNeuralCircuitMetrics(stimulation: NeuralStimulationSettings, analysis = analyzeNeuralStimulation(stimulation)): NeuralCircuitMetrics {
  const dose = clamp(
    (stimulation.amplitude * stimulation.frequency * stimulation.pulseWidth * stimulation.radius * (stimulation.enabled ? 1 : 0.25)) / 5000,
    0,
    1
  );
  const tremorBase = stimulation.mode === "tremor" ? stimulation.noiseSeverity * 1.08 : stimulation.noiseSeverity * 0.62;
  const tremorIndex = clamp(tremorBase * (1 - analysis.suppressionPotential * 0.42) + analysis.overloadDrive * 0.22, 0, 1);
  const overloadRisk = clamp(dose * 0.72 + stimulation.noiseSeverity * 0.16 + analysis.overloadDrive * 0.42, 0, 1);
  const suppressionScore = clamp(analysis.suppressionPotential * (1 - overloadRisk * 0.48) * (1 - tremorIndex * 0.45), 0, 1);
  const synchrony = clamp(stimulation.noiseSeverity * 0.62 + analysis.overloadDrive * 0.28 - suppressionScore * 0.2, 0, 1);
  const firingRate = clamp(4.5 + tremorIndex * 10.5 + overloadRisk * 7.2 - suppressionScore * 3.4, 0, 30);
  const networkEntropy = clamp(0.44 + synchrony * 0.2 + overloadRisk * 0.22 - suppressionScore * 0.12, 0, 1);

  return {
    firingRate: round(firingRate),
    synchrony: round(synchrony),
    tremorIndex: round(tremorIndex),
    stimulationDose: round(dose),
    overloadRisk: round(overloadRisk),
    suppressionScore: round(suppressionScore),
    networkEntropy: round(networkEntropy)
  };
}

export function neuralStateToBodyPatch(state: NeuralCircuitState): {
  parameters: Partial<Record<ParameterControlId, number>>;
  summary: string;
} {
  const neuralSynchrony = clamp(
    0.22 + state.metrics.tremorIndex * 0.5 + state.metrics.overloadRisk * 0.18 - state.metrics.suppressionScore * 0.22,
    0,
    1
  );
  const oxidativeStress = clamp(0.25 + state.metrics.overloadRisk * 0.18 + state.metrics.tremorIndex * 0.08, 0, 1);
  return {
    parameters: {
      neuralSynchrony: round(neuralSynchrony),
      oxidativeStress: round(oxidativeStress)
    },
    summary: `Neural state sent to Body Sandbox: synchrony ${Math.round(neuralSynchrony * 100)}%, exploratory oxidative load ${Math.round(oxidativeStress * 100)}%.`
  };
}

function gradeWindow(value: number, low: number, ideal: number, high: number) {
  const below = value < ideal ? 1 - (ideal - value) / Math.max(0.001, ideal - low) : 1;
  const above = value > ideal ? 1 - (value - ideal) / Math.max(0.001, high - ideal) : 1;
  const goodness = clamp(Math.min(below, above), 0, 1);
  const excess = value > high ? clamp((value - high) / Math.max(0.001, high), 0, 1) : 0;
  const deficit = value < low ? clamp((low - value) / Math.max(0.001, low), 0, 1) : 0;
  return { goodness, excess, deficit };
}

function describeParameter(
  label: string,
  window: { goodness: number; excess: number; deficit: number },
  goodDetail: string,
  highDetail: string
) {
  if (window.deficit > 0.12) {
    return { label, status: "low" as const, detail: `${label} is currently underpowered.` };
  }
  if (window.excess > 0.08) {
    return { label, status: "high" as const, detail: highDetail };
  }
  return { label, status: "good" as const, detail: goodDetail };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
