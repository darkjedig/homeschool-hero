import Link from "next/link";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { hexToRgb, subjectMeta } from "@/lib/subjects";
import { Progress } from "@/components/ui/progress";

export type MissionCardProps = {
  subjectSlug: string;
  title: string;
  subTopic: string;
  progress: number;
  points: number;
  href?: string;
  iconName?: string;
  color?: string;
};

/** A "Today's Mission" subject card with subject-coloured glow. */
export function MissionCard({
  subjectSlug,
  title,
  subTopic,
  progress,
  points,
  href = "#",
  iconName,
  color,
}: MissionCardProps) {
  const meta = subjectMeta(subjectSlug);
  const accent = color || meta.color;
  const rgb = hexToRgb(accent);
  return (
    <Link
      href={href}
      className="block rounded-2xl border bg-gradient-to-b from-white/[0.06] to-transparent p-4 transition hover:-translate-y-0.5 hover:scale-[1.02]"
      style={{
        borderColor: `${accent}4d`,
        boxShadow: `0 0 24px rgba(${rgb},0.15)`,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ backgroundColor: `${accent}22` }}
        >
          <SubjectIcon slug={subjectSlug} iconName={iconName} color={accent} size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subTopic}</p>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{progress}%</span>
        <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 font-semibold text-yellow-300">
          {points} pts
        </span>
      </div>
    </Link>
  );
}
