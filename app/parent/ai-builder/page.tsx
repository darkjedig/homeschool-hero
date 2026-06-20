"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Wand2, CheckCircle2, XCircle, BookOpen, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";

type Mode = "course" | "lesson";

export default function AiBuilderPage() {
  const [mode, setMode] = useState<Mode>("course");
  const [prompt, setPrompt] = useState("");
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const config = useQuery(api.settings.getAiConfig);
  const courseDraft = useQuery(
    api.aiDrafts.getCourseDraft,
    activeDraftId && mode === "course" ? { draftId: activeDraftId as never } : "skip",
  );
  const lessonDraft = useQuery(
    api.aiDrafts.getLessonDraft,
    activeDraftId && mode === "lesson" ? { draftId: activeDraftId as never } : "skip",
  );

  const createCourse = useMutation(api.aiDrafts.createCourseDraft);
  const createLesson = useMutation(api.aiDrafts.createLessonDraft);
  const generate = useAction(api.aiCourseBuilder.generate);

  const startGenerate = async () => {
    if (!prompt.trim()) return;
    const id =
      mode === "course"
        ? await createCourse({ prompt })
        : await createLesson({ prompt, difficultyLevel: "beginner" });
    setActiveDraftId(id);
    // Fire-and-forget; the draft row updates reactively as the action completes.
    void generate({ type: mode, draftId: id, prompt });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Wand2 size={22} className="text-purple-300" /> AI Lesson Builder
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe what you want; the AI drafts it. You review and approve before
          anything reaches the student.
        </p>
      </header>

      {!config?.keyIsSet && (
        <div className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-sm text-orange-200">
          No OpenRouter API key set.{" "}
          <Link href="/parent/settings" className="font-semibold underline">
            Add one in Settings
          </Link>{" "}
          to generate lessons.
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Choose a mode: build a <span className="text-white">brand-new course</span> (a
        new subject with its own topics and lessons), or generate{" "}
        <span className="text-white">a single lesson</span> to drop into an existing
        subject. Either way, you review and approve before the student sees anything.
      </p>

      {/* Mode + prompt */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ModeButton active={mode === "course"} onClick={() => setMode("course")} icon={Layers} label="New course" desc="Creates a brand-new subject with topics + lessons." />
          <ModeButton active={mode === "lesson"} onClick={() => setMode("lesson")} icon={BookOpen} label="Lesson into existing subject" desc="Adds one lesson + quiz to a subject you choose." />
        </div>

        <div>
          <Label className="mb-2 block text-sm font-semibold text-white">Prompt</Label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder={
              mode === "course"
                ? "e.g. A beginner Game Development course covering game loops, sprites and collision, with simple Scratch-style examples."
                : "e.g. A lesson on the water cycle for Science, with a quiz."
            }
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
          />
        </div>

        <Button
          onClick={startGenerate}
          disabled={!prompt.trim()}
          className="bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-purple-400"
        >
          <Sparkles size={16} /> Generate {mode === "course" ? "course" : "lesson"}
        </Button>
      </section>

      {/* Live draft state */}
      {mode === "course" && courseDraft !== undefined && (
        <CourseReview draft={courseDraft} draftId={activeDraftId} />
      )}
      {mode === "lesson" && lessonDraft !== undefined && (
        <LessonReview draft={lessonDraft} draftId={activeDraftId} />
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Layers;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-start gap-3 rounded-xl border p-4 text-left transition " +
        (active
          ? "border-purple-500/50 bg-purple-500/20 text-white shadow-[0_0_16px_rgba(168,85,247,0.25)]"
          : "border-white/10 bg-white/5 text-muted-foreground hover:text-white")
      }
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs opacity-80">{desc}</span>
      </span>
    </button>
  );
}

// ----------------- status banner -----------------
function StatusBanner({ status, errorMessage }: { status: string; errorMessage?: string }) {
  if (status === "generating")
    return (
      <div className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm text-purple-200">
        <Loader2 size={16} className="animate-spin" /> Generating… this can take up to a minute.
      </div>
    );
  if (status === "failed")
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
        <XCircle size={16} className="mt-0.5" />
        <span>{errorMessage ?? "Generation failed. Check your key/model and try again."}</span>
      </div>
    );
  if (status === "approved")
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-300">
        <CheckCircle2 size={16} /> Approved and published to the student portal.
      </div>
    );
  return null;
}

// ----------------- course review -----------------
function CourseReview({ draft, draftId }: { draft: Doc<"aiCourseDrafts"> | null | undefined; draftId: string | null }) {
  const approve = useMutation(api.aiDrafts.approveCourseDraft);
  const router = useRouter();
  const [edits, setEdits] = useState<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    if (draft?.status === "pending" && !edits) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEdits({
        name: draft.proposedSubject?.name ?? "",
        slug: (draft.proposedSubject?.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: draft.proposedSubject?.description ?? "",
        icon: draft.proposedSubject?.icon ?? "BookOpen",
        color: draft.proposedSubject?.color ?? "#3b82f6",
      });
    }
  }, [draft, edits]);

  if (!draft || !draftId) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Draft</h2>
        <Badge variant="secondary">{draft.status}</Badge>
      </div>
      <StatusBanner status={draft.status} errorMessage={draft.errorMessage} />

      {draft.status === "pending" && draft.proposedSubject && edits && (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">Review the draft, edit the details, then approve to publish.</p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Subject name"><Input value={edits.name} onChange={(e) => setEdits({ ...edits, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} /></Field>
            <Field label="Slug"><Input value={edits.slug} onChange={(e) => setEdits({ ...edits, slug: e.target.value })} /></Field>
            <Field label="Description" full><Input value={edits.description} onChange={(e) => setEdits({ ...edits, description: e.target.value })} /></Field>
            <Field label="Colour"><Input value={edits.color} onChange={(e) => setEdits({ ...edits, color: e.target.value })} /></Field>
            <Field label="Icon (Lucide)"><Input value={edits.icon} onChange={(e) => setEdits({ ...edits, icon: e.target.value })} /></Field>
          </div>

          {draft.proposedTopics?.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Topics ({draft.proposedTopics.length})</p>
              <ul className="space-y-1 text-sm text-white">
                {draft.proposedTopics.map((t, i) => (
                  <li key={i} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                    <span className="font-medium">{t.name}</span>{" "}
                    <span className="text-xs text-muted-foreground">· {t.difficultyLevel}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {draft.proposedLessons?.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Lessons ({draft.proposedLessons.length})</p>
              <ul className="space-y-2 text-sm">
                {draft.proposedLessons.map((l, i) => (
                  <li key={i} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                    <p className="font-medium text-white">{l.title} <span className="text-xs text-muted-foreground">· {l.quizQuestions.length} questions · {l.pointsAwarded}pts</span></p>
                    <p className="mt-1 text-xs text-muted-foreground">{l.notes}</p>
                    <p className="mt-1 truncate text-[11px] text-blue-400">{l.videoUrl}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button
            onClick={async () => {
              await approve({
                draftId: draftId as never,
                subject: { name: edits.name, description: edits.description, icon: edits.icon, color: edits.color },
                topics: draft.proposedTopics ?? [],
                lessons: draft.proposedLessons ?? [],
                slug: edits.slug,
              });
              router.push("/parent/dashboard");
            }}
            className="bg-green-600 text-white hover:bg-green-500"
          >
            <CheckCircle2 size={16} /> Approve &amp; publish course
          </Button>
        </div>
      )}
    </section>
  );
}

// ----------------- lesson review -----------------
function LessonReview({ draft, draftId }: { draft: Doc<"aiLessonDrafts"> | null | undefined; draftId: string | null }) {
  const approve = useMutation(api.aiDrafts.approveLessonDraft);
  const subjects = useQuery(api.subjects.list);
  const [subjectId, setSubjectId] = useState("");
  const topics = useQuery(
    api.topics.listBySubject,
    subjectId ? { subjectId: subjectId as never } : "skip",
  );
  const [topicId, setTopicId] = useState("");
  const [edits, setEdits] = useState<{ title: string; notes: string; videoUrl: string } | null>(null);
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (draft?.status === "pending" && !edits) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEdits({
        title: draft.proposedTitle ?? "",
        notes: draft.proposedNotes ?? "",
        videoUrl: draft.proposedVideoUrl ?? "",
      });
    }
  }, [draft, edits]);

  if (!draft || !draftId) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Draft</h2>
        <Badge variant="secondary">{draft.status}</Badge>
      </div>
      <StatusBanner status={draft.status} errorMessage={draft.errorMessage} />

      {draft.status === "pending" && edits && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Place in subject">
              <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopicId(""); }} className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white">
                <option value="">Choose subject…</option>
                {(subjects ?? []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Topic">
              <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white" disabled={!topics}>
                <option value="">Choose topic…</option>
                {(topics ?? []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Title" full><Input value={edits.title} onChange={(e) => setEdits({ ...edits, title: e.target.value })} /></Field>
            <Field label="Lesson notes" full>
              <textarea rows={4} value={edits.notes} onChange={(e) => setEdits({ ...edits, notes: e.target.value })} className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white" />
            </Field>
            <Field label="YouTube URL" full><Input value={edits.videoUrl} onChange={(e) => setEdits({ ...edits, videoUrl: e.target.value })} /></Field>
          </div>

          {draft.proposedQuizQuestions?.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Quiz ({draft.proposedQuizQuestions.length} questions)</p>
              <ul className="space-y-2 text-sm text-white">
                {draft.proposedQuizQuestions.map((q, i) => (
                  <li key={i} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                    <p className="font-medium">{q.questionText}</p>
                    <p className="text-xs text-green-400">Answer: {q.correctAnswer}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button
            onClick={async () => {
              if (!subjectId || !topicId) return;
              await approve({
                draftId: draftId as never,
                subjectId: subjectId as never,
                topicId: topicId as never,
                title: edits.title,
                notes: edits.notes,
                videoUrl: edits.videoUrl,
                difficultyLevel: draft.difficultyLevel,
                pointsAwarded: 100,
                quizQuestions: draft.proposedQuizQuestions ?? [],
              });
              router.push("/parent/dashboard");
            }}
            disabled={!subjectId || !topicId}
            className="bg-green-600 text-white hover:bg-green-500"
          >
            <CheckCircle2 size={16} /> Approve &amp; publish lesson
          </Button>
        </div>
      )}
    </section>
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
