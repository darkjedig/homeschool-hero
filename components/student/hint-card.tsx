"use client";

import { useState } from "react";
import { Bot, LifeBuoy } from "lucide-react";
import { GetHelpDrawer } from "./get-help-drawer";

/** "Need a Hint?" card that opens the adaptive Get Help drawer. */
export function HintCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/20 shadow-[0_0_16px_rgba(59,130,246,0.35)]">
          <Bot size={18} className="text-blue-300" />
        </div>
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
