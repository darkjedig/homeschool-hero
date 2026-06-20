"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubjectFields, slugify } from "@/components/shared/subject-fields";

type Topic = { name: string; description: string; difficulty: "beginner" | "intermediate" | "advanced" };
type Q = {
  questionText: string;
  questionType: "mcq" | "truefalse" | "ordering";
  options: string[];
  correctAnswer: string;
  explanation: string;
};
type Lesson = {
  topicIndex: number;
  title: string;
  description: string;
  videoUrl: string;
  lessonNotes: string;
  difficulty: Topic["difficulty"];
  estimatedMinutes: number;
  pointsAwarded: number;
  status: "draft" | "published";
  questions: Q[];
};

const emptyQ = (): Q => ({
  questionText: "",
  questionType: "mcq",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
});

export default function NewCoursePage() {
  const create = useMutation(api.courses.create);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [openLesson, setOpenLesson] = useState<number | null>(null);

  const [subject, setSubject] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "Rocket",
    color: "#3b82f6",
  });
  const [topics, setTopics] = useState<Topic[]>([
    { name: "", description: "", difficulty: "beginner" },
  ]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const submit = async () => {
    setBusy(true);
    try {
      await create({
        subject: { ...subject, slug: subject.slug || slugify(subject.name) },
        topics: topics.filter((t) => t.name.trim()).map((t) => ({
          name: t.name,
          description: t.description,
          difficultyLevel: t.difficulty,
        })),
        lessons: lessons
          .filter((l) => l.title.trim() && l.videoUrl.trim())
          .map((l) => ({
            topicIndex: l.topicIndex,
            title: l.title,
            description: l.description,
            videoUrl: l.videoUrl,
            lessonNotes: l.lessonNotes,
            difficultyLevel: l.difficulty,
            estimatedMinutes: l.estimatedMinutes,
            pointsAwarded: l.pointsAwarded,
            status: l.status,
            quizQuestions: l.questions
              .filter((q) => q.questionText.trim())
              .map((q) => ({
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options.filter((o) => o.trim()),
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
              })),
          })),
      });
      router.push("/parent/dashboard");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">New Course Builder</h1>
          <p className="text-sm text-muted-foreground">
            Create a subject, its topics, lessons and quizzes in one go.
          </p>
        </div>
        <Button
          onClick={submit}
          disabled={busy}
          className="bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.4)] hover:bg-blue-400"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Save course
        </Button>
      </header>

      {/* Subject */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">Subject</h2>
        <SubjectFields value={subject} onChange={(v) => setSubject(v)} />
      </section>

      {/* Topics */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Topics</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setTopics([...topics, { name: "", description: "", difficulty: "beginner" }])
            }
          >
            <Plus size={14} /> Add topic
          </Button>
        </div>
        <div className="space-y-2">
          {topics.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs text-muted-foreground">{i + 1}</span>
              <Input
                value={t.name}
                onChange={(e) => {
                  const next = [...topics];
                  next[i] = { ...t, name: e.target.value };
                  setTopics(next);
                }}
                placeholder="Topic name"
                className="flex-1"
              />
              <select
                value={t.difficulty}
                onChange={(e) => {
                  const next = [...topics];
                  next[i] = { ...t, difficulty: e.target.value as Topic["difficulty"] };
                  setTopics(next);
                }}
                className="rounded-md border border-white/10 bg-card px-2 py-2 text-sm text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                onClick={() => setTopics(topics.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Lessons */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Lessons ({lessons.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLessons([
                ...lessons,
                {
                  topicIndex: 0,
                  title: "",
                  description: "",
                  videoUrl: "",
                  lessonNotes: "",
                  difficulty: "beginner",
                  estimatedMinutes: 10,
                  pointsAwarded: 50,
                  status: "published",
                  questions: [emptyQ()],
                },
              ]);
              setOpenLesson(lessons.length);
            }}
          >
            <Plus size={14} /> Add lesson
          </Button>
        </div>

        <div className="space-y-2">
          {lessons.map((l, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/20">
              <button
                onClick={() => setOpenLesson(openLesson === i ? null : i)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left"
              >
                <ChevronDown
                  size={16}
                  className={openLesson === i ? "" : "-rotate-90"}
                />
                <span className="flex-1 text-sm font-medium text-white">
                  {l.title || `Lesson ${i + 1}`}
                </span>
                <select
                  value={l.topicIndex}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const next = [...lessons];
                    next[i] = { ...l, topicIndex: Number(e.target.value) };
                    setLessons(next);
                  }}
                  className="rounded-md border border-white/10 bg-card px-2 py-1 text-xs text-white"
                >
                  {topics.map((t, ti) => (
                    <option key={ti} value={ti}>
                      {t.name || `Topic ${ti + 1}`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLessons(lessons.filter((_, j) => j !== i));
                  }}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </button>

              {openLesson === i && (
                <div className="space-y-3 border-t border-white/5 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Field label="Title">
                      <Input
                        value={l.title}
                        onChange={(e) => updateLesson(setLessons, lessons, i, { title: e.target.value })}
                      />
                    </Field>
                    <Field label="YouTube URL">
                      <Input
                        value={l.videoUrl}
                        onChange={(e) => updateLesson(setLessons, lessons, i, { videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </Field>
                    <Field label="Description" full>
                      <Input
                        value={l.description}
                        onChange={(e) => updateLesson(setLessons, lessons, i, { description: e.target.value })}
                      />
                    </Field>
                    <Field label="Lesson notes" full>
                      <textarea
                        value={l.lessonNotes}
                        onChange={(e) => updateLesson(setLessons, lessons, i, { lessonNotes: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
                      />
                    </Field>
                    <Field label="Minutes">
                      <Input
                        type="number"
                        value={l.estimatedMinutes}
                        onChange={(e) => updateLesson(setLessons, lessons, i, { estimatedMinutes: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Points">
                      <Input
                        type="number"
                        value={l.pointsAwarded}
                        onChange={(e) => updateLesson(setLessons, lessons, i, { pointsAwarded: Number(e.target.value) })}
                      />
                    </Field>
                  </div>

                  {/* Quiz questions */}
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">
                        Quiz questions ({l.questions.length})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateLesson(setLessons, lessons, i, { questions: [...l.questions, emptyQ()] })
                        }
                      >
                        <Plus size={12} /> Question
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {l.questions.map((q, qi) => (
                        <div key={qi} className="space-y-2 rounded-md border border-white/5 p-2">
                          <Input
                            value={q.questionText}
                            onChange={(e) => updateQuestion(setLessons, lessons, i, qi, { questionText: e.target.value })}
                            placeholder={`Question ${qi + 1}`}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => (
                              <Input
                                key={oi}
                                value={opt}
                                onChange={(e) => {
                                  const options = [...q.options];
                                  options[oi] = e.target.value;
                                  updateQuestion(setLessons, lessons, i, qi, { options });
                                }}
                                placeholder={`Option ${oi + 1}`}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <Input
                              value={q.correctAnswer}
                              onChange={(e) => updateQuestion(setLessons, lessons, i, qi, { correctAnswer: e.target.value })}
                              placeholder="Correct answer (must match an option)"
                            />
                            <Input
                              value={q.explanation}
                              onChange={(e) => updateQuestion(setLessons, lessons, i, qi, { explanation: e.target.value })}
                              placeholder="Explanation shown after answering"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {lessons.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No lessons yet. Add a topic, then add a lesson under it.
            </p>
          )}
        </div>
      </section>

      <div className="text-right">
        <Button
          onClick={submit}
          disabled={busy}
          className="bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.4)] hover:bg-blue-400"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Save course
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="mb-1 text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function updateLesson(
  set: React.Dispatch<React.SetStateAction<Lesson[]>>,
  lessons: Lesson[],
  i: number,
  patch: Partial<Lesson>,
) {
  const next = [...lessons];
  next[i] = { ...next[i], ...patch };
  set(next);
}

function updateQuestion(
  set: React.Dispatch<React.SetStateAction<Lesson[]>>,
  lessons: Lesson[],
  i: number,
  qi: number,
  patch: Partial<Q>,
) {
  const next = [...lessons];
  const questions = [...next[i].questions];
  questions[qi] = { ...questions[qi], ...patch };
  next[i] = { ...next[i], questions };
  set(next);
}
