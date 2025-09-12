// src/components/ShareSheet.tsx
import React, { useEffect } from "react";
import { X as Close, Link as LinkIcon, Share2, MessageCircle, Send, Globe } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  text?: string;
  url: string;
};

function openNew(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function ShareSheet({ open, onClose, title = "Bagikan", text = "", url }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const wa = `https://wa.me/?text=${encodeURIComponent(text ? `${text}\n${url}` : url)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const tw = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

  async function shareNative() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        onClose();
        return;
      }
    } catch {}
    // fallback kalau ga support
    try {
      await navigator.clipboard.writeText(url);
      alert("Link disalin ke clipboard 📎");
    } catch {
      alert("Gagal menyalin link. Silakan salin manual.");
    }
    onClose();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link disalin ke clipboard 📎");
    } catch {
      alert("Gagal menyalin link. Silakan salin manual.");
    }
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[250] bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-[260]"
      >
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl rounded-t-2xl bg-white/80 backdrop-blur-md border-t border-white/50 shadow-[0_-12px_40px_rgba(2,6,23,0.18)]">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="h-1.5 w-10 rounded-full bg-slate-300/70 mx-auto absolute left-1/2 -translate-x-1/2 -mt-1" />
            <h3 className="font-semibold">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="p-2 rounded-lg hover:bg-white/70"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 pb-4 pt-2 grid grid-cols-4 gap-3">
            <button
              onClick={shareNative}
              className="group flex flex-col items-center gap-1"
            >
              <div className="h-12 w-12 grid place-items-center rounded-xl bg-white/80 border border-white/60 shadow-sm group-active:scale-95">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-[11px]">Share</span>
            </button>

            <button
              onClick={() => openNew(wa)}
              className="group flex flex-col items-center gap-1"
            >
              <div className="h-12 w-12 grid place-items-center rounded-xl bg-white/80 border border-white/60 shadow-sm group-active:scale-95">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-[11px]">WhatsApp</span>
            </button>

            <button
              onClick={() => openNew(tg)}
              className="group flex flex-col items-center gap-1"
            >
              <div className="h-12 w-12 grid place-items-center rounded-xl bg-white/80 border border-white/60 shadow-sm group-active:scale-95">
                <Send className="h-5 w-5" />
              </div>
              <span className="text-[11px]">Telegram</span>
            </button>

            <button
              onClick={() => openNew(tw)}
              className="group flex flex-col items-center gap-1"
            >
              <div className="h-12 w-12 grid place-items-center rounded-xl bg-white/80 border border-white/60 shadow-sm group-active:scale-95">
                <Share2 className="h-5 w-5" />
              </div>
              <span className="text-[11px]">X</span>
            </button>

            <button
              onClick={copyLink}
              className="group flex flex-col items-center gap-1 col-span-4 mt-1"
            >
              <div className="h-12 w-full grid place-items-center rounded-xl bg-white border border-slate-200 shadow-sm group-active:scale-[0.99]">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <LinkIcon className="h-4 w-4" />
                  Salin Link
                </div>
              </div>
            </button>
          </div>
        </div>
        <div className="h-[env(safe-area-inset-bottom)] bg-transparent" />
      </div>
    </>
  );
}
