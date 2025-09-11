import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: number; message: string };
type ToastCtx = { show: (message: string, ms?: number) => void };

const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, ms = 1800) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast Stack */}
      <div className="fixed top-3 inset-x-0 z-[60] pointer-events-none">
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4">
          <div className="flex flex-col items-center gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="pointer-events-auto rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg px-3 py-2"
              >
                {t.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
