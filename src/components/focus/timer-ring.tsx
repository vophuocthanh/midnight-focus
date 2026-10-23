import { formatClock } from "@/lib/format";
import { MODE_LABELS } from "@/lib/timer";
import { cn } from "@/lib/utils";
import type { TimerMode, TimerStatus } from "@/types";

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STATUS_TEXT: Record<TimerStatus, string> = {
  idle: "Ready to focus",
  running: "Session in progress",
  paused: "Paused",
};

interface TimerRingProps {
  mode: TimerMode;
  status: TimerStatus;
  remainingMs: number;
  totalMs: number;
}

export function TimerRing({ mode, status, remainingMs, totalMs }: TimerRingProps) {
  const progress = totalMs > 0 ? 1 - remainingMs / totalMs : 0;
  const label = formatClock(remainingMs);

  return (
    <div className="relative mx-auto grid aspect-square w-[min(80vw,20rem)] place-items-center animate-in fade-in-0 zoom-in-95 duration-700 ease-calm sm:w-80">
      <div
        aria-hidden
        className={cn(
          "absolute inset-[14%] rounded-full bg-primary/25 blur-3xl transition-opacity duration-700",
          status === "running" ? "opacity-100" : "opacity-0"
        )}
      />
      <svg viewBox="0 0 240 240" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="timer-ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--mf-accent)" }} />
            <stop offset="100%" style={{ stopColor: "var(--mf-info)" }} />
          </linearGradient>
        </defs>
        <circle cx="120" cy="120" r={RADIUS} fill="none" strokeWidth={6} className="stroke-elevated" />
        <circle
          cx="120"
          cy="120"
          r={RADIUS}
          fill="none"
          strokeWidth={6}
          stroke="url(#timer-ring-gradient)"
          strokeLinecap={progress > 0 ? "round" : "butt"}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>

      <div role="timer" aria-label={`${MODE_LABELS[mode]}, ${label} remaining`} className="relative flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-text-secondary">{MODE_LABELS[mode]}</p>
        <p className="text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl">{label}</p>
        <p className="text-sm text-text-secondary">{STATUS_TEXT[status]}</p>
      </div>
    </div>
  );
}
