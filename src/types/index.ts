export type TimerMode = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused";
export type TaskPriority = "low" | "medium" | "high";
export type Durations = Record<TimerMode, number>;
export type AmbientSound = "off" | "rain" | "brown" | "pad" | "youtube";

export interface Settings {
  /** Session lengths in minutes, per timer mode. */
  durations: Durations;
  dailyGoalMinutes: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  sound: boolean;
  notifications: boolean;
  reducedMotion: boolean;
  /** Background sound that plays during focus sessions. */
  ambientSound: AmbientSound;
  /** 0 to 100. */
  ambientVolume: number;
  /** Link pasted for the "youtube" ambient option. Empty when unset. */
  youtubeUrl: string;
}

export interface LearningTask {
  id: string;
  title: string;
  category: string;
  priority: TaskPriority;
  /** Estimated number of focus sessions the task needs. */
  targetSessions: number;
  completedSessions: number;
  done: boolean;
  createdAt: number;
}

export interface SessionRecord {
  id: string;
  taskId: string | null;
  /** Snapshot of the task title, so history still reads correctly after a task is deleted. */
  taskTitle: string | null;
  mode: TimerMode;
  durationSec: number;
  completedAt: number;
}

/**
 * Deadline-based timer. While running, the remaining time is derived from `endsAt`
 * so throttled or background tabs cannot cause drift. While paused, `remainingMs` holds it.
 */
export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  totalMs: number;
  remainingMs: number;
  endsAt: number | null;
  startedAt: number | null;
  taskId: string | null;
}

export interface Completion {
  id: string;
  mode: TimerMode;
  durationSec: number;
  taskTitle: string | null;
  /** Whether the next session was started automatically. */
  nextStarted: boolean;
}

/** The slice of state written to localStorage. */
export interface PersistedState {
  settings: Settings;
  tasks: LearningTask[];
  sessions: SessionRecord[];
  timer: TimerState;
  selectedTaskId: string | null;
}

export interface AppState extends PersistedState {
  hydrated: boolean;
  completion: Completion | null;
}
