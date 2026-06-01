import { useEffect, useMemo, useRef, useState } from "react";
import { useSandbox } from "@/lib/sandbox/sandboxState";

type Node = {
  symbol: string;
  name: string;
  direction: "up" | "down";
  log2FC: number;
  pAdj: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  degree: number;
};

type Edge = { source: string; target: string; score: number };

const geneNames: Record<string, string> = {
  SNCA: "Alpha-synuclein",
  LRRK2: "Leucine-rich repeat kinase 2",
  GBA1: "Glucosylceramidase beta 1",
  PINK1: "PTEN-induced kinase 1",
  INSR: "Insulin receptor",
  IRS1: "Insulin receptor substrate 1",
  SLC2A4: "GLUT4 glucose transporter",
  PPARG: "PPAR gamma",
  RPE65: "Retinoid isomerohydrolase",
  ABCA4: "Retinal transporter",
  RPGR: "Retinitis pigmentosa GTPase regulator",
  CEP290: "Centrosomal protein 290",
  IL6: "Interleukin 6",
  TNF: "Tumor necrosis factor",
  NFKB1: "NF-kappa-B p105",
  CXCL8: "Interleukin 8"
};

export function ScenarioNetworkGraph() {
  const { activePreset } = useSandbox();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 780, h: 480 });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const genes = useMemo(
    () =>
      activePreset.keyGenes.map((symbol, index) => ({
        symbol,
        name: geneNames[symbol] ?? `${symbol} signal`,
        direction: index % 3 === 1 ? "down" as const : "up" as const,
        log2FC: Number((1.1 + activePreset.organEffects[0].magnitude / 55 - index * 0.17).toFixed(2)),
        pAdj: 10 ** -(4 + index),
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        degree: 0
      })),
    [activePreset]
  );

  const edges = useMemo<Edge[]>(
    () =>
      genes.flatMap((gene, index) => {
        const next = genes[(index + 1) % genes.length];
        const hub = genes[0];
        return [
          next ? { source: gene.symbol, target: next.symbol, score: 0.62 + index * 0.04 } : null,
          index > 1 && hub ? { source: hub.symbol, target: gene.symbol, score: 0.72 - index * 0.03 } : null
        ].filter((edge): edge is Edge => Boolean(edge));
      }),
    [genes]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({ w: Math.max(320, rect.width), h: Math.max(360, rect.height) });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    edges.forEach((edge) => {
      map.set(edge.source, (map.get(edge.source) ?? 0) + 1);
      map.set(edge.target, (map.get(edge.target) ?? 0) + 1);
    });
    return map;
  }, [edges]);

  useEffect(() => {
    const cx = size.w / 2;
    const cy = size.h / 2;
    setNodes(
      genes.map((gene, index) => {
        const angle = (index / Math.max(1, genes.length)) * Math.PI * 2;
        const radius = Math.min(size.w, size.h) * 0.3;
        return { ...gene, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, vx: 0, vy: 0, degree: degreeMap.get(gene.symbol) ?? 0 };
      })
    );
  }, [degreeMap, genes, size.h, size.w]);

  useEffect(() => {
    if (!nodes.length) return;
    let raf = 0;
    let alpha = 1;
    const step = () => {
      alpha *= 0.985;
      if (alpha < 0.01) return;
      setNodes((previous) => {
        const next = previous.map((node) => ({ ...node }));
        const cx = size.w / 2;
        const cy = size.h / 2;
        for (let i = 0; i < next.length; i += 1) {
          for (let j = i + 1; j < next.length; j += 1) {
            const a = next[i];
            const b = next[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist2 = dx * dx + dy * dy + 0.01;
            const force = 2200 / dist2;
            const dist = Math.sqrt(dist2);
            a.vx += (dx / dist) * force;
            a.vy += (dy / dist) * force;
            b.vx -= (dx / dist) * force;
            b.vy -= (dy / dist) * force;
          }
        }
        edges.forEach((edge) => {
          const a = next.find((node) => node.symbol === edge.source);
          const b = next.find((node) => node.symbol === edge.target);
          if (!a || !b) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
          const force = (dist - 125) * 0.04 * edge.score;
          a.vx += (dx / dist) * force;
          a.vy += (dy / dist) * force;
          b.vx -= (dx / dist) * force;
          b.vy -= (dy / dist) * force;
        });
        next.forEach((node) => {
          node.vx += (cx - node.x) * 0.005;
          node.vy += (cy - node.y) * 0.005;
          node.vx *= 0.82 * alpha;
          node.vy *= 0.82 * alpha;
          node.x = Math.max(44, Math.min(size.w - 44, node.x + node.vx));
          node.y = Math.max(44, Math.min(size.h - 44, node.y + node.vy));
        });
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [edges, genes, nodes.length, size.h, size.w]);

  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.symbol, node])), [nodes]);
  const active = hover ?? selected;
  const neighborSet = useMemo(() => {
    if (!active) return new Set<string>();
    const set = new Set<string>([active]);
    edges.forEach((edge) => {
      if (edge.source === active) set.add(edge.target);
      if (edge.target === active) set.add(edge.source);
    });
    return set;
  }, [active, edges]);

  return (
    <div ref={containerRef} className="relative min-h-[480px] overflow-hidden rounded-lg border border-cyan-300/15 bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/40">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:26px_26px] opacity-60" />
      <svg width={size.w} height={size.h} className="relative">
        <defs>
          <radialGradient id="scenarioUp"><stop offset="0%" stopColor="#67e8f9" /><stop offset="100%" stopColor="#0891b2" /></radialGradient>
          <radialGradient id="scenarioDown"><stop offset="0%" stopColor="#c4b5fd" /><stop offset="100%" stopColor="#7c3aed" /></radialGradient>
          <filter id="scenarioGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {edges.map((edge) => {
          const a = nodeMap.get(edge.source);
          const b = nodeMap.get(edge.target);
          if (!a || !b) return null;
          const dim = active && !(neighborSet.has(edge.source) && neighborSet.has(edge.target));
          return <line key={`${edge.source}-${edge.target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#22d3ee" strokeOpacity={dim ? 0.08 : 0.25 + edge.score * 0.4} strokeWidth={0.5 + edge.score * 1.5} />;
        })}
        {nodes.map((node) => {
          const radius = 9 + Math.min(16, node.degree * 3) + Math.min(8, Math.abs(node.log2FC) * 1.4);
          const isActive = active === node.symbol;
          const isNeighbor = active && neighborSet.has(node.symbol);
          const dim = active && !isNeighbor;
          return (
            <g key={node.symbol} transform={`translate(${node.x},${node.y})`} style={{ cursor: "pointer", opacity: dim ? 0.25 : 1, transition: "opacity 0.2s" }} onMouseEnter={() => setHover(node.symbol)} onMouseLeave={() => setHover(null)} onClick={() => setSelected(selected === node.symbol ? null : node.symbol)}>
              <circle r={radius} fill={node.direction === "up" ? "url(#scenarioUp)" : "url(#scenarioDown)"} stroke={isActive ? "#e0f2fe" : "#07111f"} strokeWidth={isActive ? 2.5 : 1.5} filter={isActive ? "url(#scenarioGlow)" : undefined} />
              <text y={radius + 13} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc" style={{ pointerEvents: "none" }}>{node.symbol}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-md border border-cyan-300/15 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 backdrop-blur">
        <span>Network Pulse layer: {activePreset.shortTitle}</span>
        <span>Size = hub degree x signal</span>
      </div>
    </div>
  );
}
