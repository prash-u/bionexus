import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";

export function ModuleCard({
  to,
  title,
  description,
  icon: Icon
}: {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link to={to}>
      <GlassCard className="h-full transition hover:border-violet-300/45 hover:shadow-violet">
        <Icon className="mb-4 h-6 w-6 text-cyan-200" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </GlassCard>
    </Link>
  );
}
