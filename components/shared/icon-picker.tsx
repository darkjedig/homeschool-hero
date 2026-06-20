"use client";

import { useMemo, useRef, useState, useEffect, createElement } from "react";
import {
  Rocket, Calculator, BookOpen, FlaskConical, Landmark, Cpu, Gamepad2,
  ChefHat, Hammer, Music, Palette, Globe, Leaf, Heart, Brain, Code,
  Atom, Bird, TreePine, Sun, Moon, Cloud, Map, Compass, Telescope,
  Microscope, Languages, PenTool, Briefcase, ShoppingBag, Wrench, Cog,
  Database, Flag, Crown, Gem, Trophy, Target, Lightbulb, Zap, Camera,
  Car, Plane, Ship, Bike, Mountain, Waves, Snowflake, Flame, Wind,
  Droplet, Plug, Battery, Cookie, Apple, Pizza, Coffee, IceCream,
  Utensils, Backpack, Pencil, Brush, Scissors, Ruler, Compass as CompassIcon,
  Calendar, Clock, Star, Bell, Bookmark, Gift, Key, Lock, Eye, Glasses,
  type LucideIcon,
} from "lucide-react";

// Curated set of subject-relevant Lucide icons (keeps the bundle small).
const ICONS: Record<string, LucideIcon> = {
  Rocket, Calculator, BookOpen, FlaskConical, Landmark, Cpu, Gamepad2,
  ChefHat, Hammer, Music, Palette, Globe, Leaf, Heart, Brain, Code, Atom,
  Bird, TreePine, Sun, Moon, Cloud, Map, Compass, Telescope, Microscope,
  Languages, PenTool, Briefcase, ShoppingBag, Wrench, Cog, Database, Flag,
  Crown, Gem, Trophy, Target, Lightbulb, Zap, Camera, Car, Plane, Ship,
  Bike, Mountain, Waves, Snowflake, Flame, Wind, Droplet, Plug, Battery,
  Cookie, Apple, Pizza, Coffee, IceCream, Utensils, Backpack, Pencil,
  Brush, Scissors, Ruler, Calendar, Clock, Star, Bell, Bookmark, Gift,
  Key, Lock, Eye, Glasses,
};
void CompassIcon;

export const ICON_NAMES = Object.keys(ICONS).sort();
export const FALLBACK_ICON = Rocket;
export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? FALLBACK_ICON;
}

/** Renders a Lucide icon by name (createElement avoids creating a component
 *  variable during render, which the linter disallows). */
export function DynamicIcon({ name, size = 18 }: { name: string; size?: number }) {
  return createElement(getIcon(name), { size });
}

/** Searchable Lucide icon picker. */
export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(
    () =>
      ICON_NAMES.filter((n) =>
        n.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white"
      >
        <DynamicIcon name={value} size={18} />
        <span className="flex-1 text-left">{value || "Pick an icon"}</span>
        <span className="text-xs text-muted-foreground">▾</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-popover p-2 shadow-xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            className="mb-2 w-full rounded-md border border-white/10 bg-card px-2 py-1.5 text-sm text-white"
          />
          <div className="grid max-h-56 grid-cols-6 gap-1 overflow-y-auto">
            {filtered.map((name) => {
              const active = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={
                    "grid h-9 w-full place-items-center rounded-md transition " +
                    (active
                      ? "bg-blue-500/30 text-blue-300"
                      : "text-muted-foreground hover:bg-white/10 hover:text-white")
                  }
                >
                  <DynamicIcon name={name} size={18} />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-6 py-3 text-center text-xs text-muted-foreground">
                No icons match.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
