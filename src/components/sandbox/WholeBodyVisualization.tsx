import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { useId, useMemo, useState, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { bodyRegionLabels } from "@/data/scenarios/presets";
import type { BodyRegionId, OrganEffect } from "@/lib/ontology/types";
import { useSandbox } from "@/lib/sandbox/sandboxState";

type AtlasView = { zoom: number; panX: number; panY: number };
type Region = {
  id: BodyRegionId;
  atlasId?: string;
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
};

const viewBox = { x: 0, y: 0, width: 106.00675, height: 195.36273 };
const defaultView: AtlasView = { zoom: 1.03, panX: 0, panY: 0 };

const regions: Region[] = [
  { id: "brain", cx: 53, cy: 13.8, r: 2.2, hitR: 6.2, haloX: 8, haloY: 6.1, labelX: 53, labelY: 8.8, anchor: "middle", calloutX: 61, calloutY: 7 },
  { id: "eye", cx: 48.2, cy: 15.5, r: 1.15, hitR: 4.2, haloX: 4.5, haloY: 3.4, labelX: 39, labelY: 15, anchor: "end", calloutX: 17, calloutY: 18 },
  { id: "lungs", cx: 52.6, cy: 45.4, r: 2.3, hitR: 8.4, haloX: 12.2, haloY: 8.8, labelX: 45.6, labelY: 46.4, anchor: "end", calloutX: 32, calloutY: 42 },
  { id: "heart", cx: 50, cy: 54, r: 2.25, hitR: 6, haloX: 6.4, haloY: 5, labelX: 43, labelY: 55, anchor: "end", calloutX: 29, calloutY: 55 },
  { id: "liver", cx: 46, cy: 70.8, r: 2.8, hitR: 7.4, haloX: 10.2, haloY: 5.8, labelX: 39, labelY: 71.8, anchor: "end", calloutX: 26, calloutY: 71 },
  { id: "pancreas", cx: 54.2, cy: 76.7, r: 1.75, hitR: 6.4, haloX: 7.8, haloY: 3.4, labelX: 61.2, labelY: 77.7, anchor: "start", calloutX: 67, calloutY: 78 },
  { id: "gut", atlasId: "intestine", cx: 52.8, cy: 95.5, r: 3.05, hitR: 8.2, haloX: 10, haloY: 9, labelX: 59.8, labelY: 96.5, anchor: "start", calloutX: 67, calloutY: 98 },
  { id: "kidney", cx: 42.7, cy: 83.4, r: 2.05, hitR: 6, haloX: 6, haloY: 6.8, labelX: 35.7, labelY: 84.4, anchor: "end", calloutX: 25, calloutY: 85 },
  { id: "immune", atlasId: "bone_marrow", cx: 43.8, cy: 137.2, r: 1.95, hitR: 6, haloX: 5.4, haloY: 8.2, labelX: 36.8, labelY: 138.2, anchor: "end", calloutX: 25, calloutY: 141 },
  { id: "peripheralNerves", atlasId: "skin", cx: 24, cy: 103.5, r: 1.35, hitR: 6.2, haloX: 5, haloY: 5.2, labelX: 17, labelY: 104.5, anchor: "end", calloutX: 7, calloutY: 105 },
  { id: "muscle", cx: 52.6, cy: 160, r: 2.7, hitR: 8.2, haloX: 10.8, haloY: 8.7, labelX: 59.6, labelY: 161, anchor: "start", calloutX: 68, calloutY: 164 }
];

const flows = [
  ["gut", "liver", -10, 4.8],
  ["liver", "pancreas", 8, 5.5],
  ["pancreas", "muscle", -8, 5.1],
  ["lungs", "heart", 5, 4.6],
  ["brain", "liver", -18, 7.1],
  ["liver", "kidney", 8, 5.8],
  ["immune", "liver", 16, 5.3],
  ["muscle", "liver", 17, 6.4],
  ["eye", "brain", 9, 5.6],
  ["brain", "peripheralNerves", -14, 6.8]
] as const;

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
  const { activePreset, sandbox, selectRegion } = useSandbox();
  const [view, setView] = useState<AtlasView>(defaultView);
  const [drag, setDrag] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [hovered, setHovered] = useState<BodyRegionId | null>(null);
  const [showFlows, setShowFlows] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const effects = useMemo(() => new Map(activePreset.organEffects.map((effect) => [effect.organ, effect])), [activePreset.organEffects]);
  const selectedRegion = regions.find((region) => region.id === (hovered ?? sandbox.selectedRegionId));
  const selectedEffect = selectedRegion ? effects.get(selectedRegion.id) : undefined;
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
    <div className="body-stage glass relative flex h-full min-h-[520px] w-full select-none flex-col overflow-hidden rounded-lg border-cyan-300/20 bg-[#03101f]">
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
          <ToggleChip active={showFlows} onClick={() => setShowFlows((value) => !value)} label="flows" />
          <ToggleChip active={showLabels} onClick={() => setShowLabels((value) => !value)} label="labels" />
        </div>
      </div>
      <div className={`relative grid min-h-0 flex-1 gap-4 overflow-hidden ${compact ? "" : "lg:grid-cols-[1fr_0.58fr]"}`}>
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="relative z-10 h-full min-h-[470px] w-full cursor-grab touch-none drop-shadow-[0_30px_70px_rgba(34,211,238,0.18)] active:cursor-grabbing"
          role="img"
          aria-label="Translucent whole-body systems biology atlas"
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={pointerMove}
          onPointerLeave={() => {
            setDrag(null);
            setHovered(null);
          }}
          onPointerUp={() => setDrag(null)}
          onPointerDown={(event) => {
            if ((event.target as Element).closest("[data-hotspot='true']")) return;
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
              <image href="/anatomogram-human.svg" x="0" y="0" width={viewBox.width} height={viewBox.height} opacity="0.86" preserveAspectRatio="xMidYMid meet" filter={`url(#${uid}-blurGlow)`} />
              <NeurovascularOverlay uid={uid} />
            </g>
            {showFlows ? <NetworkEdges uid={uid} effects={effects} /> : null}
            <g>
              {regions.map((region) => (
                <AnatomyHotspot
                  key={region.id}
                  uid={uid}
                  region={region}
                  effect={effects.get(region.id)}
                  selected={sandbox.selectedRegionId === region.id}
                  hovered={hovered === region.id}
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
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">BioBody atlas framework</p>
            <h2 className="text-2xl font-semibold text-white">{activePreset.shortTitle}</h2>
            <p className="text-sm leading-6 text-slate-400">{activePreset.description}</p>
            <div className="rounded-lg border border-slate-700/40 bg-slate-950/45 p-4">
              <p className="text-sm font-semibold text-white">{selectedRegion ? bodyRegionLabels[selectedRegion.id] : "Body region"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{selectedEffect?.label ?? "Reference region in this scenario."}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-300" style={{ width: `${selectedEffect?.magnitude ?? 12}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {sandbox.bodySystems.map((system) => (
                <span key={system.id} className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs text-violet-100">
                  {system.label}: {system.status}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NetworkEdges({ effects, uid }: { effects: Map<BodyRegionId, OrganEffect>; uid: string }) {
  return (
    <g>
      {flows.map(([sourceId, targetId, curve, speed]) => {
        const source = regions.find((region) => region.id === sourceId);
        const target = regions.find((region) => region.id === targetId);
        if (!source || !target) return null;
        const sourceEffect = effects.get(source.id);
        const targetEffect = effects.get(target.id);
        const active = Boolean(sourceEffect || targetEffect);
        const color = active ? colorFor(targetEffect ?? sourceEffect) : "rgba(125,240,255,0.55)";
        const path = curvedPath(source, target, curve);
        return (
          <g key={`${sourceId}-${targetId}`} opacity={active ? 0.78 : 0.18}>
            <path d={path} fill="none" stroke={color} strokeWidth={active ? 0.5 : 0.22} strokeDasharray="1.8 2.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" filter={active ? `url(#${uid}-blurGlow)` : undefined} />
            <circle r={active ? 0.78 : 0.42} fill={color}><animateMotion dur={`${speed}s`} repeatCount="indefinite" path={path} /></circle>
          </g>
        );
      })}
    </g>
  );
}

function SelectedCallout({ region, effect }: { region: Region; effect?: OrganEffect }) {
  const color = colorFor(effect);
  return (
    <g pointerEvents="none">
      <path d={`M ${region.cx} ${region.cy} C ${region.cx + (region.calloutX >= region.cx ? 6 : -6)} ${region.cy - 5}, ${region.calloutX - 5} ${region.calloutY - 3}, ${region.calloutX} ${region.calloutY}`} fill="none" stroke={color} strokeWidth="0.42" strokeDasharray="1.4 1.8" opacity="0.88" vectorEffect="non-scaling-stroke" />
      <rect x={region.calloutX} y={region.calloutY - 7} width="38" height="16" rx="2.8" fill="rgba(8,20,36,0.92)" stroke={color} strokeOpacity="0.58" vectorEffect="non-scaling-stroke" />
      <text x={region.calloutX + 3} y={region.calloutY - 2.2} fill="hsl(213 45% 97%)" fontSize="3.1" fontWeight="700">{bodyRegionLabels[region.id]}</text>
      <text x={region.calloutX + 3} y={region.calloutY + 2.7} fill="hsl(215 30% 72%)" fontSize="2.1">{effect?.label ?? "Reference region"}</text>
      <text x={region.calloutX + 3} y={region.calloutY + 6.2} fill={color} fontSize="2.2" fontFamily="JetBrains Mono, monospace">pulse {(Math.max(0.08, (effect?.magnitude ?? 18) / 100) * 100).toFixed(0)}%</text>
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
    </g>
  );
}

function AnatomyHotspot({ uid, region, effect, selected, hovered, showLabel, onHover, onSelect }: { uid: string; region: Region; effect?: OrganEffect; selected: boolean; hovered: boolean; showLabel: boolean; onHover: (id: BodyRegionId | null) => void; onSelect: (id: BodyRegionId) => void }) {
  const active = Boolean(effect);
  const color = colorFor(effect);
  const intensity = Math.max(0.12, (effect?.magnitude ?? 12) / 100);
  const radius = region.r + (selected ? 0.55 : hovered ? 0.32 : 0);
  const showText = showLabel || selected || hovered;
  return (
    <g data-hotspot="true" role="button" tabIndex={0} style={{ cursor: "pointer" }} onMouseEnter={() => onHover(region.id)} onMouseLeave={() => onHover(null)} onClick={() => onSelect(region.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(region.id); }} aria-label={`Select ${bodyRegionLabels[region.id]}`}>
      <ellipse cx={region.cx} cy={region.cy} rx={region.haloX} ry={region.haloY} fill={color} opacity={active ? 0.1 + intensity * 0.2 : selected || hovered ? 0.08 : 0.02} filter={`url(#${uid}-hotspotGlow)`} className={active ? "animate-pulse-soft" : undefined} />
      <circle cx={region.cx} cy={region.cy} r={region.hitR} fill="transparent" />
      <circle cx={region.cx} cy={region.cy} r={radius} fill="rgba(8,20,36,0.8)" stroke={color} strokeWidth={selected ? 0.58 : hovered || active ? 0.36 : 0.22} strokeOpacity={selected || hovered || active ? 0.95 : 0.48} vectorEffect="non-scaling-stroke" />
      <circle cx={region.cx} cy={region.cy} r={Math.max(0.72, radius - 1.4)} fill={color} fillOpacity={active ? 0.24 + intensity * 0.46 : 0.12} className={active ? "animate-pulse-glow" : undefined} />
      {showText ? <text x={region.labelX} y={region.labelY} textAnchor={region.anchor} fill="hsl(213 45% 97%)" fontSize="2.8" fontWeight="700" letterSpacing="0.08em" paintOrder="stroke" stroke="rgba(8,20,36,0.9)" strokeWidth="1.1">{bodyRegionLabels[region.id].toUpperCase()}</text> : null}
    </g>
  );
}

function curvedPath(source: Region, target: Region, curve: number) {
  const midX = (source.cx + target.cx) / 2;
  const midY = (source.cy + target.cy) / 2;
  const dx = target.cx - source.cx;
  const dy = target.cy - source.cy;
  const length = Math.max(1, Math.hypot(dx, dy));
  return `M ${source.cx} ${source.cy} Q ${(midX + (-dy / length) * curve).toFixed(1)} ${(midY + (dx / length) * curve).toFixed(1)} ${target.cx} ${target.cy}`;
}
