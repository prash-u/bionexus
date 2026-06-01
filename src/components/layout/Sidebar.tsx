import { BarChart3, BrainCircuit, FileText, FlaskConical, Home, Network, ScanHeart, Settings, SlidersHorizontal, UserRoundSearch } from "lucide-react";
import { NavLink } from "react-router-dom";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/body-sandbox", label: "Body Sandbox", icon: ScanHeart },
  { to: "/workspace", label: "Workspace", icon: BrainCircuit },
  { to: "/body-atlas", label: "Body Atlas", icon: UserRoundSearch },
  { to: "/neural-circuit", label: "Neural Circuit", icon: SlidersHorizontal },
  { to: "/knowledge-graph", label: "Knowledge Graph", icon: Network },
  { to: "/interventions", label: "Interventions", icon: FlaskConical },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-700/40 bg-slate-950/35 p-4 backdrop-blur-xl lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg border border-cyan-300/40 bg-cyan-300/10 p-2 text-cyan-100">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">BioNexus</p>
          <p className="text-xs text-slate-400">Body-scale reasoning sandbox</p>
        </div>
      </div>
      <nav className="space-y-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                isActive
                  ? "border border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
