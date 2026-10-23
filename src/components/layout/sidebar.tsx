"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { focusStreak } from "@/lib/stats";
import { formatMinutes } from "@/lib/format";
import { useAppState } from "@/state/app-state";
import { DailyProgressBar, useDailyProgress } from "./daily-progress";
import { NAV_ITEMS } from "./nav-items";

export function Wordmark({ className, labelClassName }: { className?: string; labelClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary to-info text-primary-foreground shadow-md shadow-primary/20">
        <Timer className="size-4" aria-hidden />
      </span>
      <span className={cn("font-semibold tracking-tight", labelClassName)}>Midnight Focus</span>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { state } = useAppState();
  const progress = useDailyProgress();
  const streak = focusStreak(state.sessions, progress.now);
  const percent = progress.hydrated ? Math.round(progress.ratio * 100) : 0;

  return (
    <aside className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-6 md:flex lg:w-60 lg:px-4">
      <Wordmark className="justify-center lg:justify-start lg:px-2" labelClassName="hidden lg:inline" />

      <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              className={cn(
                "relative flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 lg:justify-start",
                active ? "bg-elevated text-foreground" : "text-text-secondary hover:bg-elevated/60 hover:text-foreground"
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" aria-hidden />}
              <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} aria-hidden />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border bg-surface p-3 lg:p-4">
        <p className="text-center text-xs tabular-nums text-text-secondary lg:hidden" title="Daily goal progress">
          {percent}%
        </p>
        <div className="hidden flex-col gap-2.5 lg:flex">
          <div className="flex items-baseline justify-between text-xs text-text-secondary">
            <span>Daily goal</span>
            <span className="tabular-nums text-foreground">{percent}%</span>
          </div>
          <DailyProgressBar ratio={progress.hydrated ? progress.ratio : 0} />
          <p className="text-xs text-text-secondary">
            {progress.hydrated ? formatMinutes(progress.focusSeconds) : "—"} of {Math.round(progress.goalSeconds / 60)} min
            {" · "}
            {streak > 0 ? `${streak}-day streak` : "No streak yet"}
          </p>
        </div>
      </div>
    </aside>
  );
}
