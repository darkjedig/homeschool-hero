"use client";

import { Sparkles } from "lucide-react";

/**
 * AI mascot widget — glowing orb with a robot face and an encouraging speech
 * bubble. Kept as a client island so we can animate it later (Phase 8).
 */
export function AiMascot({
  message = "You've got this! Keep being awesome.",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/30 shadow-[0_0_24px_rgba(59,130,246,0.45)]">
        <span className="text-xl" role="img" aria-label="AI mascot">
          🤖
        </span>
        <Sparkles
          size={12}
          className="absolute -right-1 -top-1 text-blue-300"
        />
      </div>
      <div className="relative rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground backdrop-blur-md">
        {message}
      </div>
    </div>
  );
}
