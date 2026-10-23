"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyProgressBar, useDailyProgress } from "@/components/layout/daily-progress";
import { formatMinutes } from "@/lib/format";
import { focusStreak, totalFocusSessions } from "@/lib/stats";
import { useAppState } from "@/state/app-state";

export function StatsCards() {
  const { state } = useAppState();
  const progress = useDailyProgress();
  const ready = state.hydrated;
  const goalMinutes = Math.round(progress.goalSeconds / 60);
  const streak = focusStreak(state.sessions, progress.now);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Focus today</CardDescription>
          <CardTitle className="text-2xl tabular-nums">{ready ? formatMinutes(progress.focusSeconds) : "—"}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Sessions today</CardDescription>
          <CardTitle className="text-2xl tabular-nums">{ready ? progress.sessionCount : "—"}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="gap-4">
        <CardHeader>
          <CardDescription>Daily goal</CardDescription>
          <CardTitle className="text-2xl tabular-nums">{ready ? `${Math.round(progress.ratio * 100)}%` : "—"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <DailyProgressBar ratio={ready ? progress.ratio : 0} />
          <p className="text-xs text-text-secondary">Goal: {goalMinutes} min per day</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Completed focus sessions</CardDescription>
          <CardTitle className="text-2xl tabular-nums">{ready ? totalFocusSessions(state.sessions) : "—"}</CardTitle>
          <p className="text-xs text-text-secondary">
            {ready && streak > 0 ? `${streak}-day streak` : "All time, saved in this browser"}
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}
