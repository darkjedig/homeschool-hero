import Link from "next/link";
import { Rocket, Headphones, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Reward = { title: string; cost: number; icon: LucideIcon };

const DEFAULTS: Reward[] = [
  { title: "Neon Rocket", cost: 500, icon: Rocket },
  { title: "Galaxy Headset", cost: 800, icon: Headphones },
  { title: "Hero Cape", cost: 1200, icon: Sparkles },
];

/** Reward Shop strip — row of reward chips (matches dashboard footer). */
export function RewardShopStrip({ rewards = DEFAULTS }: { rewards?: Reward[] }) {
  return (
    <section className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <h3 className="mb-3 text-sm font-semibold text-white">Reward Shop</h3>
      <div className="flex flex-wrap gap-2">
        {rewards.map((r) => (
          <Link
            key={r.title}
            href="/rewards"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white transition hover:border-yellow-400/40"
          >
            <r.icon size={14} className="text-yellow-300" />
            {r.title}
            <span className="font-semibold text-yellow-300">⭐ {r.cost}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
