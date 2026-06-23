"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { YouTubePlayer } from "./youtube-player";
import { RevealBlock } from "./interactive/reveal";
import { FlashcardsBlock } from "./interactive/flashcards";
import { OrderingBlock } from "./interactive/ordering";
import { TimelineBlock } from "./interactive/timeline";
import { CodeSandboxBlock } from "./interactive/code-sandbox";
import { MathArenaBlock } from "./interactive/math-arena";
import { MatchGameBlock } from "./interactive/match-game";
import { FillBlankBlock } from "./interactive/fill-blank";
import { SimulationBlock } from "./interactive/simulation";
import { Lightbulb, PlayCircle } from "lucide-react";

type Block = NonNullable<Doc<"lessons">["content"]>[number];

/** Renders a lesson's structured content blocks in order. */
export function LessonBlocks({
  blocks,
  lessonId,
}: {
  blocks: Block[];
  lessonId: string;
}) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "heading":
            return (
              <h2 key={i} className="pt-2 text-lg font-semibold text-white">
                {b.text}
              </h2>
            );
          case "text":
            return (
              <div key={i} className="space-y-3 text-sm leading-relaxed text-slate-200">
                {(b.text ?? "").split(/\n{2,}/).map((p, pi) => (
                  <p key={pi} className="whitespace-pre-line">{p}</p>
                ))}
              </div>
            );
          case "example":
            return (
              <div key={i} className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.07] p-5">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-200">
                  <Lightbulb size={14} /> Worked example
                </p>
                <p className="whitespace-pre-line text-sm text-slate-200">{b.text}</p>
              </div>
            );
          case "keyPoints":
            return (
              <ul key={i} className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                {(b.items ?? []).map((it, ki) => (
                  <li key={ki} className="flex gap-2 text-sm text-slate-200">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {it}
                  </li>
                ))}
              </ul>
            );
          case "video":
            return b.url ? (
              <div key={i}>
                <YouTubePlayer lessonId={lessonId} videoUrl={b.url} />
                {b.caption && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <PlayCircle size={12} /> {b.caption}
                  </p>
                )}
              </div>
            ) : null;
          case "interactive":
            if (!b.variant) return null;
            const data = b.data ?? [];
            if (b.variant === "reveal") return <RevealBlock key={i} data={data} />;
            if (b.variant === "flashcards") return <FlashcardsBlock key={i} data={data} />;
            if (b.variant === "ordering") return <OrderingBlock key={i} data={data} />;
            if (b.variant === "timeline") return <TimelineBlock key={i} data={data} />;
            if (b.variant === "codeSandbox") return <CodeSandboxBlock key={i} data={data} />;
            if (b.variant === "mathArena") return <MathArenaBlock key={i} data={data} />;
            if (b.variant === "match") return <MatchGameBlock key={i} data={data} />;
            if (b.variant === "fillBlank") return <FillBlankBlock key={i} data={data} />;
            if (b.variant === "simulation") return <SimulationBlock key={i} data={data} />;
            return null;
          default:
            return null;
        }
      })}
    </div>
  );
}
