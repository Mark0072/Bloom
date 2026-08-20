"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import { getBrandTheme } from "@/lib/brandTheme";
import { t } from "@/lib/i18n";
import { useBloomStore } from "@/store/useBloomStore";

export default function ThanksPage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const resetFlow = useBloomStore((s) => s.resetFlow);
  const theme = getBrandTheme(storeId);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  function handleRestart() {
    resetFlow();
    router.push("/select-store");
  }

  if (!hasHydrated || !theme) return null;

  const isSirena = theme.key === "sirena";

  return (
    <KioskShell fullBleed>
      <div
        className={`relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-7 py-12 text-center sm:px-10 ${
          isSirena
            ? "bg-[var(--brand-highlight)] text-[var(--brand-primary)]"
            : "bg-white text-[var(--brand-primary)]"
        }`}
      >
        <div
          className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full ${
            isSirena ? "bg-[var(--brand-secondary)]/25" : "bg-[var(--brand-highlight)]"
          }`}
          aria-hidden="true"
        />
        <div
          className={`pointer-events-none absolute -bottom-36 -left-28 h-80 w-80 rounded-full ${
            isSirena ? "bg-white/35" : "bg-[var(--brand-primary)]/10"
          }`}
          aria-hidden="true"
        />

        <main className="relative z-10 flex w-full max-w-xl flex-col items-center">
          <div
            className={`relative w-full overflow-hidden rounded-[2rem] p-8 shadow-xl ${
              isSirena ? "bg-white/65" : "bg-[var(--brand-primary)]"
            }`}
          >
            <div className="relative mx-auto h-28 w-full max-w-sm sm:h-36">
              <Image src={theme.logo} alt={theme.name} fill sizes="384px" className="object-contain" priority />
            </div>
            {isSirena && <p className="mt-2 text-lg font-semibold text-[var(--brand-primary)]">{theme.shortTagline}</p>}
          </div>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.25em] opacity-65">
            {language === "en" ? "Purchase route completed" : "Recorrido completado"}
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">{t("thanksTitle", language)}</h1>
          <p className="mt-4 max-w-md text-lg font-semibold leading-relaxed opacity-80">{t("thanksSubtitle", language)}</p>

          <button
            type="button"
            onClick={handleRestart}
            className={`mt-9 min-h-16 w-full rounded-[1.4rem] px-6 py-4 text-xl font-black shadow-xl active:scale-[0.985] ${
              isSirena
                ? "bg-[var(--brand-primary)] text-white"
                : "bg-[var(--brand-highlight)] text-[var(--brand-primary)]"
            }`}
          >
            {t("restart", language)}
          </button>

          <p className="mt-5 text-sm font-black">{language === "en" ? "Thank you for your time." : "¡Gracias por su tiempo!"}</p>
        </main>
      </div>
    </KioskShell>
  );
}
