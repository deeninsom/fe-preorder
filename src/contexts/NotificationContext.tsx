import { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  exiting?: boolean;
}

interface NotifCtx {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id" | "exiting">) => void;
  dismiss: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const Ctx = createContext<NotifCtx>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const toast = useCallback(
    ({ type, title, message, duration = 5000 }: Omit<Toast, "id" | "exiting">) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [{ id, type, title, message, duration }, ...prev].slice(0, 6));
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: "error",   title, message, duration: 7000 }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) => toast({ type: "info",    title, message }), [toast]);

  return (
    <Ctx.Provider value={{ toasts, toast, dismiss, success, error, warning, info }}>
      {children}
    </Ctx.Provider>
  );
}

export const useNotification = () => useContext(Ctx);
