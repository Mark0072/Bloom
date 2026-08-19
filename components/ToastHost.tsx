"use client";

import { useEffect } from "react";
import { useBloomStore } from "@/store/useBloomStore";

const TONE_STYLES: Record<string, string> = {
  success: "bg-[var(--bloom-accent)] text-[var(--bloom-accent-text)]",
  error: "bg-[var(--bloom-danger)] text-white",
  info: "bg-[var(--bloom-text)] text-[var(--bloom-bg)]",
};

export default function ToastHost() {
  const toasts = useBloomStore((s) => s.toasts);
  const dismissToast = useBloomStore((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => window.setTimeout(() => dismissToast(toast.id), 3200));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`w-full max-w-md rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-lg ${
            TONE_STYLES[toast.tone] ?? TONE_STYLES.info
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
