"use client";

import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";

type Pair = { key: string; value: string };

/** Clickable timeline: events (key = date/era, value = event). Tap one to expand. */
export function TimelineBlock({ data }: { data: Pair[] }) {
  const sorted = [...data].sort((a, b) => a.key.localeCompare(b.key));
  const [open, setOpen] = useState<string | null>(sorted[0]?.key ?? null);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Clock size={16} className="text-blue-300" /> Timeline
      </p>
      <ol className="relative space-y-3 border-l border-white/10 pl-5">
        {sorted.map((item) => {
          const isOpen = open === item.key;
          return (
            <li key={item.key} className="relative">
              <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.key)}
                className="flex w-full items-center gap-2 text-left"
              >
                <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-200">
                  {item.key}
                </span>
                <ChevronDown size={14} className={"text-muted-foreground transition " + (isOpen ? "rotate-180" : "")} />
              </button>
              {isOpen && (
                <p className="mt-1 text-sm text-slate-200">{item.value}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
