"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import { useBloomStore } from "@/store/useBloomStore";
import type { Language } from "@/types";

export default function LanguagePage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const setLanguage = useBloomStore((s) => s.setLanguage);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  function handleSelect(language: Language) {
    setLanguage(language);
    router.push("/home");
  }

  return (
    <KioskShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
        <div className="text-center">
          <h1 className="text-kiosk-lg font-extrabold">Elige tu idioma</h1>
          <p className="mt-2 opacity-70">Choose your language</p>
        </div>

        <div className="flex w-full flex-col gap-5">
          <button
            type="button"
            onClick={() => handleSelect("es")}
            className="bloom-card flex items-center gap-4 rounded-3xl p-6 text-left shadow-lg border-2 active:scale-[0.98]"
          >
            <span className="text-4xl">🇩🇴</span>
            <p className="text-kiosk-lg font-extrabold">Español</p>
          </button>
          <button
            type="button"
            onClick={() => handleSelect("en")}
            className="bloom-card flex items-center gap-4 rounded-3xl p-6 text-left shadow-lg border-2 active:scale-[0.98]"
          >
            <span className="text-4xl">🇺🇸</span>
            <p className="text-kiosk-lg font-extrabold">English</p>
          </button>
        </div>
      </div>
    </KioskShell>
  );
}
