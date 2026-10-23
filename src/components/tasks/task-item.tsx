"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Pencil, Target, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PRIORITY_LABELS } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { useAppState } from "@/state/app-state";
import type { LearningTask } from "@/types";

interface TaskItemProps {
  task: LearningTask;
  onEdit: (task: LearningTask) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { dispatch } = useAppState();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ratio = Math.min(1, task.completedSessions / task.targetSessions);
  const meta = [task.category, PRIORITY_LABELS[task.priority] + " priority", `${task.completedSessions} of ${task.targetSessions} sessions`];

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors duration-200 hover:border-primary/30 sm:gap-4">
      <button
        type="button"
        onClick={() => dispatch({ type: "toggleTaskDone", taskId: task.id })}
        aria-pressed={task.done}
        aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-200",
          task.done ? "border-success bg-success text-background" : "border-border text-transparent hover:border-primary"
        )}
      >
        <Check className="size-3.5" aria-hidden />
      </button>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-medium", task.done && "text-text-muted line-through")}>{task.title}</p>
          {task.done && <Badge variant="secondary" className="text-success">Done</Badge>}
        </div>
        <p className="text-sm text-text-secondary">{meta.filter(Boolean).join(" · ")}</p>
        <div
          role="progressbar"
          aria-label={`Progress for ${task.title}`}
          aria-valuemin={0}
          aria-valuemax={task.targetSessions}
          aria-valuenow={Math.min(task.completedSessions, task.targetSessions)}
          className="h-1.5 w-full overflow-hidden rounded-full bg-elevated"
        >
          <div className="h-full rounded-full bg-linear-to-r from-primary to-info transition-[width] duration-500 ease-calm" style={{ width: `${ratio * 100}%` }} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Use ${task.title} in focus`}
          title="Use in focus"
          onClick={() => {
            dispatch({ type: "selectTask", taskId: task.id });
            router.push("/");
          }}
        >
          <Target aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Edit ${task.title}`} title="Edit" onClick={() => onEdit(task)}>
          <Pencil aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Delete ${task.title}`} title="Delete" onClick={() => setConfirmDelete(true)}>
          <Trash2 aria-hidden />
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{task.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The task is removed. Sessions already recorded in History stay there.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => dispatch({ type: "deleteTask", taskId: task.id })}>
              Delete task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
