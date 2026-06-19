"use client";

import { useState } from "react";
import { Bot, LifeBuoy } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

/** "Need a Hint?" card that opens the Get Help drawer. */
export function HintCard() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <section className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/20 shadow-[0_0_16px_rgba(59,130,246,0.35)]">
          <Bot size={18} className="text-blue-300" />
        </div>
        <div className="mr-auto">
          <p className="text-sm font-semibold text-white">Need a Hint?</p>
          <p className="text-xs text-muted-foreground">Stuck? Ask for help.</p>
        </div>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/30"
          >
            <LifeBuoy size={16} />
            Ask for Help
          </button>
        </DrawerTrigger>
      </section>

      <DrawerContent className="border-white/10 bg-card text-foreground">
        <DrawerHeader>
          <DrawerTitle className="text-white">Get Help</DrawerTitle>
          <DrawerDescription>
            A simpler explanation and step-by-step hints will appear here
            (adaptive help arrives in a later phase).
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 text-sm text-muted-foreground">
          <p>
            Take a breath — you&apos;ve got this. Try breaking the problem into
            smaller steps, or rewatch the last part of the lesson.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
