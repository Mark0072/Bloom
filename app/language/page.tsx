"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import KioskShell from "@/components/KioskShell";
import { getBrandTheme } from "@/lib/brandTheme";
import { useBloomStore } from "@/store/useBloomStore";
import type { Language } from "@/types";

export default function LanguagePage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const setLanguage = useBloomStore((s) => s.setLanguage);
  const theme = getBrandTheme(storeId);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  function handleSelect(language: Language) {
    setLanguage(language);
    router.push("/home");
  }

  if (!hasHydrated || !theme) return null;

  const isSirena = theme.key === "sirena";

  return (
    <KioskShell fullBleed>
      <div
        className={`relative flex min-h-[100dvh] flex-col overflow-hidden ${
          isSirena ? "bg-[var(--brand-highlight)]" : "bg-[var(--brand-primary)]"
        }`}
      >
        <header className="relative z-10 flex items-center justify-between gap-4 px-5 pb-4 pt-6 sm:px-8 sm:pt-8">
          <BrandLogo theme={theme} inverse={!isSirena} className="h-14 w-40 sm:w-48" />
          <Link
            href="/select-store"
            className={`rounded-full px-4 py-2 text-xs font-bold ${
              isSirena
                ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                : "bg-white/15 text-white"
            }`}
          >
            Cambiar tienda
          </Link>
        </header>

        <main className="relative z-10 flex flex-1 flex-col px-5 pb-6 sm:px-8 sm:pb-8">
          <div
            className={`relative min-h-[42dvh] flex-1 overflow-hidden rounded-[2rem] bg-cover bg-center shadow-2xl ring-1 ring-black/10 ${
              isSirena ? "bg-[#0aa9d2]" : "bg-[#087f4d]"
            }`}
            style={{ backgroundImage: `url(${theme.languagePromo})` }}
            role="img"
            aria-label={isSirena ? "Promoción de Sirena" : "Promoción de Aprezio"}
          >
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
            <p className="absolute bottom-5 left-5 max-w-[75%] text-lg font-black leading-tight text-white drop-shadow-md sm:text-xl">
              {isSirena ? "Compra fácil, a tu ritmo" : "Precios que rinden para todos"}
            </p>
          </div>

          <section className={`pt-7 text-center ${isSirena ? "text-[var(--brand-primary)]" : "text-white"}`}>
            <p className="text-xs font-black uppercase tracking-[0.22em] opacity-70">Bienvenido · Welcome</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Elige tu idioma</h1>
            <p className="mt-1 text-base font-semibold opacity-75">Choose your language</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <LanguageButton code="ES" label="Español" onClick={() => handleSelect("es")} inverted={!isSirena} />
              <LanguageButton code="EN" label="English" onClick={() => handleSelect("en")} inverted={!isSirena} />
            </div>
          </section>
        </main>
      </div>
    </KioskShell>
  );
}

function LanguageButton({
  code,
  label,
  inverted,
  onClick,
}: {
  code: string;
  label: string;
  inverted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-20 items-center justify-center gap-3 rounded-[1.4rem] px-4 py-4 text-lg font-black shadow-xl transition-transform active:scale-[0.98] ${
        inverted
          ? "bg-white text-[var(--brand-primary)]"
          : "bg-[var(--brand-primary)] text-white"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs tracking-wider ${
          inverted ? "bg-[var(--brand-highlight)]" : "bg-white/15"
        }`}
        aria-hidden="true"
      >
        {code}
      </span>
      <span>{label}</span>
    </button>
  );
}
