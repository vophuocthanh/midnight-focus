import { Pause, Play, RotateCcw, SkipForward, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TimerMode, TimerStatus } from "@/types";

interface TimerControlsProps {
  mode: TimerMode;
  status: TimerStatus;
  canReset: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({ mode, status, canReset, onToggle, onReset, onSkip }: TimerControlsProps) {
  const running = status === "running";
  const label = running ? "Pause" : status === "paused" ? "Resume" : mode === "focus" ? "Start focus" : "Start break";
  const PrimaryIcon = running ? Pause : Play;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-3">
        <IconAction label="Reset (R)" icon={RotateCcw} disabled={!canReset} onClick={onReset} />
        <Button
          size="lg"
          onClick={onToggle}
          className={
            "h-12 min-w-44 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-px hover:bg-accent-hover hover:shadow-primary/40 " +
            (running ? "shadow-[0_0_36px_-4px_var(--mf-glow)]" : "")
          }
        >
          <PrimaryIcon aria-hidden />
          {label}
          <span className="sr-only">(Space)</span>
        </Button>
        <IconAction label="Skip session (N)" icon={SkipForward} onClick={onSkip} />
      </div>
      <p className="text-xs text-text-muted">
        <kbd className="font-mono">Space</kbd> start or pause · <kbd className="font-mono">R</kbd> reset ·{" "}
        <kbd className="font-mono">N</kbd> skip
      </p>
    </div>
  );
}

function IconAction({
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="rounded-full text-text-secondary hover:text-foreground"
          />
        }
      >
        <Icon aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
