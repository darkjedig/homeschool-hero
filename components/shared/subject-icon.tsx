import { subjectMeta } from "@/lib/subjects";
import { getIcon } from "@/components/shared/icon-picker";
import { createElement } from "react";

/**
 * Renders a subject's accent icon in its subject colour. Used on tiles,
 * mission cards, and subject headers.
 *
 * Prefers the DB-stored `iconName`/`color` (so parent-created subjects show
 * the icon chosen in the icon picker), falling back to the hardcoded
 * `subjectMeta(slug)` lookup for legacy/built-in subjects.
 */
export function SubjectIcon({
  slug,
  iconName,
  color,
  size = 22,
  className,
}: {
  slug: string;
  iconName?: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const meta = subjectMeta(slug);
  const Icon = getIcon(iconName?.trim() || "");
  const accent = color?.trim() || meta.color;
  return createElement(Icon, {
    size,
    className,
    style: { color: accent },
    "aria-hidden": true,
  });
}
