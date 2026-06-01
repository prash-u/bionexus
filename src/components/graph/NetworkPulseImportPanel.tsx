import { GitFork, Trash2, UploadCloud, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { defaultNetworkPulseCsvForPreset, rankNetworkGenes } from "@/lib/network/networkPulseImport";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function NetworkPulseImportPanel() {
  const {
    activePreset,
    sandbox,
    importNetworkPulseCsv,
    selectNetworkPulseImport,
    removeNetworkPulseImport,
    clearNetworkPulseImportError
  } = useSandbox();
  const examples = useMemo(() => defaultNetworkPulseCsvForPreset(activePreset), [activePreset]);
  const [label, setLabel] = useState(`${activePreset.shortTitle} imported signal`);
  const [source, setSource] = useState("Network Pulse-style local CSV");
  const [genesCsv, setGenesCsv] = useState(examples.genesCsv);
  const [edgesCsv, setEdgesCsv] = useState(examples.edgesCsv);
  const [pathwaysCsv, setPathwaysCsv] = useState(examples.pathwaysCsv);
  const importsForScenario = sandbox.networkPulseImports.filter((item) => item.scenarioId === sandbox.activeScenarioId);
  const activeImport = importsForScenario.find((item) => item.id === sandbox.activeNetworkPulseImportId);
  const rankedGenes = activeImport ? rankNetworkGenes(activeImport).slice(0, 5) : [];

  const loadExample = () => {
    const next = defaultNetworkPulseCsvForPreset(activePreset);
    setLabel(`${activePreset.shortTitle} imported signal`);
    setGenesCsv(next.genesCsv);
    setEdgesCsv(next.edgesCsv);
    setPathwaysCsv(next.pathwaysCsv);
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-violet-300/25 bg-violet-300/10 p-2 text-violet-100">
          <GitFork className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Network Pulse import</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Bring gene, edge and pathway signals into the sandbox</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Paste the same compact tables used by Network Pulse Analyzer. BioNexus turns them into upstream backtrace candidates, graph topology and report evidence.
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-3">
          <TextInput label="Import label" value={label} onChange={setLabel} />
          <TextInput label="Source note" value={source} onChange={setSource} />
          <button type="button" onClick={() => importNetworkPulseCsv({ label, source, genesCsv, edgesCsv, pathwaysCsv })} className="nexus-button w-full justify-center">
            <UploadCloud className="h-4 w-4" />
            Import network signal
          </button>
          <button type="button" onClick={loadExample} className="nexus-button-secondary w-full justify-center">
            Load scenario example
          </button>
          {sandbox.networkPulseImportError ? (
            <div className="rounded-lg border border-rose-300/20 bg-rose-400/10 p-3 text-xs leading-5 text-rose-100">
              <div className="flex items-start justify-between gap-3">
                <span>{sandbox.networkPulseImportError}</span>
                <button type="button" aria-label="Dismiss network import error" onClick={clearNetworkPulseImportError} className="text-rose-100/70 transition hover:text-white">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <CsvBox label="Genes CSV" value={genesCsv} onChange={setGenesCsv} rows={9} />
          <CsvBox label="Edges CSV" value={edgesCsv} onChange={setEdgesCsv} rows={9} />
          <CsvBox label="Pathways CSV" value={pathwaysCsv} onChange={setPathwaysCsv} rows={9} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Imports in this scenario</p>
          <div className="mt-3 space-y-2">
            {importsForScenario.length ? importsForScenario.map((item) => (
              <div key={item.id} className={`rounded-lg border p-3 ${item.id === activeImport?.id ? "border-violet-300/35 bg-violet-300/10" : "border-white/10 bg-white/[0.03]"}`}>
                <button type="button" onClick={() => selectNetworkPulseImport(item.id)} className="block w-full text-left">
                  <span className="block text-sm font-semibold text-white">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">{item.summary}</span>
                </button>
                <button type="button" onClick={() => removeNetworkPulseImport(item.id)} className="mt-2 inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-slate-400 transition hover:border-rose-300/40 hover:text-rose-100">
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            )) : (
              <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-500">No imported network signal yet. Scenario defaults remain active.</p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-violet-300/20 bg-violet-300/[0.055] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-violet-200">Active network backtrace</p>
          {activeImport ? (
            <div className="mt-3 space-y-2">
              {rankedGenes.map((gene) => (
                <div key={gene.symbol} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-slate-950/45 px-3 py-2">
                  <div>
                    <p className="font-mono text-sm font-semibold text-white">{gene.symbol}</p>
                    <p className="text-xs text-slate-500">{gene.degree} edges · {gene.pathwayCount} pathways · log2FC {gene.log2FC.toFixed(2)}</p>
                  </div>
                  <span className="font-mono text-xs text-violet-100">{Math.round(gene.score * 100)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-400">Import or select a Network Pulse signal to override the synthetic graph with data-backed topology.</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-700/60 bg-slate-950/65 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-300/50" />
    </label>
  );
}

function CsvBox({ label, value, rows, onChange }: { label: string; value: string; rows: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="w-full resize-y rounded-lg border border-slate-700/60 bg-slate-950/65 px-3 py-2 font-mono text-[11px] leading-5 text-slate-200 outline-none transition focus:border-violet-300/50" />
    </label>
  );
}
