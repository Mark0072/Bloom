"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
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
    if (route) setRoute(route);
  }, [route, setRoute]);

  if (!hasHydrated || !storeId || !route) return null;

  return (
    <KioskShell>
      <StoreHeader title={t("routeTitle", language)} />
      <p className="text-sm opacity-70">{t("routeIntro", language)}</p>

      <div className="flex flex-col overflow-y-auto pb-4">
        {route.stops.map((stop, idx) => (
          <div key={stop.zoneId} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {idx + 1}
              </div>
              {idx < route.stops.length - 1 && <div className="w-0.5 flex-1 bg-brand-200" />}
            </div>
            <div className="flex-1 pb-6">
              <p className="font-bold">{stop.zoneLabel}</p>
              {stop.items.length === 0 ? (
                <p className="text-sm opacity-50">—</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1">
                  {stop.items.map((item) => (
                    <li key={item.sku} className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm">
                      {item.name} <span className="opacity-50">· {item.aisle}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <StepNav backHref="/basket/result" nextHref="/assistance" />
    </KioskShell>
  );
}
