"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, Pencil, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubjectIcon } from "@/components/shared/subject-icon";
import {
  SubjectFields,
  slugify,
  type SubjectFormValues,
} from "@/components/shared/subject-fields";
import { subjectMeta, hexToRgb } from "@/lib/subjects";

type Editor =
  | { mode: "new" }
  | { mode: "edit"; id: string; values: SubjectFormValues };

const EMPTY: SubjectFormValues = {
  name: "",
  slug: "",
  description: "",
  icon: "Rocket",
  color: "#3b82f6",
};

export default function ParentSubjectsPage() {
  const subjects = useQuery(api.subjects.listAll);
  const counts = useQuery(api.subjects.topicCounts);
  const create = useMutation(api.subjects.create);
  const update = useMutation(api.subjects.update);
  const remove = useMutation(api.subjects.remove);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [draft, setDraft] = useState<SubjectFormValues>(EMPTY);
  const [busy, setBusy] = useState(false);

  const openNew = () => {
    setDraft(EMPTY);
    setEditor({ mode: "new" });
  };

  const save = async () => {
    if (!draft.name.trim()) return;
    setBusy(true);
    try {
      if (editor?.mode === "new") {
        await create({ ...draft, slug: draft.slug || slugify(draft.name) });
      } else if (editor?.mode === "edit") {
        await update({
          subjectId: editor.id as never,
          name: draft.name,
          slug: draft.slug || slugify(draft.name),
          description: draft.description,
          icon: draft.icon,
          color: draft.color,
          active: true,
        });
      }
      setEditor(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subjects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit and remove the subjects available to the student.
          </p>
        </div>
        <Button onClick={openNew} className="bg-blue-500 text-white hover:bg-blue-400">
          <Plus size={16} /> Add subject
        </Button>
      </header>

      {editor && (
        <section className="relative z-20 rounded-2xl border border-blue-500/30 bg-blue-500/[0.06] p-5 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {editor.mode === "new" ? "New subject" : "Edit subject"}
            </h3>
            <button onClick={() => setEditor(null)} className="text-muted-foreground hover:text-white">
              <X size={16} />
            </button>
          </div>
          <SubjectFields value={draft} onChange={setDraft} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditor(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy || !draft.name.trim()} className="bg-blue-500 text-white hover:bg-blue-400">
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              Save subject
            </Button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(subjects ?? []).map((s) => {
          const meta = subjectMeta(s.slug);
          const rgb = hexToRgb(s.color || meta.color);
          const accent = s.color || meta.color;
          return (
            <div
              key={s._id}
              className="rounded-2xl border bg-gradient-to-b from-white/[0.06] to-transparent p-5 backdrop-blur-md"
              style={{ borderColor: `${accent}40`, boxShadow: `0 0 22px rgba(${rgb},0.12)` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ backgroundColor: `${accent}22` }}>
                  <SubjectIcon slug={s.slug} iconName={s.icon} color={s.color} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.slug}</p>
                </div>
                <Badge variant={s.active ? "default" : "secondary"}>
                  {s.active ? "active" : "hidden"}
                </Badge>
              </div>
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{counts?.[s._id] ?? "—"} topics</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setDraft({ name: s.name, slug: s.slug, description: s.description, icon: s.icon, color: s.color });
                      setEditor({ mode: "edit", id: s._id, values: draft });
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete "${s.name}" and all its topics, lessons and quizzes? This cannot be undone.`)) return;
                      await remove({ subjectId: s._id });
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {subjects === undefined &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          ))}
        {subjects !== undefined && subjects.length === 0 && !editor && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No subjects yet. Click <span className="text-white">Add subject</span> to create one.
          </p>
        )}
      </div>
    </div>
  );
}
