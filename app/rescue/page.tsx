"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
import StepNav from "@/components/StepNav";
import { formatMoney } from "@/lib/money";
import { getRescueOffers, getManualBundles, calculateBundlePrice, addRescueItemToBasket, addBundleToBasket, type RescueOffer } from "@/lib/rescue";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

function consumptionHint(offer: RescueOffer): string {
  const cls = offer.attributes.perishableClass;
  if (cls === "prepared_food") return "Recomendado: consumir hoy mismo.";
  if (cls === "raw_meat_fish") return "Recomendado: cocinar en las próximas 24-48 horas.";
  if (cls === "bakery") return "Recomendado: consumir en 1-2 días.";
  if (cls === "fresh_dairy") return "Recomendado: refrigerar y consumir pronto.";
  if (cls === "fresh_produce") return "Recomendado: consumir en los próximos días.";
  return "Recomendado: consumir pronto.";
}

export default function RescuePage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const addLine = useBloomStore((s) => s.addLine);
  const logRescueAddition = useBloomStore((s) => s.logRescueAddition);
  const logBundleAddition = useBloomStore((s) => s.logBundleAddition);
  const lines = useBloomStore((s) => s.lines);

  const [wantsToSee, setWantsToSee] = useState<boolean | null>(null);
  const [addedSkus, setAddedSkus] = useState<Set<string>>(new Set());
  const [addedBundles, setAddedBundles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  if (!hasHydrated || !storeId) return null;

  const offers = getRescueOffers(storeId);
  const bundles = getManualBundles(storeId);

  function handleAddOffer(offer: RescueOffer) {
    const line = addRescueItemToBasket(offer, 1);
    addLine(line);
    logRescueAddition(offer.sku);
    setAddedSkus((prev) => new Set(prev).add(offer.sku));
  }

  function handleAddBundle(bundleId: string) {
    const bundle = bundles.find((b) => b.bundleId === bundleId);
    if (!bundle || !storeId) return;
    const bundleLines = addBundleToBasket(bundle, storeId);
    bundleLines.forEach((line) => addLine(line));
    logBundleAddition(bundle.bundleId);
    setAddedBundles((prev) => new Set(prev).add(bundleId));
  }

  if (wantsToSee === null) {
    return (
      <KioskShell>
        <StoreHeader title={t("rescueTitle", language)} />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <span className="text-5xl">💚</span>
          <p className="text-kiosk-base font-semibold">{t("rescueIntro", language)}</p>
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={() => setWantsToSee(true)}
              className="rounded-2xl bg-rescue-500 py-4 text-kiosk-base font-bold text-white"
            >
              Ver Ofertas de Rescate ({offers.length})
            </button>
            <button
              type="button"
              onClick={() => router.push("/route")}
              className="rounded-2xl border-2 border-slate-300 bg-white py-4 font-bold text-slate-700"
            >
              {t("rescueSkip", language)}
            </button>
          </div>
        </div>
        <StepNav backHref="/basket/result" />
      </KioskShell>
    );
  }

  return (
    <KioskShell>
      <StoreHeader title={t("rescueTitle", language)} />
      <p className="rounded-xl bg-rescue-100 p-3 text-sm text-rescue-700 font-medium">{t("rescueIntro", language)}</p>

      <div className="flex flex-col gap-3 overflow-y-auto pb-4">
        {offers.map((offer) => {
          const alreadyAdded = addedSkus.has(offer.sku) || lines.some((l) => l.sku === offer.sku && l.isRescue);
          return (
            <div key={offer.sku} className="rounded-2xl border border-rescue-500/40 bg-white p-4">
              <p className="font-bold">{offer.name}</p>
              <p className="text-sm opacity-70">{offer.category}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm line-through opacity-50">{formatMoney(offer.price)}</span>
                <span className="text-kiosk-base font-extrabold text-rescue-700">{formatMoney(offer.rescuePrice)}</span>
                <span className="rounded-full bg-rescue-500 px-2 py-0.5 text-xs font-bold text-white">
                  -{offer.discountPercent}%
                </span>
              </div>
              <p className="mt-1 text-xs opacity-70">
                {offer.daysRemaining} {t("rescueDaysLeft", language)} · {consumptionHint(offer)}
              </p>
              <button
                type="button"
                disabled={alreadyAdded}
                onClick={() => handleAddOffer(offer)}
                className="mt-3 w-full rounded-xl bg-rescue-500 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                {alreadyAdded ? "Agregado ✓" : t("rescueAdd", language)}
              </button>
            </div>
          );
        })}
        {offers.length === 0 && <p className="text-center opacity-60 py-6">No hay Ofertas de Rescate disponibles hoy.</p>}

        {bundles.length > 0 && (
          <div className="mt-2">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide opacity-60">{t("bundlesTitle", language)}</p>
            <div className="flex flex-col gap-3">
              {bundles.map((bundle) => {
                const { total, savings } = calculateBundlePrice(bundle, storeId);
                const already = addedBundles.has(bundle.bundleId);
                return (
                  <div key={bundle.bundleId} className="rounded-2xl border border-blue-300 bg-blue-50 p-4">
                    <p className="font-bold text-blue-900">{bundle.name}</p>
                    <p className="text-sm text-blue-800/80">{bundle.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-kiosk-base font-extrabold text-blue-900">{formatMoney(total)}</span>
                      {savings > 0 && <span className="text-xs font-semibold text-blue-700">Ahorras {formatMoney(savings)}</span>}
                    </div>
                    <button
                      type="button"
                      disabled={already}
                      onClick={() => handleAddBundle(bundle.bundleId)}
                      className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {already ? "Agregado ✓" : t("addBundle", language)}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <StepNav backHref="/basket/result" nextHref="/route" />
    </KioskShell>
  );
}
