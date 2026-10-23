import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState, DEFAULT_SETTINGS, reducer } from "./reducer";
import { idleTimer, remainingAt } from "../lib/timer";
import type { AppState, LearningTask } from "../types";

const MIN = 60_000;

function withTask(state: AppState): AppState {
  const task: LearningTask = {
    id: "t1",
    title: "Master React rendering",
    category: "Frontend",
    priority: "high",
    targetSessions: 3,
    completedSessions: 0,
    done: false,
    createdAt: 0,
  };
  return reducer(state, { type: "addTask", task });
}

test("start, pause and resume keep the remaining time", () => {
  let state = createInitialState();
  state = reducer(state, { type: "start", now: 1_000 });
  assert.equal(state.timer.status, "running");
  assert.equal(remainingAt(state.timer, 1_000 + 10_000), 25 * MIN - 10_000);

  state = reducer(state, { type: "pause", now: 11_000 });
  assert.equal(state.timer.status, "paused");
  assert.equal(state.timer.remainingMs, 25 * MIN - 10_000);

  // Time passes while paused. It must not count against the session.
  state = reducer(state, { type: "start", now: 500_000 });
  assert.equal(remainingAt(state.timer, 500_000), 25 * MIN - 10_000);
  assert.equal(state.timer.startedAt, 1_000, "resume keeps the original session start");
});

test("completion only happens once the deadline has passed", () => {
  let state = reducer(createInitialState(), { type: "start", now: 0 });
  const early = reducer(state, { type: "complete", now: 25 * MIN - 1 });
  assert.equal(early, state, "early completion is ignored");

  state = reducer(state, { type: "complete", now: 25 * MIN });
  assert.equal(state.timer.mode, "shortBreak");
  assert.equal(state.timer.status, "idle");
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].durationSec, 25 * 60);
});

test("a repeated completion does not create a second session", () => {
  let state = reducer(createInitialState(), { type: "start", now: 0 });
  state = reducer(state, { type: "complete", now: 25 * MIN });
  const again = reducer(state, { type: "complete", now: 30 * MIN });
  assert.equal(again, state);
  assert.equal(again.sessions.length, 1);
});

test("a finished focus session counts toward the selected task", () => {
  let state = withTask(createInitialState());
  state = reducer(state, { type: "start", now: 0 });
  assert.equal(state.timer.taskId, "t1");
  state = reducer(state, { type: "complete", now: 25 * MIN });
  assert.equal(state.tasks[0].completedSessions, 1);
  assert.equal(state.sessions[0].taskTitle, "Master React rendering");
});

test("breaks are recorded but do not count toward a task", () => {
  let state = withTask(createInitialState());
  state = reducer(state, { type: "setMode", mode: "shortBreak" });
  state = reducer(state, { type: "start", now: 0 });
  state = reducer(state, { type: "complete", now: 5 * MIN });
  assert.equal(state.sessions[0].mode, "shortBreak");
  assert.equal(state.tasks[0].completedSessions, 0);
});

test("auto-start begins the next session immediately", () => {
  let state = reducer(createInitialState(), {
    type: "setSettings",
    settings: { ...DEFAULT_SETTINGS, autoStartBreaks: true },
  });
  state = reducer(state, { type: "start", now: 0 });
  state = reducer(state, { type: "complete", now: 25 * MIN });
  assert.equal(state.timer.status, "running");
  assert.equal(state.timer.mode, "shortBreak");
  assert.equal(state.timer.endsAt, 25 * MIN + 5 * MIN);
  assert.equal(state.completion?.nextStarted, true);
});

test("changing durations updates an idle timer but not a running one", () => {
  let state = reducer(createInitialState(), {
    type: "setSettings",
    settings: { ...DEFAULT_SETTINGS, durations: { ...DEFAULT_SETTINGS.durations, focus: 50 } },
  });
  assert.equal(state.timer.totalMs, 50 * MIN);

  state = reducer(state, { type: "start", now: 0 });
  state = reducer(state, {
    type: "setSettings",
    settings: { ...DEFAULT_SETTINGS, durations: { ...DEFAULT_SETTINGS.durations, focus: 10 } },
  });
  assert.equal(state.timer.totalMs, 50 * MIN);
});

test("skip and reset move the timer without recording a session", () => {
  let state = reducer(createInitialState(), { type: "start", now: 0 });
  state = reducer(state, { type: "skip" });
  assert.equal(state.timer.mode, "shortBreak");
  assert.equal(state.timer.status, "idle");
  assert.equal(state.sessions.length, 0);

  state = reducer(state, { type: "start", now: 0 });
  state = reducer(state, { type: "reset" });
  assert.deepEqual(state.timer, idleTimer("shortBreak", DEFAULT_SETTINGS.durations));
});

test("the mode cannot change while a session is running", () => {
  const state = reducer(createInitialState(), { type: "start", now: 0 });
  assert.equal(reducer(state, { type: "setMode", mode: "longBreak" }), state);
});
