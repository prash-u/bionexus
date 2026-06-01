import { Dna, Network, Split } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { bodyRegionLabels } from "@/data/scenarios/presets";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function BacktracePanel() {
  const { sandbox } = useSandbox();
  const candidates = sandbox.simulationResult.backtraceCandidates;

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex items-center gap-2">
        <Split className="h-5 w-5 text-violet-200" />
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Reverse reasoning</p>
          <h2 className="text-lg font-semibold text-white">Possible upstream drivers</h2>
        </div>
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-400">
        Given the current exploratory body state, these genes and pathways are ranked as plausible explanatory candidates, not causal conclusions.
      </p>
      <div className="space-y-3">
        {candidates.map((candidate) => (
          <article key={candidate.id} className="rounded-lg border border-violet-300/15 bg-violet-300/[0.055] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Dna className="h-4 w-4 text-cyan-200" />
                  <h3 className="text-lg font-semibold text-white">{candidate.geneSymbol}</h3>
                  <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100">{candidate.direction}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{candidate.geneName}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg text-violet-100">{Math.round(candidate.score * 100)}%</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">rank score</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{candidate.reasoning}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.linkedPathways.slice(0, 3).map((pathway) => (
                <span key={pathway} className="inline-flex items-center gap-1 rounded-full border border-slate-600/40 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-200">
                  <Network className="h-3 w-3 text-cyan-200" />
                  {pathway}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {candidate.linkedBodyRegions.slice(0, 4).map((region) => (
                <span key={region} className="rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300">{bodyRegionLabels[region]}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </GlassCard>
  );
}
