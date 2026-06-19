import type { LucideIcon } from "lucide-react";
import {
  Calculator,
  BookOpen,
  FlaskConical,
  Landmark,
  Cpu,
  Gamepad2,
  ChefHat,
  Hammer,
  Rocket,
} from "lucide-react";

export type SubjectSlug =
  | "maths"
  | "english"
  | "science"
  | "history"
  | "ai-and-computer-science"
  | "game-development"
  | "homemaking"
  | "building-and-construction";

export type SubjectMeta = {
  slug: string;
  name: string;
  shortName: string;
  color: string;
  icon: LucideIcon;
};

/**
 * HomeschoolHero subject metadata — single source of truth for accent
 * colours and icons. Values mirror .cursor/skills/design/SKILL.md.
 * `color` is the raw hex (used for inline styles / glow shadows).
 */
export const SUBJECTS: Record<string, SubjectMeta> = {
  maths: {
    slug: "maths",
    name: "Maths",
    shortName: "Maths",
    color: "#3b82f6",
    icon: Calculator,
  },
  english: {
    slug: "english",
    name: "English",
    shortName: "English",
    color: "#a855f7",
    icon: BookOpen,
  },
  science: {
    slug: "science",
    name: "Science",
    shortName: "Science",
    color: "#22c55e",
    icon: FlaskConical,
  },
  history: {
    slug: "history",
    name: "History",
    shortName: "History",
    color: "#f97316",
    icon: Landmark,
  },
  "ai-and-computer-science": {
    slug: "ai-and-computer-science",
    name: "AI & Computer Science",
    shortName: "AI & CS",
    color: "#06b6d4",
    icon: Cpu,
  },
  "game-development": {
    slug: "game-development",
    name: "Game Development",
    shortName: "Game Dev",
    color: "#ec4899",
    icon: Gamepad2,
  },
  homemaking: {
    slug: "homemaking",
    name: "Homemaking",
    shortName: "Home",
    color: "#f43f5e",
    icon: ChefHat,
  },
  "building-and-construction": {
    slug: "building-and-construction",
    name: "Building & Construction",
    shortName: "Building",
    color: "#d97706",
    icon: Hammer,
  },
};

export const ROCKET_ICON = Rocket;

export function subjectMeta(slug: string): SubjectMeta {
  return (
    SUBJECTS[slug] ?? {
      slug,
      name: slug,
      shortName: slug,
      color: "#3b82f6",
      icon: Rocket,
    }
  );
}

/** Convert "#3b82f6" → "59,130,246" for rgba() glow shadows. */
export function hexToRgb(hex: string): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
