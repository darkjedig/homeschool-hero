"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, Loader2, CheckCircle2, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";

type Q = Doc<"quizQuestions">;

/** Inline quiz + questions editor for a lesson, used on the lesson editor page. */
export function QuizEditor({ lessonId }: { lessonId: string }) {
  const data = useQuery(api.quizzes.getForLesson, { lessonId: lessonId as never });
  const ensure = useMutation(api.quizzes.ensureForLesson);
  const addQ = useMutation(api.quizzes.addQuestion);
  const [ensuring, setEnsuring] = useState(false);

  if (data === undefined) {
    return <div className="h-24 animate-pulse rounded-xl bg-white/5" />;
  }

  if (data === null) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center">
        <p className="mb-3 text-sm text-muted-foreground">No quiz for this lesson yet.</p>
        <Button
          onClick={async () => {
            setEnsuring(true);
            try {
              await ensure({ lessonId: lessonId as never });
            } finally {
              setEnsuring(false);
            }
          }}
          disabled={ensuring}
          className="bg-blue-500 text-white hover:bg-blue-400"
        >
          {ensuring ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Create quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {data.questions.length} question{data.questions.length === 1 ? "" : "s"} ·{" "}
        {data.quiz.pointsAwarded} pts
      </p>

      {data.questions.map((q) => (
        <QuestionRow key={q._id} q={q} quizId={data.quiz._id} />
      ))}

      <AddQuestion quizId={data.quiz._id} addQ={addQ} />
    </div>
  );
}

function QuestionRow({ q, quizId }: { q: Q; quizId: string }) {
  const update = useMutation(api.quizzes.updateQuestion);
  const remove = useMutation(api.quizzes.deleteQuestion);
  const [draft, setDraft] = useState({
    questionText: q.questionText,
    options: q.options.length === 4 ? q.options : [...q.options, "", "", "", ""].slice(0, 4),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  });
  const [busy, setBusy] = useState(false);
  const dirty =
    draft.questionText !== q.questionText ||
    draft.correctAnswer !== q.correctAnswer ||
    draft.explanation !== q.explanation ||
    draft.options.join("|") !== q.options.join("|");

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          Question
        </span>
        <button
          onClick={async () => {
            if (!confirm("Delete this question?")) return;
            await remove({ questionId: q._id });
          }}
          className="text-muted-foreground hover:text-red-400"
          aria-label="Delete question"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <Input
        value={draft.questionText}
        onChange={(e) => setDraft({ ...draft, questionText: e.target.value })}
        placeholder="Question text"
        className="mb-2"
      />
      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {draft.options.map((opt, i) => (
          <Input
            key={i}
            value={opt}
            onChange={(e) => {
              const options = [...draft.options];
              options[i] = e.target.value;
              setDraft({ ...draft, options });
            }}
            placeholder={`Option ${i + 1}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">Correct answer</Label>
          <Input
            value={draft.correctAnswer}
            onChange={(e) => setDraft({ ...draft, correctAnswer: e.target.value })}
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">Explanation</Label>
          <Input
            value={draft.explanation}
            onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
          />
        </div>
      </div>
      {dirty && (
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            onClick={async () => {
              setBusy(true);
              try {
                await update({
                  questionId: q._id,
                  questionText: draft.questionText,
                  options: draft.options.filter((o) => o.trim()),
                  correctAnswer: draft.correctAnswer,
                  explanation: draft.explanation,
                });
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="bg-blue-500 text-white hover:bg-blue-400"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}

function AddQuestion({
  quizId,
  addQ,
}: {
  quizId: string;
  addQ: ReturnType<typeof useMutation<typeof api.quizzes.addQuestion>>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] py-3 text-sm font-semibold text-muted-foreground hover:text-white"
      >
        <Plus size={16} /> Add a question
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/[0.06] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-semibold text-white">
          <ListChecks size={13} /> New question
        </span>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-white">
          Cancel
        </button>
      </div>
      <Input
        value={draft.questionText}
        onChange={(e) => setDraft({ ...draft, questionText: e.target.value })}
        placeholder="Question text"
        className="mb-2"
      />
      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {draft.options.map((opt, i) => (
          <Input
            key={i}
            value={opt}
            onChange={(e) => {
              const options = [...draft.options];
              options[i] = e.target.value;
              setDraft({ ...draft, options });
            }}
            placeholder={`Option ${i + 1}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          value={draft.correctAnswer}
          onChange={(e) => setDraft({ ...draft, correctAnswer: e.target.value })}
          placeholder="Correct answer"
        />
        <Input
          value={draft.explanation}
          onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
          placeholder="Explanation"
        />
      </div>
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          disabled={busy || !draft.questionText.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              await addQ({
                quizId: quizId as never,
                questionText: draft.questionText,
                options: draft.options.filter((o) => o.trim()),
                correctAnswer: draft.correctAnswer,
                explanation: draft.explanation,
              });
              setDraft({ questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" });
              setOpen(false);
            } finally {
              setBusy(false);
            }
          }}
          className="bg-blue-500 text-white hover:bg-blue-400"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add question
        </Button>
      </div>
    </div>
  );
}
