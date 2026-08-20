"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProductVisual from "@/components/ProductVisual";
import StateIcon from "@/components/StateIcon";
import StepNav from "@/components/StepNav";
import { getBrandTheme } from "@/lib/brandTheme";
import { t } from "@/lib/i18n";
import { getStoreProduct } from "@/lib/products";
import { generateShoppingRoute } from "@/lib/route";
import { useBloomStore } from "@/store/useBloomStore";

const MAP_MARKERS: Record<string, { left: number; top: number }> = {
  ENTRADA: { left: 8, top: 82 },
  Z01: { left: 27, top: 73 },
  Z02: { left: 42, top: 62 },
  Z03: { left: 54, top: 49 },
  Z04: { left: 52, top: 30 },
  Z05: { left: 67, top: 35 },
  Z06: { left: 68, top: 60 },
  Z07: { left: 79, top: 69 },
  CAJA: { left: 69, top: 87 },
};

export default function RoutePage() {
  const router = useRouter();
  const storeId = useBloomStore((state) => state.storeId);
  const hasHydrated = useBloomStore((state) => state.hasHydrated);
  const language = useBloomStore((state) => state.language);
  const lines = useBloomStore((state) => state.lines);
  const setRoute = useBloomStore((state) => state.setRoute);
  const theme = getBrandTheme(storeId);
  const [mapSource, setMapSource] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  useEffect(() => {
    setMapSource(theme ? `/brand/${theme.key}/store-map.png` : "/brand/shared/store-map.png");
  }, [theme]);

  const route = useMemo(() => (storeId ? generateShoppingRoute(lines, storeId) : null), [storeId, lines]);

  useEffect(() => {
    if (route && lines.length > 0) setRoute(route);
  }, [route, lines.length, setRoute]);

  if (!hasHydrated || !storeId || !route) return null;

  if (lines.length === 0) {
    return (
      <AppShell title={t("routeTitle", language)}>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--bloom-surface-alt)] text-[var(--brand-primary)]" aria-hidden="true">
            <StateIcon name="basket" />
          </div>
          <div>
            <p className="text-xl font-black">{t("emptyRouteTitle", language)}</p>
            <p className="mt-2 text-sm bloom-muted">
              {language === "en" ? "Add products and we will organize the quickest path." : "Agrega productos y organizaremos el recorrido más corto."}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <button type="button" onClick={() => router.push("/basket/start")} className="bloom-btn-primary rounded-2xl py-4">
              {t("goToBasketStart", language)}
            </button>
            <button type="button" onClick={() => router.push("/products")} className="bloom-btn-secondary rounded-2xl py-4">
              {t("goToProducts", language)}
            </button>
          </div>
        </div>
        <StepNav fallbackHref="/home" />
      </AppShell>
    );
  }

  const itemCount = route.stops.reduce((sum, stop) => sum + stop.items.length, 0);

  return (
    <AppShell title={t("routeTitle", language)}>
      <div className="flex flex-col gap-5 overflow-y-auto pb-4">
        <section className="rounded-3xl bg-[var(--brand-primary)] p-5 text-white shadow-lg">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
            {language === "en" ? "Recommended route" : "Ruta recomendada"}
          </p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h1 className="text-3xl font-black leading-tight">
              {language === "en" ? "Follow the numbered stops" : "Sigue las paradas numeradas"}
            </h1>
            <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
              {itemCount} {language === "en" ? "items" : "productos"}
            </span>
          </div>
          <p className="mt-2 text-sm text-white/80">{t("routeIntro", language)}</p>
        </section>

        <figure className="overflow-hidden rounded-3xl border-2 bloom-border bg-white shadow-lg">
          <div className="relative aspect-square w-full overflow-hidden bg-white">
            {mapSource ? (
              <img
                src={mapSource}
                alt={language === "en" ? "Store map with recommended route" : "Mapa de la tienda con la ruta recomendada"}
                className="h-full w-full object-cover object-top"
                onError={() => {
                  if (mapSource !== "/brand/shared/store-map.png") setMapSource("/brand/shared/store-map.png");
                  else setMapSource(null);
                }}
              />
            ) : (
              <div className="absolute inset-4 grid grid-cols-4 gap-3 rounded-2xl bg-slate-50 p-4" aria-hidden="true">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span key={index} className="rounded-lg border-2 border-slate-200 bg-white" />
                ))}
              </div>
            )}

            {route.stops.map((stop, index) => {
              const position = MAP_MARKERS[stop.zoneId] ?? { left: 50, top: 50 };
              return (
                <div
                  key={stop.zoneId}
                  className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--brand-primary)] text-sm font-black text-white shadow-[0_3px_10px_rgba(0,0,0,0.35)]"
                  style={{ left: `${position.left}%`, top: `${position.top}%` }}
                  title={stop.zoneLabel}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
          <figcaption className="border-t bloom-border bg-[var(--bloom-surface-alt)] px-4 py-3 text-center text-xs font-semibold bloom-muted">
            {language === "en" ? "Your route ends at checkout." : "El recorrido termina en caja."}
          </figcaption>
        </figure>

        <section aria-labelledby="route-stops-heading">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="route-stops-heading" className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">
              {language === "en" ? "Stops and products" : "Paradas y productos"}
            </h2>
            <span className="h-px flex-1 bg-[var(--bloom-border)]" />
          </div>

          <ol className="flex flex-col gap-3">
            {route.stops.map((stop, stopIndex) => (
              <li key={stop.zoneId} className="bloom-card overflow-hidden rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 bg-[var(--bloom-surface-alt)] px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] font-black text-white">
                    {stopIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-black">{stop.zoneLabel}</p>
                    <p className="text-xs bloom-muted">
                      {stop.items.length > 0
                        ? `${stop.items.length} ${language === "en" ? "product(s)" : "producto(s)"}`
                        : language === "en" ? "Reference point" : "Punto de referencia"}
                    </p>
                  </div>
                </div>

                {stop.items.map((item, itemIndex) => {
                  const product = getStoreProduct(storeId, item.sku);
                  if (!product) return null;
                  return (
                    <div
                      key={`${item.sku}-${itemIndex}`}
                      className={`flex items-center gap-3 px-4 py-3 ${itemIndex > 0 ? "border-t bloom-border" : ""}`}
                    >
                      <ProductVisual product={product} className="h-14 w-14 shrink-0 rounded-xl" sizes="56px" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold leading-snug">{item.name}</p>
                        <p className="mt-0.5 text-sm font-semibold text-[var(--brand-primary)]">{item.aisle}</p>
                      </div>
                      <span className="text-xl text-[var(--brand-secondary)]" aria-hidden="true">→</span>
                    </div>
                  );
                })}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <StepNav
        fallbackHref="/basket/result"
        nextHref="/checkout"
        nextLabel={language === "en" ? "Review my purchase" : "Revisar mi compra"}
      />
    </AppShell>
  );
}
