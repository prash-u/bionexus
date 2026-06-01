import { ArrowRight, BrainCircuit, FileText, Network, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { SafetyNotice } from "@/components/safety/SafetyNotice";
import { GlassCard } from "@/components/ui/GlassCard";
import { ModuleCard } from "@/components/workspace/ModuleCard";
import { parkinsonsDemo } from "@/data/demo/parkinsons/program";

export function HomePage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Privacy-first biological reasoning</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold text-white md:text-6xl">BioNexus</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            BioNexus is a privacy-first biological reasoning workspace for exploring how genes, pathways, tissues,
            systems, phenotypes and interventions connect.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="nexus-button" to="/workspace">
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="nexus-button-secondary" to="/knowledge-graph">
              View knowledge graph
            </Link>
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-sm uppercase tracking-[0.18em] text-violet-200">Current vertical slice</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{parkinsonsDemo.program.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{parkinsonsDemo.program.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-200">
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>{parkinsonsDemo.entities.length}</strong><br />entities</div>
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>{parkinsonsDemo.relationships.length}</strong><br />relationships</div>
          </div>
        </GlassCard>
      </section>
      <SafetyNotice />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ModuleCard to="/workspace" title="Workspace" icon={BrainCircuit} description="Mission-control surface for abstraction layers, reasoning trail, and next exploration options." />
        <ModuleCard to="/knowledge-graph" title="Knowledge Graph" icon={Network} description="Structured graph view of demo entities, relationships, confidence, and evidence." />
        <ModuleCard to="/simulation-studio" title="Simulation Studio" icon={SlidersHorizontal} description="Architecture placeholder for tremor, DBS, neural pulse, and pathway propagation modules." />
        <ModuleCard to="/reports" title="Reports" icon={FileText} description="Learner, research, executive, and investor-ready exports from the same local state." />
      </section>
    </div>
  );
}
