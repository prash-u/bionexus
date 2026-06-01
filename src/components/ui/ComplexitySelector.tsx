import type { ComplexityLevel } from "@/lib/ontology/types";
import { useAppSettings } from "@/lib/storage/localStorage";

const levels: ComplexityLevel[] = ["basic", "intermediate", "advanced", "expert"];

export function ComplexitySelector() {
  const { complexityLevel, setComplexityLevel } = useAppSettings();
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-lg border border-slate-600/30 bg-slate-950/40 p-1">
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => setComplexityLevel(level)}
          className={`rounded-md px-3 py-2 text-sm capitalize transition ${
            complexityLevel === level ? "bg-violet-400/20 text-violet-100" : "text-slate-400 hover:text-slate-100"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
