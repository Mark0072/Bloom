"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import StepNav from "@/components/StepNav";
import { generateShoppingRoute } from "@/lib/route";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

export default function RoutePage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const lines = useBloomStore((s) => s.lines);
  const setRoute = useBloomStore((s) => s.setRoute);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  const route = useMemo(() => (storeId ? generateShoppingRoute(lines, storeId) : null), [storeId, lines]);

  useEffect(() => {
    if (route && lines.length > 0) setRoute(route);
  }, [route, lines.length, setRoute]);

  if (!hasHydrated || !storeId || !route) return null;

  if (lines.length === 0) {
    return (
      <AppShell title={t("routeTitle", language)}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-5xl">🧺</span>
          <p className="text-kiosk-base font-bold">{t("emptyRouteTitle", language)}</p>
          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => router.push("/basket/start")}
              className="bloom-btn-primary rounded-2xl py-4"
            >
              {t("goToBasketStart", language)}
            </button>
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="bloom-btn-secondary rounded-2xl py-4"
            >
              {t("goToProducts", language)}
            </button>
          </div>
        </div>
        <StepNav fallbackHref="/home" />
      </AppShell>
    );
  }

  return (
    <AppShell title={t("routeTitle", language)}>
      <p className="text-sm bloom-muted">{t("routeIntro", language)}</p>

      <div className="flex flex-col overflow-y-auto pb-4">
        {route.stops.map((stop, idx) => (
          <div key={stop.zoneId} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bloom-accent)] text-sm font-bold text-[var(--bloom-accent-text)]">
                {idx + 1}
              </div>
              {idx < route.stops.length - 1 && <div className="w-0.5 flex-1 bg-[var(--bloom-border)]" />}
            </div>
            <div className="flex-1 pb-6">
              <p className="font-bold">{stop.zoneLabel}</p>
              {stop.items.length === 0 ? (
                <p className="text-sm bloom-muted">—</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1">
                  {stop.items.map((item) => (
                    <li key={item.sku} className="bloom-card rounded-lg px-3 py-2 text-sm">
                      {item.name} <span className="bloom-muted">· {item.aisle}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <StepNav fallbackHref="/basket/result" nextHref="/checkout" />
    </AppShell>
  );
}
