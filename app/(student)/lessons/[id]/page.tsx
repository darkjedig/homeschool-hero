"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { YouTubePlayer } from "@/components/student/youtube-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, ListChecks, Video, Lightbulb, Check, X } from "lucide-react";
import { isYouTubeVideoUrl } from "@/lib/youtube";
import { LessonBlocks } from "@/components/student/lesson-blocks";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lesson = useQuery(api.lessons.get, { lessonId: id as never });
  const quiz = useQuery(
    api.quizzes.getForLesson,
    lesson ? { lessonId: lesson._id } : "skip",
  );

  if (lesson === undefined || quiz === undefined) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/5" />;
  }
  if (lesson === null) notFound();

  const hasVideo = isYouTubeVideoUrl(lesson.videoUrl);
  const warmup = quiz?.questions[0];

  return (
    <article className="max-w-3xl space-y-6">
      <header className="space-y-2">
        {lesson.kind === "activity" ? (
          <Badge className="border-cyan-500/30 bg-cyan-500/15 text-cyan-200">Interactive Activity</Badge>
        ) : (
          <Badge className="border-white/10 bg-white/5 text-muted-foreground">Lesson</Badge>
        )}
        <h1 className="text-2xl font-bold text-white xl:text-3xl">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground">{lesson.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock size={14} /> {lesson.estimatedMinutes} min</span>
          <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> {lesson.pointsAwarded} pts</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 uppercase">{lesson.difficultyLevel}</span>
        </div>
      </header>

      {/* Video (or honest placeholder) */}
      {hasVideo ? (
        <YouTubePlayer lessonId={lesson._id} videoUrl={lesson.videoUrl} />
      ) : (
        <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-center">
          <div>
            <Video size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-white">Video coming soon</p>
            <p className="text-xs text-muted-foreground">Read the lesson below and try the warm-up.</p>
          </div>
        </div>
      )}

      {/* Structured lesson content (blocks) — falls back to lessonNotes */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lesson</h2>
        {lesson.content && lesson.content.length > 0 ? (
          <LessonBlocks blocks={lesson.content} lessonId={lesson._id} />
        ) : lesson.lessonNotes ? (
          <div className="space-y-3 text-sm leading-relaxed text-slate-200">
            {lesson.lessonNotes.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">{para}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No lesson content yet.</p>
        )}
      </section>

      {/* Interactive warm-up: multiple-choice quick check (uses the first quiz question) */}
      {warmup && (
        <WarmUp
          question={warmup.questionText}
          options={warmup.options}
          answer={warmup.correctAnswer}
          explanation={warmup.explanation}
        />
      )}

      {/* Quiz CTA */}
      {quiz && quiz.questions.length > 0 ? (
        <Link href={`/quiz/${quiz.quiz._id}`} className="block">
          <Button className="w-full bg-blue-500 py-6 text-base text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-400">
            <ListChecks size={18} /> Take the quiz ({quiz.questions.length} questions · +{lesson.pointsAwarded} pts)
          </Button>
        </Link>
      ) : lesson.kind === "activity" ? (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4 text-center text-sm text-cyan-100">
          Great work — keep practising this activity to boost your score!
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-muted-foreground">
          Quiz coming soon for this lesson.
        </div>
      )}

      <div className="flex justify-between text-xs text-muted-foreground">
        <Link href="/subjects" className="hover:text-white">← All subjects</Link>
      </div>
    </article>
  );
}

function WarmUp({
  question,
  options,
  answer,
  explanation,
}: {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = selected !== null;
  return (
    <section className="rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.06] p-5">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <Lightbulb size={16} className="text-yellow-300" /> Quick warm-up
      </h2>
      <p className="mb-3 text-sm text-slate-200">{question}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isCorrect = opt === answer;
          const isSelected = opt === selected;
          let cls = "border-white/10 bg-white/5 text-white hover:border-yellow-400/40";
          if (revealed) {
            if (isCorrect) cls = "border-green-500/50 bg-green-500/15 text-white";
            else if (isSelected) cls = "border-red-500/50 bg-red-500/15 text-white";
            else cls = "border-white/10 bg-white/5 text-muted-foreground";
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={revealed}
              onClick={() => setSelected(opt)}
              className={"flex w-full items-center gap-2 rounded-xl border px-4 py-2.5 text-left text-sm transition " + cls}
            >
              {revealed && isCorrect && <Check size={15} className="text-green-400" />}
              {revealed && isSelected && !isCorrect && <X size={15} className="text-red-400" />}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
          <p className={selected === answer ? "text-green-400" : "text-orange-300"}>
            {selected === answer ? "Correct! " : "Not quite. "}
          </p>
          <p className="mt-1 text-muted-foreground">{explanation}</p>
        </div>
      )}
    </section>
  );
}
