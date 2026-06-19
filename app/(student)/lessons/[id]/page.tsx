"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, notFound } from "next/navigation";
import { YouTubePlayer } from "@/components/student/youtube-player";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lesson = useQuery(api.lessons.get, { lessonId: id as never });

  if (lesson === undefined) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/5" />;
  }
  if (lesson === null) notFound();

  return (
    <article className="max-w-4xl space-y-5">
      <header className="space-y-2">
        <Badge className="border-white/10 bg-white/5 text-muted-foreground">
          Lesson
        </Badge>
        <h1 className="text-2xl font-bold text-white xl:text-3xl">
          {lesson.title}
        </h1>
        <p className="text-sm text-muted-foreground">{lesson.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {lesson.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400" /> {lesson.pointsAwarded} pts
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 uppercase">
            {lesson.difficultyLevel}
          </span>
        </div>
      </header>

      <YouTubePlayer lessonId={lesson._id} videoUrl={lesson.videoUrl} />

      {lesson.lessonNotes && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <h2 className="mb-2 text-sm font-semibold text-white">Lesson notes</h2>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {lesson.lessonNotes}
          </p>
        </section>
      )}
    </article>
  );
}
