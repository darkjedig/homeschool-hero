"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "./icon-picker";

export type SubjectFormValues = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
};

export const SUBJECT_SWATCHES = [
  "#3b82f6",
  "#a855f7",
  "#22c55e",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#f43f5e",
  "#d97706",
];

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Shared subject form fields — used by Subjects page + New Course page so the
 *  inputs are always identical (name, slug, description, colour swatches,
 *  searchable icon picker). */
export function SubjectFields({
  value,
  onChange,
}: {
  value: SubjectFormValues;
  onChange: (next: SubjectFormValues) => void;
}) {
  const set = (patch: Partial<SubjectFormValues>) => onChange({ ...value, ...patch });
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="Name">
        <Input
          value={value.name}
          onChange={(e) =>
            set({ name: e.target.value, slug: slugify(e.target.value) })
          }
          placeholder="e.g. Homemaking"
        />
      </Field>
      <Field label="Slug">
        <Input value={value.slug} onChange={(e) => set({ slug: e.target.value })} />
      </Field>
      <Field label="Description" full>
        <Input
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
      <Field label="Icon">
        <IconPicker value={value.icon} onChange={(icon) => set({ icon })} />
      </Field>
      <Field label="Colour">
        <div className="flex flex-wrap items-center gap-2 pt-1.5">
          {SUBJECT_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ color: c })}
              className={
                "h-7 w-7 rounded-full border-2 transition " +
                (value.color === c ? "border-white" : "border-transparent")
              }
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </Field>
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
      <Label className="mb-1 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
