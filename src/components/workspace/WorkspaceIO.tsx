import { Download, RotateCcw, Upload } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function WorkspaceIO() {
  const { exportWorkspace, importWorkspace, resetWorkspace } = useWorkspace();
  const [payload, setPayload] = useState("");
  const [message, setMessage] = useState("");

  const download = () => {
    const blob = new Blob([exportWorkspace()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bionexus-workspace.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = () => {
    const result = importWorkspace(payload);
    setMessage(result.ok ? "Workspace imported." : result.error);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="space-y-3">
        <button className="nexus-button w-full" onClick={download}><Download className="h-4 w-4" /> Export workspace JSON</button>
        <button className="nexus-button-secondary w-full" onClick={importJson}><Upload className="h-4 w-4" /> Import pasted JSON</button>
        <button className="nexus-button-secondary w-full" onClick={resetWorkspace}><RotateCcw className="h-4 w-4" /> Reset to Parkinson's demo</button>
        {message ? <p className="text-sm text-cyan-100">{message}</p> : null}
      </div>
      <textarea
        className="min-h-36 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200"
        placeholder="Paste a BioNexus workspace JSON export here to import it."
        value={payload}
        onChange={(event) => setPayload(event.target.value)}
      />
    </div>
  );
}
