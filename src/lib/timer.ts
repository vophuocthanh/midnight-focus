import type { Durations, TimerMode, TimerState } from "../types";

export const MODES: TimerMode[] = ["focus", "shortBreak", "longBreak"];

export const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

export const DEFAULT_DURATIONS: Durations = { focus: 25, shortBreak: 5, longBreak: 15 };

export const DURATION_LIMITS: Record<TimerMode, { min: number; max: number }> = {
  focus: { min: 1, max: 180 },
  shortBreak: { min: 1, max: 60 },
  longBreak: { min: 1, max: 120 },
};

/** Progress shorter than this is discarded without a confirmation prompt. */
export const MEANINGFUL_PROGRESS_MS = 60_000;

export function nextMode(mode: TimerMode): TimerMode {
  return mode === "focus" ? "shortBreak" : "focus";
}

export function modeDurationMs(durations: Durations, mode: TimerMode): number {
  return durations[mode] * 60_000;
}

export function idleTimer(mode: TimerMode, durations: Durations): TimerState {
  const totalMs = modeDurationMs(durations, mode);
  return { mode, status: "idle", totalMs, remainingMs: totalMs, endsAt: null, startedAt: null, taskId: null };
}

export function remainingAt(timer: TimerState, now: number): number {
  if (timer.status === "running" && timer.endsAt !== null) return Math.max(0, timer.endsAt - now);
  return timer.remainingMs;
}

export function elapsedAt(timer: TimerState, now: number): number {
  return timer.totalMs - remainingAt(timer, now);
}
