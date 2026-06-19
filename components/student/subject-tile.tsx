import Link from "next/link";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { hexToRgb, subjectMeta } from "@/lib/subjects";
import { Progress } from "@/components/ui/progress";

export type SubjectTileProps = {
  slug: string;
  name: string;
  progress: number;
  href?: string;
};

/** Compact subject tile for the 2x4 "Core Subjects" grid. */
export function SubjectTile({ slug, name, progress, href = "#" }: SubjectTileProps) {
  const meta = subjectMeta(slug);
  const rgb = hexToRgb(meta.color);
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center transition hover:-translate-y-0.5"
      style={{ boxShadow: `0 0 18px rgba(${rgb},0.10)` }}
    >
      <div
        className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl"
        style={{ backgroundColor: `${meta.color}22` }}
      >
        <SubjectIcon slug={slug} size={20} />
      </div>
      <p className="truncate text-xs font-semibold text-white">{name}</p>
      <Progress value={progress} className="mt-2 h-1.5" />
      <p className="mt-1 text-[10px] text-muted-foreground">{progress}%</p>
    </Link>
  );
}
