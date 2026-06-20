"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { YoutubeUrlField } from "@/components/shared/youtube-url-field";
import { QuizEditor } from "@/components/parent/quiz-editor";

export default function EditLessonPage() {
  const { id } = useParams<{ id: string }>();
  const lesson = useQuery(api.lessons.get, { lessonId: id as never });
  const update = useMutation(api.lessons.update);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    lessonNotes: string;
    videoUrl: string;
    difficultyLevel: "beginner" | "intermediate" | "advanced";
    estimatedMinutes: number;
    pointsAwarded: number;
    status: "draft" | "published";
  } | null>(null);

  // Initialise the form once the lesson loads.
  useEffect(() => {
    if (lesson && !form) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        title: lesson.title,
        description: lesson.description,
        lessonNotes: lesson.lessonNotes,
        videoUrl: lesson.videoUrl,
        difficultyLevel: lesson.difficultyLevel,
        estimatedMinutes: lesson.estimatedMinutes,
        pointsAwarded: lesson.pointsAwarded,
        status: lesson.status,
      });
    }
  }, [lesson, form]);

  if (lesson === undefined || !form) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white/5" />;
  }
  if (lesson === null) {
    return <p className="text-sm text-muted-foreground">Lesson not found.</p>;
  }

  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  const save = async () => {
    setBusy(true);
    try {
      await update({ lessonId: lesson._id, ...form });
      router.push("/parent/lessons");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => router.push("/parent/lessons")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white"
      >
        <ArrowLeft size={16} /> Back to lessons
      </button>

      <header>
        <h1 className="text-2xl font-bold text-white">Edit lesson</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fix the title, notes and especially the YouTube video URL. The student
          can only watch a real video URL — not a search link.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <Field label="Title" full>
          <Input value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Description" full>
          <Input value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Field label="Lesson notes" full>
          <textarea
            rows={5}
            value={form.lessonNotes}
            onChange={(e) => set({ lessonNotes: e.target.value })}
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
          />
        </Field>

        <div className="md:col-span-2">
          <YoutubeUrlField
            value={form.videoUrl}
            onChange={(v) => set({ videoUrl: v })}
            suggestion={`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.title + " lesson for kids")}`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Difficulty">
            <select
              value={form.difficultyLevel}
              onChange={(e) => set({ difficultyLevel: e.target.value as typeof form.difficultyLevel })}
              className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
          <Field label="Minutes">
            <Input
              type="number"
              value={form.estimatedMinutes}
              onChange={(e) => set({ estimatedMinutes: Number(e.target.value) })}
            />
          </Field>
          <Field label="Points">
            <Input
              type="number"
              value={form.pointsAwarded}
              onChange={(e) => set({ pointsAwarded: Number(e.target.value) })}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set({ status: e.target.value as typeof form.status })}
              className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={busy} className="bg-blue-500 text-white hover:bg-blue-400">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Save changes
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="mb-1 text-sm font-semibold text-white">Quiz questions</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          View, edit, add and remove the questions students answer after this lesson.
        </p>
        <QuizEditor lessonId={lesson._id} />
      </section>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
