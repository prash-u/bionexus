import { Camera, Hand, Lock, Upload, Video } from "lucide-react";

const inputModes = [
  { icon: Camera, label: "Webcam", description: "Future local camera stream for motion and phenotype observation." },
  { icon: Hand, label: "Handpose", description: "Future 21-point hand landmark tracking for tremor or motor-output demos." },
  { icon: Upload, label: "Image upload", description: "Future static media input for visible phenotype teaching examples." },
  { icon: Video, label: "Video upload", description: "Future local video frame analysis for time-series phenotype context." }
];

export function LiveVisionInputPanel() {
  return (
    <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-emerald-200" />
        <h3 className="text-sm font-semibold text-white">Live Vision input architecture</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-emerald-50/80">
        Ported from Live Vision Model Lab as a future client-side input layer. Inference should run locally in the browser tab and export structured observations into SandboxState.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {inputModes.map((mode) => (
          <div key={mode.label} className="rounded-lg border border-emerald-300/20 bg-slate-950/35 p-3">
            <mode.icon className="mb-2 h-4 w-4 text-emerald-200" />
            <p className="text-sm font-semibold text-white">{mode.label}</p>
            <p className="mt-1 text-xs leading-5 text-emerald-50/70">{mode.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
