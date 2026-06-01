import { BacktracePanel } from "@/components/sandbox/BacktracePanel";
import { BiologicalLayerControls } from "@/components/sandbox/BiologicalLayerControls";
import { MolecularImportPanel } from "@/components/sandbox/MolecularImportPanel";
import { ParameterControlPanel } from "@/components/sandbox/ParameterControlPanel";
import { SandboxOutputPanel } from "@/components/sandbox/SandboxOutputPanel";
import { ScenarioBuilderPanel } from "@/components/sandbox/ScenarioBuilderPanel";
import { WholeBodyVisualization } from "@/components/sandbox/WholeBodyVisualization";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReasoningTrail } from "@/components/workspace/ReasoningTrail";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function BodySandboxPage() {
  const { activePreset, sandbox } = useSandbox();
  return (
    <div className="space-y-6">
      <GlassCard className="overflow-hidden p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Body Sandbox</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Configure body state, trace molecular flow, and backtrace upstream biology</h1>
            <p className="mt-2 max-w-4xl text-slate-400">
              Ask what happens when a biological system is predisposed, perturbed, inhibited, stimulated, damaged, rescued or modulated, then inspect plausible genes and molecules behind the state.
            </p>
          </div>
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Current simulation</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{sandbox.simulationResult.summary}</p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ScenarioBuilderPanel />
          <ParameterControlPanel />
          <MolecularImportPanel />
        </div>
        <div className="space-y-5">
          <WholeBodyVisualization />
          <GlassCard>
            <p className="mb-3 text-sm font-semibold text-white">Biological layer controls</p>
            <BiologicalLayerControls />
          </GlassCard>
        </div>
        <BacktracePanel />
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Reasoning trail</h2>
          <div className="mt-4">
            <ReasoningTrail steps={activePreset.reasoningTrail.steps} />
          </div>
        </GlassCard>
        <SandboxOutputPanel />
      </div>
    </div>
  );
}
