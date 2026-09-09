import { SpaceArt } from "@/components/shared/space-art";

export function AiMascot({ message = "You've got this! Keep being awesome." }: { message?: string }) {
  return <div className="mascot-message flex items-center gap-2"><SpaceArt kind="robot" className="h-24 w-20 shrink-0" /><p className="max-w-40 rounded-xl border border-blue-400/20 bg-blue-950/30 px-3 py-2 text-xs leading-relaxed text-blue-100">{message}</p></div>;
}
