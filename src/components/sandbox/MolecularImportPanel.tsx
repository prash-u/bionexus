import { DatabaseZap, DownloadCloud, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { bodyRegionLabels } from "@/data/scenarios/presets";
import type { BodyRegionId, MolecularEdge, ScenarioCategory } from "@/lib/ontology/types";
import { useSandbox } from "@/lib/sandbox/sandboxState";

const regionIds = Object.keys(bodyRegionLabels) as BodyRegionId[];
const edgeKinds: MolecularEdge["edgeKind"][] = ["reaction", "transport", "endocrine", "neural", "immune", "gene_delivery", "modulation"];

const defaultsByCategory: Record<ScenarioCategory, {
  stableId: string;
  sourceRegionId: BodyRegionId;
  targetRegionId: BodyRegionId;
  edgeKind: MolecularEdge["edgeKind"];
  pathwayContext: string;
}> = {
  neural: {
    stableId: "R-HSA-209924",
    sourceRegionId: "brain",
    targetRegionId: "peripheralNerves",
    edgeKind: "neural",
    pathwayContext: "Dopamine synthesis / motor-circuit context"
  },
  metabolic: {
    stableId: "R-HSA-74716",
    sourceRegionId: "pancreas",
    targetRegionId: "muscle",
    edgeKind: "endocrine",
    pathwayContext: "Insulin receptor binding / glucose regulation context"
  },
  ocular: {
    stableId: "R-HSA-420883",
    sourceRegionId: "eye",
    targetRegionId: "brain",
    edgeKind: "reaction",
    pathwayContext: "Phototransduction reaction context"
  },
  immune: {
    stableId: "R-HSA-193691",
    sourceRegionId: "immune",
    targetRegionId: "liver",
    edgeKind: "immune",
    pathwayContext: "NF-kB inflammatory signaling context"
  },
  cardiovascular: {
    stableId: "R-HSA-74716",
    sourceRegionId: "heart",
    targetRegionId: "muscle",
    edgeKind: "endocrine",
    pathwayContext: "Cardiometabolic signaling context"
  },
  mitochondrial: {
    stableId: "R-HSA-110144",
    sourceRegionId: "muscle",
    targetRegionId: "heart",
    edgeKind: "reaction",
    pathwayContext: "Adenylate kinase energy-transfer context"
  },
  environmental: {
    stableId: "R-HSA-193691",
    sourceRegionId: "immune",
    targetRegionId: "skin",
    edgeKind: "immune",
    pathwayContext: "Environmental inflammatory response context"
  },
  custom: {
    stableId: "R-HSA-74716",
    sourceRegionId: "pancreas",
    targetRegionId: "muscle",
    edgeKind: "reaction",
    pathwayContext: "Custom sandbox molecular edge"
  }
};

export function MolecularImportPanel() {
  const {
    activePreset,
    sandbox,
    importReactomeEdge,
    removeImportedMolecularEdge,
    clearMolecularImportError,
    selectMolecularEdge
  } = useSandbox();
  const defaults = useMemo(() => defaultsByCategory[activePreset.category], [activePreset.category]);
  const [stableId, setStableId] = useState(defaults.stableId);
  const [sourceRegionId, setSourceRegionId] = useState<BodyRegionId>(defaults.sourceRegionId);
  const [targetRegionId, setTargetRegionId] = useState<BodyRegionId>(defaults.targetRegionId);
  const [edgeKind, setEdgeKind] = useState<MolecularEdge["edgeKind"]>(defaults.edgeKind);
  const [pathwayContext, setPathwayContext] = useState(defaults.pathwayContext);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setStableId(defaults.stableId);
    setSourceRegionId(defaults.sourceRegionId);
    setTargetRegionId(defaults.targetRegionId);
    setEdgeKind(defaults.edgeKind);
    setPathwayContext(defaults.pathwayContext);
  }, [defaults]);

  const importedForScenario = sandbox.importedMolecularEdges.filter((edge) => edge.scenarioIds.includes(sandbox.activeScenarioId));

  const submit = async () => {
    setIsImporting(true);
    await importReactomeEdge({ stableId, sourceRegionId, targetRegionId, edgeKind, pathwayContext });
    setIsImporting(false);
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">
          <DatabaseZap className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Molecular import</p>
          <h2 className="mt-1 text-base font-semibold text-white">Attach database-backed reaction edges</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Optional live Reactome lookup. Results stay in local browser storage and are treated as educational sandbox context.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-[0.14em] text-slate-500" htmlFor="reactome-stable-id">Reactome stable id</label>
        <input
          id="reactome-stable-id"
          value={stableId}
          onChange={(event) => setStableId(event.target.value)}
          className="w-full rounded-lg border border-slate-700/60 bg-slate-950/65 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
          placeholder="R-HSA-74716"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldSelect label="From" value={sourceRegionId} onChange={(value) => setSourceRegionId(value as BodyRegionId)}>
            {regionIds.map((id) => <option key={id} value={id}>{bodyRegionLabels[id]}</option>)}
          </FieldSelect>
          <FieldSelect label="To" value={targetRegionId} onChange={(value) => setTargetRegionId(value as BodyRegionId)}>
            {regionIds.map((id) => <option key={id} value={id}>{bodyRegionLabels[id]}</option>)}
          </FieldSelect>
        </div>
        <FieldSelect label="Edge kind" value={edgeKind} onChange={(value) => setEdgeKind(value as MolecularEdge["edgeKind"])}>
          {edgeKinds.map((kind) => <option key={kind} value={kind}>{kind.replace(/_/g, " ")}</option>)}
        </FieldSelect>
        <label className="block text-xs uppercase tracking-[0.14em] text-slate-500" htmlFor="pathway-context">Pathway context</label>
        <input
          id="pathway-context"
          value={pathwayContext}
          onChange={(event) => setPathwayContext(event.target.value)}
          className="w-full rounded-lg border border-slate-700/60 bg-slate-950/65 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
        />
        <button type="button" onClick={submit} disabled={isImporting} className="nexus-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">
          <DownloadCloud className="h-4 w-4" />
          {isImporting ? "Importing..." : "Import Reactome edge"}
        </button>
      </div>

      {sandbox.molecularImportError ? (
        <div className="rounded-lg border border-rose-300/20 bg-rose-400/10 p-3 text-xs leading-5 text-rose-100">
          <div className="flex items-start justify-between gap-3">
            <span>{sandbox.molecularImportError}</span>
            <button type="button" aria-label="Dismiss import error" onClick={clearMolecularImportError} className="text-rose-100/70 transition hover:text-white">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Imported edges in this scenario</p>
        {importedForScenario.length ? importedForScenario.map((edge) => (
          <div key={edge.id} className="rounded-lg border border-slate-700/45 bg-slate-950/45 p-3">
            <button type="button" onClick={() => selectMolecularEdge(edge.id)} className="block w-full text-left">
              <span className="block text-sm font-semibold text-white">{edge.label}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-400">{bodyRegionLabels[edge.sourceRegionId]} {"->"} {bodyRegionLabels[edge.targetRegionId]} · {edge.payloads.length} payloads</span>
            </button>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100">Reactome exact</span>
              <button type="button" onClick={() => removeImportedMolecularEdge(edge.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-slate-400 transition hover:border-rose-300/40 hover:text-rose-100" aria-label={`Remove ${edge.label}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )) : (
          <p className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-3 text-xs leading-5 text-slate-500">
            No imported edges yet. Curated BioNexus edges remain active for the preset.
          </p>
        )}
      </div>

      {sandbox.molecularImportSnapshots.length ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Import trail</p>
          {sandbox.molecularImportSnapshots.slice(0, 3).map((snapshot) => (
            <div key={snapshot.id} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-200">{snapshot.query}</span>
                <span className={snapshot.status === "ready" ? "text-[10px] uppercase tracking-[0.12em] text-emerald-200" : "text-[10px] uppercase tracking-[0.12em] text-rose-200"}>{snapshot.status}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">{snapshot.label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </GlassCard>
  );
}

function FieldSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-700/60 bg-slate-950/65 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/50"
      >
        {children}
      </select>
    </label>
  );
}
