"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import RescueBundleCard from "@/components/RescueBundleCard";
import RescueOfferCard from "@/components/RescueOfferCard";
import StepNav from "@/components/StepNav";
import { translateCategory } from "@/lib/categoryNames";
import { t } from "@/lib/i18n";
import { getStoreProduct } from "@/lib/products";
import {
  addBundleToBasket,
  addRescueItemToBasket,
  calculateBundlePrice,
  getManualBundles,
  getRescueOffers,
  type RescueOffer,
} from "@/lib/rescue";
import { useBloomStore } from "@/store/useBloomStore";
import type { StoreProduct } from "@/types";

function FilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold shadow-sm transition active:scale-[0.98] ${
        active ? "bloom-btn-primary" : "bloom-btn-secondary"
      }`}
    >
      {label}
    </button>
  );
}

function RescueMark() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--bloom-accent)] text-[var(--bloom-accent-text)] shadow-sm">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 11a8 8 0 1 1-2.3-5.7" strokeLinecap="round" />
        <path d="M20 4v7h-7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 12.5 11 15l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function RescuePage() {
  const router = useRouter();
  const storeId = useBloomStore((state) => state.storeId);
  const hasHydrated = useBloomStore((state) => state.hasHydrated);
  const language = useBloomStore((state) => state.language);
  const addRescueLine = useBloomStore((state) => state.addRescueLine);
  const addBundleLines = useBloomStore((state) => state.addBundleLines);
  const logRescueAddition = useBloomStore((state) => state.logRescueAddition);
  const logBundleAddition = useBloomStore((state) => state.logBundleAddition);
  const pushToast = useBloomStore((state) => state.pushToast);
  const lines = useBloomStore((state) => state.lines);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [pendingOverBudget, setPendingOverBudget] = useState<
    { kind: "rescue"; offer: RescueOffer } | { kind: "bundle"; bundleId: string } | null
  >(null);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  const offers = useMemo(() => (storeId ? getRescueOffers(storeId) : []), [storeId]);
  const bundles = useMemo(() => (storeId ? getManualBundles(storeId) : []), [storeId]);
  const categories = useMemo(() => Array.from(new Set(offers.map((offer) => offer.category))), [offers]);
  const visibleOffers = selectedCategory ? offers.filter((offer) => offer.category === selectedCategory) : offers;

  if (!hasHydrated || !storeId) return null;

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
    if (!storeId) return;
    const bundle = bundles.find((candidate) => candidate.bundleId === bundleId);
    if (!bundle) return;

    const bundleLines = addBundleToBasket(bundle, storeId, language);
    const result = addBundleLines(bundleLines, { allowOverBudget });
    if (result.ok) {
      logBundleAddition(bundle.bundleId);
      pushToast(t("addedToCartToast", language), "success");
    } else if (result.reason === "budget") {
      setPendingOverBudget({ kind: "bundle", bundleId });
    } else if (result.reason === "stock") {
      pushToast(t("maxStockReached", language), "error");
    }
  }

  function confirmPendingOverBudget() {
    if (!pendingOverBudget) return;
    if (pendingOverBudget.kind === "rescue") handleAddOffer(pendingOverBudget.offer, true);
    else handleAddBundle(pendingOverBudget.bundleId, true);
    setPendingOverBudget(null);
  }

  return (
    <AppShell title={t("rescueTitle", language)}>
      <section className="bloom-card-alt flex items-center gap-3 rounded-[1.35rem] p-4 sm:p-5">
        <RescueMark />
        <div>
          <h2 className="text-base font-extrabold sm:text-lg">{t("rescueTitle", language)}</h2>
          <p className="mt-0.5 text-sm leading-relaxed bloom-muted">{t("rescueIntro", language)}</p>
        </div>
      </section>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 pb-1">
          <FilterPill active={selectedCategory === ""} label={t("allCategories", language)} onClick={() => setSelectedCategory("")} />
          {categories.map((category) => (
            <FilterPill
              key={category}
              active={selectedCategory === category}
              label={translateCategory(category, language)}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>
      )}

      <section aria-labelledby="rescue-products-heading" className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="rescue-products-heading" className="text-lg font-extrabold">
              {selectedCategory ? translateCategory(selectedCategory, language) : t("rescueTitle", language)}
            </h2>
            <p className="text-sm bloom-muted">
              {language === "en"
                ? `${visibleOffers.length} ${visibleOffers.length === 1 ? "offer" : "offers"}`
                : `${visibleOffers.length} ${visibleOffers.length === 1 ? "oferta" : "ofertas"}`}
            </p>
          </div>
        </div>

        {visibleOffers.length > 0 ? (
          <div className="product-grid">
            {visibleOffers.map((offer) => (
              <RescueOfferCard
                key={offer.sku}
                offer={offer}
                language={language}
                alreadyAdded={lines.some((line) => line.sku === offer.sku && line.isRescue)}
                onAdd={() => handleAddOffer(offer)}
              />
            ))}
          </div>
        ) : (
          <div className="bloom-card-alt flex min-h-48 items-center justify-center rounded-[1.5rem] p-8 text-center">
            <p className="max-w-sm font-semibold bloom-muted">
              {language === "en" ? "No Rescue Offers are available in this category today." : "No hay Ofertas de Rescate disponibles en esta categoría hoy."}
            </p>
          </div>
        )}
      </section>

      {bundles.length > 0 && (
        <section aria-labelledby="rescue-bundles-heading" className="space-y-3 pb-5 pt-2">
          <div>
            <h2 id="rescue-bundles-heading" className="text-lg font-extrabold">{t("bundlesTitle", language)}</h2>
            <p className="text-sm bloom-muted">
              {language === "en" ? "Ready-made combinations with extra savings." : "Combinaciones listas con ahorro adicional."}
            </p>
          </div>

          <div className="bundle-grid">
            {bundles.map((bundle) => {
              const { total, savings } = calculateBundlePrice(bundle, storeId);
              const products = bundle.productSkus
                .map((sku) => getStoreProduct(storeId, sku))
                .filter((product): product is StoreProduct => Boolean(product));

              return (
                <RescueBundleCard
                  key={bundle.bundleId}
                  bundle={bundle}
                  products={products}
                  language={language}
                  total={total}
                  savings={savings}
                  alreadyAdded={lines.some((line) => line.bundleId === bundle.bundleId)}
                  onAdd={() => handleAddBundle(bundle.bundleId)}
                />
              );
            })}
          </div>
        </section>
      )}

      <StepNav fallbackHref="/basket/result" nextHref="/route" nextDisabled={lines.length === 0} />

      {pendingOverBudget && (
        <Modal
          title={t("budgetExceededTitle", language)}
          onClose={() => setPendingOverBudget(null)}
          closeLabel={t("close", language)}
        >
          <p className="mb-4 text-sm bloom-muted">{t("budgetExceededBody", language)}</p>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={confirmPendingOverBudget} className="bloom-btn-primary rounded-full py-3.5">
              {t("addAnyway", language)}
            </button>
            <button type="button" onClick={() => setPendingOverBudget(null)} className="bloom-btn-secondary rounded-full py-3.5">
              {t("cancel", language)}
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
