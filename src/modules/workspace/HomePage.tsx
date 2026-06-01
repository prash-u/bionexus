import { ArrowRight, BrainCircuit, FileText, Network, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { SafetyNotice } from "@/components/safety/SafetyNotice";
import { GlassCard } from "@/components/ui/GlassCard";
import { ModuleCard } from "@/components/workspace/ModuleCard";
import { parkinsonsDemo } from "@/data/demo/parkinsons/program";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function HomePage() {
  const { workspace } = useWorkspace();
  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Privacy-first biological reasoning</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold text-white md:text-6xl">BioNexus</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            BioNexus is a privacy-first biological reasoning workspace for authoring, connecting, simulating and
            reporting biological systems across scales.
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
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>{workspace.entities.length}</strong><br />entities</div>
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>{workspace.relationships.length}</strong><br />relationships</div>
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>{workspace.hypotheses.length}</strong><br />hypotheses</div>
            <div className="rounded-lg bg-slate-950/45 p-3"><strong>1.0</strong><br />workspace</div>
          </div>
        </GlassCard>
      </section>
      <SafetyNotice />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ModuleCard to="/workspace" title="Workspace" icon={BrainCircuit} description="Create entities, relationships, hypotheses and reasoning trails in a saved local workspace." />
        <ModuleCard to="/knowledge-graph" title="Knowledge Graph" icon={Network} description="Inspect and navigate the live graph, including user-authored biological objects." />
        <ModuleCard to="/simulation-studio" title="Simulation Studio" icon={SlidersHorizontal} description="Adjust conceptual perturbation controls that feed reports and workspace state." />
        <ModuleCard to="/reports" title="Reports" icon={FileText} description="Generate learner, research, executive and investor reports from your actual workspace." />
      </section>
    </div>
  );
}
