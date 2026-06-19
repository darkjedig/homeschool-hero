"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const data = useQuery(api.hello.hello);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md shadow-[0_0_40px_rgba(59,130,246,0.15)]">
        <h1 className="text-3xl font-bold text-white">HomeschoolHero</h1>
        <p className="mt-2 text-muted-foreground">
          Phase 1 smoke test — live Convex connection
        </p>
        <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-4">
          <p className="text-sm text-secondary">Convex says:</p>
          <p className="mt-1 font-mono text-xl text-blue-300">
            {data ?? "loading…"}
          </p>
        </div>
      </div>
    </main>
  );
}
