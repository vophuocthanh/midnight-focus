import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePersisted } from "./storage";
import { DEFAULT_SETTINGS } from "../state/reducer";

const valid = {
  version: 1,
  settings: { ...DEFAULT_SETTINGS, durations: { focus: 40, shortBreak: 5, longBreak: 15 } },
  tasks: [{ id: "a", title: " Algebra ", category: "Math", priority: "low", targetSessions: 2, completedSessions: 1, done: false, createdAt: 1 }],
  sessions: [{ id: "s", taskId: "a", taskTitle: "Algebra", mode: "focus", durationSec: 2400, completedAt: 5 }],
  timer: { mode: "focus", status: "idle", totalMs: 2400000, remainingMs: 2400000, endsAt: null, startedAt: null, taskId: null },
  selectedTaskId: "a",
};

test("missing, malformed or outdated data returns null", () => {
  assert.equal(parsePersisted(null), null);
  assert.equal(parsePersisted("nope"), null);
  assert.equal(parsePersisted({ ...valid, version: 0 }), null);
});

test("valid data round-trips", () => {
  const parsed = parsePersisted(valid);
  assert.ok(parsed);
  assert.equal(parsed.settings.durations.focus, 40);
  assert.equal(parsed.tasks[0].title, "Algebra");
  assert.equal(parsed.selectedTaskId, "a");
});

test("bad values fall back to defaults and bad items are dropped", () => {
  const parsed = parsePersisted({
    ...valid,
    settings: { durations: { focus: 0, shortBreak: "x", longBreak: 999 }, sound: "yes" },
    tasks: [{ id: "b", title: "   " }, "junk", { id: "c", title: "Ok", priority: "urgent", targetSessions: -4 }],
    sessions: [{ id: "s", mode: "nap", durationSec: 1, completedAt: 1 }],
    selectedTaskId: "missing",
  });
  assert.ok(parsed);
  assert.deepEqual(parsed.settings.durations, DEFAULT_SETTINGS.durations);
  assert.equal(parsed.settings.sound, DEFAULT_SETTINGS.sound);
  assert.equal(parsed.tasks.length, 1);
  assert.equal(parsed.tasks[0].priority, "medium");
  assert.equal(parsed.tasks[0].targetSessions, 1);
  assert.equal(parsed.sessions.length, 0);
  assert.equal(parsed.selectedTaskId, null);
});

test("a running timer without a deadline is reset to idle", () => {
  const parsed = parsePersisted({ ...valid, timer: { ...valid.timer, status: "running", endsAt: null } });
  assert.ok(parsed);
  assert.equal(parsed.timer.status, "idle");
});
