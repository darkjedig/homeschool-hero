"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, Pencil, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { subjectMeta, hexToRgb } from "@/lib/subjects";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SWATCHES = [
  "#3b82f6",
  "#a855f7",
  "#22c55e",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#f43f5e",
  "#d97706",
];

export default function ParentSubjectsPage() {
  const subjects = useQuery(api.subjects.listAll);
  const counts = useQuery(api.subjects.topicCounts);
  const create = useMutation(api.subjects.create);
  const update = useMutation(api.subjects.update);
  const remove = useMutation(api.subjects.remove);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "Rocket",
    color: "#3b82f6",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const startAdd = () => {
    setDraft({ name: "", slug: "", description: "", icon: "Rocket", color: "#3b82f6" });
    setAdding(true);
  };

  const saveNew = async () => {
    if (!draft.name.trim()) return;
    setBusy(true);
    try {
      await create({ ...draft, slug: draft.slug || slugify(draft.name) });
      setAdding(false);
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
        <Button onClick={startAdd} className="bg-blue-500 text-white hover:bg-blue-400">
          <Plus size={16} /> Add subject
        </Button>
      </header>

      {adding && (
        <SubjectForm
          title="New subject"
          value={draft}
          onChange={(v) => setDraft({ ...draft, ...v })}
          onCancel={() => setAdding(false)}
          onSave={saveNew}
          busy={busy}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(subjects ?? []).map((s) => {
          const meta = subjectMeta(s.slug);
          const rgb = hexToRgb(s.color || meta.color);
          const isEditing = editId === s._id;
          return (
            <div
              key={s._id}
              className="rounded-2xl border bg-gradient-to-b from-white/[0.06] to-transparent p-5 backdrop-blur-md"
              style={{
                borderColor: `${s.color || meta.color}40`,
                boxShadow: `0 0 22px rgba(${rgb},0.12)`,
              }}
            >
              {isEditing ? (
                <SubjectForm
                  title="Edit subject"
                  value={{
                    name: s.name,
                    slug: s.slug,
                    description: s.description,
                    icon: s.icon,
                    color: s.color,
                  }}
                  onChange={(v) => {}}
                  onCancel={() => setEditId(null)}
                  onSave={async (vals) => {
                    setBusy(true);
                    try {
                      await update({
                        subjectId: s._id,
                        name: vals.name ?? s.name,
                        slug: vals.slug ?? s.slug,
                        description: vals.description ?? s.description,
                        icon: vals.icon ?? s.icon,
                        color: vals.color ?? s.color,
                        active: s.active,
                      });
                      setEditId(null);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  busy={busy}
                  initial
                />
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="grid h-11 w-11 place-items-center rounded-xl"
                      style={{ backgroundColor: `${s.color || meta.color}22` }}
                    >
                      <SubjectIcon slug={s.slug} size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.slug}</p>
                    </div>
                    <Badge variant={s.active ? "default" : "secondary"}>
                      {s.active ? "active" : "hidden"}
                    </Badge>
                  </div>
                  <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                    {s.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {counts?.[s._id] ?? "—"} topics
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditId(s._id)}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-white"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            !confirm(
                              `Delete "${s.name}" and all its topics, lessons and quizzes? This cannot be undone.`,
                            )
                          )
                            return;
                          await remove({ subjectId: s._id });
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {subjects === undefined &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          ))}
        {subjects !== undefined && subjects.length === 0 && !adding && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No subjects yet. Click <span className="text-white">Add subject</span> to create one.
          </p>
        )}
      </div>
    </div>
  );
}

function SubjectForm({
  title,
  value,
  onChange,
  onCancel,
  onSave,
  busy,
  initial,
}: {
  title: string;
  value: { name: string; slug: string; description: string; icon: string; color: string };
  onChange: (v: Partial<typeof value>) => void;
  onCancel: () => void;
  onSave: (vals: typeof value) => void | Promise<void>;
  busy: boolean;
  initial?: boolean;
}) {
  const [local, setLocal] = useState(value);
  const set = (v: Partial<typeof value>) => {
    const next = { ...local, ...v };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="col-span-full rounded-2xl border border-blue-500/30 bg-blue-500/[0.06] p-5 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Name">
          <Input
            value={local.name}
            onChange={(e) => set({ name: e.target.value, slug: slugify(e.target.value) })}
          />
        </Field>
        <Field label="Slug">
          <Input value={local.slug} onChange={(e) => set({ slug: e.target.value })} />
        </Field>
        <Field label="Description" full>
          <Input value={local.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Field label="Icon (Lucide name)">
          <Input value={local.icon} onChange={(e) => set({ icon: e.target.value })} />
        </Field>
        <Field label="Colour">
          <div className="flex flex-wrap items-center gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ color: c })}
                className={"h-7 w-7 rounded-full border-2 " + (local.color === c ? "border-white" : "border-transparent")}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onSave(local)}
          disabled={busy || !local.name.trim()}
          className="bg-blue-500 text-white hover:bg-blue-400"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          Save
        </Button>
      </div>
      {initial && null}
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
