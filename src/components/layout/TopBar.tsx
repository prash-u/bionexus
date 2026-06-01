import { Activity, PanelLeftClose, PanelLeftOpen, ShieldCheck } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { navItems } from "@/components/layout/navItems";
import { cn } from "@/components/ui/cn";
import { useAppSettings } from "@/lib/storage/localStorage";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function TopBar() {
  const { userMode, complexityLevel, sidebarCollapsed, setSidebarCollapsed } = useAppSettings();
  const { activePreset, sandbox } = useSandbox();
  const includedModules = sandbox.moduleOutputs.filter((output) => output.includedInReport).length;
  const activeNetworkImport = sandbox.networkPulseImports.find((item) => item.id === sandbox.activeNetworkPulseImportId);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/40 bg-slate-950/60 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 xl:flex-nowrap">
        <div className="flex min-w-0 items-center gap-3 text-sm text-slate-300">
          <button
            type="button"
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-600/40 bg-slate-950/45 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100 lg:inline-flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <Activity className="h-4 w-4 shrink-0 text-cyan-200" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-100">Body sandbox: {activePreset.shortTitle}</p>
            <p className="truncate text-xs text-slate-500">
              {sandbox.simulationResult.backtraceCandidates[0]?.geneSymbol ?? "No gene candidate"} backtrace · {activePreset.affectedSystems.slice(0, 2).join(" / ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeNetworkImport ? (
            <span className="rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-blue-100">
              Network: {activeNetworkImport.genes.length} genes
            </span>
          ) : null}
          <span className="rounded-full border border-slate-500/30 bg-slate-950/45 px-3 py-1 text-slate-200">
            Report modules {includedModules}/{sandbox.moduleOutputs.length}
          </span>
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
          <Link to="/body-sandbox" className="nexus-button hidden px-3 py-1.5 text-xs sm:inline-flex">
            Open Sandbox
          </Link>
        </div>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-0.5 lg:hidden" aria-label="Mobile primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-50"
                  : "border-slate-600/35 bg-slate-950/45 text-slate-300 hover:border-violet-300/40 hover:text-white"
              )
            }
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.shortLabel}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
