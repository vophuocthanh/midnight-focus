"use client";

import { useAppState } from "@/state/app-state";
import { useNow } from "@/hooks/use-now";
import { todayStats } from "@/lib/stats";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Today's focus minutes against the daily goal. Used in the header and sidebar. */
export function useDailyProgress() {
  const { state } = useAppState();
  // Until the clock is known, values are zero. Callers only show them once `hydrated` is true.
  const now = useNow(60_000) ?? 0;
  const { focusSeconds, sessionCount } = todayStats(state.sessions, now);
  const goalSeconds = state.settings.dailyGoalMinutes * 60;
  const ratio = Math.min(1, focusSeconds / goalSeconds);
  return { focusSeconds, sessionCount, goalSeconds, ratio, hydrated: state.hydrated, now };
}

export function DailyProgressBar({ ratio, className }: { ratio: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-elevated", className)}>
      <div
        className="h-full rounded-full bg-linear-to-r from-primary to-info transition-[width] duration-500 ease-calm"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}

export function DailyProgressSummary() {
  const { focusSeconds, goalSeconds, ratio, hydrated } = useDailyProgress();
  const goalMinutes = Math.round(goalSeconds / 60);
  return (
    <div className="flex w-44 flex-col gap-1.5" aria-live="polite">
      <div className="flex items-baseline justify-between text-xs text-text-secondary">
        <span>Today</span>
        <span className="tabular-nums text-foreground">
          {hydrated ? formatMinutes(focusSeconds) : "—"} <span className="text-text-muted">/ {goalMinutes} min</span>
        </span>
      </div>
      <DailyProgressBar ratio={hydrated ? ratio : 0} />
    </div>
  );
}
