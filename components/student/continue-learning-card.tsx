import { SpaceArt } from "@/components/shared/space-art";
import Link from "next/link";
import { Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export type ContinueLearningCardProps = {
  title: string;
  subject: string;
  lessonNumber: number;
  totalLessons: number;
  progress: number;
  href: string;
};

/** Wide "Continue Learning" hero card with thumbnail + primary CTA. */
export function ContinueLearningCard({
  title,
  subject,
  lessonNumber,
  totalLessons,
  progress,
  href,
}: ContinueLearningCardProps) {
  return (
    <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
      <div className="relative aspect-[16/7] w-full bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-blue-900/50">
        <SpaceArt kind="planets" className="absolute inset-0" />
        <div className="absolute left-4 top-4">
          <Badge className="border-white/10 bg-black/40 text-white">{subject}</Badge>
        </div>
        <Link
          href={href}
          aria-label={`Continue ${title}`}
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-blue-500 text-white shadow-[0_0_28px_rgba(59,130,246,0.5)] transition hover:scale-105"
        >
          <Play size={22} className="ml-0.5" fill="currentColor" />
        </Link>
        <p className="absolute bottom-3 left-4 right-4 text-lg font-semibold text-white drop-shadow">
          {title}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>
            Lesson {lessonNumber} of {totalLessons}
          </span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <Link
          href={href}
          className="mt-4 block w-full rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 px-4 py-2 text-center font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition hover:bg-blue-400"
        >
          Continue Lesson
        </Link>
      </div>
    </section>
  );
}
