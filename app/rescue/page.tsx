"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import StepNav from "@/components/StepNav";
import Modal from "@/components/Modal";
import { formatMoney } from "@/lib/money";
import { getRescueOffers, getManualBundles, calculateBundlePrice, addRescueItemToBasket, addBundleToBasket, type RescueOffer } from "@/lib/rescue";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import { translateCategory } from "@/lib/categoryNames";
import type { Language } from "@/types";

function consumptionHint(offer: RescueOffer, language: Language): string {
  const cls = offer.attributes.perishableClass;
  if (language === "en") {
    if (cls === "prepared_food") return "Recommended: eat today.";
    if (cls === "raw_meat_fish") return "Recommended: cook within 24-48 hours.";
    if (cls === "bakery") return "Recommended: eat within 1-2 days.";
    if (cls === "fresh_dairy") return "Recommended: refrigerate and consume soon.";
    if (cls === "fresh_produce") return "Recommended: eat within the next few days.";
    return "Recommended: consume soon.";
  }
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
  const addRescueLine = useBloomStore((s) => s.addRescueLine);
  const addBundleLines = useBloomStore((s) => s.addBundleLines);
  const logRescueAddition = useBloomStore((s) => s.logRescueAddition);
  const logBundleAddition = useBloomStore((s) => s.logBundleAddition);
  const pushToast = useBloomStore((s) => s.pushToast);
  const lines = useBloomStore((s) => s.lines);

  const [wantsToSee, setWantsToSee] = useState<boolean | null>(null);
  const [pendingOverBudget, setPendingOverBudget] = useState<
    { kind: "rescue"; offer: RescueOffer } | { kind: "bundle"; bundleId: string } | null
  >(null);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  if (!hasHydrated || !storeId) return null;

  const offers = getRescueOffers(storeId);
  const bundles = getManualBundles(storeId);

  function handleAddOffer(offer: RescueOffer, allowOverBudget = false) {
    const line = addRescueItemToBasket(offer, 1, language);
    const result = addRescueLine(line, { allowOverBudget });
    if (result.ok) {
      logRescueAddition(offer.sku);
      pushToast(t("addedToCartToast", language), "success");
    } else if (result.reason === "budget") {
      setPendingOverBudget({ kind: "rescue", offer });
    } else if (result.reason === "stock") {
      pushToast(t("maxStockReached", language), "error");
    }
  }

  function handleAddBundle(bundleId: string, allowOverBudget = false) {
    const bundle = bundles.find((b) => b.bundleId === bundleId);
    if (!bundle || !storeId) return;
    const bundleLines = addBundleToBasket(bundle, storeId, language);
    const result = addBundleLines(bundleLines, { allowOverBudget });
    if (result.ok) {
      logBundleAddition(bundle.bundleId);
      pushToast(t("addedToCartToast", language), "success");
    } else if (result.reason === "budget") {
      setPendingOverBudget({ kind: "bundle", bundleId });
    }
  }

  function confirmPendingOverBudget() {
    if (!pendingOverBudget) return;
    if (pendingOverBudget.kind === "rescue") handleAddOffer(pendingOverBudget.offer, true);
    else handleAddBundle(pendingOverBudget.bundleId, true);
    setPendingOverBudget(null);
  }

  if (wantsToSee === null) {
    return (
      <AppShell title={t("rescueTitle", language)}>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <span className="text-5xl">💚</span>
          <p className="text-kiosk-base font-semibold">{t("rescueIntro", language)}</p>
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={() => setWantsToSee(true)}
              className="rounded-2xl bg-[var(--bloom-warning)] py-4 text-kiosk-base font-bold text-black"
            >
              {t("rescueTitle", language)} ({offers.length})
            </button>
            <button
              type="button"
              onClick={() => router.push(lines.length > 0 ? "/route" : "/basket/start")}
              className="bloom-btn-secondary rounded-2xl py-4"
            >
              {t("rescueSkip", language)}
            </button>
          </div>
        </div>
        <StepNav fallbackHref="/basket/result" />
      </AppShell>
    );
  }

  return (
    <AppShell title={t("rescueTitle", language)}>
      <p className="bloom-card-alt rounded-xl p-3 text-sm font-medium">{t("rescueIntro", language)}</p>

      <div className="flex flex-col gap-3 overflow-y-auto pb-4">
        {offers.map((offer) => {
          const alreadyAdded = lines.some((l) => l.sku === offer.sku && l.isRescue);
          return (
            <div key={offer.sku} className="bloom-card rounded-2xl p-4">
              <p className="font-bold">{offer.name}</p>
              <p className="text-sm bloom-muted">{translateCategory(offer.category, language)}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm line-through bloom-muted">{formatMoney(offer.price)}</span>
                <span className="text-kiosk-base font-extrabold text-[var(--bloom-warning)]">{formatMoney(offer.rescuePrice)}</span>
                <span className="rounded-full bg-[var(--bloom-warning)] px-2 py-0.5 text-xs font-bold text-black">
                  -{offer.discountPercent}%
                </span>
              </div>
              <p className="mt-1 text-xs bloom-muted">
                {offer.daysRemaining} {t("rescueDaysLeft", language)} · {consumptionHint(offer, language)}
              </p>
              <button
                type="button"
                disabled={alreadyAdded}
                onClick={() => handleAddOffer(offer)}
                className="mt-3 w-full rounded-xl bg-[var(--bloom-warning)] py-3 text-sm font-bold text-black disabled:opacity-40"
              >
                {alreadyAdded ? t("bundleAlreadyAdded", language) : t("rescueAdd", language)}
              </button>
            </div>
          );
        })}
        {offers.length === 0 && (
          <p className="text-center bloom-muted py-6">
            {language === "en" ? "No Rescue Offers available today." : "No hay Ofertas de Rescate disponibles hoy."}
          </p>
        )}

        {bundles.length > 0 && (
          <div className="mt-2">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide bloom-muted">{t("bundlesTitle", language)}</p>
            <div className="flex flex-col gap-3">
              {bundles.map((bundle) => {
                const { total, savings } = calculateBundlePrice(bundle, storeId);
                const already = lines.some((l) => l.bundleId === bundle.bundleId);
                return (
                  <div key={bundle.bundleId} className="bloom-card rounded-2xl border-blue-300 p-4">
                    <p className="font-bold">{bundle.name}</p>
                    <p className="text-sm bloom-muted">{bundle.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-kiosk-base font-extrabold">{formatMoney(total)}</span>
                      {savings > 0 && (
                        <span className="text-xs font-semibold text-blue-600">
                          {language === "en" ? `Save ${formatMoney(savings)}` : `Ahorras ${formatMoney(savings)}`}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={already}
                      onClick={() => handleAddBundle(bundle.bundleId)}
                      className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {already ? t("bundleAlreadyAdded", language) : t("addBundle", language)}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <StepNav fallbackHref="/basket/result" nextHref="/route" nextDisabled={lines.length === 0} />

      {pendingOverBudget && (
        <Modal
          title={t("budgetExceededTitle", language)}
          onClose={() => setPendingOverBudget(null)}
          closeLabel={t("close", language)}
        >
          <p className="mb-4 text-sm bloom-muted">{t("budgetExceededBody", language)}</p>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={confirmPendingOverBudget} className="bloom-btn-primary rounded-2xl py-3">
              {t("addAnyway", language)}
            </button>
            <button type="button" onClick={() => setPendingOverBudget(null)} className="bloom-btn-secondary rounded-2xl py-3">
              {t("cancel", language)}
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
