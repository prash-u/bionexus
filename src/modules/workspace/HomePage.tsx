import { ArrowRight, FileText, Network, ScanHeart, UserRoundSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { SafetyNotice } from "@/components/safety/SafetyNotice";
import { GlassCard } from "@/components/ui/GlassCard";
import { ModuleCard } from "@/components/workspace/ModuleCard";
import { abstractionLayers, entityTypeLabels } from "@/data/ontology/entityTypes";
import { scenarioPresets } from "@/data/scenarios/presets";
import { useWorkspace } from "@/lib/workspace/workspaceState";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function HomePage() {
  const { workspace } = useWorkspace();
  const { selectPreset } = useSandbox();
  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Privacy-first body sandbox</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold text-white md:text-6xl">BioNexus</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            BioNexus is a privacy-first biological reasoning sandbox for exploring how genes, pathways, tissues,
            organs, systems, phenotypes and interventions connect.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="nexus-button" to="/body-sandbox">
              Build a scenario
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="nexus-button-secondary" to="/body-sandbox">
              Explore the body
            </Link>
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-sm uppercase tracking-[0.18em] text-violet-200">Configurable sandbox</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">From preset scenario to biological consequence map</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Choose a scenario, modify assumptions, trace pathway consequences across the body, then export the reasoning trail.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-200">
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>{workspace.entities.length}</strong><br />entities</div>
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>{workspace.relationships.length}</strong><br />relationships</div>
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>{scenarioPresets.length}</strong><br />presets</div>
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>1.1</strong><br />sandbox</div>
          </div>
        </GlassCard>
      </section>
      <SafetyNotice />
      <GlassCard>
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-200">Start from whatever data you have</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Build a sandbox experience across the hierarchy</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Pick the layer your example lives in, then BioNexus should extrapolate upstream toward genes and proteins and downstream toward tissues, phenotypes, scenarios and interventions.
            </p>
            <Link to="/body-sandbox" className="nexus-button mt-5">Fit an example now</Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {abstractionLayers.map((layer, index) => (
              <Link
                key={layer}
                to="/body-sandbox"
                className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-3 transition hover:border-cyan-300/45 hover:bg-cyan-300/[0.06]"
              >
                <span className="text-[10px] uppercase tracking-[0.16em] text-cyan-200">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-2 block text-sm font-semibold text-white">{entityTypeLabels[layer]}</span>
              </Link>
            ))}
          </div>
        </div>
      </GlassCard>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ModuleCard to="/body-sandbox" title="Build a scenario" icon={ScanHeart} description="Choose a preset, baseline, predispositions, perturbations and interventions." />
        <ModuleCard to="/body-sandbox" title="Explore the body" icon={UserRoundSearch} description="Inspect affected organs and systems through the Body pillar." />
        <ModuleCard to="/body-sandbox" title="Trace pathways" icon={Network} description="Use Knowledge Path to trace upstream and downstream reasoning." />
        <ModuleCard to="/reports" title="Generate a report" icon={FileText} description="Export learner, educator, research, investor or scenario reports from SandboxState." />
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scenarioPresets.map((preset) => (
          <button key={preset.id} className="text-left" onClick={() => selectPreset(preset.id)}>
            <GlassCard className="h-full transition hover:border-cyan-300/45 hover:shadow-glow">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Demo preset</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{preset.shortTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{preset.description}</p>
            </GlassCard>
          </button>
        ))}
      </section>
    </div>
  );
}
