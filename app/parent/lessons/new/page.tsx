"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Q = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export default function NewLessonPage() {
  const subjects = useQuery(api.subjects.list);
  const [subjectId, setSubjectId] = useState<string>("");
  const topics = useQuery(
    api.topics.listBySubject,
    subjectId ? { subjectId: subjectId as never } : "skip",
  );
  const [topicId, setTopicId] = useState<string>("");
  const create = useMutation(api.lessons.createSingle);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    lessonNotes: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    estimatedMinutes: 10,
    pointsAwarded: 50,
    status: "published" as "draft" | "published",
  });
  const [questions, setQuestions] = useState<Q[]>([
    { questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" },
  ]);

  const submit = async () => {
    if (!subjectId || !topicId) return;
    setBusy(true);
    try {
      await create({
        subjectId: subjectId as never,
        topicId: topicId as never,
        title: form.title,
        description: form.description,
        videoUrl: form.videoUrl,
        lessonNotes: form.lessonNotes,
        difficultyLevel: form.difficulty,
        estimatedMinutes: form.estimatedMinutes,
        pointsAwarded: form.pointsAwarded,
        status: form.status,
        quizQuestions: questions
          .filter((q) => q.questionText.trim())
          .map((q) => ({
            questionText: q.questionText,
            questionType: "mcq" as const,
            options: q.options.filter((o) => o.trim()),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
      });
      router.push("/parent/lessons");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Add a Lesson</h1>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label className="mb-1 text-xs text-muted-foreground">Subject</Label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId("");
              }}
              className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
            >
              <option value="">Choose subject…</option>
              {(subjects ?? []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1 text-xs text-muted-foreground">Topic</Label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
              disabled={!topics}
            >
              <option value="">Choose topic…</option>
              {(topics ?? []).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="YouTube URL"><Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=…" /></Field>
          <Field label="Description" full><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Lesson notes" full>
            <textarea rows={3} value={form.lessonNotes} onChange={(e) => setForm({ ...form, lessonNotes: e.target.value })} className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white" />
          </Field>
          <Field label="Minutes"><Input type="number" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} /></Field>
          <Field label="Points"><Input type="number" value={form.pointsAwarded} onChange={(e) => setForm({ ...form, pointsAwarded: Number(e.target.value) })} /></Field>
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as typeof form.difficulty })} className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })} className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Quiz questions</h2>
          <Button variant="outline" size="sm" onClick={() => setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" }])}>
            <Plus size={14} /> Add question
          </Button>
        </div>
        <div className="space-y-3">
          {questions.map((q, qi) => (
            <div key={qi} className="space-y-2 rounded-lg border border-white/5 p-3">
              <div className="flex items-center gap-2">
                <Input value={q.questionText} onChange={(e) => { const n = [...questions]; n[qi] = { ...q, questionText: e.target.value }; setQuestions(n); }} placeholder={`Question ${qi + 1}`} className="flex-1" />
                <button onClick={() => setQuestions(questions.filter((_, j) => j !== qi))} className="text-muted-foreground hover:text-red-400"><Trash2 size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <Input key={oi} value={opt} onChange={(e) => { const options = [...q.options]; options[oi] = e.target.value; const n = [...questions]; n[qi] = { ...q, options }; setQuestions(n); }} placeholder={`Option ${oi + 1}`} />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input value={q.correctAnswer} onChange={(e) => { const n = [...questions]; n[qi] = { ...q, correctAnswer: e.target.value }; setQuestions(n); }} placeholder="Correct answer" />
                <Input value={q.explanation} onChange={(e) => { const n = [...questions]; n[qi] = { ...q, explanation: e.target.value }; setQuestions(n); }} placeholder="Explanation" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="text-right">
        <Button onClick={submit} disabled={busy || !subjectId || !topicId} className="bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.4)] hover:bg-blue-400">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save lesson
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="mb-1 text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
