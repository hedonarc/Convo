import { cn } from "@shared/utils";
import * as React from "react";

const DEFAULT_DURATION_MS = 5000;

export interface ToastItem {
  id: string;
  message: string;
  /** Optional title rendered in bolder weight above `message`. */
  title?: string;
  /** Auto-dismiss delay in ms. Pass 0 to keep until manually dismissed. */
  durationMs?: number;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setItems((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const duration = item.durationMs ?? DEFAULT_DURATION_MS;
      setItems((current) => [...current, { ...item, id }]);
      if (duration > 0) {
        // No timer cleanup needed — dismiss is idempotent and the closure
        // captures only the id, so unmounted toasts are simply no-ops.
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {items.map((item) => (
        <Toast key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "border-border bg-surface text-text-primary pointer-events-auto",
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg",
        "animate-in fade-in slide-in-from-bottom-2",
      )}
    >
      <div className="min-w-0 flex-1">
        {item.title && (
          <p className="text-text-primary truncate text-sm font-semibold">
            {item.title}
          </p>
        )}
        <p className="text-text-secondary text-sm">{item.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className={cn(
          "text-text-secondary hover:text-text-primary -m-1 rounded p-1 text-xs",
          "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
        )}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
