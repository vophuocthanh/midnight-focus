import type { SessionRecord } from "../types";

/** Local midnight for the day containing `timestamp`. */
export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** DST-safe: adds calendar days in local time. */
export function addDays(dayStart: number, days: number): number {
  const date = new Date(dayStart);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

function focusSessionsBetween(sessions: SessionRecord[], from: number, to: number): SessionRecord[] {
  return sessions.filter((s) => s.mode === "focus" && s.completedAt >= from && s.completedAt < to);
}

function sumSeconds(sessions: SessionRecord[]): number {
  return sessions.reduce((total, s) => total + s.durationSec, 0);
}

export function todayStats(sessions: SessionRecord[], now: number) {
  const start = startOfDay(now);
  const today = focusSessionsBetween(sessions, start, addDays(start, 1));
  return { focusSeconds: sumSeconds(today), sessionCount: today.length };
}

export function totalFocusSessions(sessions: SessionRecord[]): number {
  return sessions.filter((s) => s.mode === "focus").length;
}

/** Focus seconds for each of the last seven days, oldest first, ending today. */
export function weeklyFocus(sessions: SessionRecord[], now: number) {
  const today = startOfDay(now);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6);
    const seconds = sumSeconds(focusSessionsBetween(sessions, day, addDays(day, 1)));
    return { day, seconds };
  });
}

/** Consecutive days with at least one focus session, counting back from today (or yesterday). */
export function focusStreak(sessions: SessionRecord[], now: number): number {
  const activeDays = new Set(
    sessions.filter((s) => s.mode === "focus").map((s) => startOfDay(s.completedAt))
  );
  let day = startOfDay(now);
  if (!activeDays.has(day)) day = addDays(day, -1);
  let streak = 0;
  while (activeDays.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}
