import { ComplexitySelector } from "@/components/ui/ComplexitySelector";
import { GlassCard } from "@/components/ui/GlassCard";
import { ModeSelector } from "@/components/ui/ModeSelector";
import { SafetyNotice } from "@/components/safety/SafetyNotice";
import { useAppSettings } from "@/lib/storage/localStorage";

export function SettingsPage() {
  const { resetAcknowledgement } = useAppSettings();
  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-violet-200">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Local workspace preferences</h1>
        <p className="mt-2 max-w-3xl text-slate-400">Settings stay in this browser through localStorage. No accounts, backend, telemetry, or tracking are used.</p>
      </GlassCard>
      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold text-white">User mode</h2>
        <ModeSelector />
      </GlassCard>
      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold text-white">Complexity level</h2>
        <ComplexitySelector />
      </GlassCard>
      <SafetyNotice />
      <GlassCard>
        <h2 className="text-lg font-semibold text-white">Privacy and theme notes</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">BioNexus is dark-first, local-first, and designed for offline-friendly demonstrations. Future imported modules should share the ontology contracts before adding new visual surfaces.</p>
        <button className="nexus-button-secondary mt-4" onClick={resetAcknowledgement}>Reset intended-use acknowledgement</button>
      </GlassCard>
    </div>
  );
}
