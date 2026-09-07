"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Gift } from "lucide-react";

/** Reward Shop strip — row of LIVE reward chips from the parent-managed shop. */
export function RewardShopStrip() {
  const rewards = useQuery(api.rewards.listActive);
  const list = (rewards ?? []).slice(0, 6);

  return (
    <section className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Reward Shop</h3>
        <Link
          href="/rewards"
          className="text-xs font-medium text-yellow-300/80 transition hover:text-yellow-300"
        >
          View all
        </Link>
      </div>

      {rewards !== undefined && list.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-3 text-xs text-muted-foreground">
          <Gift size={14} className="text-yellow-300/70" />
          No rewards in the shop yet — check back soon!
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((r) => (
            <Link
              key={r._id}
              href="/rewards"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white transition hover:border-yellow-400/40"
            >
              <Gift size={14} className="text-yellow-300" />
              {r.title}
              <span className="font-semibold text-yellow-300">⭐ {r.pointsCost}</span>
            </Link>
          ))}
          {rewards === undefined &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-28 animate-pulse rounded-full border border-white/10 bg-white/5"
              />
            ))}
        </div>
      )}
    </section>
  );
}
