"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import AssistanceModal from "@/components/AssistanceModal";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import ToastHost from "@/components/ToastHost";
import { getStore } from "@/lib/products";
import { formatMoney } from "@/lib/money";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

const NAV_ITEMS = [
  { key: "navProducts" as const, href: "/products", emoji: "🔍" },
  { key: "navBasket" as const, href: "/basket/start", emoji: "🧺" },
  { key: "navRescue" as const, href: "/rescue", emoji: "💚" },
];

export default function AppShell({ title, children }: { title?: string; children: React.ReactNode }) {
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
  const unitCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const hasActiveAssistance = assistance && assistance.status === "activa";

  function goToCart() {
    router.push(lines.length > 0 ? "/basket/result" : "/basket/start");
  }

  return (
    <KioskShell>
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("navMenu", language)}
              className="bloom-btn-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
            >
              ☰
            </button>
            <div className="min-w-0">
              <p className="truncate font-bold text-xl">{store?.publicDisplayName ?? "Bloom"}</p>
              {title && <p className="truncate text-sm bloom-muted">{title}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setAccessibilityOpen(true)}
              aria-label={t("accessibility", language)}
              className="bloom-btn-secondary flex h-10 w-10 items-center justify-center rounded-xl text-lg"
            >
              ♿
            </button>
            <button
              type="button"
              onClick={() => setAssistanceOpen(true)}
              aria-label={t("assistanceCta", language)}
              className="bloom-btn-secondary relative flex h-10 w-10 items-center justify-center rounded-xl text-lg"
            >
              🙋
              {hasActiveAssistance && (
                <span
                  className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--bloom-danger)]"
                  aria-label={t("assistanceActive", language)}
                />
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={goToCart}
          className="bloom-btn-primary flex w-full items-center justify-between rounded-2xl px-4 py-3"
        >
          <span className="flex items-center gap-2 font-bold">
            🛒 {t("myCart", language)}
            {unitCount > 0 && (
              <span className="rounded-full bg-black/15 px-2 py-0.5 text-xs">
                {unitCount} {t("cartUnits", language)}
              </span>
            )}
          </span>
          <span className="font-bold">{formatMoney(cartTotal)}</span>
        </button>
      </header>

      {children}

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label={t("navMenu", language)}>
          <div className="bloom-card flex h-full w-72 max-w-[80vw] flex-col gap-2 p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-extrabold">{t("navMenu", language)}</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t("close", language)}
                className="bloom-btn-secondary flex h-8 w-8 items-center justify-center rounded-full"
              >
                ×
              </button>
            </div>
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${
                    active ? "bloom-btn-primary" : "bloom-btn-secondary"
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  {t(item.key, language)}
                </Link>
              );
            })}
            <Link
              href="/home"
              onClick={() => setMenuOpen(false)}
              className="bloom-btn-secondary mt-2 flex items-center gap-3 rounded-xl px-4 py-3 font-semibold"
            >
              <span className="text-xl">🏠</span>
              {t("homeGreeting", language)}
            </Link>
          </div>
          <button
            type="button"
            className="flex-1 bg-black/40"
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
