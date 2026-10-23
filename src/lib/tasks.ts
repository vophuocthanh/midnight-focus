import type { LearningTask, TaskPriority } from "../types";

export const PRIORITY_LABELS: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

/** Open tasks first (by priority, then newest), finished tasks last. */
export function sortTasks(tasks: LearningTask[]): LearningTask[] {
  return [...tasks].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      b.createdAt - a.createdAt
  );
}
