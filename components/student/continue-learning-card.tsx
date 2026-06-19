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
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
      <div className="relative aspect-[16/8] w-full bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-blue-900/50">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_40%,#a855f7,transparent_40%),radial-gradient(circle_at_70%_70%,#3b82f6,transparent_40%)]" />
        <div className="absolute left-4 top-4">
          <Badge className="border-white/10 bg-black/40 text-white">{subject}</Badge>
        </div>
        <button
          type="button"
          aria-label="Play lesson"
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-blue-500 text-white shadow-[0_0_28px_rgba(59,130,246,0.5)] transition hover:scale-105"
        >
          <Play size={22} className="ml-0.5" fill="currentColor" />
        </button>
        <p className="absolute bottom-3 left-4 right-4 text-lg font-semibold text-white drop-shadow">
          {title}
        </p>
      </div>
      <div className="p-4">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>
            Lesson {lessonNumber} of {totalLessons}
          </span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <Link
          href={href}
          className="mt-4 block w-full rounded-xl bg-blue-500 px-6 py-3 text-center font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition hover:bg-blue-400"
        >
          Continue Lesson
        </Link>
      </div>
    </section>
  );
}
