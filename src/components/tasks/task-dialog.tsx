"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newId } from "@/lib/ids";
import { PRIORITY_LABELS } from "@/lib/tasks";
import { useAppState } from "@/state/app-state";
import type { LearningTask, TaskPriority } from "@/types";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create a task. Pass a task to edit it. */
  task?: LearningTask | null;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit learning task" : "New learning task"}</DialogTitle>
          <DialogDescription>Sessions you complete for this task are counted against its estimate.</DialogDescription>
        </DialogHeader>
        {open && <TaskForm task={task} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

const isPriority = (value: string | null): value is TaskPriority => value === "low" || value === "medium" || value === "high";

// Mounted only while the dialog is open, so each open starts from the current task.
function TaskForm({ task, onDone }: { task?: LearningTask | null; onDone: () => void }) {
  const { dispatch } = useAppState();
  const [title, setTitle] = useState(task?.title ?? "");
  const [category, setCategory] = useState(task?.category ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [sessions, setSessions] = useState(String(task?.targetSessions ?? 4));
  const [submitted, setSubmitted] = useState(false);

  const count = Number(sessions);
  const titleError = title.trim() ? null : "Give the task a name.";
  const sessionsError = Number.isInteger(count) && count >= 1 && count <= 99 ? null : "Use a whole number from 1 to 99.";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (titleError || sessionsError) return;
    const values = {
      title: title.trim().slice(0, 80),
      category: category.trim().slice(0, 40),
      priority,
      targetSessions: count,
    };
    if (task) {
      dispatch({ type: "updateTask", task: { ...task, ...values } });
    } else {
      dispatch({
        type: "addTask",
        task: { id: newId(), ...values, completedSessions: 0, done: false, createdAt: Date.now() },
      });
    }
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          autoFocus
          value={title}
          maxLength={80}
          placeholder="Master React rendering"
          aria-invalid={submitted && !!titleError}
          onChange={(e) => setTitle(e.target.value)}
        />
        {submitted && titleError && <p className="text-xs text-danger">{titleError}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="task-category">Category</Label>
        <Input
          id="task-category"
          value={category}
          maxLength={40}
          placeholder="Frontend development (optional)"
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select
            value={priority}
            onValueChange={(value) => {
              if (isPriority(value)) setPriority(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{PRIORITY_LABELS[priority]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="task-sessions">Estimated sessions</Label>
          <Input
            id="task-sessions"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={sessions}
            aria-invalid={submitted && !!sessionsError}
            onChange={(e) => setSessions(e.target.value)}
          />
          {submitted && sessionsError && <p className="text-xs text-danger">{sessionsError}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">{task ? "Save changes" : "Create task"}</Button>
      </DialogFooter>
    </form>
  );
}
