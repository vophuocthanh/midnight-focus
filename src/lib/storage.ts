import type { AmbientSound, LearningTask, PersistedState, SessionRecord, Settings, TaskPriority, TimerMode, TimerState, TimerStatus } from "../types";
import { DEFAULT_DURATIONS, DURATION_LIMITS, MODES, idleTimer } from "./timer";
import { DEFAULT_SETTINGS } from "../state/reducer";

const STORAGE_KEY = "midnight-focus";
/** Bump when the stored shape changes. Older versions are discarded and defaults are used. */
const STORAGE_VERSION = 1;

type Loose = Record<string, unknown>;

const isRecord = (v: unknown): v is Loose => typeof v === "object" && v !== null && !Array.isArray(v);
const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isMode = (v: unknown): v is TimerMode => (MODES as unknown[]).includes(v);
const isPriority = (v: unknown): v is TaskPriority => v === "low" || v === "medium" || v === "high";
const isAmbientSound = (v: unknown): v is AmbientSound =>
  v === "off" || v === "rain" || v === "brown" || v === "pad" || v === "youtube";
const orDefault = <T>(v: unknown, fallback: T, valid: (x: unknown) => boolean): T => (valid(v) ? (v as T) : fallback);

function parseSettings(value: unknown): Settings {
  const s = isRecord(value) ? value : {};
  const d = isRecord(s.durations) ? s.durations : {};
  const duration = (mode: TimerMode) => {
    const n = d[mode];
    const { min, max } = DURATION_LIMITS[mode];
    return isFiniteNumber(n) && n >= min && n <= max ? Math.round(n) : DEFAULT_DURATIONS[mode];
  };
  const bool = (v: unknown, fallback: boolean) => orDefault(v, fallback, (x) => typeof x === "boolean");
  return {
    durations: { focus: duration("focus"), shortBreak: duration("shortBreak"), longBreak: duration("longBreak") },
    dailyGoalMinutes: orDefault(
      s.dailyGoalMinutes,
      DEFAULT_SETTINGS.dailyGoalMinutes,
      (x) => isFiniteNumber(x) && x >= 1 && x <= 1440
    ),
    autoStartBreaks: bool(s.autoStartBreaks, DEFAULT_SETTINGS.autoStartBreaks),
    autoStartFocus: bool(s.autoStartFocus, DEFAULT_SETTINGS.autoStartFocus),
    sound: bool(s.sound, DEFAULT_SETTINGS.sound),
    notifications: bool(s.notifications, DEFAULT_SETTINGS.notifications),
    reducedMotion: bool(s.reducedMotion, DEFAULT_SETTINGS.reducedMotion),
    ambientSound: orDefault(s.ambientSound, DEFAULT_SETTINGS.ambientSound, isAmbientSound),
    youtubeUrl: orDefault(s.youtubeUrl, DEFAULT_SETTINGS.youtubeUrl, (x) => typeof x === "string" && x.length <= 300),
    ambientVolume: orDefault(s.ambientVolume, DEFAULT_SETTINGS.ambientVolume, (x) => isFiniteNumber(x) && x >= 0 && x <= 100),
  };
}

function parseTask(value: unknown): LearningTask | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string") return null;
  if (!value.title.trim()) return null;
  return {
    id: value.id,
    title: value.title.trim().slice(0, 80),
    category: typeof value.category === "string" ? value.category.slice(0, 40) : "",
    priority: orDefault(value.priority, "medium" as TaskPriority, isPriority),
    targetSessions: orDefault(value.targetSessions, 1, (x) => isFiniteNumber(x) && x >= 1 && x <= 99),
    completedSessions: orDefault(value.completedSessions, 0, (x) => isFiniteNumber(x) && x >= 0),
    done: value.done === true,
    createdAt: orDefault(value.createdAt, 0, isFiniteNumber),
  };
}

function parseSession(value: unknown): SessionRecord | null {
  if (!isRecord(value) || typeof value.id !== "string" || !isMode(value.mode)) return null;
  if (!isFiniteNumber(value.durationSec) || !isFiniteNumber(value.completedAt)) return null;
  return {
    id: value.id,
    taskId: typeof value.taskId === "string" ? value.taskId : null,
    taskTitle: typeof value.taskTitle === "string" ? value.taskTitle : null,
    mode: value.mode,
    durationSec: value.durationSec,
    completedAt: value.completedAt,
  };
}

/** Anything unreadable falls back to an idle timer rather than breaking the app. */
function parseTimer(value: unknown, settings: Settings): TimerState {
  const fallback = idleTimer("focus", settings.durations);
  if (!isRecord(value) || !isMode(value.mode)) return fallback;
  const status = value.status as TimerStatus;
  if (!["idle", "running", "paused"].includes(status)) return fallback;
  const totalMs = isFiniteNumber(value.totalMs) && value.totalMs > 0 ? value.totalMs : idleTimer(value.mode, settings.durations).totalMs;
  const remainingMs = isFiniteNumber(value.remainingMs) ? Math.min(Math.max(value.remainingMs, 0), totalMs) : totalMs;
  const endsAt = isFiniteNumber(value.endsAt) ? value.endsAt : null;
  const startedAt = isFiniteNumber(value.startedAt) ? value.startedAt : null;
  if (status === "running" && (endsAt === null || startedAt === null)) return fallback;
  return {
    mode: value.mode,
    status,
    totalMs,
    remainingMs: status === "idle" ? totalMs : remainingMs,
    endsAt: status === "running" ? endsAt : null,
    startedAt: status === "idle" ? null : startedAt,
    taskId: typeof value.taskId === "string" ? value.taskId : null,
  };
}

/** Returns null for missing, malformed or outdated data. Individual bad items are dropped. */
export function parsePersisted(raw: unknown): PersistedState | null {
  if (!isRecord(raw) || raw.version !== STORAGE_VERSION) return null;
  const settings = parseSettings(raw.settings);
  const tasks = Array.isArray(raw.tasks) ? raw.tasks.map(parseTask).filter((t): t is LearningTask => t !== null) : [];
  const sessions = Array.isArray(raw.sessions)
    ? raw.sessions.map(parseSession).filter((s): s is SessionRecord => s !== null)
    : [];
  const selectedTaskId = typeof raw.selectedTaskId === "string" && tasks.some((t) => t.id === raw.selectedTaskId)
    ? raw.selectedTaskId
    : null;
  return { settings, tasks, sessions, timer: parseTimer(raw.timer, settings), selectedTaskId };
}

export function loadPersisted(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : parsePersisted(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePersisted(state: PersistedState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, ...state }));
  } catch {
    // Storage can be full or blocked (private mode). The app keeps working in memory.
  }
}
