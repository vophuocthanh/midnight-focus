import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LearningTask } from "@/types";

const NO_TASK = "__none__";

interface TaskPanelProps {
  tasks: LearningTask[];
  selectedTaskId: string | null;
  onSelect: (taskId: string | null) => void;
  onCreate: () => void;
}

export function TaskPanel({ tasks, selectedTaskId, onSelect, onCreate }: TaskPanelProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-elevated text-primary">
          <BookOpen className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Add your first learning task</p>
          <p className="text-sm text-text-secondary">Sessions will count toward it.</p>
        </div>
        <Button size="sm" onClick={onCreate}>
          <Plus aria-hidden />
          Create task
        </Button>
      </div>
    );
  }

  const selected = tasks.find((t) => t.id === selectedTaskId) ?? null;
  // Finished tasks drop out of the picker, except the one that is currently selected.
  const options = tasks.filter((t) => !t.done || t.id === selectedTaskId);
  const details = selected ? [selected.category, `${selected.completedSessions} of ${selected.targetSessions} sessions`] : [];

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-secondary">Current task</p>
        <Select
          value={selectedTaskId ?? NO_TASK}
          onValueChange={(value) => onSelect(value === NO_TASK || value === null ? null : value)}
        >
          <SelectTrigger
            aria-label="Current learning task"
            className="mt-0.5 h-auto w-full max-w-full border-0 bg-transparent px-0 py-0 text-base font-medium shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          >
            <SelectValue>{selected?.title ?? "No task selected"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_TASK}>No task</SelectItem>
            {options.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {details.length > 0 && (
          <p className="truncate text-xs text-text-secondary">{details.filter(Boolean).join(" · ")}</p>
        )}
      </div>
      <Button variant="ghost" size="icon" aria-label="New learning task" onClick={onCreate}>
        <Plus aria-hidden />
      </Button>
    </div>
  );
}
