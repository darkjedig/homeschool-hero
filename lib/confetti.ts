"use client";

import confetti from "canvas-confetti";

/** Fire a celebratory confetti burst (used on quiz success). */
export function celebrate() {
  const colors = ["#3b82f6", "#a855f7", "#22c55e", "#f97316", "#eab308"];
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors,
    disableForReducedMotion: true,
  });
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true,
    });
  }, 150);
}
