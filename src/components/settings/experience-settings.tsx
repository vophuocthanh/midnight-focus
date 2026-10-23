"use client";

import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState } from "@/state/app-state";
import { ToggleRow } from "./timer-settings";

export function ExperienceSettings() {
  const { state, dispatch } = useAppState();
  const { settings } = state;

  const update = (patch: Partial<typeof settings>) => dispatch({ type: "setSettings", settings: { ...settings, ...patch } });

  async function setNotifications(enabled: boolean) {
    if (!enabled) return update({ notifications: false });
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications.");
      return;
    }
    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission === "granted") {
      update({ notifications: true });
    } else {
      toast.error("Notifications are blocked. You can allow them in your browser's site settings.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
        <CardDescription>How Midnight Focus signals that a session has ended.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <ToggleRow
          id="sound"
          label="Completion sound"
          description="Play a short chime when a session ends."
          checked={settings.sound}
          onChange={(sound) => update({ sound })}
        />
        <ToggleRow
          id="notifications"
          label="Browser notifications"
          description="Show a system notification when a session ends. Your browser will ask for permission."
          checked={settings.notifications}
          onChange={setNotifications}
        />
        <ToggleRow
          id="reduced-motion"
          label="Reduce motion"
          description="Turn off ring and dialog animations. Your system setting is respected too."
          checked={settings.reducedMotion}
          onChange={(reducedMotion) => update({ reducedMotion })}
        />
      </CardContent>
    </Card>
  );
}
