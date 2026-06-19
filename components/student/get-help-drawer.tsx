"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Lightbulb, BookOpen, RotateCcw, ChevronRight } from "lucide-react";
import Link from "next/link";

export type HelpItem = { question?: string; explanation: string };

const GENERIC_HINTS = [
  "Re-read the question slowly — underline what it is actually asking.",
  "Cross out any answer you know is wrong before guessing.",
  "Break the problem into smaller steps instead of solving it all at once.",
  "If it mentions a lesson, rewatch the last minute of the video.",
];

/**
 * Adaptive Get-Help drawer — slides up with a simpler re-explanation,
 * step-by-step hints, a link back to the lesson, and a retry action.
 * Triggered below 60% on a quiz, or from the dashboard "Need a Hint?" card.
 */
export function GetHelpDrawer({
  open,
  onOpenChange,
  title = "Get Help",
  items,
  lessonHref,
  onRetry,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  items?: HelpItem[];
  lessonHref?: string;
  onRetry?: () => void;
}) {
  const hasItems = (items?.length ?? 0) > 0;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-white/10 bg-card text-foreground">
        <DrawerHeader className="text-center">
          <DrawerTitle className="flex items-center justify-center gap-2 text-white">
            <Lightbulb size={18} className="text-yellow-300" /> {title}
          </DrawerTitle>
          <DrawerDescription>
            Take a breath — let&apos;s make this simpler. You&apos;ve got this.
          </DrawerDescription>
        </DrawerHeader>

        <div className="mx-auto w-full max-w-lg space-y-4 px-4 pb-8">
          {hasItems && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Where it went wrong
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {items!.map((it, i) => (
                  <li key={i}>
                    {it.question && (
                      <p className="font-medium text-white">{it.question}</p>
                    )}
                    <p>{it.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Step-by-step hints
            </p>
            <ol className="space-y-2">
              {GENERIC_HINTS.map((h, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="font-semibold text-yellow-300">{i + 1}.</span>
                  {h}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {lessonHref && (
              <Link
                href={lessonHref}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <BookOpen size={16} /> Rewatch lesson
              </Link>
            )}
            {onRetry && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onRetry();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(59,130,246,0.4)] hover:bg-blue-400"
              >
                <RotateCcw size={16} /> Try again
              </button>
            )}
          </div>

          {!lessonHref && !onRetry && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-1 pt-1 text-xs text-muted-foreground hover:text-white"
            >
              Back to dashboard <ChevronRight size={12} />
            </Link>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
