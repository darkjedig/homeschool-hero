"use client";

/** One value per JS session so Convex query args stay stable across remounts. */
const SESSION_NOW = Date.now();

export function useStableNow(): number {
  return SESSION_NOW;
}
