import { cn } from "@/components/ui/cn";

export function GlassCard({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("glass rounded-lg p-5", className)}>{children}</section>;
}
