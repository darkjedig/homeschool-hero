"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, Thermometer, Zap, FlaskConical } from "lucide-react";
import type { InteractiveProps, InteractiveResult } from "./types";
import {
  HeartSim,
  LungsSim,
  SkeletonSim,
  DigestiveSim,
  BrainSim,
} from "./body-sims";

/** All supported simulation ids. */
export type SimId =
  | "circuit"
  | "particles"
  | "heart"
  | "lungs"
  | "skeleton"
  | "digestive"
  | "brain";

const DEFAULT_TITLES: Record<SimId, string> = {
  circuit: "Build a Circuit",
  particles: "States of Matter",
  heart: "How the Heart Pumps Blood",
  lungs: "Breathing Simulator",
  skeleton: "Bones & Muscles in Motion",
  digestive: "Food's Journey",
  brain: "Nerve Signal Reflex",
};

/** Dispatches to a specific science simulation by id. */
export function SimulationBlock({ data, onComplete }: InteractiveProps) {
  const get = (k: string) => data.find((d) => d.key === k)?.value ?? "";
  const sim = (get("sim") || "circuit") as SimId;
  const title = get("title") || (DEFAULT_TITLES[sim] ?? "Simulation");

  const childProps = { title, onComplete };

  return (
    <div className="rounded-2xl border border-green-500/25 bg-green-500/[0.05] p-5">
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <FlaskConical size={16} className="text-green-300" /> {title}
      </p>
      {sim === "particles" && <Particles {...childProps} />}
      {sim === "heart" && <HeartSim {...childProps} />}
      {sim === "lungs" && <LungsSim {...childProps} />}
      {sim === "skeleton" && <SkeletonSim {...childProps} />}
      {sim === "digestive" && <DigestiveSim {...childProps} />}
      {sim === "brain" && <BrainSim {...childProps} />}
      {sim === "circuit" && <Circuit {...childProps} />}
    </div>
  );
}

type SimChildProps = {
  title: string;
  onComplete?: (r: InteractiveResult) => void;
};

/* ----------------------------- Circuit sim ----------------------------- */

function Circuit({ title, onComplete }: SimChildProps) {
  const [batteries, setBatteries] = useState(1);
  const [on, setOn] = useState(true);
  const brightness = on ? batteries / 3 : 0;
  const label = !on ? "Off" : batteries === 1 ? "Dim" : batteries === 2 ? "Bright" : "Very bright";
  const loggedRef = useRef(false);

  const report = (detail: string) => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    onComplete?.({ detail: `${title}: ${detail}`, completed: true });
  };

  return (
    <div>
      <svg viewBox="0 0 320 180" className="mx-auto w-full max-w-sm">
        {/* wires */}
        <rect x="20" y="20" width="280" height="140" rx="10" fill="none" stroke="#475569" strokeWidth="4" />
        {/* battery cells */}
        {Array.from({ length: batteries }).map((_, i) => (
          <g key={i} transform={`translate(${110 + i * 36}, 150)`}>
            <rect x="-12" y="-10" width="8" height="20" fill="#22c55e" />
            <rect x="2" y="-6" width="6" height="12" fill="#86efac" />
          </g>
        ))}
        {/* switch */}
        <circle cx="40" cy="90" r="4" fill="#94a3b8" />
        <line
          x1="40"
          y1="90"
          x2={on ? 40 : 56}
          y2={on ? 50 : 70}
          stroke="#94a3b8"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* bulb */}
        <circle
          cx="160"
          cy="40"
          r="22"
          fill="#fde047"
          opacity={0.15 + brightness * 0.85}
          style={{ filter: brightness > 0 ? `drop-shadow(0 0 ${brightness * 24}px #fde047)` : "none" }}
        />
        <circle cx="160" cy="40" r="22" fill="none" stroke="#eab308" strokeWidth="3" />
      </svg>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap size={13} className="text-green-300" /> Batteries: {batteries} ({batteries * 1.5}V)
          </span>
          <input
            type="range"
            min={1}
            max={3}
            value={batteries}
            onChange={(e) => {
              const n = Number(e.target.value);
              setBatteries(n);
              report(`used ${n} batter${n === 1 ? "y" : "ies"} (${n * 1.5}V)`);
            }}
            className="w-full accent-green-500"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setOn((v) => !v);
            report(`switched the circuit ${on ? "off" : "on"}`);
          }}
          className={
            "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition " +
            (on ? "bg-green-500 text-black hover:bg-green-400" : "border border-white/10 bg-white/5 text-white hover:bg-white/10")
          }
        >
          <Lightbulb size={15} /> Switch {on ? "ON" : "OFF"}
        </button>
        <p className="text-sm text-slate-200">
          Bulb: <span className="font-semibold text-green-300">{label}</span>
          {on && " — more batteries means more voltage, so the bulb shines brighter."}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------- Particles sim ----------------------------- */

function Particles({ title, onComplete }: SimChildProps) {
  const [temp, setTemp] = useState(20);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempRef = useRef(temp);
  const loggedRef = useRef(false);

  useEffect(() => {
    tempRef.current = temp;
  }, [temp]);

  const state = temp < 34 ? "Solid" : temp < 67 ? "Liquid" : "Gas";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cols = 6;
    const rows = 4;
    const n = cols * rows;
    const parts = Array.from({ length: n }, (_, i) => {
      const lx = ((i % cols) + 0.5) * (W / cols);
      const ly = (Math.floor(i / cols) + 0.5) * (H / rows) + H * 0.35;
      return { lx, ly, x: lx, y: Math.min(ly, H - 12), vx: 0, vy: 0 };
    });

    let raf = 0;
    const tick = () => {
      const t = tempRef.current / 100; // 0..1
      const speed = 0.2 + t * 2.4;
      const spring = t < 0.34 ? 0.12 : t < 0.67 ? 0.02 : 0;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.vx += (Math.random() - 0.5) * speed;
        p.vy += (Math.random() - 0.5) * speed;
        // Solid/liquid pull toward lattice; gas roams free.
        p.vx += (p.lx - p.x) * spring;
        p.vy += (p.ly - p.y) * spring;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 6) { p.x = 6; p.vx *= -1; }
        if (p.x > W - 6) { p.x = W - 6; p.vx *= -1; }
        if (p.y < 6) { p.y = 6; p.vy *= -1; }
        if (p.y > H - 6) { p.y = H - 6; p.vy *= -1; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = t < 0.34 ? "#60a5fa" : t < 0.67 ? "#34d399" : "#f472b6";
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={320}
        height={180}
        className="w-full rounded-xl border border-white/10 bg-black/40"
      />
      <div className="mt-4 space-y-2">
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Thermometer size={13} className="text-green-300" /> Temperature: {temp}°
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={temp}
            onChange={(e) => {
              const t = Number(e.target.value);
              setTemp(t);
              if (!loggedRef.current) {
                loggedRef.current = true;
                const s = t < 34 ? "Solid" : t < 67 ? "Liquid" : "Gas";
                onComplete?.({
                  detail: `${title}: heated the sample to ${t}° (${s})`,
                  completed: true,
                });
              }
            }}
            className="w-full accent-green-500"
          />
        </label>
        <p className="text-sm text-slate-200">
          State: <span className="font-semibold text-green-300">{state}</span> — heat gives particles
          more energy, so they move faster and spread out.
        </p>
      </div>
    </div>
  );
}
