import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navItems } from "@/components/layout/navItems";
import { cn } from "@/components/ui/cn";
import { useAppSettings } from "@/lib/storage/localStorage";

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppSettings();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-slate-700/40 bg-slate-950/45 p-4 backdrop-blur-xl transition-[width] duration-300 lg:block",
        sidebarCollapsed ? "w-[5.25rem]" : "w-72"
      )}
      aria-label="Primary"
    >
      <div className={cn("mb-8 flex items-center gap-3", sidebarCollapsed && "justify-center")}>
        <div className="rounded-lg border border-cyan-300/40 bg-cyan-300/10 p-2 text-cyan-100">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className={cn("min-w-0", sidebarCollapsed && "sr-only")}>
          <p className="text-lg font-semibold text-white">BioNexus</p>
          <p className="text-xs text-slate-400">Body-scale reasoning sandbox</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={sidebarCollapsed ? `${item.label} - ${item.description}` : item.description}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition",
                sidebarCollapsed && "justify-center px-2",
                isActive
                  ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                  : "border-transparent text-slate-400 hover:border-slate-700/60 hover:bg-slate-800/50 hover:text-slate-100",
                item.primary && !isActive && "text-cyan-100/80"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className={cn("min-w-0 truncate", sidebarCollapsed && "sr-only")}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className={cn(
          "absolute bottom-4 inline-flex items-center justify-center gap-2 rounded-md border border-slate-600/40 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100",
          sidebarCollapsed ? "left-4 right-4" : "left-4 right-4"
        )}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <span className={cn(sidebarCollapsed && "sr-only")}>{sidebarCollapsed ? "Expand" : "Collapse"}</span>
      </button>
    </aside>
  );
}
