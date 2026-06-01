import { CheckCircle2, FlaskConical } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function HypothesisLab() {
  const { workspace, addHypothesis, updateHypothesisStatus } = useWorkspace();
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [rationale, setRationale] = useState("");
  const [linkedIds, setLinkedIds] = useState<string[]>([workspace.selectedEntityId]);

  const toggleLinked = (id: string) => {
    setLinkedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const create = () => {
    if (!title.trim() || !question.trim() || !rationale.trim()) return;
    addHypothesis({ title: title.trim(), question: question.trim(), rationale: rationale.trim(), linkedEntityIds: linkedIds });
    setTitle("");
    setQuestion("");
    setRationale("");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-cyan-200" />
          <h3 className="text-base font-semibold text-white">Create hypothesis</h3>
        </div>
        <div className="mt-4 grid gap-3">
          <input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Hypothesis title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <input className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Research question" value={question} onChange={(event) => setQuestion(event.target.value)} />
          <textarea className="min-h-24 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Rationale based on the current map" value={rationale} onChange={(event) => setRationale(event.target.value)} />
          <div className="max-h-44 overflow-auto rounded-md border border-slate-700/50 p-2">
            {workspace.entities.map((entity) => (
              <label key={entity.id} className="flex items-center gap-2 px-2 py-1 text-xs text-slate-300">
                <input type="checkbox" checked={linkedIds.includes(entity.id)} onChange={() => toggleLinked(entity.id)} />
                {entity.shortName ?? entity.name}
              </label>
            ))}
          </div>
          <button className="nexus-button" onClick={create}>Save hypothesis</button>
        </div>
      </div>
      <div className="space-y-3">
        {workspace.hypotheses.map((hypothesis) => (
          <div key={hypothesis.id} className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{hypothesis.title}</h3>
                <p className="mt-1 text-sm text-cyan-100">{hypothesis.question}</p>
              </div>
              <span className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs text-violet-100">{hypothesis.status.replace(/_/g, " ")}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{hypothesis.rationale}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["draft", "active", "ready_for_report"] as const).map((status) => (
                <button key={status} className="nexus-button-secondary px-3 py-1 text-xs" onClick={() => updateHypothesisStatus(hypothesis.id, status)}>
                  {hypothesis.status === status ? <CheckCircle2 className="h-3 w-3" /> : null}
                  {status.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
