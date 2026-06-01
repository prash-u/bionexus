export function ReasoningTrail({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-xs text-cyan-100">
            {index + 1}
          </span>
          <span className="pt-1 text-sm leading-6 text-slate-300">{step}</span>
        </li>
      ))}
    </ol>
  );
}
