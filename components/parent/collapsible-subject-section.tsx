"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { hexToRgb } from "@/lib/subjects";

/**
 * Collapsible subject group for parent list pages (Lessons, Quizzes). Keeps
 * long pages scannable — each subject is a header bar that expands to reveal
 * its rows. Mirrors the HomeschoolHero dark/glow tokens.
 */
export function CollapsibleSubjectSection({
  name,
  color,
  count,
  countLabel = "lessons",
  defaultOpen = false,
  children,
}: {
  name: string;
  color: string;
  count: number;
  countLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const rgb = hexToRgb(color);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]"
        style={open ? { boxShadow: `0 0 20px rgba(${rgb},0.12)`, borderColor: `${color}40` } : undefined}
        aria-expanded={open}
      >
        <span
          className="h-5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
        <span className="flex-1 truncate text-base font-semibold text-white">{name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {count} {count === 1 ? countLabel.replace(/s$/, "") : countLabel}
        </span>
        <ChevronDown
          size={18}
          className={"shrink-0 text-muted-foreground transition-transform duration-200 " + (open ? "rotate-180" : "")}
        />
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-2xl border border-white/5 bg-black/20 p-3">
          {children}
        </div>
      )}
    </section>
  );
}
