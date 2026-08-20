"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import BrandLogo from "@/components/BrandLogo";
import AssistanceModal from "@/components/AssistanceModal";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import ToastHost from "@/components/ToastHost";
import { getBrandTheme } from "@/lib/brandTheme";
import { getStore } from "@/lib/products";
import { formatMoney } from "@/lib/money";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

type IconName = "home" | "search" | "basket" | "rescue" | "menu" | "accessibility" | "assistance";

const NAV_ITEMS: { key: "navProducts" | "navBasket" | "navRescue"; href: string; match: string; icon: IconName }[] = [
  { key: "navProducts", href: "/products", match: "/products", icon: "search" },
  { key: "navBasket", href: "/basket/start", match: "/basket", icon: "basket" },
  { key: "navRescue", href: "/rescue", match: "/rescue", icon: "rescue" },
];

export default function AppShell({
  title,
  children,
  preserveTrueColor = false,
}: {
  title?: string;
  children: React.ReactNode;
  preserveTrueColor?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const storeId = useBloomStore((s) => s.storeId);
  const language = useBloomStore((s) => s.language);
  const lines = useBloomStore((s) => s.lines);
  const assistance = useBloomStore((s) => s.assistance);

  const [menuOpen, setMenuOpen] = useState(false);
  const [assistanceOpen, setAssistanceOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const store = storeId ? getStore(storeId) : null;
  const theme = getBrandTheme(storeId);
  const unitCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const hasActiveAssistance = assistance?.status === "activa";

  function goToCart() {
    router.push(lines.length > 0 ? "/basket/result" : "/basket/start");
  }

  if (!theme) return <KioskShell preserveTrueColor={preserveTrueColor}>{children}</KioskShell>;

  return (
    <KioskShell fullBleed preserveTrueColor={preserveTrueColor}>
      <div className="relative flex h-[100dvh] w-full bg-[var(--bloom-bg)]">
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 bg-[var(--bloom-surface)]/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={t("navMenu", language)}
                aria-expanded={menuOpen}
                aria-controls="app-navigation-drawer"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--bloom-surface-alt)] text-[var(--brand-primary)] shadow-sm ring-1 ring-black/5"
              >
                <ShellIcon name="menu" />
              </button>

              <BrandLogo theme={theme} className="h-11 w-28 md:hidden" />

              <div className="hidden min-w-0 flex-1 min-[520px]:block">
                <p className="hidden text-xs font-bold uppercase tracking-[0.16em] text-[var(--bloom-text-muted)] md:block">
                  {store?.publicDisplayName}
                </p>
                <h1 className="truncate text-lg font-black text-[var(--bloom-text)] sm:text-xl">{title ?? t("homeGreeting", language)}</h1>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAccessibilityOpen(true)}
                  aria-label={t("accessibility", language)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bloom-surface-alt)] text-[var(--brand-primary)] shadow-sm ring-1 ring-black/5"
                >
                  <ShellIcon name="accessibility" />
                </button>
                <button
                  type="button"
                  onClick={() => setAssistanceOpen(true)}
                  aria-label={t("assistanceCta", language)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bloom-surface-alt)] text-[var(--brand-primary)] shadow-sm ring-1 ring-black/5"
                >
                  <ShellIcon name="assistance" />
                  {hasActiveAssistance && (
                    <span
                      className="absolute right-1 top-1 h-3 w-3 rounded-full bg-[var(--bloom-danger)] ring-2 ring-[var(--bloom-surface)]"
                      aria-label={t("assistanceActive", language)}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={goToCart}
                  className="flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--bloom-accent)] px-3 py-2 text-[var(--bloom-accent-text)] shadow-md active:scale-[0.98]"
                >
                  <span className="relative" aria-hidden="true">
                    <ShellIcon name="basket" />
                    {unitCount > 0 && (
                      <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-highlight)] px-1 text-[10px] font-black text-[var(--brand-primary)]">
                        {unitCount}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-[10px] font-bold uppercase tracking-wide opacity-85">{t("myCart", language)}</span>
                    <span className="block text-sm font-black leading-none">{formatMoney(cartTotal)}</span>
                  </span>
                </button>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">{children}</div>
          </main>
        </section>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label={t("navMenu", language)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setMenuOpen(false);
          }}
        >
          <aside
            id="app-navigation-drawer"
            className="flex h-full w-[18rem] max-w-[84vw] flex-col bg-[var(--brand-sidebar)] px-4 py-5 text-[var(--brand-sidebar-text)] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <BrandLogo theme={theme} inverse className="h-14 w-36" />
              <button
                type="button"
                autoFocus
                onClick={() => setMenuOpen(false)}
                aria-label={t("close", language)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl text-white"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-[var(--brand-sidebar-muted)]">{theme.shortTagline}</p>
            <ShellNavigation pathname={pathname} language={language} onNavigate={() => setMenuOpen(false)} />
            <div className="mt-auto rounded-2xl bg-white/10 p-3 text-xs leading-relaxed">
              <p className="font-bold text-white">{store?.branchName}</p>
              <Link
                href="/select-store"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex font-semibold text-[var(--brand-sidebar-muted)] underline-offset-4 hover:underline"
              >
                {language === "en" ? "Change store" : "Cambiar tienda"}
              </Link>
            </div>
          </aside>
          <button
            type="button"
            className="flex-1 bg-black/55"
            aria-label={t("close", language)}
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}

      {assistanceOpen && (
        <AssistanceModal
          onClose={() => setAssistanceOpen(false)}
          onOpenAccessibilityPanel={() => {
            setAssistanceOpen(false);
            setAccessibilityOpen(true);
          }}
        />
      )}
      {accessibilityOpen && <AccessibilityPanel onClose={() => setAccessibilityOpen(false)} />}
      <ToastHost />
    </KioskShell>
  );
}

function ShellNavigation({ pathname, language, onNavigate }: { pathname: string; language: "es" | "en"; onNavigate?: () => void }) {
  const homeActive = pathname === "/home";
  return (
    <nav className="mt-8 flex flex-col gap-2" aria-label={language === "en" ? "Main navigation" : "Navegación principal"}>
      <Link href="/home" onClick={onNavigate} aria-current={homeActive ? "page" : undefined} className={navClass(homeActive)}>
        <ShellIcon name="home" />
        <span>{language === "en" ? "Home" : "Inicio"}</span>
      </Link>
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.match);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={navClass(active)}>
            <ShellIcon name={item.icon} />
            <span>{t(item.key, language)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function navClass(active: boolean): string {
  return `flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-colors ${
    active ? "bg-[var(--brand-highlight)] text-[var(--brand-primary)] shadow-md" : "text-[var(--brand-sidebar-text)] hover:bg-white/10"
  }`;
}

function ShellIcon({ name }: { name: IconName }) {
  const common = "h-5 w-5 shrink-0";
  if (name === "menu") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "home") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
  if (name === "search") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>;
  if (name === "basket") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9h16l-1.5 11h-13zM8 9l4-6 4 6" /><path d="M9 13v3M15 13v3" /></svg>;
  if (name === "rescue") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z" /><path d="M4 21c2-5 6-9 12-12" /></svg>;
  if (name === "accessibility") return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4.5" r="2" /><path d="M5 8h14M12 7v6M8 21l4-8 4 8M7 12l5 2 5-2" /></svg>;
  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-5 3.5-8 8-8s7.2 3 8 8" /><path d="M19 5v6M16 8h6" /></svg>;
}
