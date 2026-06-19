"use client";

import { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";

type Remaining = { days: number; hours: number; mins: number; secs: number };

function untilFriday(): Remaining {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay(); // 0 Sun ... 5 Fri ... 6 Sat
  const add = (5 - day + 7) % 7;
  target.setDate(now.getDate() + add);
  target.setHours(9, 0, 0, 0); // Friday 9am
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  }
  let diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const mins = Math.floor(diff / 60000);
  diff -= mins * 60000;
  const secs = Math.floor(diff / 1000);
  return { days, hours, mins, secs };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Friday Challenge widget — purple-themed, live countdown. */
export function FridayChallengeCard({
  title = "Game Dev Challenge",
  subtitle = "Build a Platformer Level",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [t, setT] = useState<Remaining | null>(null);

  useEffect(() => {
    // Client-only countdown: time must be set after mount to avoid SSR
    // hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setT(untilFriday());
    const id = setInterval(() => setT(untilFriday()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="flex h-full flex-col rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-600/20 via-purple-900/20 to-transparent p-5 shadow-[0_0_30px_rgba(168,85,247,0.18)]">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-purple-500/25">
        <Gamepad2 size={22} className="text-purple-300" />
      </div>
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-purple-300/80">
        Starts in
      </p>
      <div className="mt-2 grid grid-cols-4 gap-1.5 font-mono text-center">
        {[
          { v: t?.days ?? 0, l: "Days" },
          { v: t?.hours ?? 0, l: "Hrs" },
          { v: t?.mins ?? 0, l: "Mins" },
          { v: t?.secs ?? 0, l: "Secs" },
        ].map((u) => (
          <div
            key={u.l}
            className="rounded-lg border border-white/10 bg-black/30 py-2"
          >
            <div className="text-lg font-bold text-white">
              {pad(u.v)}
            </div>
            <div className="text-[9px] uppercase text-muted-foreground">
              {u.l}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-purple-500 px-4 py-2.5 font-semibold text-white shadow-[0_0_18px_rgba(168,85,247,0.45)] transition hover:bg-purple-400"
      >
        Get Ready!
      </button>
    </section>
  );
}
