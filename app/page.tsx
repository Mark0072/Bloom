"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import KioskShell from "@/components/KioskShell";
import { getBrandTheme } from "@/lib/brandTheme";
import { useBloomStore } from "@/store/useBloomStore";

export default function WelcomePage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const theme = getBrandTheme(storeId);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  if (!hasHydrated || !theme) return null;

  const isSirena = theme.key === "sirena";

  return (
    <KioskShell fullBleed>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--brand-primary)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-[position:62%_bottom] opacity-95"
          style={{ backgroundImage: `url(${theme.welcomeHero})` }}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-0 ${
            isSirena
              ? "bg-gradient-to-b from-[#08a8cf]/40 via-[#07558b]/40 to-[#003f78]"
              : "bg-gradient-to-b from-[#087f4d]/35 via-[#087f4d]/55 to-[#006c3e]"
          }`}
          aria-hidden="true"
        />
        <div
          className={`pointer-events-none absolute rounded-full bg-[var(--brand-highlight)] ${
            isSirena ? "-right-24 top-[14%] h-64 w-64 opacity-90" : "-right-28 -top-20 h-80 w-80 opacity-95"
          }`}
          aria-hidden="true"
        />

        <header className="relative z-10 flex items-start justify-between gap-4 px-6 pt-7 sm:px-9 sm:pt-9">
          <BrandLogo theme={theme} inverse className="h-16 w-48" />
          <Link
            href="/select-store"
            className="rounded-full bg-black/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm"
          >
            Cambiar tienda
          </Link>
        </header>

        <main className="relative z-10 mt-auto flex max-w-2xl flex-col items-start px-6 pb-10 sm:px-9 sm:pb-12">
          <p className="inline-flex -rotate-1 rounded-xl bg-[var(--brand-highlight)] px-4 py-2 text-sm font-black uppercase tracking-[0.1em] text-[var(--brand-primary)] shadow-lg">
            {theme.welcome.accent}
          </p>
          <p className="mt-5 text-xl font-black uppercase tracking-wide text-white sm:text-2xl">{theme.welcome.eyebrow}</p>
          <h1 className="mt-1 max-w-xl text-5xl font-black leading-[0.94] tracking-tight text-white drop-shadow-lg sm:text-6xl">
            {theme.welcome.headline}
          </h1>
          <p className="mt-5 max-w-md text-base font-semibold leading-relaxed text-white/90 sm:text-lg">{theme.welcome.description}</p>
          <button
            type="button"
            onClick={() => router.push("/language")}
            className="mt-7 flex min-h-16 w-full items-center justify-between rounded-[1.4rem] bg-white px-6 py-4 text-left text-xl font-black text-[var(--brand-primary)] shadow-2xl active:scale-[0.985] sm:max-w-sm"
          >
            <span>Toca aquí</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-highlight)]" aria-hidden="true">→</span>
          </button>
        </main>
      </div>
    </KioskShell>
  );
}
