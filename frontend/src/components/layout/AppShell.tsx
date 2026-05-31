import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { StudentSwitcher } from "./StudentSwitcher";
import { StreamStatusIndicator } from "./StreamStatusIndicator";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-panel md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <GraduationCap className="h-4 w-4" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-[-0.01em]">Action Center</p>
            <p className="text-2xs text-subtle">Counselor console</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <StudentSwitcher />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
          <span className="truncate text-2xs text-subtle">Signed in · csl_001</span>
          <StreamStatusIndicator />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-5 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
