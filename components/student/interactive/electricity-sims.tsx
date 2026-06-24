"use client";

import { useEffect, useRef, useState } from "react";
import {
  Zap, ToggleLeft, Search, RotateCcw,
} from "lucide-react";
import type { InteractiveResult } from "./types";

type SimProps = { title: string; onComplete?: (r: InteractiveResult) => void };

function useLogOnce(onComplete?: (r: InteractiveResult) => void, title?: string) {
  const ref = useRef(false);
  return (detail: string) => {
    if (ref.current) return;
    ref.current = true;
    onComplete?.({ detail: `${title ?? "Simulation"}: ${detail}`, completed: true });
  };
}

/* =========================================================================
   ELECTRON FLOW — atoms lattice + drifting electrons; voltage controls speed
   ========================================================================= */

export function ElectronFlow({ title, onComplete }: SimProps) {
  const [voltage, setVoltage] = useState(4);
  const [on, setOn] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef(voltage);
  const onRef = useRef(on);
  const log = useLogOnce(onComplete, title);
  useEffect(() => { vRef.current = voltage; }, [voltage]);
  useEffect(() => { onRef.current = on; }, [on]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    // Electrons drift around a wire loop path.
    const path = (p: number) => {
      const f = ((p % 1) + 1) % 1;
      // rectangle wire loop: top, right, bottom, left
      const x1 = 60, x2 = 262, y1 = 50, y2 = 150, peri = 2 * ((x2 - x1) + (y2 - y1));
      const d = f * peri;
      const w = x2 - x1, h = y2 - y1;
      if (d < w) return { x: x1 + d, y: y1 };
      if (d < w + h) return { x: x2, y: y1 + (d - w) };
      if (d < 2 * w + h) return { x: x2 - (d - w - h), y: y2 };
      return { x: x1, y: y2 - (d - 2 * w - h) };
    };
    let raf = 0, t = 0;
    const tick = () => {
      t += 1;
      const v = vRef.current;
      const flow = onRef.current && v > 0;
      const speed = flow ? 0.0009 * v : 0;
      ctx.clearRect(0, 0, W, H);

      // wire loop
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 14;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.rect(60, 50, 202, 100);
      ctx.stroke();
      ctx.strokeStyle = "#0ea5e9";
      ctx.lineWidth = 2;
      ctx.stroke();

      // atom lattice inside wire (faint, fixed)
      ctx.fillStyle = "rgba(100,116,139,0.35)";
      for (let x = 70; x < 262; x += 22) {
        for (const yy of [50, 150]) {
          ctx.beginPath();
          ctx.arc(x, yy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (let y = 60; y < 150; y += 22) {
        for (const xx of [60, 262]) {
          ctx.beginPath();
          ctx.arc(xx, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // battery (left side, over the wire)
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(48, 92, 24, 16);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 92, 24, 16);
      // battery terminals (long = +, short = −)
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(44, 96);
      ctx.lineTo(48, 96);
      ctx.moveTo(44, 104);
      ctx.lineTo(48, 104);
      ctx.stroke();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "9px system-ui";
      ctx.fillText(`${v}V`, 38, 88);

      // bulb (right side)
      const glow = flow ? Math.min(1, v / 9) : 0;
      ctx.beginPath();
      ctx.arc(262, 100, 16, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(253,224,71,${0.1 + glow * 0.8})`;
      ctx.shadowColor = "#fde047";
      ctx.shadowBlur = glow * 22;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#eab308"; ctx.lineWidth = 2; ctx.stroke();

      // electrons drifting
      const n = 10;
      for (let i = 0; i < n; i++) {
        const p = t * speed + i / n;
        const pos = path(p);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = flow ? 8 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // labels
      ctx.fillStyle = "#94a3b8"; ctx.font = "9px system-ui";
      ctx.fillText("battery", 38, 124);
      ctx.fillText("bulb", 250, 128);
      ctx.fillStyle = flow ? "#fde047" : "#64748b";
      ctx.font = "10px system-ui";
      ctx.fillText(flow ? `current flowing (${v}V)` : "no current", 110, 180);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={320} height={200} className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black" />
      <div className="mt-4 space-y-2">
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap size={13} className="text-yellow-400" /> Voltage: {voltage} V
          </span>
          <input type="range" min={0} max={10} value={voltage}
            onChange={(e) => { setVoltage(Number(e.target.value)); log(`set voltage to ${e.target.value}V and watched electrons drift`); }}
            className="w-full accent-yellow-500" />
        </label>
        <div className="flex items-center gap-3">
          <button onClick={() => { setOn((o) => !o); log("toggled the circuit and watched the current start/stop"); }}
            className={"rounded-xl px-4 py-2 text-sm font-semibold transition " + (on ? "bg-yellow-500 text-black hover:bg-yellow-400" : "border border-white/10 bg-white/5 text-white")}>
            {on ? "Circuit ON" : "Circuit OFF"}
          </button>
          <p className="text-sm text-slate-200">
            Electrons <span className="text-sky-300">drift</span> through the wire — that flow IS
            electricity. More voltage → faster electrons → brighter bulb.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   CONDUCTOR TESTER — drop materials in the gap; bulb lights for conductors
   ========================================================================= */

const MATERIALS: { name: string; conductor: boolean; color: string }[] = [
  { name: "Copper", conductor: true, color: "#b87333" },
  { name: "Iron", conductor: true, color: "#9ca3af" },
  { name: "Gold", conductor: true, color: "#fbbf24" },
  { name: "Graphite", conductor: true, color: "#475569" },
  { name: "Glass", conductor: false, color: "#7dd3fc" },
  { name: "Plastic", conductor: false, color: "#f472b6" },
  { name: "Rubber", conductor: false, color: "#334155" },
  { name: "Wood", conductor: false, color: "#92400e" },
];

export function ConductorTester({ title, onComplete }: SimProps) {
  const [inGap, setInGap] = useState<string | null>(null);
  const [tested, setTested] = useState<Record<string, boolean>>({});
  const log = useLogOnce(onComplete, title);
  const current = inGap ? MATERIALS.find((m) => m.name === inGap) : null;
  const lit = current?.conductor ?? false;
  const conductors = Object.entries(tested).filter(([, v]) => v).length;
  const insulators = Object.entries(tested).filter(([, v]) => !v).length;

  return (
    <div>
      <svg viewBox="0 0 320 180" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black">
        {/* wires */}
        <path d="M 30,90 L 110,90 M 210,90 L 290,90" stroke="#0ea5e9" strokeWidth="4" fill="none" />
        <path d="M 30,90 L 30,140 L 290,140 L 290,90" stroke="#0ea5e9" strokeWidth="4" fill="none" />
        {/* battery */}
        <rect x="22" y="120" width="16" height="10" fill="#fbbf24" />
        <text x="14" y="148" fill="#fbbf24" fontSize="9">battery</text>
        {/* gap clips */}
        <rect x="106" y="80" width="6" height="20" fill="#64748b" />
        <rect x="208" y="80" width="6" height="20" fill="#64748b" />
        {/* material in gap */}
        {current && (
          <rect x="112" y="82" width="96" height="16" fill={current.color} stroke="#fff" strokeWidth="1" opacity="0.9" />
        )}
        {!current && <text x="130" y="94" fill="#475569" fontSize="10">place a material →</text>}
        {/* current flow dots when lit */}
        {lit && [0, 1, 2, 3].map((i) => (
          <circle key={i} cx={40 + i * 28} cy={140} r="3.5" fill="#fde047">
            <animate attributeName="cx" values={`40;270`} dur={`${0.9 + i * 0.1}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* bulb */}
        <circle cx="290" cy="90" r="15" fill={lit ? "#fde047" : "#1e293b"} stroke="#eab308" strokeWidth="2"
          style={lit ? { filter: "drop-shadow(0 0 14px #fde047)" } : undefined} />
      </svg>

      <p className="mt-3 text-center text-sm">
        {current ? (
          <>
            <span className="font-semibold" style={{ color: current.color }}>{current.name}</span>{" "}
            is a <span className={lit ? "text-green-400 font-semibold" : "text-slate-400 font-semibold"}>{lit ? "CONDUCTOR — bulb lights!" : "INSULATOR — bulb stays dark"}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Pick a material below to test it in the circuit gap.</span>
        )}
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {MATERIALS.map((m) => (
          <button key={m.name} onClick={() => {
            setInGap(m.name);
            setTested((t) => ({ ...t, [m.name]: m.conductor }));
            log(`tested ${m.name} — it's a ${m.conductor ? "conductor" : "insulator"}`);
          }}
            className={"rounded-lg border px-2 py-2 text-xs font-semibold transition " +
              (tested[m.name] !== undefined
                ? m.conductor ? "border-green-500/50 bg-green-500/15 text-green-300"
                  : "border-slate-500/50 bg-slate-500/15 text-slate-300"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10")}>
            <span className="mr-1 inline-block h-3 w-3 rounded-sm align-middle" style={{ backgroundColor: m.color }} />
            {m.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Found: <span className="text-green-400">{conductors} conductors</span> · <span className="text-slate-400">{insulators} insulators</span> of {MATERIALS.length}
      </p>
    </div>
  );
}

/* =========================================================================
   SERIES vs PARALLEL — toggle wiring; break a bulb and see what stays lit
   ========================================================================= */

export function SeriesParallel({ title, onComplete }: SimProps) {
  const [mode, setMode] = useState<"series" | "parallel">("series");
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const log = useLogOnce(onComplete, title);

  const bulbLit = (i: number) => {
    if (mode === "series") return !broken[1] && !broken[2] && !broken[3];
    return !broken[i];
  };
  const anyBroken = broken[1] || broken[2] || broken[3];

  return (
    <div>
      <svg viewBox="0 0 320 190" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black">
        {/* battery */}
        <rect x="24" y="150" width="18" height="12" fill="#fbbf24" />
        <text x="14" y="180" fill="#fbbf24" fontSize="9">battery</text>
        {/* wires from battery up to top rail */}
        <path d="M 33,150 L 33,30 L 290,30 L 290,150 L 33,150" stroke="#0ea5e9" strokeWidth="3" fill="none" />

        {mode === "series" ? (
          /* three bulbs in a single row on the top wire */
          <>
            {[120, 160, 200].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={30} r={11}
                  fill={bulbLit(i + 1) ? "#fde047" : "#1e293b"}
                  stroke="#eab308" strokeWidth="2"
                  style={bulbLit(i + 1) ? { filter: "drop-shadow(0 0 8px #fde047)" } : undefined} />
                <text x={x - 8} y={20} fontSize="8" fill="#94a3b8">B{i + 1}</text>
                {broken[i + 1] && <path d={`M ${x - 11},30 L ${x + 11},30`} stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />}
              </g>
            ))}
            <text x="110" y="80" fill="#94a3b8" fontSize="10">one path — all in a row</text>
          </>
        ) : (
          /* three parallel branches */
          <>
            {[100, 160, 220].map((x, i) => (
              <g key={i}>
                <path d={`M ${x},30 L ${x},70 M ${x},110 L ${x},150`} stroke="#0ea5e9" strokeWidth="3" />
                <path d={`M 33,150 L ${x},150`} stroke="#0ea5e9" strokeWidth="3" fill="none" />
                <circle cx={x} cy={90} r={11}
                  fill={bulbLit(i + 1) ? "#fde047" : "#1e293b"}
                  stroke="#eab308" strokeWidth="2"
                  style={bulbLit(i + 1) ? { filter: "drop-shadow(0 0 8px #fde047)" } : undefined} />
                <text x={x - 8} y={78} fontSize="8" fill="#94a3b8">B{i + 1}</text>
                {broken[i + 1] && <path d={`M ${x},70 L ${x},110`} stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />}
              </g>
            ))}
            <text x="92" y="120" fill="#94a3b8" fontSize="10">each bulb has its own path</text>
          </>
        )}
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 p-1">
          {(["series", "parallel"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setBroken({}); log(`switched to ${m} wiring`); }}
              className={"rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition " + (mode === m ? "bg-sky-500 text-black" : "text-muted-foreground hover:text-white")}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={() => { setBroken((b) => ({ ...b, 2: !b[2] })); log(`broke bulb 2 in ${mode} — ${mode === "series" ? "all went out" : "others stayed on"}`); }}
          className={"rounded-xl px-4 py-2 text-sm font-semibold transition " + (broken[2] ? "bg-red-500 text-white" : "border border-white/10 bg-white/5 text-white hover:bg-white/10")}>
          {broken[2] ? "Fix bulb 2" : "Break bulb 2"}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-200">
        {mode === "series"
          ? <>Series: one break and <span className="font-semibold text-red-300">everything goes out</span>.</>
          : <>Parallel: a broken bulb only kills <span className="font-semibold text-sky-300">that branch</span> — the rest stay on.</>}
        {anyBroken && mode === "series" && " (try parallel to compare!)"}
      </p>
    </div>
  );
}

/* =========================================================================
   SWITCH LAB — labelled circuit diagram; flip the switch + learn the symbols
   ========================================================================= */

export function SwitchLab({ title, onComplete }: SimProps) {
  const [closed, setClosed] = useState(true);
  const [hover, setHover] = useState<string | null>(null);
  const log = useLogOnce(onComplete, title);
  const lit = closed;

  const SymbolInfo: Record<string, string> = {
    battery: "Battery — long line = +, short line = −",
    wire: "Wire — carries the current",
    switch: closed ? "Switch (closed) — current flows" : "Switch (open) — no current",
    bulb: "Bulb — lights when current flows",
  };

  return (
    <div>
      <svg viewBox="0 0 320 170" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black">
        {/* rectangular wire loop with symbols */}
        {/* top wire battery -> switch */}
        <path d="M 70,40 L 140,40" stroke={hover === "wire" ? "#38bdf8" : "#0ea5e9"} strokeWidth="3" />
        {/* switch */}
        <g onMouseEnter={() => setHover("switch")} onMouseLeave={() => setHover(null)} className="cursor-pointer">
          <circle cx="140" cy="40" r="3" fill="#94a3b8" />
          <circle cx="180" cy="40" r="3" fill="#94a3b8" />
          <line x1="140" y1="40" x2={closed ? 180 : 172} y2={closed ? 40 : 24}
            stroke={hover === "switch" ? "#fbbf24" : "#e2e8f0"} strokeWidth="3" strokeLinecap="round" />
          <rect x="136" y="34" width="48" height="14" fill="transparent" />
        </g>
        {/* top wire switch -> bulb */}
        <path d="M 180,40 L 250,40" stroke={hover === "wire" ? "#38bdf8" : "#0ea5e9"} strokeWidth="3" />
        {/* right wire down */}
        <path d="M 250,40 L 250,130" stroke="#0ea5e9" strokeWidth="3" />
        {/* bottom wire */}
        <path d="M 250,130 L 70,130" stroke="#0ea5e9" strokeWidth="3" />
        {/* left wire up to battery */}
        <path d="M 70,130 L 70,40" stroke="#0ea5e9" strokeWidth="3" />

        {/* battery symbol (long/short lines) */}
        <g onMouseEnter={() => setHover("battery")} onMouseLeave={() => setHover(null)}>
          <line x1="62" y1="32" x2="78" y2="32" stroke={hover === "battery" ? "#fbbf24" : "#e2e8f0"} strokeWidth="3" />
          <line x1="66" y1="40" x2="74" y2="40" stroke={hover === "battery" ? "#fbbf24" : "#e2e8f0"} strokeWidth="3" />
          <line x1="62" y1="48" x2="78" y2="48" stroke={hover === "battery" ? "#fbbf24" : "#e2e8f0"} strokeWidth="3" />
          <line x1="66" y1="56" x2="74" y2="56" stroke={hover === "battery" ? "#fbbf24" : "#e2e8f0"} strokeWidth="3" />
          <text x="56" y="26" fontSize="8" fill="#fbbf24">+</text>
        </g>

        {/* bulb symbol (circle with X) */}
        <g onMouseEnter={() => setHover("bulb")} onMouseLeave={() => setHover(null)}>
          <circle cx="250" cy="40" r="13" fill={lit ? "rgba(253,224,71,0.25)" : "transparent"}
            stroke={hover === "bulb" ? "#fbbf24" : "#eab308"} strokeWidth="2"
            style={lit ? { filter: "drop-shadow(0 0 10px #fde047)" } : undefined} />
          <line x1="241" y1="31" x2="259" y2="49" stroke="#eab308" strokeWidth="1.5" />
          <line x1="259" y1="31" x2="241" y2="49" stroke="#eab308" strokeWidth="1.5" />
        </g>

        {/* labels */}
        <text x="50" y="74" fontSize="9" fill="#94a3b8">battery</text>
        <text x="144" y="26" fontSize="9" fill="#94a3b8">switch</text>
        <text x="240" y="66" fontSize="9" fill="#94a3b8">bulb</text>
        <text x="150" y="150" fontSize="11" fill={lit ? "#fde047" : "#64748b"} fontWeight="700">
          {lit ? "CLOSED (on) — bulb lit" : "OPEN (off) — bulb dark"}
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={() => { setClosed((c) => !c); log(`${closed ? "opened" : "closed"} the switch`); }}
          className={"flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition " + (closed ? "bg-amber-500 text-black hover:bg-amber-400" : "border border-white/10 bg-white/5 text-white")}>
          <ToggleLeft size={16} /> {closed ? "Open switch" : "Close switch"}
        </button>
        <p className="text-sm text-slate-200">
          Hover any symbol to learn it. {hover ? <span className="font-semibold text-amber-300">{SymbolInfo[hover]}</span> : "Then flip the switch."}
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   HAZARD SPOTTER — tap the electrical hazards in the room
   ========================================================================= */

const HAZARDS: { id: string; label: string; cx: number; cy: number; r: number }[] = [
  { id: "hairdryer", label: "Hairdryer near water", cx: 70, cy: 60, r: 18 },
  { id: "socket", label: "Overloaded socket", cx: 165, cy: 95, r: 16 },
  { id: "cable", label: "Frayed cable", cx: 250, cy: 130, r: 18 },
  { id: "toaster", label: "Metal fork in toaster", cx: 255, cy: 60, r: 16 },
  { id: "puddle", label: "Puddle by the cord", cx: 110, cy: 140, r: 16 },
];

export function HazardSpotter({ title, onComplete }: SimProps) {
  const [found, setFound] = useState<string[]>([]);
  const log = useLogOnce(onComplete, title);
  const done = found.length === HAZARDS.length;

  return (
    <div>
      <svg viewBox="0 0 320 170" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-800">
        {/* sink (top left) */}
        <rect x="20" y="40" width="90" height="40" rx="4" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1.5" />
        <ellipse cx="65" cy="58" rx="18" ry="6" fill="#0ea5e9" opacity="0.4" />
        <text x="34" y="92" fontSize="8" fill="#64748b">sink</text>
        {/* toaster (top right) */}
        <rect x="225" y="42" width="55" height="26" rx="3" fill="#374151" stroke="#6b7280" strokeWidth="1.5" />
        <rect x="250" y="34" width="6" height="10" fill="#9ca3af" />
        <text x="228" y="80" fontSize="8" fill="#64748b">toaster</text>
        {/* power strip (centre) */}
        <rect x="135" y="86" width="60" height="18" rx="2" fill="#374151" stroke="#6b7280" strokeWidth="1.5" />
        {[145, 157, 169, 181].map((x) => <circle key={x} cx={x} cy="95" r="3" fill="#fbbf24" />)}
        {/* table (bottom right) */}
        <rect x="210" y="115" width="90" height="8" fill="#475569" />
        {/* frayed cable on table */}
        <path d="M 215,115 L 270,115 L 285,123" stroke="#92400e" strokeWidth="3" fill="none" />
        <path d="M 283,121 L 287,125 M 285,119 L 289,123" stroke="#ef4444" strokeWidth="1.5" />
        {/* puddle (bottom left) */}
        <ellipse cx="110" cy="145" rx="26" ry="6" fill="#0ea5e9" opacity="0.4" />
        {/* extension cord across floor */}
        <path d="M 165,104 L 120,138" stroke="#1e293b" strokeWidth="4" />

        {/* hazard hit zones */}
        {HAZARDS.map((h) => {
          const isFound = found.includes(h.id);
          return (
            <g key={h.id} onClick={() => {
              if (isFound) return;
              setFound((f) => [...f, h.id]);
              log(`spotted hazard: ${h.label}`);
            }} className="cursor-pointer">
              <circle cx={h.cx} cy={h.cy} r={h.r} fill={isFound ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.0)"} stroke={isFound ? "#22c55e" : "transparent"} strokeWidth="2" />
              {isFound && (
                <>
                  <circle cx={h.cx} cy={h.cy} r={h.r} fill="rgba(239,68,68,0.18)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                  <circle cx={h.cx} cy={h.cy} r="9" fill="#22c55e" />
                  <path d={`M ${h.cx - 4},${h.cy} L ${h.cx - 1},${h.cy + 3} L ${h.cx + 4},${h.cy - 3}`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </g>
          );
        })}

        {done && <text x="80" y="20" fontSize="13" fill="#22c55e" fontWeight="700">✓ All hazards found!</text>}
      </svg>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-slate-200">
          <Search size={15} className="text-amber-300" />
          Found <span className="font-bold text-amber-300">{found.length}</span> / {HAZARDS.length} hazards
        </span>
        <button onClick={() => setFound([])} className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10">
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      <ul className="mt-3 space-y-1">
        {HAZARDS.map((h) => (
          <li key={h.id} className={"text-xs " + (found.includes(h.id) ? "text-green-400" : "text-slate-500")}>
            {found.includes(h.id) ? "✓" : "○"} {found.includes(h.id) ? h.label : "hidden hazard"}
          </li>
        ))}
      </ul>
    </div>
  );
}
