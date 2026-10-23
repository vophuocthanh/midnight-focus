/**
 * Looping video behind the focus screen. It is hidden under reduced motion, and a dark wash
 * keeps the timer and text readable over bright frames.
 */
export function FocusBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <video
        className="absolute inset-0 size-full object-cover object-center motion-reduce:hidden"
        src="/backgrounds/focus-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/45 via-background/15 to-background/55" />
    </div>
  );
}
