import { MODE_LABELS, MODES } from "@/lib/timer";
import { cn } from "@/lib/utils";
import type { TimerMode } from "@/types";

interface ModeSelectorProps {
  mode: TimerMode;
  disabled: boolean;
  onChange: (mode: TimerMode) => void;
}

export function ModeSelector({ mode, disabled, onChange }: ModeSelectorProps) {
  return (
    <div role="group" aria-label="Timer mode" className="grid w-full max-w-sm grid-cols-3 rounded-full border border-border bg-surface p-1">
      {MODES.map((value) => {
        const selected = value === mode;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(value)}
            className={cn(
              "min-h-10 rounded-full px-2 text-sm transition-colors duration-200 disabled:cursor-not-allowed",
              selected ? "bg-elevated text-foreground shadow-sm" : "text-text-secondary hover:text-foreground",
              disabled && !selected && "opacity-50"
            )}
          >
            {MODE_LABELS[value]}
          </button>
        );
      })}
    </div>
  );
}
