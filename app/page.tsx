"use client";

import { useRouter } from "next/navigation";
import { useBloomStore } from "@/store/useBloomStore";
import { getColorFilterValue } from "@/lib/accessibility";

export default function WelcomePage() {
  const router = useRouter();
  const accessibility = useBloomStore((s) => s.accessibility);

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--bloom-accent)] px-6 text-center text-[var(--bloom-accent-text)]"
      data-contrast={accessibility.highContrast ? "high" : undefined}
      data-textsize={accessibility.largeText ? "large" : undefined}
      style={{ filter: getColorFilterValue(accessibility.colorProfile) }}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--bloom-surface)] text-5xl shadow-lg">🛒</div>
        <div>
          <h1 className="text-kiosk-xl font-extrabold">Compra Asistida</h1>
          <p className="mt-2 text-kiosk-base opacity-90">
            Te ayudamos a comprar más fácil, más rápido y sin pasarte del presupuesto.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/select-store")}
          className="w-full rounded-2xl bg-[var(--bloom-surface)] py-5 text-kiosk-lg font-bold text-[var(--bloom-accent)] shadow-xl active:scale-[0.98]"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
