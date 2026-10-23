"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatMinutes } from "@/lib/format";
import { MEANINGFUL_PROGRESS_MS, remainingAt } from "@/lib/timer";
import { useNow } from "@/hooks/use-now";
import { useAppState } from "@/state/app-state";
import type { TimerMode } from "@/types";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { CompletionDialog } from "./completion-dialog";
import { ModeSelector } from "./mode-selector";
import { TaskPanel } from "./task-panel";
import { TimerControls } from "./timer-controls";
import { TimerRing } from "./timer-ring";
import { FocusBackdrop } from "./focus-backdrop";

/** An action that would throw away the current session. Asked for confirmation when progress is meaningful. */
type Discard = { kind: "reset" } | { kind: "skip" } | { kind: "mode"; mode: TimerMode };

function discardCopy(discard: Discard) {
  switch (discard.kind) {
    case "reset":
      return { title: "Reset this session?", description: "The progress so far is discarded. Completed sessions are kept.", action: "Reset" };
    case "skip":
      return { title: "Skip this session?", description: "Skipping ends it early, and the time is not recorded.", action: "Skip" };
    case "mode":
      return { title: "Switch timer mode?", description: "Switching discards the progress in this session.", action: "Switch" };
  }
}

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select") !== null);

export function FocusScreen() {
  const { state, dispatch } = useAppState();
  const { timer, tasks, selectedTaskId, completion } = state;
  const running = timer.status === "running";
  // Redraw every 250 ms only while a session runs, and once a second otherwise.
  const now = useNow(running ? 250 : 1000);
  const remainingMs = now === null ? timer.remainingMs : remainingAt(timer, now);
  const elapsedMs = timer.totalMs - remainingMs;
  const discardsProgress = timer.status !== "idle" && elapsedMs >= MEANINGFUL_PROGRESS_MS;

  const [discard, setDiscard] = useState<Discard | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Full screen covers only this screen, so the sidebar and header disappear with it.
  const rootRef = useRef<HTMLDivElement>(null);
  const canFullscreen = useSyncExternalStore(
    () => () => {},
    () => document.fullscreenEnabled === true,
    () => false
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      rootRef.current?.requestFullscreen().catch(() => toast.error("Full screen is not available right now."));
    }
  }

  const toggle = useCallback(() => {
    dispatch(running ? { type: "pause", now: Date.now() } : { type: "start", now: Date.now() });
  }, [dispatch, running]);

  const applyDiscard = useCallback(
    (action: Discard) => {
      if (action.kind === "reset") dispatch({ type: "reset" });
      else if (action.kind === "skip") dispatch({ type: "skip" });
      else dispatch({ type: "setMode", mode: action.mode });
    },
    [dispatch]
  );

  const requestDiscard = useCallback(
    (action: Discard) => {
      if (discardsProgress) setDiscard(action);
      else applyDiscard(action);
    },
    [applyDiscard, discardsProgress]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;

      const key = event.key.toLowerCase();
      if (key === " ") {
        // Buttons and links already respond to Space natively. Handling it here too would toggle twice.
        if (event.target instanceof HTMLElement && event.target.closest("button, a, [role=button]")) return;
        event.preventDefault();
        toggle();
      } else if (key === "r") {
        event.preventDefault();
        if (timer.status !== "idle") requestDiscard({ kind: "reset" });
      } else if (key === "n") {
        event.preventDefault();
        requestDiscard({ kind: "skip" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timer.status, toggle, requestDiscard]);

  const copy = discard ? discardCopy(discard) : null;

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col items-center gap-6 sm:gap-10 fullscreen:h-dvh fullscreen:justify-center fullscreen:overflow-y-auto fullscreen:bg-background fullscreen:px-6"
    >
      <FocusBackdrop />
      {canFullscreen && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 text-text-secondary hover:text-foreground"
          aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
          title={isFullscreen ? "Exit full screen" : "Full screen"}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
        </Button>
      )}
      <section className="text-center in-fullscreen:hidden">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your focus space</h1>
        <p className="mt-2 text-text-secondary">One session at a time. Keep moving forward.</p>
      </section>

      <div className="flex w-full max-w-md flex-col items-center gap-4 sm:gap-5 in-fullscreen:hidden">
        <TaskPanel
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelect={(taskId) => dispatch({ type: "selectTask", taskId })}
          onCreate={() => setTaskDialogOpen(true)}
        />
        <ModeSelector
          mode={timer.mode}
          disabled={running}
          onChange={(mode) => mode !== timer.mode && requestDiscard({ kind: "mode", mode })}
        />
      </div>

      <div className="flex flex-col items-center gap-6 sm:gap-8">
        <TimerRing mode={timer.mode} status={timer.status} remainingMs={remainingMs} totalMs={timer.totalMs} />
        <TimerControls
          mode={timer.mode}
          status={timer.status}
          canReset={timer.status !== "idle"}
          onToggle={toggle}
          onReset={() => requestDiscard({ kind: "reset" })}
          onSkip={() => requestDiscard({ kind: "skip" })}
        />
      </div>

      <CompletionDialog
        completion={completion}
        onStartNext={() => dispatch({ type: "start", now: Date.now() })}
        onClose={() => dispatch({ type: "dismissCompletion" })}
      />

      <AlertDialog open={discard !== null} onOpenChange={(open) => !open && setDiscard(null)}>
        <AlertDialogContent>
          {copy && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{copy.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {copy.description} ({formatMinutes(elapsedMs)} so far.)
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep going</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    if (discard) applyDiscard(discard);
                    setDiscard(null);
                  }}
                >
                  {copy.action}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <TaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
    </div>
  );
}
