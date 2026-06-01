import { Activity, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppSettings } from "@/lib/storage/localStorage";
import { useSandbox } from "@/lib/sandbox/sandboxState";

const mobileNav = [
  ["/body-sandbox", "Sandbox"],
  ["/workspace", "Workspace"],
  ["/body-atlas", "Atlas"],
  ["/neural-circuit", "Neural"],
  ["/knowledge-graph", "Graph"],
  ["/reports", "Reports"]
];

export function TopBar() {
  const { userMode, complexityLevel } = useAppSettings();
  const { activePreset } = useSandbox();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/40 bg-slate-950/60 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Activity className="h-4 w-4 text-cyan-200" />
          <span>Body sandbox: {activePreset.shortTitle}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-violet-300/30 bg-violet-300/10 px-3 py-1 capitalize text-violet-100">
            {userMode.replace(/([A-Z])/g, " $1")}
          </span>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 capitalize text-cyan-100">
            {complexityLevel}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-emerald-100">
            <ShieldCheck className="h-3 w-3" />
            Local-first
          </span>
        </div>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
        {mobileNav.map(([to, label]) => (
          <NavLink key={to} to={to} className="nexus-button-secondary whitespace-nowrap px-3 py-1.5 text-xs">
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
