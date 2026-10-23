"use client";

import { usePathname } from "next/navigation";
import { Wordmark } from "./sidebar";
import { DailyProgressSummary } from "./daily-progress";
import { NAV_ITEMS } from "./nav-items";

export function PageHeader() {
  const pathname = usePathname();
  const title = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Midnight Focus";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-3.5 backdrop-blur-xl sm:px-8">
      <div className="flex min-w-0 items-center">
        <Wordmark className="md:hidden" />
        <h2 className="hidden truncate text-sm font-medium text-text-secondary md:block">{title}</h2>
      </div>
      <DailyProgressSummary />
    </header>
  );
}
