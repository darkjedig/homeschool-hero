"use client";

import { useEffect, useRef, useState } from "react";
import { Sun, Droplets, Wind, Volume2, Radio, Sprout } from "lucide-react";
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
   LIGHT RAYS — torch beam reflects off a mirror; prism splits the spectrum
   ========================================================================= */

export function LightRays({ title, onComplete }: SimProps) {
  const [angle, setAngle] = useState(20); // mirror tilt degrees
  const [prism, setPrism] = useState(false);
  const log = useLogOnce(onComplete, title);
  // mirror sits at (190, 100), beam comes from torch at (30, 100) horizontally.
  const reflectAngle = prism ? 0 : angle; // prism refracts instead of reflecting
  // reflected ray endpoint: angle measured from vertical mirror normal (horizontal).
  const rad = (reflectAngle * Math.PI) / 180;
  const len = 150;
  const rx = 190 + Math.cos(2 * rad) * len;
  const ry = 100 - Math.sin(2 * rad) * len;
  const spectrum = ["#ef4444", "#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#6366f1", "#a855f7"];

  return (
    <div>
      <svg viewBox="0 0 320 180" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black">
        {/* incoming beam (torch -> mirror) */}
        <line x1="40" y1="100" x2={prism ? 150 : 190} y2="100" stroke="#fde68a" strokeWidth="4" opacity="0.9" style={{ filter: "drop-shadow(0 0 6px #fde68a)" }} />
        {/* torch */}
        <rect x="20" y="92" width="20" height="16" rx="2" fill="#475569" />
        <circle cx="40" cy="100" r="5" fill="#fde68a" />

        {prism ? (
          <>
            {/* prism triangle */}
            <polygon points="150,80 150,120 185,100" fill="rgba(125,211,252,0.3)" stroke="#7dd3fc" strokeWidth="2" />
            {/* split spectrum */}
            {spectrum.map((c, i) => (
              <line key={c} x1="185" y1="100" x2="300" y2={60 + i * 12}
                stroke={c} strokeWidth="3" opacity="0.85" style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
            ))}
            <text x="210" y="50" fontSize="9" fill="#94a3b8">white light splits into colours</text>
          </>
        ) : (
          <>
            {/* mirror (rotates with angle) */}
            <g transform={`rotate(${-angle} 190 100)`}>
              <line x1="190" y1="78" x2="190" y2="122" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
              <line x1="190" y1="78" x2="190" y2="122" stroke="#94a3b8" strokeWidth="1" />
            </g>
            {/* reflected beam */}
            <line x1="190" y1="100" x2={rx} y2={ry} stroke="#fde68a" strokeWidth="4" opacity="0.9" style={{ filter: "drop-shadow(0 0 6px #fde68a)" }} />
            {/* normal (dashed) */}
            <line x1="190" y1="100" x2={190 + 40} y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
            <text x="148" y="74" fontSize="9" fill="#94a3b8">mirror</text>
            <text x={Math.min(rx, 290) - 50} y={ry - 8} fontSize="9" fill="#fbbf24">reflection</text>
          </>
        )}
      </svg>
      <div className="mt-4 space-y-3">
        {!prism && (
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Radio size={13} className="text-amber-300" /> Mirror tilt: {angle}°
            </span>
            <input type="range" min={5} max={40} value={angle}
              onChange={(e) => { setAngle(Number(e.target.value)); log(`tilted the mirror to ${e.target.value}° and watched the beam reflect`); }}
              className="w-full accent-amber-500" />
          </label>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => { setPrism((p) => !p); log(prism ? "switched back to the mirror" : "slotted in the prism and split light into a rainbow"); }}
            className={"rounded-xl px-4 py-2 text-sm font-semibold transition " + (prism ? "bg-sky-500 text-black hover:bg-sky-400" : "border border-white/10 bg-white/5 text-white")}>
            {prism ? "Use mirror" : "Use prism"}
          </button>
          <p className="text-sm text-slate-200">
            {prism
              ? <>A <span className="text-sky-300">prism</span> bends colours by different amounts, splitting white light into a rainbow.</>
              : <>Light <span className="text-amber-300">reflects</span> off a mirror — angle in equals angle out.</>}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SOUND WAVES — frequency (pitch) + amplitude (volume) animate the wave
   ========================================================================= */

export function SoundWaves({ title, onComplete }: SimProps) {
  const [freq, setFreq] = useState(4); // higher = higher pitch
  const [amp, setAmp] = useState(40); // higher = louder
  const [t, setT] = useState(0);
  const log = useLogOnce(onComplete, title);

  useEffect(() => {
    let raf = 0;
    const tick = () => { setT((x) => x + 0.12); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // build wave path
  const midY = 80;
  let d = `M 10 ${midY}`;
  for (let x = 10; x <= 310; x += 3) {
    const y = midY - amp * Math.sin((x / 320) * Math.PI * 2 * freq + t);
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  const pitch = freq <= 2 ? "low pitch" : freq <= 5 ? "medium pitch" : "high pitch";
  const loud = amp <= 20 ? "quiet" : amp <= 50 ? "medium" : "loud";

  return (
    <div>
      <svg viewBox="0 0 320 160" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black">
        {/* center line */}
        <line x1="10" y1={midY} x2="310" y2={midY} stroke="#1e293b" strokeWidth="1" />
        {/* speaker */}
        <Volume2 size={18} x={2} y={70} className="text-violet-300" />
        {/* wave */}
        <path d={d} fill="none" stroke="#a78bfa" strokeWidth="3" style={{ filter: "drop-shadow(0 0 6px #a78bfa)" }} />
        <text x="120" y="20" fontSize="10" fill="#c4b5fd">{pitch} · {loud}</text>
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Pitch (frequency): {freq}</span>
          <input type="range" min={1} max={8} value={freq}
            onChange={(e) => { setFreq(Number(e.target.value)); log(`raised the pitch and watched the waves bunch up`); }}
            className="w-full accent-violet-500" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Volume (amplitude): {amp}</span>
          <input type="range" min={5} max={60} value={amp}
            onChange={(e) => { setAmp(Number(e.target.value)); log(`turned up the volume and watched the waves grow taller`); }}
            className="w-full accent-violet-500" />
        </label>
      </div>
      <p className="mt-2 text-sm text-slate-200">
        Sound travels as <span className="font-semibold text-violet-300">waves</span>. Bunched-up waves =
        high pitch; taller waves = louder.
      </p>
    </div>
  );
}

/* =========================================================================
   PLANT GROWTH — seed → sprout → seedling → flowering plant (step + needs)
   ========================================================================= */

const STAGES = [
  { label: "Seed", desc: "A seed waits in the soil for water and warmth.", sun: false, water: false },
  { label: "Sprout", desc: "Roots push down; the first shoot pushes up.", sun: true, water: true },
  { label: "Seedling", desc: "Leaves open to catch sunlight and make food.", sun: true, water: true },
  { label: "Flowering", desc: "Buds open into flowers; bees spread pollen.", sun: true, water: true },
];

export function PlantGrowth({ title, onComplete }: SimProps) {
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(false);
  const log = useLogOnce(onComplete, title);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setStage((s) => (s + 1) % (STAGES.length + 1)), 1400);
    return () => clearInterval(id);
  }, [auto]);

  const s = Math.min(stage, STAGES.length - 1);
  const cur = STAGES[s];

  return (
    <div>
      <svg viewBox="0 0 320 200" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-sky-950/30 to-black">
        {/* sky + sun */}
        <Sun size={20} x={286} y={12} className="text-yellow-300" />
        {/* soil */}
        <rect x="0" y="150" width="320" height="50" fill="#3f2d1a" />
        {/* water drop when needed */}
        {cur.water && <Droplets size={14} x={150} y={20} className="text-sky-300" />}

        {/* seed */}
        {s === 0 && <ellipse cx="160" cy="165" rx="9" ry="6" fill="#92400e" />}

        {/* sprout */}
        {s >= 1 && (
          <>
            <line x1="160" y1="150" x2="160" y2={150 - 22 * (s)} stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
            {/* roots */}
            <line x1="160" y1="150" x2="150" y2="168" stroke="#a16207" strokeWidth="2" />
            <line x1="160" y1="150" x2="170" y2="168" stroke="#a16207" strokeWidth="2" />
          </>
        )}

        {/* seedling leaves */}
        {s >= 2 && (
          <>
            <ellipse cx="142" cy={150 - 22 * s - 6} rx="12" ry="6" fill="#16a34a" transform={`rotate(-25 142 ${150 - 22 * s - 6})`} />
            <ellipse cx="178" cy={150 - 22 * s - 6} rx="12" ry="6" fill="#16a34a" transform={`rotate(25 178 ${150 - 22 * s - 6})`} />
          </>
        )}

        {/* flower */}
        {s >= 3 && (
          <>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="160" cy={150 - 22 * s - 18} rx="6" ry="11" fill="#ec4899"
                transform={`rotate(${a} 160 ${150 - 22 * s - 18})`} />
            ))}
            <circle cx="160" cy={150 - 22 * s - 18} r="5" fill="#fbbf24" />
          </>
        )}

        <text x="124" y="190" fontSize="11" fill="#e2e8f0" fontWeight="700">{cur.label}</text>
      </svg>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={() => { setStage((x) => Math.min(x + 1, STAGES.length - 1)); log(`advanced the plant to the ${STAGES[Math.min(stage + 1, STAGES.length - 1)].label} stage`); }}
          className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500">
          <Sprout size={15} /> Next stage
        </button>
        <button onClick={() => { setAuto((a) => !a); setStage(0); log("let the plant auto-grow through every stage"); }}
          className={"rounded-xl px-4 py-2 text-sm font-semibold transition " + (auto ? "bg-green-600 text-white" : "border border-white/10 bg-white/5 text-white")}>
          {auto ? "Stop" : "Auto-grow"}
        </button>
        <p className="text-sm text-slate-200">{cur.desc}</p>
      </div>
      <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Sun size={12} className="text-yellow-300" /> sunlight</span>
        <span className="flex items-center gap-1"><Droplets size={12} className="text-sky-300" /> water</span>
        <span className="flex items-center gap-1"><Wind size={12} className="text-slate-300" /> space + air</span>
        — plants need all three to grow.
      </p>
    </div>
  );
}

/* =========================================================================
   ORBIT — planets circle the sun; speed slider + click a planet to name it
   ========================================================================= */

const PLANETS = [
  { name: "Mercury", r: 30, speed: 1.6, color: "#9ca3af", size: 3 },
  { name: "Venus", r: 46, speed: 1.2, color: "#fbbf24", size: 5 },
  { name: "Earth", r: 64, speed: 1.0, color: "#3b82f6", size: 5 },
  { name: "Mars", r: 82, speed: 0.8, color: "#ef4444", size: 4 },
  { name: "Jupiter", r: 108, speed: 0.45, color: "#f97316", size: 9 },
];

export function Orbit({ title, onComplete }: SimProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const speedRef = useRef(speed);
  const log = useLogOnce(onComplete, title);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    let raf = 0, t = 0;
    const tick = () => {
      t += 0.01 * speedRef.current;
      ctx.clearRect(0, 0, W, H);
      // orbits
      ctx.strokeStyle = "rgba(100,116,139,0.25)";
      ctx.lineWidth = 1;
      for (const p of PLANETS) {
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // sun
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#fde047";
      ctx.shadowColor = "#fde047";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
      // planets
      const hits: { x: number; y: number; name: string }[] = [];
      for (const p of PLANETS) {
        const ang = t * p.speed;
        const x = cx + Math.cos(ang) * p.r;
        const y = cy + Math.sin(ang) * p.r;
        hits.push({ x, y, name: p.name });
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        if (selected === p.name) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.font = "9px system-ui";
          ctx.fillText(p.name, x - 12, y - p.size - 4);
        }
      }
      // store hits for click handling via closure on canvas
      (canvas as HTMLCanvasElement & { _hits?: typeof hits })._hits = hits;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selected]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;
    const hits = (canvas as HTMLCanvasElement & { _hits?: { x: number; y: number; name: string }[] })._hits ?? [];
    for (const h of hits) {
      if (Math.abs(h.x - mx) < 12 && Math.abs(h.y - my) < 12) {
        setSelected(h.name);
        log(`clicked on ${h.name} and watched its orbit`);
        return;
      }
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={320}
        height={200}
        onClick={onClick}
        className="w-full cursor-pointer rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black"
      />
      <div className="mt-4 space-y-2">
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wind size={13} className="text-sky-300" /> Orbit speed: {speed}×
          </span>
          <input type="range" min={0} max={4} step={0.5} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-sky-500" />
        </label>
        <p className="text-sm text-slate-200">
          {selected
            ? <>That&apos;s <span className="font-semibold text-sky-300">{selected}</span> — click another planet to name it.</>
            : <>The <span className="text-yellow-300">Sun</span> sits at the centre; planets orbit it. Click one to name it. Earth&apos;s orbit = one year.</>}
        </p>
      </div>
    </div>
  );
}
