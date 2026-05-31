import * as ToastPrimitive from "@radix-ui/react-toast";
import { useUiStore, type ToastTone } from "@/store/uiStore";
import { cn } from "@/lib/cn";

const TONE_ACCENT: Record<ToastTone, string> = {
  success: "border-l-low-fg",
  error: "border-l-critical-fg",
  info: "border-l-accent",
};

export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          open
          onOpenChange={(open) => {
            if (!open) dismissToast(toast.id);
          }}
          className={cn(
            "flex items-start gap-3 rounded-md border border-l-2 border-border bg-surface px-3.5 py-3 shadow-md",
            "animate-fade-in data-[state=closed]:opacity-0",
            TONE_ACCENT[toast.tone],
          )}
        >
          <div className="min-w-0 flex-1">
            <ToastPrimitive.Title className="text-sm font-medium text-ink">
              {toast.title}
            </ToastPrimitive.Title>
            {toast.description ? (
              <ToastPrimitive.Description className="mt-0.5 text-xs text-muted">
                {toast.description}
              </ToastPrimitive.Description>
            ) : null}
          </div>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[60] m-0 flex w-80 max-w-[calc(100vw-2rem)] list-none flex-col gap-2 p-0 outline-none" />
    </ToastPrimitive.Provider>
  );
}
