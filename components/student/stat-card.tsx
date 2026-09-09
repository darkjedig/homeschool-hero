import type { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type StatCardProps = {
  icon: LucideIcon;
  iconColor?: string;
  value: string;
  label: string;
  sub?: string;
  subColor?: "green" | "muted";
  progress?: number;
};

/** One of the 4 top-row stat cards: dark glass, icon, big number, label. */
export function StatCard({
  icon: Icon,
  iconColor = "#3b82f6",
  value,
  label,
  sub,
  subColor = "muted",
  progress,
}: StatCardProps) {
  return (
    <section className="hero-stat space-panel">
      <div className="hero-stat-icon">
        <div
          className="grid h-16 w-16 place-items-center rounded-full border border-white/10"
          style={{ backgroundColor: `${iconColor}22` }}
        >
          <Icon size={34} style={{ color: iconColor }} />
        </div>
      </div>
      <p className="hero-stat-value text-2xl font-bold text-white">{value}</p>
      <p className="hero-stat-label text-xs text-blue-100">{label}</p>
      {sub && (
        <p
          className={
            "mt-1 text-xs " +
            (subColor === "green" ? "text-green-400" : "text-muted-foreground")
          }
        >
          {sub}
        </p>
      )}
      {typeof progress === "number" && (
        <Progress value={progress} className="mt-3 h-2" />
      )}
    </section>
  );
}
