"use client";

import Link from "next/link";
import { Star } from "lucide-react";

/** Fixed bottom-right star FAB — primary quick action. */
export function FloatingActionButton({ href = "/rewards" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Quick rewards"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.55)] transition hover:scale-105 hover:bg-blue-400"
    >
      <Star size={24} fill="currentColor" />
    </Link>
  );
}
