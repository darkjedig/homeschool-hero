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
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ backgroundColor: `${iconColor}22` }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold text-white xl:text-4xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
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
