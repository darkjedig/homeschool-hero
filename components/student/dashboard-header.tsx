import { Bell, Gem, Star, User } from "lucide-react";
import { AiMascot } from "./ai-mascot";

/**
 * Dashboard header row: greeting + mascot (left) and quick stats + bell +
 * avatar (right). Values are mockup placeholders pending live Convex data.
 */
export function DashboardHeader({ name = "Hudson" }: { name?: string }) {
  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white xl:text-3xl">
            Welcome back, {name}! <span aria-hidden>👋</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Ready to learn, build, and level up? Let&apos;s go!
          </p>
        </div>
        <AiMascot />
      </div>

      <div className="flex items-center gap-4">
        <StatPill icon={<Gem size={16} className="text-blue-400" />} value="2,450" />
        <StatPill icon={<Star size={16} className="text-yellow-400" />} value="18" />
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}

function StatPill({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md">
      {icon}
      {value}
    </div>
  );
}
