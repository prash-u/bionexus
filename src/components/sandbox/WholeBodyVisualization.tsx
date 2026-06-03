import { Activity, Brain, Info, Waves } from "lucide-react";
import type { PointerEvent as ReactPointerEvent, ReactNode, WheelEvent as ReactWheelEvent } from "react";
import { useEffect, useMemo, useState } from "react";

export type BodySystemFilterId =
  | "nervous"
  | "musculoskeletal"
  | "cardiovascular"
  | "respiratory"
  | "digestive"
  | "endocrine"
  | "renal"
  | "ocular"
  | "cns"
  | "eye"
  | "heart"
  | "lungs"
  | "liver"
  | "pancreas"
  | "gut"
  | "kidney"
  | "muscle"
  | "immune"
  | "pns"
  | "adipose";

type BodyRegion = {
  id: BodySystemFilterId;
  filterId: BodySystemFilterId;
  label: string;
  plainLabel: string;
  x: number;
  y: number;
  tone: string;
  description: string;
  molecules: string[];
};

type WholeBodyVisualizationProps = {
  sandbox?: any;
  sandboxState?: any;
  simulationResult?: any;
  result?: any;
  activeSystems?: BodySystemFilterId[];
  className?: string;
  [key: string]: unknown;
};

type DensityLevel = "low" | "medium" | "high" | "maximum";
type AtlasSystemId = Extract<
  BodySystemFilterId,
  "nervous" | "cardiovascular" | "respiratory" | "digestive" | "endocrine" | "immune" | "musculoskeletal" | "renal" | "ocular"
>;

type OverlayPath = {
  id: string;
  d: string;
  label?: string;
  molecule?: string;
  stroke?: string;
  reverse?: boolean;
};

type SystemOverlay = {
  id: AtlasSystemId;
  label: string;
  purpose: string;
  color: string;
  secondaryColor?: string;
  dasharray: string;
  width: number;
  particleShape: "dot" | "spark" | "cell" | "wave" | "triangle";
  paths: OverlayPath[];
  nodes: Array<{ x: number; y: number; label: string; molecule?: string }>;
};

const regions: BodyRegion[] = [
  { id: "cns", filterId: "nervous", label: "Brain / CNS", plainLabel: "Brain and central nervous system", x: 50, y: 11, tone: "cyan", description: "Coordinates neural signalling, motor control and sensory integration.", molecules: ["dopamine", "BDNF", "alpha-synuclein"] },
  { id: "eye", filterId: "ocular", label: "Eye / retina", plainLabel: "Eye and retina", x: 50, y: 9, tone: "violet", description: "Represents photoreceptor stress, retinal support and visual function signals.", molecules: ["RPE65", "rhodopsin", "AAV payload"] },
  { id: "pns", filterId: "nervous", label: "Peripheral nerves", plainLabel: "Peripheral nervous system", x: 50, y: 24, tone: "blue", description: "Carries body-to-brain and brain-to-body signalling across peripheral circuits.", molecules: ["acetylcholine", "neurofilament", "ion channels"] },
  { id: "heart", filterId: "cardiovascular", label: "Heart", plainLabel: "Heart", x: 50, y: 30, tone: "rose", description: "Tracks cardiovascular regulation, perfusion and autonomic state in the sandbox.", molecules: ["NO", "angiotensin II", "adrenaline"] },
  { id: "lungs", filterId: "respiratory", label: "Lungs", plainLabel: "Lungs", x: 50, y: 27, tone: "sky", description: "Represents oxygen exchange, respiratory load and inflammatory signalling.", molecules: ["O2", "CO2", "IL-6"] },
  { id: "immune", filterId: "immune", label: "Immune / blood", plainLabel: "Immune and blood system", x: 45, y: 38, tone: "emerald", description: "Summarises circulating immune activity, cytokine tone and inflammatory state.", molecules: ["IL-6", "TNF-alpha", "CRP"] },
  { id: "liver", filterId: "endocrine", label: "Liver", plainLabel: "Liver", x: 55, y: 40, tone: "amber", description: "Handles metabolic buffering, detoxification and glucose/lipid regulation.", molecules: ["glucose", "insulin", "AMPK"] },
  { id: "pancreas", filterId: "endocrine", label: "Pancreas", plainLabel: "Pancreas", x: 51, y: 43, tone: "teal", description: "Represents insulin secretion and glucose sensing in metabolic scenarios.", molecules: ["insulin", "GLP-1", "glucagon"] },
  { id: "gut", filterId: "digestive", label: "Gut", plainLabel: "Gut", x: 50, y: 51, tone: "lime", description: "Models digestion, microbiome-adjacent signals and inflammatory exchange.", molecules: ["SCFA", "GLP-1", "bile acids"] },
  { id: "kidney", filterId: "renal", label: "Kidney", plainLabel: "Kidney", x: 58, y: 49, tone: "cyan", description: "Tracks filtration, fluid balance and cardiovascular-metabolic coupling.", molecules: ["renin", "creatinine", "sodium"] },
  { id: "adipose", filterId: "endocrine", label: "Adipose", plainLabel: "Adipose tissue", x: 50, y: 56, tone: "violet", description: "Represents stored-energy signalling and endocrine metabolic tone.", molecules: ["leptin", "adiponectin", "free fatty acids"] },
  { id: "muscle", filterId: "musculoskeletal", label: "Skeletal muscle", plainLabel: "Skeletal muscle", x: 36, y: 63, tone: "blue", description: "Shows movement, glucose uptake, mitochondrial reserve and exercise adaptation.", molecules: ["ATP", "GLUT4", "myokines"] }
];

const atlasSystems: SystemOverlay[] = [
  {
    id: "nervous",
    label: "Nervous",
    purpose: "Information flow",
    color: "#67e8f9",
    secondaryColor: "#a78bfa",
    dasharray: "1.4 2.6",
    width: 0.52,
    particleShape: "spark",
    paths: [
      { id: "brain-spine-muscle", d: "M50 11 C50 18 50 24 50 33 C48 45 42 56 36 63 C43 72 47 77 43 79 M50 33 C62 42 71 52 74 38 M50 33 C56 56 57 68 57 79", label: "Brain -> spinal cord -> limbs/organs", molecule: "action potential" },
      { id: "brain-pns-organs", d: "M50 24 C46 30 45 36 45 38 M50 24 C54 32 55 39 51 43", label: "Autonomic branches", molecule: "acetylcholine" },
      { id: "eye-visual-cortex", d: "M50 9 C50 10 50 12 50 13 C50 12 50 11 50 11", label: "Retina -> visual cortex", molecule: "visual signal" },
      { id: "gut-enteric", d: "M50 11 C47 25 48 40 50 51", label: "Gut-brain axis", molecule: "enteric signalling" }
    ],
    nodes: [
      { x: 50, y: 11, label: "Brain" },
      { x: 50, y: 24, label: "Spinal cord" },
      { x: 50, y: 33, label: "PNS" },
      { x: 36, y: 63, label: "Motor output" }
    ]
  },
  {
    id: "cardiovascular",
    label: "Cardiovascular",
    purpose: "Circulation",
    color: "#fb7185",
    secondaryColor: "#38bdf8",
    dasharray: "6 3",
    width: 0.68,
    particleShape: "dot",
    paths: [
      { id: "heart-lung", d: "M50 30 C46 27 44 27 44 28 C49 25 51 25 56 28 C56 27 54 27 50 30", label: "Heart -> lungs -> heart", molecule: "O2 / CO2", stroke: "#38bdf8" },
      { id: "heart-body-loop", d: "M50 30 C31 40 29 54 26 38 M50 30 C70 40 72 54 74 38 M50 30 C43 48 41 68 43 79 M50 30 C58 48 59 68 57 79 C51 68 49 46 50 30", label: "Heart -> body -> heart", molecule: "oxygenated blood", stroke: "#fb7185" },
      { id: "portal-flow", d: "M50 51 C51 47 53 43 55 40 C53 35 51 32 50 30", label: "Portal/metabolic return", molecule: "nutrients" }
    ],
    nodes: [
      { x: 50, y: 30, label: "Heart" },
      { x: 50, y: 27, label: "Lungs" },
      { x: 43, y: 79, label: "Body perfusion" }
    ]
  },
  {
    id: "respiratory",
    label: "Respiratory",
    purpose: "Gas exchange",
    color: "#7dd3fc",
    secondaryColor: "#c4b5fd",
    dasharray: "3 5",
    width: 0.6,
    particleShape: "wave",
    paths: [
      { id: "airway", d: "M50 15 C50 18 50 21 50 21 C47 24 44 27 44 28 M50 21 C53 24 56 27 56 28", label: "Mouth/nose -> trachea -> lungs", molecule: "O2" },
      { id: "co2-return", d: "M56 28 C53 24 50 21 50 15 M44 28 C47 24 50 21 50 15", label: "CO2 movement", molecule: "CO2", stroke: "#c4b5fd", reverse: true },
      { id: "lung-blood", d: "M44 28 C46 29 48 30 50 30 M56 28 C54 29 52 30 50 30", label: "Alveoli -> bloodstream", molecule: "gas exchange" }
    ],
    nodes: [
      { x: 50, y: 15, label: "Airway" },
      { x: 44, y: 28, label: "Left lung" },
      { x: 56, y: 28, label: "Right lung" }
    ]
  },
  {
    id: "digestive",
    label: "Digestive",
    purpose: "Nutrient flow",
    color: "#bef264",
    secondaryColor: "#facc15",
    dasharray: "2 2",
    width: 0.6,
    particleShape: "dot",
    paths: [
      { id: "mouth-gut-liver", d: "M50 15 C49 28 48 37 48 41 C50 45 50 48 50 51 C53 48 55 44 55 40", label: "Mouth -> stomach -> gut -> liver", molecule: "nutrients" },
      { id: "liver-blood", d: "M55 40 C54 36 52 32 50 30", label: "Liver -> bloodstream", molecule: "glucose/lipids" }
    ],
    nodes: [
      { x: 50, y: 15, label: "Mouth" },
      { x: 48, y: 41, label: "Stomach" },
      { x: 50, y: 50, label: "Small intestine" }
    ]
  },
  {
    id: "endocrine",
    label: "Endocrine",
    purpose: "Hormone signalling",
    color: "#a78bfa",
    secondaryColor: "#2dd4bf",
    dasharray: "1 5",
    width: 0.56,
    particleShape: "wave",
    paths: [
      { id: "pituitary-thyroid-adrenal", d: "M50 11 C50 15 50 18 50 19 C54 28 57 39 58 45 C54 49 51 54 50 56", label: "Pituitary -> thyroid/adrenal/adipose", molecule: "cortisol / thyroid hormones" },
      { id: "pancreas-muscle", d: "M51 43 C47 50 42 58 36 63", label: "Pancreas -> muscle", molecule: "insulin" },
      { id: "pancreas-liver", d: "M51 43 C52 42 54 41 55 40", label: "Pancreas -> liver", molecule: "insulin / glucagon" }
    ],
    nodes: [
      { x: 50, y: 19, label: "Thyroid" },
      { x: 51, y: 43, label: "Pancreas", molecule: "insulin" },
      { x: 58, y: 45, label: "Adrenal", molecule: "cortisol" }
    ]
  },
  {
    id: "immune",
    label: "Immune / Lymphatic",
    purpose: "Immune signalling",
    color: "#34d399",
    secondaryColor: "#f0abfc",
    dasharray: "4 2 1 2",
    width: 0.58,
    particleShape: "cell",
    paths: [
      { id: "lymph-chain", d: "M45 38 C48 32 51 29 50 27 C56 32 57 42 50 51 C47 47 45 42 45 38", label: "Lymph and blood signalling", molecule: "IL6 / TNF" },
      { id: "marrow-blood", d: "M43 79 C42 62 43 48 45 38", label: "Bone marrow -> blood", molecule: "immune cells" },
      { id: "gut-immune", d: "M50 51 C47 46 45 42 45 38", label: "Gut immune interface", molecule: "cytokines" }
    ],
    nodes: [
      { x: 45, y: 38, label: "Lymph/blood", molecule: "IL6" },
      { x: 43, y: 79, label: "Bone marrow" },
      { x: 50, y: 51, label: "Gut interface" }
    ]
  },
  {
    id: "musculoskeletal",
    label: "Musculoskeletal",
    purpose: "Movement output",
    color: "#60a5fa",
    secondaryColor: "#fbbf24",
    dasharray: "8 4",
    width: 0.72,
    particleShape: "triangle",
    paths: [
      { id: "motor-output", d: "M50 24 C43 35 38 50 36 63 C41 71 43 77 43 79 M50 24 C60 34 70 40 74 38 M50 24 C54 55 57 70 57 79", label: "Motor command -> force output", molecule: "ATP / myokines" },
      { id: "upper-limb-force", d: "M50 30 C39 33 30 36 26 38 M50 30 C61 33 70 36 74 38", label: "Upper limb force", molecule: "actin/myosin" },
      { id: "lower-limb-force", d: "M50 62 C46 68 43 74 43 79 M50 62 C54 68 57 74 57 79", label: "Lower limb force", molecule: "ATP" }
    ],
    nodes: [
      { x: 36, y: 63, label: "Skeletal muscle", molecule: "ATP" },
      { x: 26, y: 38, label: "Upper limb L" },
      { x: 57, y: 79, label: "Lower limb R" }
    ]
  },
  {
    id: "renal",
    label: "Renal / Urinary",
    purpose: "Filtration and fluid regulation",
    color: "#22d3ee",
    secondaryColor: "#93c5fd",
    dasharray: "5 2",
    width: 0.58,
    particleShape: "dot",
    paths: [
      { id: "blood-kidney", d: "M50 30 C54 38 57 45 58 49", label: "Bloodstream -> kidneys", molecule: "filtrate" },
      { id: "kidney-bladder", d: "M58 49 C55 55 52 59 50 62", label: "Kidneys -> bladder", molecule: "fluid balance" },
      { id: "kidney-heart", d: "M58 49 C55 40 52 33 50 30", label: "Fluid regulation feedback", molecule: "renin/sodium", reverse: true }
    ],
    nodes: [
      { x: 58, y: 49, label: "Kidney", molecule: "renin" },
      { x: 50, y: 62, label: "Bladder" },
      { x: 50, y: 30, label: "Fluid feedback" }
    ]
  },
  {
    id: "ocular",
    label: "Ocular",
    purpose: "Visual pathway",
    color: "#c084fc",
    secondaryColor: "#67e8f9",
    dasharray: "1 1",
    width: 0.64,
    particleShape: "spark",
    paths: [
      { id: "retina-optic-cortex", d: "M50 9 C50 11 50 12 50 13 C50 12 50 11 50 11", label: "Retina -> optic nerve -> visual cortex", molecule: "phototransduction" },
      { id: "retina-support", d: "M50 9 C50 22 51 34 51 43", label: "Retina support context", molecule: "RPE65 / photoreceptors" }
    ],
    nodes: [
      { x: 50, y: 9, label: "Retina", molecule: "RPE65" },
      { x: 50, y: 13, label: "Optic nerve" },
      { x: 50, y: 11, label: "Visual cortex" }
    ]
  }
];

const atlasSystemOptions = atlasSystems.map(({ id, label, purpose }) => ({ id, label, purpose }));
const densityOptions: Array<{ id: DensityLevel; label: string; particles: number }> = [
  { id: "low", label: "Low", particles: 1 },
  { id: "medium", label: "Medium", particles: 2 },
  { id: "high", label: "High", particles: 3 },
  { id: "maximum", label: "Maximum", particles: 4 }
];

const regionSynonyms: Partial<Record<BodySystemFilterId, string[]>> = {
  cns: ["brain", "neural", "nervous", "motor", "dopamine", "cns", "basal"],
  eye: ["eye", "retina", "retinal", "visual", "photoreceptor", "ocular"],
  heart: ["heart", "cardio", "vascular", "blood pressure"],
  lungs: ["lung", "respiratory", "oxygen"],
  liver: ["liver", "hepatic", "glucose", "lipid"],
  pancreas: ["pancreas", "insulin", "glucose", "beta"],
  gut: ["gut", "intestinal", "microbiome", "digest"],
  kidney: ["kidney", "renal", "filtration"],
  muscle: ["muscle", "motor", "exercise", "movement", "mitochondrial"],
  immune: ["immune", "inflammatory", "inflammation", "cytokine", "blood"],
  pns: ["peripheral", "nerve", "autonomic", "sensory"],
  adipose: ["adipose", "fat", "metabolic", "lipid"]
};

export function WholeBodyVisualization(props: WholeBodyVisualizationProps) {
  const sandbox = props.sandbox ?? props.sandboxState;
  const result = props.simulationResult ?? props.result ?? sandbox?.simulationResult;
  const scenario = sandbox?.scenario ?? {};
  const presetId = sandbox?.activeScenarioId ?? scenario?.id ?? "";
  const isHealthyBaseline = presetId === "healthy-baseline";
  const mode = getReaderMode();
  const showRawDetails = mode === "researcher" || mode === "expert";
  const initialSystems = props.activeSystems?.filter((id): id is AtlasSystemId => atlasSystems.some((system) => system.id === id)) ?? ["nervous", "cardiovascular", "respiratory"];
  const [enabledSystems, setEnabledSystems] = useState<AtlasSystemId[]>(initialSystems.length ? initialSystems : ["nervous", "cardiovascular", "respiratory"]);
  const [showMolecules, setShowMolecules] = useState(mode === "researcher" || mode === "expert");
  const [showLabels, setShowLabels] = useState(true);
  const [signalDensity, setSignalDensity] = useState<DensityLevel>("medium");
  const [selectedRegionId, setSelectedRegionId] = useState<BodySystemFilterId>("cns");
  const [atlasViewport, setAtlasViewport] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number; panX: number; panY: number; zoom: number } | null>(null);
  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? regions[0];
  const scores = useMemo(() => buildRegionScores(result, scenario, isHealthyBaseline), [result, scenario, isHealthyBaseline]);
  const activeSet = new Set<BodySystemFilterId>(enabledSystems);
  const selectedScore = scores[selectedRegion.id] ?? 18;
  const selectedActive = activeSet.size === 0 || activeSet.has(selectedRegion.id) || activeSet.has(selectedRegion.filterId);
  const activeOverlayDetails = atlasSystems.filter((system) => enabledSystems.includes(system.id));
  const atlasTransform = atlasTransformForViewport(atlasViewport);
  const toggleOverlay = (id: AtlasSystemId) => {
    setEnabledSystems((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };
  useEffect(() => {
    if (!props.activeSystems) return;
    const nextSystems = props.activeSystems.filter((id): id is AtlasSystemId => atlasSystems.some((system) => system.id === id));
    setEnabledSystems(nextSystems.length ? nextSystems : []);
  }, [props.activeSystems]);
  const updateZoom = (nextZoom: number) => setAtlasViewport((current) => ({ ...current, zoom: clamp(nextZoom, 0.72, 3) }));
  const resetViewport = () => {
    setAtlasViewport({ zoom: 1, panX: 0, panY: 0 });
    setDragStart(null);
  };
  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.92 : 1.08;
    setAtlasViewport((current) => ({ ...current, zoom: clamp(current.zoom * delta, 0.72, 3) }));
  };
  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const target = event.target as Element;
    if (target.closest("[data-region-anchor='true']")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({ clientX: event.clientX, clientY: event.clientY, panX: atlasViewport.panX, panY: atlasViewport.panY, zoom: atlasViewport.zoom });
  };
  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragStart) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - dragStart.clientX) / Math.max(bounds.width, 1)) * 100;
    const dy = ((event.clientY - dragStart.clientY) / Math.max(bounds.height, 1)) * 100;
    setAtlasViewport((current) => ({ ...current, panX: dragStart.panX + dx, panY: dragStart.panY + dy }));
  };
  const handlePointerUp = () => setDragStart(null);

  return (
    <section className={`rounded-xl border border-cyan-300/20 bg-slate-950/55 p-3 shadow-[0_0_40px_rgba(34,211,238,0.08)] ${props.className ?? ""}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Whole Body Visualisation</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{isHealthyBaseline ? "Healthy Baseline" : scenario?.title ?? "Body sandbox state"}</h2>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-300">
            {isHealthyBaseline
              ? "This reference model shows a stable body state with no selected disease or perturbation. Use the controls to adjust biological parameters or test an intervention."
              : "This body-scale map shows relative system changes from the selected scenario, assumptions and sandbox parameters."}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 text-xs text-emerald-100">
          <Info className="mr-1 inline h-3.5 w-3.5" />
          0-100 arbitrary simulation units, not a clinical measurement.
        </div>
      </div>

      <div className="mb-3 rounded-xl border border-white/10 bg-slate-950/55 p-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Systems</p>
            <div className="flex flex-wrap gap-2">
              {atlasSystemOptions.map((system) => {
                const active = enabledSystems.includes(system.id);
                return (
                  <button
                    key={system.id}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active ? "border-cyan-300/50 bg-cyan-300/12 text-cyan-50" : "border-slate-700/60 bg-slate-950/50 text-slate-400 hover:border-violet-300/45"
                    }`}
                    onClick={() => toggleOverlay(system.id)}
                    title={system.purpose}
                  >
                    {system.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <ToggleButton active={showMolecules} label="Molecules" onClick={() => setShowMolecules((value) => !value)} />
            <ToggleButton active={showLabels} label="Labels" onClick={() => setShowLabels((value) => !value)} />
            <label className="block text-xs text-slate-400">
              <span className="mb-1 block uppercase tracking-[0.16em] text-slate-500">Signal Density</span>
              <select
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200"
                value={signalDensity}
                onChange={(event) => setSignalDensity(event.target.value as DensityLevel)}
              >
                {densityOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(680px,1fr)_minmax(300px,360px)] 2xl:grid-cols-[minmax(840px,1fr)_minmax(320px,380px)]">
        <div className="relative min-h-[760px] overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_18%,rgba(34,211,238,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.92))] p-4">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-950/75 p-1 text-xs text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.12)] backdrop-blur">
            <button type="button" className="rounded-full px-2.5 py-1 transition hover:bg-cyan-300/12" onClick={() => updateZoom(atlasViewport.zoom * 1.12)} aria-label="Zoom in">+</button>
            <span className="min-w-12 text-center tabular-nums">{Math.round(atlasViewport.zoom * 100)}%</span>
            <button type="button" className="rounded-full px-2.5 py-1 transition hover:bg-cyan-300/12" onClick={() => updateZoom(atlasViewport.zoom * 0.88)} aria-label="Zoom out">-</button>
            <button type="button" className="rounded-full border border-white/10 px-2.5 py-1 text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-50" onClick={resetViewport}>Reset</button>
          </div>
          <svg
            className={`absolute inset-0 h-full w-full ${dragStart ? "cursor-grabbing" : "cursor-grab"}`}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="BioNexus whole-body atlas with biological system overlays"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
          >
            <defs>
              <radialGradient id="bodyAtlasGlow" cx="50%" cy="42%" r="55%">
                <stop offset="0%" stopColor="rgb(125 249 255)" stopOpacity="0.24" />
                <stop offset="55%" stopColor="rgb(34 211 238)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="rgb(2 6 23)" stopOpacity="0" />
              </radialGradient>
              <filter id="bodyAtlasDropGlow" x="-40%" y="-20%" width="180%" height="150%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="atlasSystemGlow">
                <feGaussianBlur stdDeviation="0.65" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#bodyAtlasGlow)" />
            <g transform={atlasTransform}>
              <image
                href="/anatomogram-human.svg"
                x="0"
                y="0"
                width="100"
                height="100"
                opacity="0.9"
                preserveAspectRatio="xMidYMid meet"
                filter="url(#bodyAtlasDropGlow)"
              />
              <SystemOverlayLayer systems={activeOverlayDetails} density={signalDensity} showLabels={showLabels} showMolecules={showMolecules && mode !== "beginner" && signalDensity !== "low"} mode={mode} />
              {showMolecules ? <MolecularEdges isHealthyBaseline={isHealthyBaseline} selectedRegion={selectedRegion} /> : null}
              <RegionAnchorLayer
                activeSet={activeSet}
                density={signalDensity}
                isHealthyBaseline={isHealthyBaseline}
                regions={regions}
                scores={scores}
                selectedRegionId={selectedRegion.id}
                showLabels={showLabels}
                showScores={showRawDetails}
                onSelect={setSelectedRegionId}
              />
            </g>
          </svg>
        </div>

        <aside className="max-h-[760px] space-y-3 overflow-y-auto pr-1">
          <div className="rounded-xl border border-white/10 bg-slate-950/65 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{isHealthyBaseline ? "Baseline system activity" : selectedRegion.plainLabel}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">{selectedRegion.label}</h3>
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                {scoreLabel(mode)}: {Math.round(selectedScore)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {isHealthyBaseline
                ? "This region is currently within the reference model range. Select a scenario or adjust parameters to see how it changes."
                : selectedRegion.description}
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Scores are relative 0-100 arbitrary units used for educational simulation only. They are not clinical measurements.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/65 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-100">{inspectorTitle(mode)}</p>
            <div className="mt-3 space-y-3">
              <MechanismRow icon={<Brain className="h-4 w-4" />} label="Possible upstream factors" value={isHealthyBaseline && !showRawDetails ? "No dominant disruption selected." : upstreamText(result, selectedRegion)} />
              <MechanismRow icon={<Waves className="h-4 w-4" />} label="Pathway signal" value={pathwayText(result, selectedRegion)} />
              <MechanismRow icon={<Activity className="h-4 w-4" />} label="System response" value={selectedActive ? `${selectedRegion.plainLabel} is included in the current body map.` : `${selectedRegion.plainLabel} is currently dimmed by the active filter.`} />
            </div>
            {showRawDetails ? (
              <div className="mt-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Molecular edge payload</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Example traversal: {selectedRegion.molecules.join(" -> ")}. Ratios are illustrative sandbox weights, not measured stoichiometry.
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {regions.map((region) => (
              <button
                key={region.id}
                type="button"
                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                  region.id === selectedRegion.id ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-violet-300/40"
                }`}
                onClick={() => setSelectedRegionId(region.id)}
              >
                <span className="block font-semibold">{region.plainLabel}</span>
                <span className="mt-1 block text-slate-500">{Math.round(scores[region.id] ?? 14)} relative units</span>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/65 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active systems</p>
            <div className="mt-3 space-y-2">
              {activeOverlayDetails.map((system) => (
                <div key={system.id} className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{system.label}</span>
                    <span className="h-2.5 w-8 rounded-full" style={{ background: `linear-gradient(90deg, ${system.color}, ${system.secondaryColor ?? system.color})` }} />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{system.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ToggleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-emerald-300/50 bg-emerald-300/12 text-emerald-50" : "border-slate-700/60 bg-slate-950/50 text-slate-400 hover:border-cyan-300/45"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SystemOverlayLayer({
  systems,
  density,
  showLabels,
  showMolecules,
  mode
}: {
  systems: SystemOverlay[];
  density: DensityLevel;
  showLabels: boolean;
  showMolecules: boolean;
  mode: string;
}) {
  const particlesPerPath = densityOptions.find((option) => option.id === density)?.particles ?? 2;
  const labelMode = showLabels && mode !== "beginner";
  const detailedPathLabels = labelMode && (density === "high" || density === "maximum" || systems.length <= 3);
  const simpleLabels = showLabels && mode === "beginner";

  return (
    <g className="pointer-events-none">
      {systems.map((system, systemIndex) => (
        <g key={system.id} opacity={0.88}>
          {system.paths.map((path, pathIndex) => {
            const stroke = path.stroke ?? system.color;
            return (
              <g key={path.id}>
                <path
                  d={path.d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={system.width}
                  strokeDasharray={system.dasharray}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.42}
                  filter="url(#atlasSystemGlow)"
                />
                <path
                  d={path.d}
                  fill="none"
                  stroke={system.secondaryColor ?? stroke}
                  strokeWidth={system.width * 0.34}
                  strokeLinecap="round"
                  opacity={0.7}
                />
                {Array.from({ length: particlesPerPath }).map((_, particleIndex) => (
                  <OverlayParticle
                    key={`${path.id}-${particleIndex}`}
                    path={path.d}
                    color={particleIndex % 2 === 0 ? stroke : system.secondaryColor ?? stroke}
                    shape={system.particleShape}
                    duration={particleDuration(system.id, density, particleIndex)}
                    begin={-(systemIndex * 0.42 + pathIndex * 0.3 + particleIndex * 0.72)}
                    reverse={path.reverse}
                  />
                ))}
                {detailedPathLabels && path.label ? (
                  <text x={pathLabelPosition(path.d).x} y={pathLabelPosition(path.d).y} fill={stroke} fontSize="2.15" fontWeight="700" opacity="0.72">
                    {path.label}
                  </text>
                ) : null}
                {showMolecules && path.molecule ? (
                  <text x={pathLabelPosition(path.d).x} y={pathLabelPosition(path.d).y + 3} fill={system.secondaryColor ?? stroke} fontSize="1.8" fontWeight="600" opacity="0.78">
                    {path.molecule}
                  </text>
                ) : null}
              </g>
            );
          })}

          {system.nodes.map((node) => (
            <g key={`${system.id}-${node.label}`}>
              <circle cx={node.x} cy={node.y} r={1.5} fill={system.color} opacity="0.78" filter="url(#atlasSystemGlow)" />
              <circle cx={node.x} cy={node.y} r={3.2} fill="none" stroke={system.secondaryColor ?? system.color} strokeWidth="0.22" opacity="0.5" />
              {simpleLabels || labelMode ? (
                <text x={node.x + 2} y={node.y + 0.8} fill="#e2e8f0" fontSize={simpleLabels ? "2.05" : "2.2"} fontWeight="700" opacity="0.84">
                  {simpleLabels ? node.label.split(" ")[0] : node.label}
                </text>
              ) : null}
              {showMolecules && node.molecule ? (
                <text x={node.x + 2} y={node.y + 3.3} fill={system.secondaryColor ?? system.color} fontSize="1.75" fontWeight="600" opacity="0.82">
                  {node.molecule}
                </text>
              ) : null}
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

function OverlayParticle({
  path,
  color,
  shape,
  duration,
  begin,
  reverse
}: {
  path: string;
  color: string;
  shape: SystemOverlay["particleShape"];
  duration: number;
  begin: number;
  reverse?: boolean;
}) {
  const transform = reverse ? "rotate(180)" : undefined;
  if (shape === "spark") {
    return (
      <g transform={transform}>
        <path d="M-0.9 0 L0.9 0 M0 -0.9 L0 0.9" stroke={color} strokeWidth="0.28" strokeLinecap="round" filter="url(#atlasSystemGlow)">
          <animateMotion dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} rotate="auto" />
        </path>
      </g>
    );
  }
  if (shape === "cell") {
    return (
      <g transform={transform}>
        <circle r="0.78" fill={color} opacity="0.78" filter="url(#atlasSystemGlow)">
          <animateMotion dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} rotate="auto" />
        </circle>
        <circle r="0.32" fill="#ecfeff" opacity="0.72">
          <animateMotion dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} rotate="auto" />
        </circle>
      </g>
    );
  }
  if (shape === "wave") {
    return (
      <g transform={transform}>
        <path d="M-1.2 0 C-0.5 -0.8 0.5 0.8 1.2 0" fill="none" stroke={color} strokeWidth="0.32" strokeLinecap="round" filter="url(#atlasSystemGlow)">
          <animateMotion dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} rotate="auto" />
        </path>
      </g>
    );
  }
  if (shape === "triangle") {
    return (
      <g transform={transform}>
        <path d="M1 0 L-0.8 -0.7 L-0.8 0.7 Z" fill={color} opacity="0.82" filter="url(#atlasSystemGlow)">
          <animateMotion dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} rotate="auto" />
        </path>
      </g>
    );
  }
  return (
    <g transform={transform}>
      <circle r="0.62" fill={color} opacity="0.86" filter="url(#atlasSystemGlow)">
        <animateMotion dur={`${duration}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} rotate="auto" />
      </circle>
    </g>
  );
}

function particleDuration(systemId: AtlasSystemId, density: DensityLevel, index: number) {
  const base = systemId === "cardiovascular" ? 5.2 : systemId === "nervous" || systemId === "ocular" ? 3.6 : 6.4;
  const densityFactor = density === "maximum" ? 0.72 : density === "high" ? 0.84 : density === "low" ? 1.28 : 1;
  return Number((base * densityFactor + index * 0.55).toFixed(2));
}

function pathLabelPosition(d: string) {
  const matches = [...d.matchAll(/(-?\d+(?:\.\d+)?)/g)].map((match) => Number(match[0]));
  if (matches.length < 2) return { x: 50, y: 50 };
  const pairs = [];
  for (let index = 0; index < matches.length - 1; index += 2) pairs.push({ x: matches[index], y: matches[index + 1] });
  return pairs[Math.floor(pairs.length / 2)] ?? pairs[0];
}

function RegionAnchorLayer({
  activeSet,
  density,
  isHealthyBaseline,
  regions,
  scores,
  selectedRegionId,
  showLabels,
  showScores,
  onSelect
}: {
  activeSet: Set<BodySystemFilterId>;
  density: DensityLevel;
  isHealthyBaseline: boolean;
  regions: BodyRegion[];
  scores: Record<BodySystemFilterId, number>;
  selectedRegionId: BodySystemFilterId;
  showLabels: boolean;
  showScores: boolean;
  onSelect: (id: BodySystemFilterId) => void;
}) {
  return (
    <g>
      {regions.map((region) => {
        const score = scores[region.id] ?? 16;
        const isActive = activeSet.size === 0 || activeSet.has(region.id) || activeSet.has(region.filterId);
        const isSelected = region.id === selectedRegionId;
        const radius = regionNodeRadius(score);
        const color = regionColor(region.tone, score, isHealthyBaseline);
        const label = shouldShowRegionLabel(region, selectedRegionId, density, showLabels);
        const offset = labelOffset(region.id);

        return (
          <g
            key={region.id}
            data-region-anchor="true"
            opacity={isActive ? 1 : 0.38}
            role="button"
            tabIndex={0}
            aria-label={region.plainLabel}
            onClick={() => onSelect(region.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onSelect(region.id);
            }}
            style={{ cursor: "pointer", outline: "none" }}
          >
            <circle cx={region.x} cy={region.y} r={radius + 0.75} fill={color} opacity={isSelected ? 0.16 : 0.1} filter="url(#atlasSystemGlow)" />
            {isSelected ? (
              <>
                <circle cx={region.x} cy={region.y} r={radius + 1.05} fill="none" stroke="#67e8f9" strokeWidth="0.24" opacity="0.86" filter="url(#atlasSystemGlow)" />
                <circle cx={region.x} cy={region.y} r={radius + 1.38} fill="none" stroke="#a78bfa" strokeWidth="0.14" opacity="0.48">
                  <animate attributeName="r" values={`${radius + 1.05};${radius + 1.9};${radius + 1.05}`} dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.48;0.14;0.48" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </>
            ) : null}
            <circle cx={region.x} cy={region.y} r={radius} fill="rgba(2,6,23,0.46)" stroke={isSelected ? "#67e8f9" : color} strokeWidth={isSelected ? 0.22 : 0.2} />
            <circle cx={region.x} cy={region.y} r={Math.max(0.7, radius - 0.9)} fill={color} opacity={isSelected ? 0.62 : 0.42} />
            {showScores ? (
              <text x={region.x} y={region.y + 0.55} textAnchor="middle" fill="#f8fafc" fontSize="1.55" fontWeight="800" pointerEvents="none">
                {Math.round(score)}
              </text>
            ) : null}
            {label ? (
              <g pointerEvents="none">
                <path d={`M ${region.x} ${region.y} L ${region.x + offset.x * 0.72} ${region.y + offset.y * 0.72}`} stroke={color} strokeWidth="0.18" strokeDasharray="0.8 1.2" opacity="0.58" />
                <text
                  x={region.x + offset.x}
                  y={region.y + offset.y}
                  textAnchor={offset.anchor}
                  fill="#e2e8f0"
                  fontSize={density === "maximum" ? "2.05" : "1.9"}
                  fontWeight="750"
                  paintOrder="stroke"
                  stroke="rgba(2,6,23,0.86)"
                  strokeWidth="0.7"
                >
                  {region.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function atlasTransformForViewport(viewport: { zoom: number; panX: number; panY: number }) {
  return `translate(${viewport.panX} ${viewport.panY}) translate(50 50) scale(${viewport.zoom}) translate(-50 -50)`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function regionNodeRadius(score: number) {
  return Number((1.65 + Math.min(1.45, score / 100)).toFixed(2));
}

function regionColor(tone: string, score: number, isHealthyBaseline: boolean) {
  if (isHealthyBaseline) return "#34d399";
  if (score > 70) return "#fb7185";
  if (score > 48) return "#fbbf24";
  if (tone === "violet") return "#c084fc";
  if (tone === "amber") return "#f59e0b";
  if (tone === "emerald") return "#34d399";
  return "#67e8f9";
}

function shouldShowRegionLabel(region: BodyRegion, selectedRegionId: BodySystemFilterId, density: DensityLevel, showLabels: boolean) {
  if (!showLabels) return false;
  if (region.id === selectedRegionId) return true;
  if (density === "low") return false;
  const mediumRegions: BodySystemFilterId[] = ["cns", "heart", "lungs", "liver", "gut", "muscle"];
  if (density === "medium") return mediumRegions.includes(region.id);
  const highRegions: BodySystemFilterId[] = [...mediumRegions, "kidney", "pancreas", "immune", "eye"];
  if (density === "high") return highRegions.includes(region.id);
  return true;
}

function labelOffset(id: BodySystemFilterId): { x: number; y: number; anchor: "start" | "middle" | "end" } {
  const offsets: Partial<Record<BodySystemFilterId, { x: number; y: number; anchor: "start" | "middle" | "end" }>> = {
    cns: { x: 5.2, y: -2.3, anchor: "start" },
    eye: { x: 5, y: -1.2, anchor: "start" },
    pns: { x: -5, y: -1.6, anchor: "end" },
    heart: { x: -5.2, y: 1.4, anchor: "end" },
    lungs: { x: 5.4, y: -1.6, anchor: "start" },
    immune: { x: -5.2, y: 1.4, anchor: "end" },
    liver: { x: 5.3, y: 1.6, anchor: "start" },
    pancreas: { x: 5.2, y: 2.8, anchor: "start" },
    gut: { x: -5, y: 2.1, anchor: "end" },
    kidney: { x: 4.9, y: 2, anchor: "start" },
    adipose: { x: 5.2, y: 2.3, anchor: "start" },
    muscle: { x: -5.2, y: 2.3, anchor: "end" }
  };
  return offsets[id] ?? { x: 4.8, y: 1.8, anchor: "start" };
}

function MolecularEdges({ isHealthyBaseline, selectedRegion }: { isHealthyBaseline: boolean; selectedRegion: BodyRegion }) {
  const color = isHealthyBaseline ? "rgba(52, 211, 153, 0.28)" : "rgba(34, 211, 238, 0.34)";
  return (
    <g className="pointer-events-none">
      <path d={`M50 12 C48 26 ${selectedRegion.x} ${selectedRegion.y - 12} ${selectedRegion.x} ${selectedRegion.y}`} fill="none" stroke={color} strokeDasharray="1 2" strokeWidth="0.35" />
      <path d={`M50 48 C45 54 ${selectedRegion.x} ${selectedRegion.y - 5} ${selectedRegion.x} ${selectedRegion.y}`} fill="none" stroke={color} strokeDasharray="2 2" strokeWidth="0.28" />
    </g>
  );
}

function MechanismRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        <span className="text-cyan-200">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function buildRegionScores(result: any, scenario: any, isHealthyBaseline: boolean): Record<BodySystemFilterId, number> {
  const scores = Object.fromEntries(regions.map((region) => [region.id, isHealthyBaseline ? 16 : 24])) as Record<BodySystemFilterId, number>;
  const source = [
    ...(result?.organEffects ?? []),
    ...(result?.systemEffects ?? []),
    ...(result?.tissueEffects ?? []),
    ...(result?.phenotypeEffects ?? []),
    ...(scenario?.predispositions ?? []),
    ...(scenario?.perturbations ?? [])
  ];

  for (const item of source) {
    const text = JSON.stringify(item).toLowerCase();
    for (const region of regions) {
      if ((regionSynonyms[region.id] ?? []).some((term) => text.includes(term))) {
        const magnitude = Number(item?.magnitude ?? item?.effectSize ?? item?.weight ?? 42);
        scores[region.id] = Math.max(scores[region.id], isHealthyBaseline ? Math.min(36, magnitude) : Math.min(92, Math.max(32, magnitude)));
      }
    }
  }
  return scores;
}

function pulseClass(tone: string, score: number, isHealthyBaseline: boolean) {
  if (isHealthyBaseline) return "bg-emerald-300/20 shadow-[0_0_24px_rgba(52,211,153,0.24)]";
  if (score > 70) return "bg-rose-300/25 shadow-[0_0_34px_rgba(251,113,133,0.32)]";
  if (score > 48) return "bg-amber-300/20 shadow-[0_0_28px_rgba(251,191,36,0.24)]";
  if (tone === "violet") return "bg-violet-300/18 shadow-[0_0_22px_rgba(167,139,250,0.22)]";
  return "bg-cyan-300/18 shadow-[0_0_22px_rgba(34,211,238,0.22)]";
}

function getReaderMode() {
  if (typeof window === "undefined") return "student";
  const mode = window.localStorage.getItem("bionexus:user-mode") ?? window.localStorage.getItem("userMode");
  const complexity = window.localStorage.getItem("bionexus:complexity-level") ?? window.localStorage.getItem("complexityLevel");
  if (complexity === "expert") return "expert";
  if (mode === "researcher" || mode === "clinician" || complexity === "advanced") return "researcher";
  if (mode === "student") return "student";
  return "beginner";
}

function scoreLabel(mode: string) {
  if (mode === "beginner") return "System activity";
  if (mode === "student") return "Relative effect score";
  if (mode === "researcher") return "Normalised model score";
  return "Sandbox model score";
}

function inspectorTitle(mode: string) {
  if (mode === "beginner") return "Why this system changed";
  if (mode === "student") return "Mechanism explanation";
  return "Relationship inspector";
}

function upstreamText(result: any, region: BodyRegion) {
  const candidate = result?.backtraceCandidates?.[0];
  if (candidate?.geneSymbol) return `${candidate.geneSymbol} is one possible upstream factor linked through ${candidate.linkedPathways?.slice?.(0, 2)?.join(" / ") ?? "the selected pathway"}.`;
  return `${region.molecules[0]} and related pathway signals are shown as illustrative upstream context.`;
}

function pathwayText(result: any, region: BodyRegion) {
  const pathway = result?.pathwaySignals?.[0]?.label ?? result?.pathwaySignals?.[0]?.pathway ?? region.molecules[1];
  return `${pathway} is the current representative pathway signal for this region.`;
}
