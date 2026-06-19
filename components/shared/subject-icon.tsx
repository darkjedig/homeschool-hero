import { subjectMeta } from "@/lib/subjects";
import type { LucideIcon } from "lucide-react";

/**
 * Renders a subject's accent icon in its subject colour. Used on tiles,
 * mission cards, and subject headers.
 */
export function SubjectIcon({
  slug,
  size = 22,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  const meta = subjectMeta(slug);
  const Icon: LucideIcon = meta.icon;
  return (
    <Icon
      size={size}
      className={className}
      style={{ color: meta.color }}
      aria-hidden
    />
  );
}
