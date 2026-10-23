import type { Metadata } from "next";
import { StudyPlan } from "@/components/tasks/study-plan";

export const metadata: Metadata = { title: "Study plan" };

export default function PlanPage() {
  return <StudyPlan />;
}
