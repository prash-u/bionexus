import { FlaskConical } from "lucide-react";
import { ComplexitySelector } from "@/components/ui/ComplexitySelector";
import { GlassCard } from "@/components/ui/GlassCard";
import { ModeSelector } from "@/components/ui/ModeSelector";
import { SafetyNotice } from "@/components/safety/SafetyNotice";
import { useAppSettings } from "@/lib/storage/localStorage";

export function IntendedUseModal() {
  const { intendedUseAcknowledged, setIntendedUseAcknowledged } = useAppSettings();
  if (intendedUseAcknowledged) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 p-4 backdrop-blur-xl">
      <GlassCard className="max-h-[92vh] w-full max-w-4xl overflow-y-auto border-cyan-300/30">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3 text-cyan-100">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">BioNexus first launch</p>
            <h1 className="text-2xl font-semibold text-white">Choose your workspace lens</h1>
          </div>
        </div>
        <SafetyNotice />
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">User mode</h2>
          <ModeSelector />
        </div>
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">Complexity</h2>
          <ComplexitySelector />
        </div>
        <button className="nexus-button mt-6 w-full" onClick={() => setIntendedUseAcknowledged(true)}>
          Acknowledge intended use and enter workspace
        </button>
      </GlassCard>
    </div>
  );
}
