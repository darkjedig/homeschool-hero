"use client";

import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { SpaceArt } from "@/components/shared/space-art";
import { GetHelpDrawer } from "./get-help-drawer";

/** "Need a Hint?" card that opens the adaptive Get Help drawer. */
export function HintCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="hint-card flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <SpaceArt kind="robot" className="h-24 w-20 shrink-0" />
        <div className="mr-auto">
          <p className="text-sm font-semibold text-white">Need a Hint?</p>
          <p className="text-xs text-muted-foreground">Stuck? Ask for help.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/30"
        >
          <LifeBuoy size={16} />
          Ask for Help
        </button>
      </section>

      <GetHelpDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
