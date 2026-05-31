import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AppShell } from "@/components/layout/AppShell";
import { ActionCenterPage } from "@/pages/ActionCenterPage";

export function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <AppShell>
        <ActionCenterPage />
      </AppShell>
      <Toaster />
    </TooltipProvider>
  );
}
