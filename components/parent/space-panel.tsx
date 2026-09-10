import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { hexToRgb } from "@/lib/subjects";

export function Panel({
  title,
  subtitle,
  accent = "#3b82f6",
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
}) {
  const rgb = hexToRgb(accent);
  return (
    <section
      className="space-panel"
      style={{ boxShadow: `0 0 24px rgba(${rgb},0.08)` }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className="h-5 w-1 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }}
        />
        <div>
          <h3 className="text-base font-semibold text-cyan-300">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Stat({
  icon: Icon,
  color,
  value,
  label,
  href,
}: {
  icon: LucideIcon;
  color: string;
  value: string;
  label: string;
  href?: string;
}) {
  const rgb = hexToRgb(color);
  const inner = (
    <>
      <div
        className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
        style={{ backgroundColor: `${color}22`, boxShadow: `0 0 18px ${color}55` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-white xl:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </>
  );
  const cls = `relative block overflow-hidden rounded-2xl border bg-gradient-to-b from-white/[0.07] to-transparent p-5 backdrop-blur-md transition hover:-translate-y-0.5 ${
    href ? "cursor-pointer hover:brightness-110" : ""
  }`;
  const style = {
    borderColor: `${color}33`,
    boxShadow: `0 0 24px rgba(${rgb},0.14)`,
  };
  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}
