"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinutes } from "@/lib/format";
import { weeklyFocus } from "@/lib/stats";
import { useAppState } from "@/state/app-state";
import { useDailyProgress } from "@/components/layout/daily-progress";

const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const fullDay = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" });

export function WeeklyChart() {
  const { state } = useAppState();
  const { now, goalSeconds } = useDailyProgress();
  const week = weeklyFocus(state.sessions, now);
  const peak = Math.max(goalSeconds, ...week.map((d) => d.seconds));
  const total = week.reduce((sum, d) => sum + d.seconds, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 7 days</CardTitle>
        <CardDescription>{state.hydrated ? `${formatMinutes(total)} of focus time` : "Loading your history"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex h-44 items-end gap-2 sm:gap-3">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-text-muted/60"
            style={{ bottom: `${(goalSeconds / peak) * 100}%` }}
          />
          {week.map(({ day, seconds }) => {
            const height = peak > 0 ? (seconds / peak) * 100 : 0;
            const label = `${fullDay.format(day)}: ${formatMinutes(seconds)}`;
            return (
              <div key={day} className="flex h-full flex-1 flex-col justify-end gap-2">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={label}
                        className="group flex h-full w-full flex-col justify-end rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    }
                  >
                    <span
                      className="w-full rounded-t-lg bg-linear-to-t from-primary/70 to-info/80 transition-[height,filter] duration-500 ease-calm group-hover:brightness-125"
                      style={{ height: `${height}%`, minHeight: seconds > 0 ? "4px" : "0" }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
                <span className="text-center text-xs text-text-secondary">{weekday.format(day)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-text-muted">Dashed line: daily goal</p>
      </CardContent>
    </Card>
  );
}
