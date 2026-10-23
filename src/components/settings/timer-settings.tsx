"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DURATION_LIMITS, MODE_LABELS } from "@/lib/timer";
import { useAppState } from "@/state/app-state";
import type { Settings, TimerMode } from "@/types";

const DAILY_GOAL_LIMIT = { min: 1, max: 1440 };

export function TimerSettings() {
  const { state, dispatch } = useAppState();
  const { settings } = state;

  const update = (patch: Partial<Settings>) => dispatch({ type: "setSettings", settings: { ...settings, ...patch } });
  const setDuration = (mode: TimerMode, minutes: number) =>
    update({ durations: { ...settings.durations, [mode]: minutes } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer</CardTitle>
        <CardDescription>Session lengths in minutes. Changes apply to the next session.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map((mode) => (
            <NumberField
              key={mode}
              id={`duration-${mode}`}
              label={MODE_LABELS[mode]}
              value={settings.durations[mode]}
              {...DURATION_LIMITS[mode]}
              onValid={(minutes) => setDuration(mode, minutes)}
            />
          ))}
        </div>

        <NumberField
          id="daily-goal"
          label="Daily focus goal"
          suffix="minutes"
          value={settings.dailyGoalMinutes}
          {...DAILY_GOAL_LIMIT}
          onValid={(minutes) => update({ dailyGoalMinutes: minutes })}
        />

        <div className="grid gap-4 border-t border-border pt-6">
          <ToggleRow
            id="auto-breaks"
            label="Start breaks automatically"
            description="When a focus session ends, start the short break without waiting."
            checked={settings.autoStartBreaks}
            onChange={(autoStartBreaks) => update({ autoStartBreaks })}
          />
          <ToggleRow
            id="auto-focus"
            label="Start focus automatically"
            description="When a break ends, start the next focus session."
            checked={settings.autoStartFocus}
            onChange={(autoStartFocus) => update({ autoStartFocus })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Number input that only commits valid values. Invalid text is shown with an error and
 * leaves the stored value alone. Blurring discards the draft.
 */
function NumberField({
  id,
  label,
  suffix = "min",
  value,
  min,
  max,
  onValid,
}: {
  id: string;
  label: string;
  suffix?: string;
  value: number;
  min: number;
  max: number;
  onValid: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = draft === null ? value : Number(draft);
  const invalid = draft !== null && !(Number.isInteger(parsed) && parsed >= min && parsed <= max);
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={draft ?? String(value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className="tabular-nums"
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            const n = Number(next);
            if (Number.isInteger(n) && n >= min && n <= max) onValid(n);
          }}
          onBlur={() => setDraft(null)}
        />
        <span className="shrink-0 text-sm text-text-secondary">{suffix}</span>
      </div>
      {invalid && (
        <p id={errorId} className="text-xs text-danger">
          Enter a whole number from {min} to {max}.
        </p>
      )}
    </div>
  );
}

export function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
