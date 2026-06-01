import type { UserMode } from "@/lib/ontology/types";
import { useAppSettings } from "@/lib/storage/localStorage";

const modes: Array<{ value: UserMode; label: string; description: string }> = [
  { value: "student", label: "Student", description: "Clear explanations and guided trails." },
  { value: "educator", label: "Educator", description: "Teaching language and report framing." },
  { value: "researcher", label: "Researcher", description: "Mechanistic terms and evidence emphasis." },
  { value: "biotechDemo", label: "Biotech / Investor", description: "Pitch-ready product narrative." },
  { value: "clinicianExploratory", label: "Professional Exploratory", description: "Careful scientific framing." }
];

export function ModeSelector() {
  const { userMode, setUserMode } = useAppSettings();
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setUserMode(mode.value)}
          className={`rounded-lg border p-4 text-left transition ${
            userMode === mode.value
              ? "border-cyan-300/70 bg-cyan-300/15 shadow-glow"
              : "border-slate-600/30 bg-slate-950/35 hover:border-cyan-300/40"
          }`}
        >
          <span className="block text-sm font-semibold text-slate-100">{mode.label}</span>
          <span className="mt-1 block text-xs text-slate-400">{mode.description}</span>
        </button>
      ))}
    </div>
  );
}
