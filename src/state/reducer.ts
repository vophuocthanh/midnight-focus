import type { AppState, Completion, LearningTask, PersistedState, SessionRecord, Settings, TimerMode, TimerState } from "../types";
import { DEFAULT_DURATIONS, idleTimer, nextMode, remainingAt } from "../lib/timer";

export const DEFAULT_SETTINGS: Settings = {
  durations: DEFAULT_DURATIONS,
  dailyGoalMinutes: 120,
  autoStartBreaks: false,
  autoStartFocus: false,
  sound: true,
  notifications: false,
  reducedMotion: false,
};

export function createInitialState(): AppState {
  return {
    hydrated: false,
    settings: DEFAULT_SETTINGS,
    tasks: [],
    sessions: [],
    timer: idleTimer("focus", DEFAULT_SETTINGS.durations),
    selectedTaskId: null,
    completion: null,
  };
}

export type Action =
  | { type: "hydrate"; state: PersistedState | null }
  | { type: "start"; now: number }
  | { type: "pause"; now: number }
  | { type: "reset" }
  | { type: "skip" }
  | { type: "setMode"; mode: TimerMode }
  | { type: "complete"; now: number }
  | { type: "dismissCompletion" }
  | { type: "selectTask"; taskId: string | null }
  | { type: "addTask"; task: LearningTask }
  | { type: "updateTask"; task: LearningTask }
  | { type: "deleteTask"; taskId: string }
  | { type: "toggleTaskDone"; taskId: string }
  | { type: "setSettings"; settings: Settings }
  | { type: "resetAll" };

function withTimer(state: AppState, timer: TimerState): AppState {
  return { ...state, timer };
}

/** Idle timers always show the current settings; running and paused ones keep their own length. */
function syncIdleTimer(state: AppState, mode: TimerMode): AppState {
  return withTimer(state, idleTimer(mode, state.settings.durations));
}

function taskTitle(tasks: LearningTask[], taskId: string | null): string | null {
  return tasks.find((t) => t.id === taskId)?.title ?? null;
}

function completeTimer(state: AppState, now: number): AppState {
  const { timer } = state;
  // Ignore stale or early calls. Only a running timer that has reached its deadline completes.
  if (timer.status !== "running" || timer.endsAt === null || timer.startedAt === null) return state;
  if (timer.endsAt > now) return state;

  const record: SessionRecord = {
    id: `session-${timer.startedAt}`,
    taskId: timer.taskId,
    taskTitle: taskTitle(state.tasks, timer.taskId),
    mode: timer.mode,
    durationSec: Math.round(timer.totalMs / 1000),
    completedAt: now,
  };

  const tasks =
    timer.mode === "focus" && timer.taskId
      ? state.tasks.map((t) =>
          t.id === timer.taskId ? { ...t, completedSessions: t.completedSessions + 1 } : t
        )
      : state.tasks;

  const next = nextMode(timer.mode);
  const autoStart = timer.mode === "focus" ? state.settings.autoStartBreaks : state.settings.autoStartFocus;
  const total = idleTimer(next, state.settings.durations).totalMs;
  const nextTimer: TimerState = autoStart
    ? {
        ...idleTimer(next, state.settings.durations),
        status: "running",
        startedAt: now,
        endsAt: now + total,
        taskId: next === "focus" ? state.selectedTaskId : null,
      }
    : idleTimer(next, state.settings.durations);

  const completion: Completion = {
    id: record.id,
    mode: timer.mode,
    durationSec: record.durationSec,
    taskTitle: record.taskTitle,
    nextStarted: autoStart,
  };

  return {
    ...state,
    sessions: [record, ...state.sessions],
    tasks,
    timer: nextTimer,
    completion,
  };
}

export function reducer(state: AppState, action: Action): AppState {
  const { timer } = state;

  switch (action.type) {
    case "hydrate":
      return action.state
        ? { ...state, ...action.state, hydrated: true, completion: null }
        : { ...state, hydrated: true };

    case "start": {
      if (timer.status === "running") return state;
      const fresh = timer.status === "idle";
      return {
        ...withTimer(state, {
          ...timer,
          status: "running",
          startedAt: fresh ? action.now : timer.startedAt,
          taskId: fresh && timer.mode === "focus" ? state.selectedTaskId : timer.taskId,
          endsAt: action.now + timer.remainingMs,
        }),
        completion: null,
      };
    }

    case "pause": {
      if (timer.status !== "running") return state;
      return withTimer(state, {
        ...timer,
        status: "paused",
        remainingMs: remainingAt(timer, action.now),
        endsAt: null,
      });
    }

    case "reset":
      return syncIdleTimer(state, timer.mode);

    case "skip":
      return syncIdleTimer(state, nextMode(timer.mode));

    case "setMode":
      if (timer.status === "running") return state;
      return syncIdleTimer(state, action.mode);

    case "complete":
      return completeTimer(state, action.now);

    case "dismissCompletion":
      return state.completion ? { ...state, completion: null } : state;

    case "selectTask":
      return { ...state, selectedTaskId: action.taskId };

    case "addTask":
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
        selectedTaskId: state.selectedTaskId ?? action.task.id,
      };

    case "updateTask":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)),
      };

    case "deleteTask":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.taskId),
        selectedTaskId: state.selectedTaskId === action.taskId ? null : state.selectedTaskId,
      };

    case "toggleTaskDone":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, done: !t.done } : t)),
      };

    case "setSettings": {
      const next = { ...state, settings: action.settings };
      return timer.status === "idle" ? syncIdleTimer(next, timer.mode) : next;
    }

    case "resetAll":
      return { ...createInitialState(), hydrated: true };
  }
}
