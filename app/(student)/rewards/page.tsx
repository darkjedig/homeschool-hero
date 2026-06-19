"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { hexToRgb } from "@/lib/subjects";

export default function RewardsPage() {
  const rewards = useQuery(api.rewards.listActive);
  const balance = useQuery(api.points.balance);
  const redeem = useMutation(api.rewards.redeem);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pts = balance ?? 2450;

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reward Shop</h1>
        <div className="flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
          <Star size={16} fill="currentColor" />
          {pts.toLocaleString()} pts
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(rewards ?? []).map((r) => {
          const affordable = pts >= r.pointsCost;
          return (
            <div
              key={r._id}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
            >
              <div
                className="mb-3 grid h-12 w-12 place-items-center rounded-xl"
                style={{
                  backgroundColor: `rgba(${hexToRgb("#eab308")},0.15)`,
                }}
              >
                <Star size={22} className="text-yellow-300" />
              </div>
              <p className="font-semibold text-white">{r.title}</p>
              <p className="mb-4 mt-1 flex-1 text-xs text-muted-foreground">
                {r.description}
              </p>
              <div className="mb-3 flex items-center gap-1 text-sm font-semibold text-yellow-300">
                <Star size={14} fill="currentColor" />
                {r.pointsCost} pts
              </div>
              <button
                type="button"
                disabled={!affordable || busyId === r._id}
                onClick={async () => {
                  setBusyId(r._id);
                  setError(null);
                  try {
                    await redeem({ rewardId: r._id });
                    setDone(r._id);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Redeem failed");
                  } finally {
                    setBusyId(null);
                  }
                }}
                className={
                  "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
                  (done === r._id
                    ? "bg-green-500/20 text-green-300"
                    : affordable
                      ? "bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.4)] hover:bg-blue-400"
                      : "cursor-not-allowed bg-white/5 text-muted-foreground")
                }
              >
                {done === r._id ? (
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle2 size={16} /> Requested
                  </span>
                ) : busyId === r._id ? (
                  <Loader2 size={16} className="mx-auto animate-spin" />
                ) : affordable ? (
                  "Redeem"
                ) : (
                  "Not enough points"
                )}
              </button>
            </div>
          );
        })}
        {rewards === undefined &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-white/5" />
          ))}
        {rewards !== undefined && rewards.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No rewards yet — the parent can add some soon.
          </p>
        )}
      </div>
    </div>
  );
}
