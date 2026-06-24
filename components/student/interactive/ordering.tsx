"use client";

import { useMemo, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import type { InteractiveProps, Pair } from "./types";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h || 1;
}
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Drag-to-order: items start in a stable shuffled order; key = correct order. */
export function OrderingBlock({ data, onComplete }: InteractiveProps) {
  const correct = useMemo(
    () => [...data].sort((a, b) => Number(a.key) - Number(b.key)),
    [data],
  );
  // Pure, deterministic shuffle (no Math.random in render). Ensure it differs
  // from the correct order where possible.
  const shuffled = useMemo(() => {
    const seed = hashSeed(data.map((d) => d.value).join("|"));
    const out = seededShuffle(data, seed);
    const sameAsCorrect =
      out.length > 1 && out.every((it, idx) => it.value === correct[idx]?.value);
    return sameAsCorrect ? [...out.slice(1), out[0]] : out;
  }, [data, correct]);
  const [items, setItems] = useState(shuffled);
  const [checked, setChecked] = useState(false);

  const isRight = (idx: number) => items[idx]?.value === correct[idx]?.value;
  const allRight = items.every((it, idx) => it.value === correct[idx]?.value);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="mb-1 text-sm font-semibold text-white">Put these in the right order</p>
      <p className="mb-3 text-xs text-muted-foreground">Drag the grip handle to reorder.</p>

      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((item, idx) => (
          <ReorderItem
            key={item.value}
            item={item}
            state={checked ? (isRight(idx) ? "right" : "wrong") : "idle"}
          />
        ))}
      </Reorder.Group>

      <div className="mt-4 flex items-center gap-3">
        {!checked ? (
          <button
            onClick={() => {
              setChecked(true);
              const correctCount = items.filter(
                (it, idx) => it.value === correct[idx]?.value,
              ).length;
              onComplete?.({
                score: correctCount,
                total: items.length,
                detail: `Ordered ${correctCount}/${items.length} correctly`,
                completed: true,
              });
            }}
            className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
          >
            Check order
          </button>
        ) : (
          <button
            onClick={() => { setItems(shuffled); setChecked(false); }}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <RefreshCw size={14} /> Try again
          </button>
        )}
        {checked && (
          <span className={"text-sm font-semibold " + (allRight ? "text-green-400" : "text-orange-400")}>
            {allRight ? "Perfect! ✓" : "Not quite — orange items are out of place."}
          </span>
        )}
      </div>
    </div>
  );
}

function ReorderItem({
  item,
  state,
}: {
  item: Pair;
  state: "idle" | "right" | "wrong";
}) {
  const controls = useDragControls();
  const border =
    state === "right" ? "border-green-500/50" : state === "wrong" ? "border-orange-500/50" : "border-white/10";
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={"flex items-center gap-3 rounded-xl border bg-black/20 px-3 py-2.5 " + border}
    >
      <span onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-muted-foreground">
        <GripVertical size={16} />
      </span>
      <span className="flex-1 text-sm text-white">{item.value}</span>
      {state === "right" && <CheckCircle2 size={16} className="text-green-400" />}
      {state === "wrong" && <XCircle size={16} className="text-orange-400" />}
    </Reorder.Item>
  );
}
