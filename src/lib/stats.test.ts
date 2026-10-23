import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, focusStreak, startOfDay, todayStats, weeklyFocus } from "./stats";
import type { SessionRecord } from "../types";

const at = (day: number, hour: number) => {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
};
const focus = (completedAt: number, durationSec = 1500): SessionRecord => ({
  id: String(completedAt),
  taskId: null,
  taskTitle: null,
  mode: "focus",
  durationSec,
  completedAt,
});

test("today's totals only include focus sessions from today", () => {
  const now = new Date(2026, 9, 23, 15).getTime();
  const sessions = [
    focus(at(now, 9)),
    focus(at(now, 10), 600),
    focus(at(addDays(startOfDay(now), -1), 22)),
    { ...focus(at(now, 11)), mode: "shortBreak" as const },
  ];
  assert.deepEqual(todayStats(sessions, now), { focusSeconds: 2100, sessionCount: 2 });
});

test("weekly trend has seven days ending today", () => {
  const now = new Date(2026, 9, 23, 15).getTime();
  const week = weeklyFocus([focus(at(addDays(startOfDay(now), -6), 9))], now);
  assert.equal(week.length, 7);
  assert.equal(week[0].seconds, 1500);
  assert.equal(week[6].seconds, 0);
});

test("streak counts back from today, or from yesterday if today is empty", () => {
  const now = new Date(2026, 9, 23, 15).getTime();
  const days = (n: number) => Array.from({ length: n }, (_, i) => focus(at(addDays(startOfDay(now), -i - 1), 9)));
  assert.equal(focusStreak(days(3), now), 3, "yesterday and before, today empty");
  assert.equal(focusStreak([focus(at(now, 9)), ...days(2)], now), 3, "today plus two prior days");
  assert.equal(focusStreak([], now), 0);
});
