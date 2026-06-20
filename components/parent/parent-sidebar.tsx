"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Rocket,
  LayoutDashboard,
  CalendarDays,
  FolderPlus,
  Library,
  BookCopy,
  ListChecks,
  Wand2,
  Gift,
  Download,
  Settings,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
  { label: "Calendar", href: "/parent/calendar", icon: CalendarDays },
  { label: "Subjects", href: "/parent/subjects", icon: Library },
  { label: "New Course", href: "/parent/courses/new", icon: FolderPlus },
  { label: "AI Builder", href: "/parent/ai-builder", icon: Wand2 },
  { label: "Lessons", href: "/parent/lessons", icon: BookCopy },
  { label: "Quizzes", href: "/parent/quizzes", icon: ListChecks },
  { label: "Rewards", href: "/parent/rewards", icon: Gift },
  { label: "Export", href: "/parent/history", icon: Download },
  { label: "Settings", href: "/parent/settings", icon: Settings },
];

export function ParentSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/5 bg-sidebar p-4 lg:flex">
      <Link href="/parent/dashboard" className="flex items-center gap-2 px-2 py-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/20 shadow-[0_0_16px_rgba(59,130,246,0.35)]">
          <Rocket size={20} className="text-blue-400" />
        </div>
        <span className="text-base font-bold text-white">
          Parent <span className="text-blue-400">Console</span>
        </span>
      </Link>

      <nav className="mt-4 flex flex-col gap-1" aria-label="Parent navigation">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
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

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-white">Signed in as Parent</p>
        <p className="mt-1">Back to{" "}
          <Link href="/dashboard" className="text-blue-400 hover:underline">
            Student view
          </Link>
        </p>
      </div>
    </aside>
  );
}
