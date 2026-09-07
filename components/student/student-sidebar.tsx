"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Rocket,
  Home,
  BookOpen,
  PlayCircle,
  ListChecks,
  CalendarDays,
  CalendarCheck,
  Gift,
  Trophy,
  Settings,
  Flame,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const NAV = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Calendar", href: "/calendar", icon: CalendarCheck },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Lessons", href: "/lessons", icon: PlayCircle },
  { label: "Quizzes", href: "/quiz", icon: ListChecks },
  { label: "Friday Challenge", href: "/friday-quiz", icon: CalendarDays },
  { label: "Rewards", href: "/rewards", icon: Gift },
  { label: "Progress", href: "/progress", icon: Trophy },
  { label: "Settings", href: "/settings", icon: Settings },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function StudentSidebar() {
  const pathname = usePathname();
  const activeIndex = NAV.findIndex(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/"),
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/5 bg-sidebar p-4 lg:flex">
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/20 shadow-[0_0_16px_rgba(59,130,246,0.35)]">
          <Rocket size={20} className="text-blue-400" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Homeschool<span className="text-blue-400">Hero</span>
        </span>
      </div>

      <nav className="mt-4 flex flex-col gap-1" aria-label="Student navigation">
        {NAV.map((item, i) => {
          const active = i === activeIndex;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition " +
                (active
                  ? "bg-blue-500/20 text-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.25)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white")
              }
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <ProfileCard />
        <StreakTracker />
      </div>
    </aside>
  );
}

function ProfileCard() {
  const overview = useQuery(api.dashboard.studentOverview);
  const profile = useQuery(api.userProfiles.getMine);
  const name = profile?.displayName ?? "Student";
  const rank = overview?.levelTitle ?? "Rookie";
  const xpInto = overview?.xpIntoLevel;
  const xpFor = overview?.xpForLevel ?? 250;
  const progress = overview?.levelProgress ?? 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{rank}</p>
        </div>
        <span className="ml-auto rounded-lg bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300">
          Lv {overview?.level ?? "—"}
        </span>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
          <span>{xpInto !== undefined ? `${xpInto.toLocaleString()} XP` : "—"}</span>
          <span>{xpFor.toLocaleString()} XP</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}

function StreakTracker() {
  const overview = useQuery(api.dashboard.studentOverview);
  const streak = overview?.streak ?? 0;
  const activity = overview?.weekActivity;
  const todayIdx = overview?.weekTodayIndex;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Flame size={16} className="text-orange-400" />
        <span className="text-sm font-semibold text-white">
          {streak} Day{streak === 1 ? "" : "s"} Streak!
        </span>
      </div>
      <div className="flex justify-between">
        {DAYS.map((d, i) => {
          const hasActivity = activity?.[i] === true;
          const isToday = todayIdx === i;
          return (
            <div
              key={i}
              className={
                "grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold " +
                (isToday
                  ? "bg-orange-500/30 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                  : hasActivity
                    ? "bg-green-500/25 text-green-300"
                    : "bg-white/5 text-muted-foreground")
              }
            >
              {hasActivity ? "✓" : d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
