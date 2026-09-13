/** Isolated Cosmo face cropped from the space-art sprite. */
export function CosmoAvatar({
  className = "",
  round = true,
}: {
  className?: string;
  round?: boolean;
}) {
  return (
    <img
      src="/images/cosmo-robot.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={
        (round ? "rounded-full object-cover object-[center_32%] " : "object-contain ") +
        "pointer-events-none select-none " +
        className
      }
    />
  );
}
