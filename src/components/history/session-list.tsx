"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatMinutes } from "@/lib/format";
import { MODE_LABELS } from "@/lib/timer";
import { useAppState } from "@/state/app-state";

const RECENT_LIMIT = 25;

export function SessionList() {
  const { state } = useAppState();
  const recent = state.sessions.slice(0, RECENT_LIMIT);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent sessions</CardTitle>
        <CardDescription>Newest first. Up to {RECENT_LIMIT} are shown.</CardDescription>
      </CardHeader>
      <CardContent>
        {!state.hydrated ? (
          <div className="h-24 animate-pulse rounded-xl bg-elevated" aria-hidden />
        ) : recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            No completed sessions yet. Finish a focus session and it will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {session.taskTitle ?? (session.mode === "focus" ? "No task" : "Break")}
                  </p>
                  <p className="text-sm text-text-secondary">{formatDateTime(session.completedAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm tabular-nums text-text-secondary">{formatMinutes(session.durationSec)}</span>
                  <Badge variant="secondary">{MODE_LABELS[session.mode]}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
