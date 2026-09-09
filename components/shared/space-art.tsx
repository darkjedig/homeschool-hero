/** Decorative generated artwork; all labels and controls remain native HTML. */
export function SpaceArt({ kind, className = "" }: { kind: "robot" | "planets" | "controller"; className?: string }) {
  return <div aria-hidden="true" className={`space-art space-art-${kind} ${className}`} />;
}
