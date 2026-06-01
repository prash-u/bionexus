import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { useId, useMemo, useState, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { bodyRegionLabels } from "@/data/scenarios/presets";
import type { BodyRegionId, MolecularEdge, OrganEffect } from "@/lib/ontology/types";
import { molecularProvenanceLabel } from "@/lib/molecular/importAdapters";
import { useSandbox } from "@/lib/sandbox/sandboxState";

type AtlasView = { zoom: number; panX: number; panY: number };
type RegionNode = {
  nodeId: string;
  regionId: BodyRegionId;
  cx: number;
  cy: number;
  r: number;
  hitR: number;
  haloX: number;
  haloY: number;
  labelX: number;
  labelY: number;
  anchor: "start" | "end" | "middle";
  calloutX: number;
  calloutY: number;
  cluster?: "muscle" | "immune" | "neural";
};

const viewBox = { x: 0, y: 0, width: 106.00675, height: 195.36273 };
const defaultView: AtlasView = { zoom: 1.04, panX: 0, panY: 0 };

const node = (
  nodeId: string,
  regionId: BodyRegionId,
  cx: number,
  cy: number,
  r: number,
  hitR: number,
  haloX: number,
  haloY: number,
  anchor: RegionNode["anchor"],
  calloutDx: number,
  calloutDy: number,
  cluster?: RegionNode["cluster"]
): RegionNode => {
  const labelOffset = anchor === "start" ? 7 : anchor === "end" ? -7 : 0;
  return {
    nodeId,
    regionId,
    cx,
    cy,
    r,
    hitR,
    haloX,
    haloY,
    labelX: cx + labelOffset,
    labelY: cy + (anchor === "middle" ? -5 : 1),
    anchor,
    calloutX: Math.min(68, Math.max(5, cx + calloutDx)),
    calloutY: Math.min(184, Math.max(12, cy + calloutDy)),
    cluster
  };
};

const regionNodes: RegionNode[] = [
  node("brain", "brain", 53, 13.8, 2.2, 6.2, 8, 6.1, "middle", 8, -7, "neural"),
  node("left-eye", "eye", 48.2, 15.5, 1.15, 4.2, 4.5, 3.4, "end", -31, 2),
  node("right-eye", "eye", 57.2, 15.5, 1.15, 4.2, 4.5, 3.4, "start", 10, 2),
  node("thyroid", "thyroid", 53, 31.6, 1.4, 4.4, 4.6, 3.2, "start", 8, -2),
  node("lungs", "lungs", 52.6, 45.4, 2.3, 8.4, 12.2, 8.8, "end", -20, -3),
  node("heart", "heart", 50, 54, 2.25, 6, 6.4, 5, "end", -18, 1),
  node("liver", "liver", 46, 70.8, 2.8, 7.4, 10.2, 5.8, "end", -20, 0),
  node("stomach", "stomach", 58.3, 68.4, 2.05, 6, 6.5, 5, "start", 9, -1),
  node("spleen", "spleen", 65, 72.4, 1.45, 4.6, 4.3, 3.6, "start", 8, 1, "immune"),
  node("pancreas", "pancreas", 54.2, 76.7, 1.75, 6.4, 7.8, 3.4, "start", 9, 1),
  node("kidney-left", "kidney", 42.7, 83.4, 2.05, 6, 6, 6.8, "end", -17, 2),
  node("kidney-right", "kidney", 62.7, 83.4, 2.05, 6, 6, 6.8, "start", 8, 2),
  node("intestine", "intestine", 52.8, 95.5, 3.05, 8.2, 10, 9, "start", 11, 3),
  node("adipose", "adipose", 55.8, 111.8, 2.5, 7.4, 9.6, 7.6, "start", 12, 3),
  node("skin", "skin", 24, 103.5, 1.35, 6.2, 5, 5.2, "end", -10, 1),
  node("bone-marrow", "boneMarrow", 43.8, 137.2, 1.95, 6, 5.4, 8.2, "end", -17, 4, "immune"),
  node("peripheral-nerves", "peripheralNerves", 26.2, 91, 1.4, 6.2, 5, 5.2, "end", -12, 1, "neural"),
  node("muscle-left-arm", "muscle", 28.5, 74, 1.8, 6.4, 5.8, 14, "end", -12, -2, "muscle"),
  node("muscle-right-arm", "muscle", 77.5, 74, 1.8, 6.4, 5.8, 14, "start", 8, -2, "muscle"),
  node("muscle-left-leg", "muscle", 43.2, 154, 2.45, 8.2, 7.6, 17, "end", -14, 4, "muscle"),
  node("muscle-right-leg", "muscle", 62.8, 154, 2.45, 8.2, 7.6, 17, "start", 10, 4, "muscle")
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 10) / 10;

const colorFor = (effect?: OrganEffect) => {
  if (!effect) return "hsl(188 100% 74%)";
  if (effect.direction === "stress") return "hsl(350 92% 70%)";
  if (effect.direction === "activation") return "hsl(36 100% 68%)";
  if (effect.direction === "suppression") return "hsl(202 100% 70%)";
  if (effect.direction === "support") return "hsl(152 70% 62%)";
  return "hsl(188 100% 74%)";
};

export function WholeBodyVisualization({ compact = false }: { compact?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const { activePreset, sandbox, selectRegion, selectMolecularEdge } = useSandbox();
  const [view, setView] = useState<AtlasView>(defaultView);
  const [drag, setDrag] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [hovered, setHovered] = useState<BodyRegionId | null>(null);
  const [showFlows, setShowFlows] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const effectMap = useMemo(() => new Map(sandbox.simulationResult.organEffects.map((effect) => [effect.organ, effect])), [sandbox.simulationResult.organEffects]);
  const selectedRegion = regionNodes.find((region) => region.regionId === (hovered ?? sandbox.selectedRegionId));
  const selectedEffect = selectedRegion ? effectForNode(selectedRegion, effectMap) : undefined;
  const selectedEdge = sandbox.simulationResult.molecularEdges.find((edge) => edge.id === sandbox.selectedMolecularEdgeId) ?? sandbox.simulationResult.molecularEdges[0];
  const transform = `translate(${viewBox.width / 2 + view.panX} ${viewBox.height / 2 + view.panY}) scale(${view.zoom}) translate(${-viewBox.width / 2} ${-viewBox.height / 2})`;

  const zoomBy = (delta: number) => setView((current) => ({ ...current, zoom: clamp(round(current.zoom + delta), 0.86, 2.7) }));
  const focusSelected = () => selectedRegion && setView({ zoom: 2.05, panX: clamp((viewBox.width / 2 - selectedRegion.cx) * 1.2, -34, 34), panY: clamp((viewBox.height / 2 - selectedRegion.cy) * 1.2, -52, 52) });
  const pointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const sensitivity = 0.16 / view.zoom;
    setView((current) => ({ ...current, panX: clamp(drag.panX + (event.clientX - drag.x) * sensitivity, -38, 38), panY: clamp(drag.panY + (event.clientY - drag.y) * sensitivity, -56, 56) }));
  };
  const wheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    zoomBy(event.deltaY > 0 ? -0.08 : 0.08);
  };

  return (
    <div className="body-stage glass relative flex min-h-[560px] w-full select-none flex-col overflow-hidden rounded-lg border-cyan-300/20 bg-[#03101f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.17),transparent_48%)]" />
      <div className="relative z-20 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-[#041426]/80 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <AtlasButton label="Zoom out" onClick={() => zoomBy(-0.16)}><Minus className="h-3.5 w-3.5" /></AtlasButton>
          <div className="min-w-[52px] rounded-md border border-white/10 bg-white/[0.035] px-2 py-1 text-center text-[10px] text-cyan-200">{(view.zoom * 100).toFixed(0)}%</div>
          <AtlasButton label="Zoom in" onClick={() => zoomBy(0.16)}><Plus className="h-3.5 w-3.5" /></AtlasButton>
          <AtlasButton label="Reset atlas view" onClick={() => setView(defaultView)}><RotateCcw className="h-3.5 w-3.5" /></AtlasButton>
          <AtlasButton label="Focus selected region" onClick={focusSelected} disabled={!selectedRegion}><Maximize2 className="h-3.5 w-3.5" /></AtlasButton>
        </div>
        <div className="flex items-center gap-2">
          <ToggleChip active={showFlows} onClick={() => setShowFlows((value) => !value)} label="molecules" />
          <ToggleChip active={showLabels} onClick={() => setShowLabels((value) => !value)} label="labels" />
        </div>
      </div>
      <div className={`relative grid gap-4 overflow-hidden ${compact ? "" : "lg:grid-cols-[1fr_0.62fr]"}`}>
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="relative z-10 h-[560px] w-full cursor-grab touch-none drop-shadow-[0_30px_70px_rgba(34,211,238,0.18)] active:cursor-grabbing lg:h-[640px]"
          role="img"
          aria-label="Detailed whole-body molecular systems biology atlas"
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={pointerMove}
          onPointerLeave={() => {
            setDrag(null);
            setHovered(null);
          }}
          onPointerUp={() => setDrag(null)}
          onPointerDown={(event) => {
            if ((event.target as Element).closest("[data-hotspot='true'],[data-edge='true']")) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDrag({ x: event.clientX, y: event.clientY, panX: view.panX, panY: view.panY });
          }}
          onWheel={wheel}
        >
          <defs>
            <radialGradient id={`${uid}-core`} cx="50%" cy="46%" r="58%"><stop offset="0%" stopColor="hsl(188 100% 76%)" stopOpacity="0.58" /><stop offset="42%" stopColor="hsl(210 100% 62%)" stopOpacity="0.2" /><stop offset="100%" stopColor="hsl(216 70% 8%)" stopOpacity="0.02" /></radialGradient>
            <linearGradient id={`${uid}-vessel`} x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="hsl(188 100% 72%)" stopOpacity="0.82" /><stop offset="100%" stopColor="hsl(218 100% 72%)" stopOpacity="0.2" /></linearGradient>
            <filter id={`${uid}-blurGlow`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id={`${uid}-hotspotGlow`} x="-160%" y="-160%" width="420%" height="420%"><feGaussianBlur stdDeviation="10" /></filter>
            <pattern id={`${uid}-microgrid`} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V4" fill="none" stroke="rgba(125,240,255,0.07)" strokeWidth="0.18" /></pattern>
          </defs>
          <rect x="0" y="0" width={viewBox.width} height={viewBox.height} fill={`url(#${uid}-microgrid)`} opacity="0.3" />
          <g transform={transform}>
            <ellipse cx="53" cy="96" rx="28" ry="84" fill={`url(#${uid}-core)`} opacity="0.7" />
            <g opacity="0.96">
              <VisibleAnatomyFallback />
              <image href="/anatomogram-human.svg" x="0" y="0" width={viewBox.width} height={viewBox.height} opacity="0.5" preserveAspectRatio="xMidYMid meet" />
              <NeurovascularOverlay uid={uid} />
              <MuscleFiberOverlay />
            </g>
            {showFlows ? <MolecularEdges edges={sandbox.simulationResult.molecularEdges} selectedEdgeId={selectedEdge?.id} onSelect={selectMolecularEdge} uid={uid} /> : null}
            <g>
              {regionNodes.map((region) => (
                <AnatomyHotspot
                  key={region.nodeId}
                  uid={uid}
                  region={region}
                  effect={effectForNode(region, effectMap)}
                  selected={sandbox.selectedRegionId === region.regionId}
                  hovered={hovered === region.regionId}
                  showLabel={showLabels}
                  onHover={setHovered}
                  onSelect={selectRegion}
                />
              ))}
            </g>
            {selectedRegion ? <SelectedCallout region={selectedRegion} effect={selectedEffect} /> : null}
          </g>
        </svg>
        {!compact ? (
          <div className="relative z-10 space-y-3 self-center p-5 lg:pl-0">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">BioBody++ molecular atlas</p>
            <h2 className="text-2xl font-semibold text-white">{activePreset.shortTitle}</h2>
            <p className="text-sm leading-6 text-slate-400">{sandbox.simulationResult.summary}</p>
            <div className="rounded-lg border border-slate-700/40 bg-slate-950/45 p-4">
              <p className="text-sm font-semibold text-white">{selectedRegion ? bodyRegionLabels[selectedRegion.regionId] : "Body region"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{selectedEffect?.label ?? "Reference region in this scenario."}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-300" style={{ width: `${selectedEffect?.magnitude ?? 12}%` }} />
              </div>
            </div>
            <EdgeInspector edge={selectedEdge} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function VisibleAnatomyFallback() {
  return (
    <g opacity="0.72" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M53 6c-8 0-13 6-13 14 0 7 5 12 13 12s13-5 13-12C66 12 61 6 53 6Z" fill="rgba(34,211,238,0.08)" stroke="rgba(125,240,255,0.5)" strokeWidth="0.45" />
      <path d="M43 33c-7 4-12 12-13 24l-3 37M63 33c7 4 12 12 13 24l3 37" stroke="rgba(125,240,255,0.42)" strokeWidth="0.5" />
      <path d="M39 35c-6 16-8 35-7 58 1 23 5 42 11 57M67 35c6 16 8 35 7 58-1 23-5 42-11 57" stroke="rgba(167,139,250,0.32)" strokeWidth="0.48" />
      <path d="M41 61c7-4 17-4 24 0M39 88c8 5 20 5 28 0M43 124c6 4 14 4 20 0" stroke="rgba(34,211,238,0.26)" strokeWidth="0.32" />
      <path d="M44 147l-5 39M62 147l5 39" stroke="rgba(125,240,255,0.42)" strokeWidth="0.5" />
      <path d="M32 92l-9 34M74 92l9 34" stroke="rgba(125,240,255,0.38)" strokeWidth="0.44" />
    </g>
  );
}

function MolecularEdges({ edges, selectedEdgeId, onSelect, uid }: { edges: MolecularEdge[]; selectedEdgeId?: string; onSelect: (id: string) => void; uid: string }) {
  return (
    <g>
      {edges.map((edge) => {
        const source = nodeForRegion(edge.sourceRegionId);
        const target = nodeForRegion(edge.targetRegionId);
        if (!source || !target) return null;
        const active = selectedEdgeId === edge.id;
        const color = edgeColor(edge.edgeKind);
        const path = curvedPath(source, target, edge.scenarioModifier * 18 || 8);
        return (
          <g key={edge.id} data-edge="true" role="button" tabIndex={0} style={{ cursor: "pointer" }} onClick={() => onSelect(edge.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(edge.id); }} opacity={active ? 0.96 : 0.55}>
            <path d={path} fill="none" stroke={color} strokeWidth={active ? 0.8 : 0.42} strokeDasharray={edge.edgeKind === "transport" ? "1.8 2.2" : edge.edgeKind === "immune" ? "0.8 1.4" : undefined} strokeLinecap="round" vectorEffect="non-scaling-stroke" filter={`url(#${uid}-blurGlow)`} />
            <circle r={active ? 0.95 : 0.56} fill={color}><animateMotion dur={`${clamp(7 - edge.baseFlux * 4, 2.8, 7)}s`} repeatCount="indefinite" path={path} /></circle>
          </g>
        );
      })}
    </g>
  );
}

function EdgeInspector({ edge }: { edge?: MolecularEdge }) {
  if (!edge) {
    return <div className="rounded-lg border border-slate-700/40 bg-slate-950/45 p-4 text-sm text-slate-400">No active molecular edge in this scenario.</div>;
  }
  return (
    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Edge inspector</p>
      <h3 className="mt-2 text-base font-semibold text-white">{edge.label}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-400">{edge.pathwayContext}</p>
      <div className="mt-3 space-y-2">
        {edge.payloads.map((payload) => (
          <div key={`${edge.id}-${payload.molecule}`} className="rounded-md border border-white/10 bg-slate-950/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white">{payload.molecule}</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-emerald-100">{payload.moleculeClass.replace(/_/g, " ")}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${provenanceClass(payload.provenance)}`}>{molecularProvenanceLabel(payload)}</span>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">{payload.ratio} · {payload.unit}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{payload.ratioBasis.replace(/_/g, " ")}</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">{payload.sourceCompartment} {"->"} {payload.targetCompartment}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {payload.sources.map((source) => (
                <a key={`${payload.molecule}-${source.database}-${source.id}`} href={source.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-600/40 bg-slate-950/60 px-2 py-0.5 text-[10px] text-slate-300 hover:border-cyan-300/40 hover:text-cyan-100">
                  {source.database}: {source.id}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectedCallout({ region, effect }: { region: RegionNode; effect?: OrganEffect }) {
  const color = colorFor(effect);
  return (
    <g pointerEvents="none">
      <path d={`M ${region.cx} ${region.cy} C ${region.cx + (region.calloutX >= region.cx ? 6 : -6)} ${region.cy - 5}, ${region.calloutX - 5} ${region.calloutY - 3}, ${region.calloutX} ${region.calloutY}`} fill="none" stroke={color} strokeWidth="0.42" strokeDasharray="1.4 1.8" opacity="0.88" vectorEffect="non-scaling-stroke" />
      <rect x={region.calloutX} y={region.calloutY - 7} width="39" height="16" rx="2.8" fill="rgba(8,20,36,0.92)" stroke={color} strokeOpacity="0.58" vectorEffect="non-scaling-stroke" />
      <text x={region.calloutX + 3} y={region.calloutY - 2.2} fill="hsl(213 45% 97%)" fontSize="3.1" fontWeight="700">{bodyRegionLabels[region.regionId]}</text>
      <text x={region.calloutX + 3} y={region.calloutY + 2.7} fill="hsl(215 30% 72%)" fontSize="2.1">{effect?.label ?? "Reference region"}</text>
      <text x={region.calloutX + 3} y={region.calloutY + 6.2} fill={color} fontSize="2.2" fontFamily="JetBrains Mono, monospace">pressure {(Math.max(0.08, (effect?.magnitude ?? 18) / 100) * 100).toFixed(0)}%</text>
    </g>
  );
}

function AtlasButton({ children, label, onClick, disabled }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-35">{children}</button>;
}

function ToggleChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px] uppercase tracking-[0.12em] transition ${active ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.035] text-slate-400 hover:text-white"}`}>{label}</button>;
}

function NeurovascularOverlay({ uid }: { uid: string }) {
  return (
    <g opacity="0.72">
      <path d="M53 29C49 43 48 57 49 72c0.5 14 2.4 29 4 45 1.6-16 3.5-31 4-45 1-15-0.8-29-4-43z" fill="none" stroke={`url(#${uid}-vessel)`} strokeWidth="0.38" />
      <path d="M53 47C43 58 39 70 38.5 89M53 47c10 11 14 23 14.5 42M53 83c-7 10-11 25-12 43M53 83c7 10 11 25 12 43M53 121c-5 13-7 29-8 50M53 121c5 13 7 29 8 50" fill="none" stroke="rgba(125,240,255,0.3)" strokeWidth="0.34" strokeLinecap="round" />
      <path d="M37 75c7 4 12 8 16 15 4-7 9-11 16-15M35 98c9 5 15 11 18 20 3-9 9-15 18-20" fill="none" stroke="rgba(167,139,250,0.32)" strokeWidth="0.28" strokeDasharray="1 2" />
    </g>
  );
}

function MuscleFiberOverlay() {
  return (
    <g opacity="0.26" stroke="hsl(152 70% 62%)" strokeWidth="0.22" strokeLinecap="round">
      <path d="M26 58c-2 11-2 22 0 34M80 58c2 11 2 22 0 34M42 132c-3 13-3 29-1 45M64 132c3 13 3 29 1 45" />
      <path d="M29 64c-1 9-1 18 1 27M77 64c1 9 1 18-1 27M45 138c-2 10-2 23-1 35M61 138c2 10 2 23 1 35" />
    </g>
  );
}

function AnatomyHotspot({ uid, region, effect, selected, hovered, showLabel, onHover, onSelect }: { uid: string; region: RegionNode; effect?: OrganEffect; selected: boolean; hovered: boolean; showLabel: boolean; onHover: (id: BodyRegionId | null) => void; onSelect: (id: BodyRegionId) => void }) {
  const active = Boolean(effect && effect.magnitude > 22);
  const color = colorFor(effect);
  const intensity = Math.max(0.12, (effect?.magnitude ?? 12) / 100);
  const radius = region.r + (selected ? 0.55 : hovered ? 0.32 : 0);
  const showText = showLabel || selected || hovered;
  return (
    <g data-hotspot="true" role="button" tabIndex={0} style={{ cursor: "pointer" }} onMouseEnter={() => onHover(region.regionId)} onMouseLeave={() => onHover(null)} onClick={() => onSelect(region.regionId)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(region.regionId); }} aria-label={`Select ${bodyRegionLabels[region.regionId]}`}>
      <ellipse cx={region.cx} cy={region.cy} rx={region.haloX} ry={region.haloY} fill={color} opacity={active ? 0.1 + intensity * 0.2 : selected || hovered ? 0.08 : 0.02} filter={`url(#${uid}-hotspotGlow)`} className={active ? "animate-pulse-soft" : undefined} />
      <circle cx={region.cx} cy={region.cy} r={region.hitR} fill="transparent" />
      <circle cx={region.cx} cy={region.cy} r={radius} fill="rgba(8,20,36,0.8)" stroke={color} strokeWidth={selected ? 0.58 : hovered || active ? 0.36 : 0.22} strokeOpacity={selected || hovered || active ? 0.95 : 0.48} vectorEffect="non-scaling-stroke" />
      <circle cx={region.cx} cy={region.cy} r={Math.max(0.72, radius - 1.4)} fill={color} fillOpacity={active ? 0.24 + intensity * 0.46 : 0.12} className={active ? "animate-pulse-glow" : undefined} />
      {showText ? <text x={region.labelX} y={region.labelY} textAnchor={region.anchor} fill="hsl(213 45% 97%)" fontSize="2.7" fontWeight="700" letterSpacing="0.08em" paintOrder="stroke" stroke="rgba(8,20,36,0.9)" strokeWidth="1.1">{bodyRegionLabels[region.regionId].toUpperCase()}</text> : null}
    </g>
  );
}

function effectForNode(region: RegionNode, effects: Map<BodyRegionId, OrganEffect>) {
  return effects.get(region.regionId) ?? (region.cluster === "immune" ? effects.get("immune") : undefined);
}

function nodeForRegion(regionId: BodyRegionId) {
  if (regionId === "immune") return regionNodes.find((region) => region.nodeId === "bone-marrow");
  if (regionId === "gut") return regionNodes.find((region) => region.regionId === "intestine");
  if (regionId === "muscle") return regionNodes.find((region) => region.nodeId === "muscle-left-leg");
  return regionNodes.find((region) => region.regionId === regionId);
}

function edgeColor(kind: MolecularEdge["edgeKind"]) {
  if (kind === "immune") return "hsl(36 100% 68%)";
  if (kind === "neural" || kind === "modulation") return "hsl(268 90% 74%)";
  if (kind === "endocrine") return "hsl(152 70% 62%)";
  if (kind === "gene_delivery") return "hsl(202 100% 70%)";
  return "hsl(188 100% 74%)";
}

function provenanceClass(provenance: MolecularEdge["payloads"][number]["provenance"]) {
  if (provenance === "database_exact") return "border-cyan-300/35 bg-cyan-300/10 text-cyan-100";
  if (provenance === "source_backed") return "border-violet-300/35 bg-violet-300/10 text-violet-100";
  return "border-amber-300/35 bg-amber-300/10 text-amber-100";
}

function curvedPath(source: RegionNode, target: RegionNode, curve: number) {
  const midX = (source.cx + target.cx) / 2;
  const midY = (source.cy + target.cy) / 2;
  const dx = target.cx - source.cx;
  const dy = target.cy - source.cy;
  const length = Math.max(1, Math.hypot(dx, dy));
  return `M ${source.cx} ${source.cy} Q ${(midX + (-dy / length) * curve).toFixed(1)} ${(midY + (dx / length) * curve).toFixed(1)} ${target.cx} ${target.cy}`;
}
