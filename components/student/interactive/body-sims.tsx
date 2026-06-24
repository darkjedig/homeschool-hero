"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Bone, Utensils, Brain, Play, Pause } from "lucide-react";
import type { InteractiveResult } from "./types";

type SimProps = {
  title: string;
  onComplete?: (r: InteractiveResult) => void;
};

function useLogOnce(onComplete?: (r: InteractiveResult) => void, title?: string) {
  const ref = useRef(false);
  return (detail: string) => {
    if (ref.current) return;
    ref.current = true;
    onComplete?.({ detail: `${title ?? "Simulation"}: ${detail}`, completed: true });
  };
}

/* =========================================================================
   HEART — double circulation: body ↔ heart ↔ LUNGS (shown as real lobes)
   ========================================================================= */

type Pt = { x: number; y: number; ox?: boolean };
// One continuous loop. ox marks where blood picks up / drops off oxygen.
// index 3→4 (lungs)   : blue → red  (picks up O₂)
// index 7→0 (body)    : red  → blue (drops off O₂)
const HEART_LOOP: Pt[] = [
  { x: 272, y: 158 }, // 0 body
  { x: 240, y: 120 }, // 1 vena cava up
  { x: 192, y: 112 }, // 2 right heart
  { x: 134, y: 92 },  // 3 pulmonary artery toward lungs
  { x: 78, y: 104, ox: true },  // 4 IN LUNGS → oxygenated
  { x: 122, y: 132 }, // 5 pulmonary vein back
  { x: 168, y: 132 }, // 6 left heart
  { x: 222, y: 146 }, // 7 aorta out to body
];

function loopPos(p: number): { x: number; y: number; oxy: boolean } {
  const n = HEART_LOOP.length;
  const f = (p % 1 + 1) % 1 * n;
  const i = Math.floor(f);
  const frac = f - i;
  const a = HEART_LOOP[i];
  const b = HEART_LOOP[(i + 1) % n];
  const x = a.x + (b.x - a.x) * frac;
  const y = a.y + (b.y - a.y) * frac;
  // oxygenated between lung (idx4) and body (idx0/7)
  const oxy = f >= 4 && f < 8;
  return { x, y, oxy };
}

function drawHeartShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.75);
  ctx.bezierCurveTo(cx - s * 1.25, cy + s * 0.05, cx - s * 0.55, cy - s * 0.95, cx, cy - s * 0.25);
  ctx.bezierCurveTo(cx + s * 0.55, cy - s * 0.95, cx + s * 1.25, cy + s * 0.05, cx, cy + s * 0.75);
  ctx.closePath();
}

function drawLungLobe(ctx: CanvasRenderingContext2D, cx: number, top: number, w: number, h: number, flip: boolean, scale: number) {
  ctx.save();
  ctx.translate(cx, top);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-6, 14, -w * 0.92, h * 0.32, -w, h * 0.6);
  ctx.bezierCurveTo(-w * 1.04, h * 0.86, -w * 0.55, h, -w * 0.06, h);
  ctx.bezierCurveTo(0, h * 0.74, -2, h * 0.42, 0, h * 0.18);
  ctx.closePath();
  // Fill (soft pink, healthy lung) + subtle stroke.
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(253, 164, 175, 0.55)");
  grad.addColorStop(1, "rgba(244, 114, 182, 0.35)");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(251, 113, 133, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Bronchioles
  ctx.strokeStyle = "rgba(190, 18, 60, 0.45)";
  ctx.lineWidth = 1;
  for (const branch of [-0.45, -0.2, 0.05]) {
    ctx.beginPath();
    ctx.moveTo(0, h * 0.12);
    ctx.quadraticCurveTo(-w * 0.3, h * (0.35 + branch), -w * (0.55 + branch * 0.4), h * (0.6 + branch));
    ctx.stroke();
  }
  ctx.restore();
}

export function HeartSim({ title, onComplete }: SimProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bpm, setBpm] = useState(72);
  const bpmRef = useRef(bpm);
  const log = useLogOnce(onComplete, title);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    let raf = 0;
    let t = 0;

    const tick = () => {
      t += 1;
      const rate = bpmRef.current;
      const beatPeriod = (60 / rate) * 60;
      const phase = (t % beatPeriod) / beatPeriod;
      // Two-phase heartbeat (lub-dub): sharp squeeze then a second smaller one.
      const beat =
        phase < 0.12 ? 1 + 0.18 * Math.sin((phase / 0.12) * Math.PI) :
        phase < 0.32 ? 1 :
        phase < 0.44 ? 1 + 0.1 * Math.sin(((phase - 0.32) / 0.12) * Math.PI) : 1;

      ctx.clearRect(0, 0, W, H);

      // ---- Lungs (left) — gently breathing, independent of heart ----
      const breathe = 0.92 + 0.08 * Math.sin(t * 0.05);
      drawLungLobe(ctx, 70, 54, 38, 78, false, breathe);
      drawLungLobe(ctx, 70, 54, 38, 78, true, breathe);
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "600 11px system-ui,sans-serif";
      ctx.fillText("LUNGS", 46, 150);
      ctx.font = "10px system-ui,sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("(add O₂)", 48, 163);

      // ---- Body silhouette (right) ----
      ctx.fillStyle = "rgba(148, 163, 184, 0.18)";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(282, 120, 26, 44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "600 11px system-ui,sans-serif";
      ctx.fillText("BODY", 268, 190);
      ctx.font = "10px system-ui,sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("(uses O₂)", 264, 203);

      // ---- Circulation path (faint) ----
      ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
      ctx.lineWidth = 6;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(HEART_LOOP[0].x, HEART_LOOP[0].y);
      for (let i = 1; i < HEART_LOOP.length; i++) ctx.lineTo(HEART_LOOP[i].x, HEART_LOOP[i].y);
      ctx.closePath();
      ctx.stroke();

      // ---- Blood particles ----
      const n = 14;
      const speed = 0.0022 * (rate / 72);
      for (let i = 0; i < n; i++) {
        const p = (t * speed + i / n) % 1;
        const pos = loopPos(p);
        const glow = pos.oxy ? "#f87171" : "#60a5fa";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ---- Heart (centre) — pulsing, two-tone ----
      const cx = 180;
      const cy = 122;
      const s = 26 * beat;
      // right side (deoxygenated, bluish)
      drawHeartShape(ctx, cx, cy, s);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = "rgba(96, 165, 250, 0.45)";
      ctx.fillRect(cx - s * 1.3, cy - s, s * 1.3, s * 2);
      ctx.fillStyle = "rgba(220, 38, 38, 0.9)";
      ctx.fillRect(cx, cy - s, s * 1.3, s * 2);
      ctx.restore();
      drawHeartShape(ctx, cx, cy, s);
      ctx.strokeStyle = "rgba(252, 165, 165, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // septum
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.25);
      ctx.lineTo(cx, cy + s * 0.75);
      ctx.strokeStyle = "rgba(120, 20, 20, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#fecaca";
      ctx.font = "700 11px system-ui,sans-serif";
      ctx.fillText("HEART", cx - 16, cy + s + 16);

      // legend
      ctx.font = "10px system-ui,sans-serif";
      ctx.fillStyle = "#60a5fa";
      ctx.fillText("● deoxygenated", 12, 18);
      ctx.fillStyle = "#f87171";
      ctx.fillText("● oxygen-rich", 12, 32);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={320} height={220} className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black" />
      <div className="mt-4 space-y-2">
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart size={13} className="text-red-400" /> Heart rate: {bpm} BPM
          </span>
          <input
            type="range"
            min={50}
            max={140}
            value={bpm}
            onChange={(e) => {
              setBpm(Number(e.target.value));
              log(`set the heart rate to ${e.target.value} BPM and watched blood flow through the lungs and body`);
            }}
            className="w-full accent-red-500"
          />
        </label>
        <p className="text-sm text-slate-200">
          Blood loops <span className="font-semibold text-sky-300">body → heart → lungs</span> (picks up
          oxygen, turns <span className="text-red-400">red</span>) then{" "}
          <span className="font-semibold text-red-300">lungs → heart → body</span>.
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   LUNGS — anatomical: trachea → bronchi → lobes that breathe + gas flow
   ========================================================================= */

function LungShape({ flip, scale }: { flip: boolean; scale: number }) {
  // path drawn from top (0,0) downward; ~64 wide, ~104 tall.
  return (
    <g transform={`scale(${flip ? -scale : scale} ${scale})`}>
      <path
        d="M 0,0 C -6,16 -30,28 -34,60 C -38,88 -20,104 -2,104 C 0,76 -2,44 0,20 Z"
        fill="url(#lungGrad)"
        stroke="#38bdf8"
        strokeWidth="2"
        opacity="0.92"
      />
      {/* bronchioles */}
      <g stroke="#0ea5e9" strokeWidth="1.4" opacity="0.7" fill="none" strokeLinecap="round">
        <path d="M -1,10 C -10,28 -20,40 -28,58" />
        <path d="M -1,10 C -6,30 -10,52 -12,74" />
        <path d="M -1,10 C -14,26 -26,46 -30,66" />
        <path d="M -14,40 L -22,52 M -10,54 L -18,68 M -20,50 L -26,64" />
      </g>
      {/* alveoli (air sacs) */}
      <g fill="#7dd3fc" opacity="0.5">
        <circle cx="-22" cy="58" r="2.4" />
        <circle cx="-12" cy="74" r="2.4" />
        <circle cx="-26" cy="66" r="2.1" />
        <circle cx="-18" cy="68" r="2" />
      </g>
    </g>
  );
}

export function LungsSim({ title, onComplete }: SimProps) {
  const [breathing, setBreathing] = useState(true);
  const [scale, setScale] = useState(0.62);
  const [particles, setParticles] = useState<{ y: number; side: number }[]>([]);
  const log = useLogOnce(onComplete, title);
  const scaleRef = useRef(scale);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  useEffect(() => {
    if (!breathing) return;
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.018;
      const next = 0.62 + 0.28 * (0.5 + 0.5 * Math.sin(t));
      setScale(next);
      // particles: inhale (growing) flow down, exhale (shrinking) flow up.
      const inhaling = next > scaleRef.current;
      setParticles((prev) => {
        const arr = prev.length ? prev : Array.from({ length: 5 }, (_, i) => ({ y: 16 + i * 12, side: i % 2 }));
        return arr.map((p) => {
          let y = p.y + (inhaling ? 1.4 : -1.4);
          if (y > 120) y = 16;
          if (y < 16) y = 120;
          return { ...p, y };
        });
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [breathing]);

  const inhaling = scale > 0.62 + 0.02 && scale < 0.9;
  const expanding = scale >= 0.9;
  const phase = expanding ? "Breathing IN — O₂ rushing in" : inhaling ? "Breathing in…" : "Breathing OUT — CO₂ leaving";

  return (
    <div>
      <svg viewBox="0 0 320 230" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-sky-950/40 to-black">
        <defs>
          <linearGradient id="lungGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Chest cavity outline */}
        <path
          d="M 40,40 C 40,18 280,18 280,40 L 280,150 C 280,200 40,200 40,150 Z"
          fill="none"
          stroke="#1e293b"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Trachea + bronchi */}
        <rect x="152" y="14" width="16" height="46" rx="6" fill="#475569" />
        {/* cartilage rings */}
        {[20, 30, 40, 50].map((y) => (
          <line key={y} x1="152" y1={y} x2="168" y2={y} stroke="#64748b" strokeWidth="1.5" />
        ))}
        {/* bifurcation */}
        <path d="M 152,60 C 130,70 112,76 100,82" stroke="#475569" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M 168,60 C 190,70 208,76 220,82" stroke="#475569" strokeWidth="7" fill="none" strokeLinecap="round" />

        {/* Airflow particles in trachea */}
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.side === 0 ? 160 - p.side * 4 : 160}
            cy={p.y}
            r="3.2"
            fill={expanding || inhaling ? "#22d3ee" : "#94a3b8"}
            opacity="0.85"
            style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
          />
        ))}

        {/* Left lung (viewer left) */}
        <g transform="translate(102,80)">
          <LungShape flip={false} scale={scale} />
        </g>
        {/* Right lung (viewer right, mirrored) */}
        <g transform="translate(218,80)">
          <LungShape flip scale={scale} />
        </g>

        {/* Flow arrows + labels */}
        <text x="120" y="210" fill="#22d3ee" fontSize="12" fontWeight="700">O₂ in</text>
        <text x="180" y="210" fill="#94a3b8" fontSize="12" fontWeight="700">CO₂ out</text>
        <text x="76" y="208" fontSize="10" fill="#38bdf8">left lung</text>
        <text x="196" y="208" fontSize="10" fill="#38bdf8">right lung</text>
        <text x="140" y="11" fontSize="10" fill="#64748b">trachea (windpipe)</text>

        {/* Inhale / exhale arrow */}
        {(expanding || inhaling) && (
          <path d="M 160,4 L 160,16 M 156,12 L 160,16 L 164,12" stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {!expanding && !inhaling && (
          <path d="M 160,16 L 160,4 M 156,8 L 160,4 L 164,8" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
      </svg>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setBreathing((b) => !b);
            log(breathing ? "paused and studied the lung diagram" : "watched the lungs breathe in and out");
          }}
          className={
            "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition " +
            (breathing ? "bg-sky-500 text-black hover:bg-sky-400" : "border border-white/10 bg-white/5 text-white")
          }
        >
          {breathing ? <Pause size={15} /> : <Play size={15} />}
          {breathing ? "Pause" : "Breathe"}
        </button>
        <p className="text-sm text-slate-200">
          <span className="font-semibold text-sky-300">{phase}</span>
        </p>
      </div>
      <p className="mt-2 text-sm text-slate-200">
        Air travels down the <span className="font-semibold text-slate-300">trachea</span>, through the
        branching <span className="font-semibold text-sky-300">bronchi</span>, into the lobes where tiny{" "}
        <span className="font-semibold text-sky-300">alveoli</span> swap O₂ for CO₂.
      </p>
    </div>
  );
}

/* =========================================================================
   SKELETON / MUSCLES — elbow flex: biceps bulge, triceps relax (opposing pair)
   ========================================================================= */

export function SkeletonSim({ title, onComplete }: SimProps) {
  const [flex, setFlex] = useState(0);
  const log = useLogOnce(onComplete, title);
  const angle = flex * 135; // degrees the forearm lifts
  const bicepBulge = 1 + flex * 1.1; // contracts → bulges
  const tricepBulge = 1.4 - flex * 0.9; // relaxes → flattens

  return (
    <div>
      <svg viewBox="0 0 320 220" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black">
        {/* Shoulder joint */}
        <circle cx="56" cy="90" r="12" fill="#e2e8f0" />
        <text x="26" y="76" fill="#94a3b8" fontSize="10">shoulder</text>

        {/* Upper arm bone (humerus) */}
        <line x1="56" y1="90" x2="170" y2="100" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />

        {/* Triceps (back of arm, below bone) — relaxes on flex */}
        <ellipse
          cx="110"
          cy={118 + flex * 10}
          rx={56}
          ry={11 * tricepBulge}
          fill="#a78bfa"
          opacity="0.7"
        />
        {/* Biceps (front of arm, above bone) — contracts/bulges on flex */}
        <ellipse
          cx="112"
          cy={80 - flex * 14}
          rx={54}
          ry={9 * bicepBulge}
          fill="#f472b6"
          opacity="0.85"
          style={{ filter: flex > 0.5 ? "drop-shadow(0 0 8px rgba(244,114,182,0.6))" : "none" }}
        />

        {/* Elbow joint */}
        <circle cx="170" cy="100" r="10" fill="#fbbf24" />
        <text x="150" y="128" fill="#fbbf24" fontSize="10">elbow</text>

        {/* Forearm (rotates up around elbow) */}
        <g transform={`rotate(${-angle} 170 100)`}>
          <line x1="170" y1="100" x2="288" y2="100" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
          {/* Hand */}
          <circle cx="292" cy="100" r="9" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
          {/* Dumbbell weight in hand (shows why you flex) */}
          <rect x="296" y="86" width="9" height="28" rx="2" fill="#475569" />
        </g>

        {/* Labels with live state */}
        <text x="70" y="56" fill="#f472b6" fontSize="12" fontWeight="700">
          Biceps {flex > 0.5 ? "● contracting" : "relaxed"}
        </text>
        <text x="60" y="160" fill="#a78bfa" fontSize="12" fontWeight="700">
          Triceps {flex > 0.5 ? "relaxed" : "● contracting"}
        </text>
      </svg>
      <div className="mt-4 space-y-2">
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bone size={13} className="text-amber-300" /> Bend elbow: {Math.round(angle)}°
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={flex * 100}
            onChange={(e) => {
              setFlex(Number(e.target.value) / 100);
              if (Number(e.target.value) > 50) {
                log("bent the elbow — biceps contracted (bulged) while triceps relaxed");
              }
            }}
            className="w-full accent-amber-500"
          />
        </label>
        <p className="text-sm text-slate-200">
          Muscles work in <span className="font-semibold text-pink-300">opposing pairs</span>. To lift,
          the <span className="text-pink-300">biceps</span> contract (bulge) while the{" "}
          <span className="text-violet-300">triceps</span> relax.
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   DIGESTIVE — body cross-section, food dot travels the tract organ-by-organ
   ========================================================================= */

const DIGEST_STAGES = [
  { label: "Mouth", desc: "Teeth grind food; saliva begins breaking it down.", color: "#fbbf24", x: 160, y: 46 },
  { label: "Stomach", desc: "Acid churns food into a mush.", color: "#f97316", x: 124, y: 116 },
  { label: "Small intestine", desc: "Nutrients soak into the blood.", color: "#22c55e", x: 170, y: 168 },
  { label: "Large intestine", desc: "Water is reclaimed; waste forms.", color: "#3b82f6", x: 210, y: 168 },
];

export function DigestiveSim({ title, onComplete }: SimProps) {
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(false);
  const log = useLogOnce(onComplete, title);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setStage((s) => (s + 1) % DIGEST_STAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, [auto]);

  const current = DIGEST_STAGES[stage];

  return (
    <div>
      <svg viewBox="0 0 320 220" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-950 to-black">
        {/* Head */}
        <circle cx="160" cy="40" r="24" fill="rgba(252,165,165,0.18)" stroke="#475569" strokeWidth="1.5" />
        {/* Neck */}
        <rect x="150" y="62" width="20" height="14" fill="rgba(252,165,165,0.18)" stroke="#475569" strokeWidth="1.5" />
        {/* Torso */}
        <path
          d="M 96,80 C 96,74 224,74 224,80 L 236,180 C 236,210 84,210 84,180 Z"
          fill="rgba(252,165,165,0.10)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Esophagus */}
        <line x1="160" y1="76" x2="150" y2="106" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

        {/* Stomach (J-shape) */}
        <path
          d="M 150,106 C 132,104 110,112 108,134 C 106,156 128,166 146,156 C 150,150 150,132 150,120 Z"
          fill={stage === 1 ? "rgba(249,115,22,0.4)" : "rgba(100,116,139,0.25)"}
          stroke={stage === 1 ? "#f97316" : "#475569"}
          strokeWidth="2"
        />

        {/* Small intestine (coiled) */}
        <g
          fill="none"
          stroke={stage === 2 ? "#22c55e" : "#3a4a5e"}
          strokeWidth={stage === 2 ? 5 : 3.5}
          strokeLinecap="round"
          opacity={stage === 2 ? 1 : 0.7}
        >
          <path d="M 150,158 C 130,150 130,170 150,170 C 170,170 170,150 150,150 C 130,150 130,168 148,166" />
          <path d="M 150,168 C 172,176 172,156 152,158" />
        </g>

        {/* Large intestine (frame) */}
        <path
          d="M 116,118 C 92,120 92,176 116,182 L 200,182 C 224,176 224,120 200,118"
          fill="none"
          stroke={stage === 3 ? "#3b82f6" : "#3a4a5e"}
          strokeWidth={stage === 3 ? 5 : 3.5}
          strokeLinecap="round"
          opacity={stage === 3 ? 1 : 0.7}
        />

        {/* Food dot travelling */}
        <circle
          cx={current.x}
          cy={current.y}
          r="8"
          fill="#fde047"
          stroke="#f59e0b"
          strokeWidth="2"
          style={{ transition: "cx 0.6s ease, cy 0.6s ease", filter: "drop-shadow(0 0 6px #fde047)" }}
        />

        {/* Organ labels */}
        <text x="178" y="36" fontSize="9" fill="#fbbf24">mouth</text>
        <text x="74" y="132" fontSize="9" fill="#f97316">stomach</text>
        <text x="118" y="196" fontSize="9" fill="#22c55e">small intestine</text>
        <text x="196" y="196" fontSize="9" fill="#3b82f6">large intestine</text>
      </svg>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setStage((s) => {
              const next = (s + 1) % DIGEST_STAGES.length;
              log(`followed food into the ${DIGEST_STAGES[next].label.toLowerCase()}`);
              return next;
            });
          }}
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
        >
          <Utensils size={15} /> Next stage
        </button>
        <button
          type="button"
          onClick={() => setAuto((a) => !a)}
          className={
            "rounded-xl px-4 py-2 text-sm font-semibold transition " +
            (auto ? "bg-orange-500 text-black hover:bg-orange-400" : "border border-white/10 bg-white/5 text-white hover:bg-white/10")
          }
        >
          {auto ? "Stop auto" : "Auto-play"}
        </button>
        <p className="text-sm text-slate-200">
          <span className="font-semibold" style={{ color: current.color }}>{current.label}</span>: {current.desc}
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   BRAIN / NERVES — reflex arc: signal up to brain AND motor signal back down
   ========================================================================= */

export function BrainSim({ title, onComplete }: SimProps) {
  const [progress, setProgress] = useState(0); // 0..1 of the full reflex arc
  const [running, setRunning] = useState(false);
  const log = useLogOnce(onComplete, title);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.022;
      setProgress(Math.min(1, t));
      if (t >= 1) {
        setRunning(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  useEffect(() => {
    if (progress >= 1 && !running) {
      log("triggered the reflex — the signal raced to the brain and the hand pulled away");
    }
  }, [progress, running, log]);

  // sensory signal goes up (hand → brain) in first half; motor comes back in second half
  const sensoryUp = progress <= 0.5;
  const sensoryT = sensoryUp ? progress * 2 : 1; // 0..1 up the cord
  const motorT = sensoryUp ? 0 : (progress - 0.5) * 2; // 0..1 back down
  const cordTop = 64;
  const cordBottom = 156;
  const sensoryY = cordBottom - sensoryT * (cordBottom - cordTop);
  const motorY = cordBottom - motorT * (cordBottom - cordTop);
  const handMoved = progress >= 1;

  return (
    <div>
      <svg viewBox="0 0 320 220" className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-violet-950/30 to-black">
        {/* Brain with folds */}
        <ellipse cx="160" cy="42" rx="52" ry="30" fill="#a78bfa" opacity="0.35" stroke="#c4b5fd" strokeWidth="2" />
        <g stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.6">
          <path d="M 120,40 C 128,28 140,30 146,42 C 152,30 164,30 170,42 C 176,30 188,30 194,42" />
          <path d="M 122,52 C 132,44 142,46 148,54 C 154,46 166,46 172,54 C 178,46 188,46 196,52" />
        </g>
        <text x="142" y="48" fill="#ddd6fe" fontSize="12" fontWeight="700">Brain</text>

        {/* Spinal cord */}
        <line x1="160" y1={cordTop} x2="160" y2={cordBottom} stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
        <text x="170" y="116" fill="#64748b" fontSize="10">spinal cord</text>

        {/* Hot stove */}
        <rect x="120" y="186" width="80" height="10" rx="2" fill="#ef4444" opacity="0.8" />
        <text x="128" y="184" fill="#fca5a5" fontSize="9">🔥 hot stove</text>

        {/* Hand (pulls away when reflex completes) */}
        <circle
          cx={handMoved ? 196 : 160}
          cy={handMoved ? 168 : 178}
          r="11"
          fill="#fca5a5"
          stroke="#ef4444"
          strokeWidth="2"
          style={{ transition: "cx 0.15s ease, cy 0.15s ease" }}
        />
        <text x={handMoved ? 206 : 142} y="178" fill="#fca5a5" fontSize="10">hand</text>

        {/* Sensory signal (yellow, going up) */}
        {running && progress < 0.5 && (
          <circle cx="160" cy={sensoryY} r="6" fill="#fde047" style={{ filter: "drop-shadow(0 0 8px #fde047)" }} />
        )}
        {/* Motor signal (green, coming back down) */}
        {running && progress >= 0.5 && (
          <circle cx="160" cy={motorY} r="6" fill="#22c55e" style={{ filter: "drop-shadow(0 0 8px #22c55e)" }} />
        )}

        {/* Direction arrows */}
        {running && progress < 0.5 && (
          <text x="172" y={sensoryY} fill="#fde047" fontSize="14">↑ signal up</text>
        )}
        {running && progress >= 0.5 && progress < 1 && (
          <text x="172" y={motorY} fill="#22c55e" fontSize="14">↓ pull back!</text>
        )}
        {progress >= 1 && (
          <text x="196" y="150" fill="#22c55e" fontSize="11" fontWeight="700">✓ Pulled away!</text>
        )}
      </svg>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={running}
          onClick={() => {
            setProgress(0);
            setRunning(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-40"
        >
          <Brain size={15} /> Touch hot stove!
        </button>
        <p className="text-sm text-slate-200">
          {running
            ? progress < 0.5
              ? "Sensory signal racing up to the brain…"
              : "Brain sending the message: pull away!"
            : progress >= 1
              ? "Reflex complete — you reacted before you even thought about it!"
              : "Tap the button. The signal races to the brain and zips back down the nerve."}
        </p>
      </div>
    </div>
  );
}
