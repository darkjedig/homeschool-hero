import { Rocket } from "lucide-react";

/** Shared placeholder for student routes built in later phases. */
export function ComingSoon({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="grid place-items-center py-20 text-center">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.35)]">
          <Rocket size={26} className="text-blue-300" />
        </div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {note ?? "This section launches in a later build phase."}
        </p>
      </div>
    </div>
  );
}
