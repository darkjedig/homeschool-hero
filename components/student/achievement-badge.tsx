import type { LucideIcon } from "lucide-react";

export type AchievementBadgeProps = {
  icon: LucideIcon;
  label: string;
  color?: string;
};

/** Circular medal/badge for the "Recent Achievements" row. */
export function AchievementBadge({
  icon: Icon,
  label,
  color = "#eab308",
}: AchievementBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div
        className="grid h-14 w-14 place-items-center rounded-full border bg-white/5 transition hover:scale-105"
        style={{
          borderColor: `${color}55`,
          boxShadow: `0 0 18px ${color}33`,
        }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <span className="max-w-[64px] truncate text-[10px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
