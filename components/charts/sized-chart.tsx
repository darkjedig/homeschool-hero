"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const CHART_TOOLTIP = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "0.75rem",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    color: "#ffffff",
    fontSize: "12px",
  },
  itemStyle: { color: "#e2e8f0" },
  labelStyle: { color: "#94a3b8", marginBottom: "2px" },
  cursor: { fill: "rgba(255,255,255,0.06)" },
};

/**
 * Only mount a Recharts chart after the wrapper has a real pixel size.
 * Avoids "width(-1) and height(-1)" warnings from ResponsiveContainer.
 */
export function SizedChart({
  className,
  children,
}: {
  className?: string;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = Math.floor(el.clientWidth);
      const h = Math.floor(el.clientHeight);
      if (w > 0 && h > 0) setSize({ width: w, height: h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("h-64 w-full min-h-[16rem] min-w-0", className)}>
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
}
