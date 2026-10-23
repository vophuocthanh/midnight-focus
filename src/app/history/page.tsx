import type { Metadata } from "next";
import { StatsCards } from "@/components/history/stats-cards";
import { WeeklyChart } from "@/components/history/weekly-chart";
import { SessionList } from "@/components/history/session-list";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="mt-1.5 text-text-secondary">A record of your sessions, kept in this browser.</p>
      </div>
      <StatsCards />
      <WeeklyChart />
      <SessionList />
    </div>
  );
}
