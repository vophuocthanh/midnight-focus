"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./sidebar";
import { PageHeader } from "./page-header";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <PageHeader />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-28 sm:px-8 md:pb-16">{children}</main>
        </div>
      </div>
      <MobileNav />
      <Toaster position="top-center" />
    </TooltipProvider>
  );
}
