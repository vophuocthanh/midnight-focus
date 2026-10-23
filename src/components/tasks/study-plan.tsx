"use client";

import { useMemo, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sortTasks } from "@/lib/tasks";
import { useAppState } from "@/state/app-state";
import type { LearningTask } from "@/types";
import { TaskDialog } from "./task-dialog";
import { TaskItem } from "./task-item";

export function StudyPlan() {
  const { state } = useAppState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LearningTask | null>(null);
  const sorted = useMemo(() => sortTasks(state.tasks), [state.tasks]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (task: LearningTask) => {
    setEditing(task);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Study plan</h1>
          <p className="mt-1.5 text-text-secondary">Break your learning into tasks, and let focus sessions count toward them.</p>
        </div>
        {state.hydrated && state.tasks.length > 0 && (
          <Button onClick={openCreate}>
            <Plus aria-hidden />
            New task
          </Button>
        )}
      </div>

      {!state.hydrated ? (
        <div className="h-40 animate-pulse rounded-2xl bg-card" aria-hidden />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-elevated text-primary">
            <BookOpen className="size-6" aria-hidden />
          </span>
          <div className="max-w-sm space-y-1.5">
            <h2 className="text-lg font-medium">No learning tasks yet</h2>
            <p className="text-sm text-text-secondary">
              Create one for each topic you are working on. Pick a task in the focus timer, and each completed session is
              logged against it.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus aria-hidden />
            Create your first task
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={openEdit} />
          ))}
        </ul>
      )}

      <TaskDialog key={editing?.id ?? "new"} open={dialogOpen} onOpenChange={setDialogOpen} task={editing} />
    </div>
  );
}
