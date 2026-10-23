"use client";

import { createContext, useContext, useEffect, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import type { AppState } from "../types";
import { loadPersisted, savePersisted } from "../lib/storage";
import { playChime } from "../lib/sound";
import { MODE_LABELS, nextMode } from "../lib/timer";
import { createInitialState, reducer, type Action } from "./reducer";

interface AppStateContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const { hydrated, settings, tasks, sessions, timer, selectedTaskId, completion } = state;

  // Load saved data after mount, so server and client first renders match.
  useEffect(() => {
    dispatch({ type: "hydrate", state: loadPersisted() });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePersisted({ settings, tasks, sessions, timer, selectedTaskId });
  }, [hydrated, settings, tasks, sessions, timer, selectedTaskId]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", settings.reducedMotion);
  }, [settings.reducedMotion]);

  // Completion is driven by the deadline, not by a counter. The timeout re-arms if it fires early,
  // and the visibility listener catches up when a throttled background tab returns.
  const endsAt = timer.status === "running" ? timer.endsAt : null;
  useEffect(() => {
    if (endsAt === null) return;
    let timeoutId = 0;
    const complete = () => dispatch({ type: "complete", now: Date.now() });
    const arm = () => {
      const left = endsAt - Date.now();
      if (left <= 0) complete();
      else timeoutId = window.setTimeout(arm, left);
    };
    arm();
    document.addEventListener("visibilitychange", complete);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", complete);
    };
  }, [endsAt]);

  // Sound and notifications run as side effects of a completion. The ref makes each one fire once,
  // even when React runs effects twice in development.
  const notifiedId = useRef<string | null>(null);
  useEffect(() => {
    if (!completion || notifiedId.current === completion.id) return;
    notifiedId.current = completion.id;
    if (settings.sound) playChime();
    if (settings.notifications && "Notification" in window && Notification.permission === "granted") {
      const label = MODE_LABELS[completion.mode];
      new Notification(`${label} complete`, {
        body: `Time for ${MODE_LABELS[nextMode(completion.mode)].toLowerCase()}.`,
      });
    }
  }, [completion, settings.sound, settings.notifications]);

  return <AppStateContext.Provider value={{ state, dispatch }}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
