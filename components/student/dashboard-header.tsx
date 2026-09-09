import Link from "next/link";
import { Gem, Star, User } from "lucide-react";
import { AiMascot } from "./ai-mascot";

export function DashboardHeader({ name = "there", points, badges }: { name?: string; points?: number; badges?: number }) {
  return <header className="dashboard-header flex flex-wrap items-center justify-between gap-4">
    <div><h1 className="text-2xl font-bold text-white">Welcome back, <span className="text-cyan-400">{name}!</span> <span aria-hidden>👋</span></h1><p className="mt-2 text-sm text-muted-foreground">Ready to learn, build, and level up? Let&apos;s go!</p></div>
    <AiMascot />
    <div className="flex items-center gap-4"><div className="flex items-center gap-5 rounded-xl border border-cyan-400/15 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold"><Link href="/rewards" className="flex items-center gap-2" aria-label="Points and rewards"><Gem size={23} className="text-cyan-400" />{points?.toLocaleString() ?? "—"}</Link><Link href="/progress" className="flex items-center gap-2" aria-label="Achievements"><Star size={21} className="text-amber-400" />{badges ?? "—"}</Link></div><Link href="/settings" aria-label="Profile settings" className="rounded-full border border-blue-200/25 p-2 text-blue-200"><User size={22} /></Link></div>
  </header>;
}
