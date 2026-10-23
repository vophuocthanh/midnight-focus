import type { Metadata } from "next";
import { TimerSettings } from "@/components/settings/timer-settings";
import { ExperienceSettings } from "@/components/settings/experience-settings";
import { DataControls } from "@/components/settings/data-controls";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1.5 text-text-secondary">Tune the timer and how you are notified.</p>
      </div>
      <TimerSettings />
      <ExperienceSettings />
      <DataControls />
    </div>
  );
}
