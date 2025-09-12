import React, { createContext, useContext, useState, useCallback } from "react";

type ToastCtx = {
  show: (msg: string, ms?: number) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);

  const show = useCallback((m: string, ms = 1800) => {
    setMsg(m);
    window.clearTimeout((show as any)._t);
    (show as any)._t = window.setTimeout(() => setMsg(null), ms);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {/* Simple top toast */}
      <div
        className={`fixed top-3 left-0 right-0 z-[60] flex justify-center transition-all duration-300 ${
          msg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="px-3 py-2 rounded-xl bg-black text-white text-sm shadow-lg max-w-[90vw]">
          {msg}
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be used within ToastProvider");
  return v;
}
