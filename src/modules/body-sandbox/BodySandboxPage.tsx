import { BiologicalLayerControls } from "@/components/sandbox/BiologicalLayerControls";
import { SandboxOutputPanel } from "@/components/sandbox/SandboxOutputPanel";
import { ScenarioBuilderPanel } from "@/components/sandbox/ScenarioBuilderPanel";
import { WholeBodyVisualization } from "@/components/sandbox/WholeBodyVisualization";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReasoningTrail } from "@/components/workspace/ReasoningTrail";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function BodySandboxPage() {
  const { activePreset } = useSandbox();
  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Body Sandbox</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Configure biological states and observe body-scale consequence maps</h1>
        <p className="mt-2 max-w-4xl text-slate-400">
          Ask what happens when a biological system is predisposed, perturbed, inhibited, stimulated, damaged, rescued or modulated.
        </p>
      </GlassCard>
      <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <ScenarioBuilderPanel />
        <div className="space-y-5">
          <WholeBodyVisualization />
          <GlassCard>
            <p className="mb-3 text-sm font-semibold text-white">Biological layer controls</p>
            <BiologicalLayerControls />
          </GlassCard>
        </div>
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
