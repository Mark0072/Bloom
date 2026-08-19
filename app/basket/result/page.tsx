"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import StepNav from "@/components/StepNav";
import BasketSummary from "@/components/BasketSummary";
import ProductCard from "@/components/ProductCard";
import Modal from "@/components/Modal";
import { searchProducts } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

export default function BasketResultPage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const lines = useBloomStore((s) => s.lines);
  const explanations = useBloomStore((s) => s.basketExplanations);
  const hasManualBasketEdits = useBloomStore((s) => s.hasManualBasketEdits);
  const regenerateBasket = useBloomStore((s) => s.regenerateBasket);
  const addProductToCart = useBloomStore((s) => s.addProductToCart);
  const pushToast = useBloomStore((s) => s.pushToast);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [pendingRegeneratePreference, setPendingRegeneratePreference] = useState<string | null>(null);
  const [pendingOverBudgetSku, setPendingOverBudgetSku] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  const searchResults = useMemo(() => {
    if (!storeId || !searchQuery.trim()) return [];
    return searchProducts(storeId, { query: searchQuery, onlyAvailable: true }).slice(0, 8);
  }, [storeId, searchQuery]);

  if (!hasHydrated || !storeId) return null;

  function requestRegenerate(extraPreference: string) {
    if (hasManualBasketEdits) {
      setPendingRegeneratePreference(extraPreference);
    } else {
      regenerateBasket(extraPreference);
    }
  }

  function handleAddFromSearch(sku: string, allowOverBudget = false) {
    const result = addProductToCart(sku, 1, { allowOverBudget });
    if (result.ok) pushToast(t("addedToCartToast", language), "success");
    else if (result.reason === "budget") setPendingOverBudgetSku(sku);
    else if (result.reason === "stock") pushToast(t("maxStockReached", language), "error");
  }

  function confirmOverBudget() {
    if (!pendingOverBudgetSku) return;
    handleAddFromSearch(pendingOverBudgetSku, true);
    setPendingOverBudgetSku(null);
  }

  return (
    <AppShell title={t("basketResultTitle", language)}>
      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        {explanations.length > 0 && (
          <div className="bloom-card-alt rounded-2xl p-4">
            <p className="mb-1 text-sm font-bold">{t("whyTheseProducts", language)}</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {explanations.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        )}

        <BasketSummary storeId={storeId} />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => requestRegenerate("ahorro_maximo")}
            className="bloom-btn-secondary flex-1 rounded-xl py-3 text-sm"
          >
            {t("saveMore", language)}
          </button>
          <button
            type="button"
            onClick={() => requestRegenerate("marcas_conocidas")}
            className="bloom-btn-secondary flex-1 rounded-xl py-3 text-sm"
          >
            {t("prioritizeKnownBrands", language)}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="bloom-btn-secondary rounded-xl py-3 text-sm border-dashed"
        >
          + {t("addFromSearch", language)}
        </button>

        {showSearch && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder", language)}
              className="bloom-card w-full rounded-xl px-4 py-3"
            />
            {searchResults.map((product) => (
              <ProductCard key={product.sku} product={product} compact onAddToCart={() => handleAddFromSearch(product.sku)} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push("/rescue")}
          className="rounded-2xl bg-[var(--bloom-warning)] py-4 text-kiosk-base font-bold text-black active:scale-[0.98]"
        >
          {t("continueToRescue", language)}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={() => router.push("/route")}
            className="bloom-btn-secondary flex-1 rounded-2xl py-3 disabled:opacity-40"
          >
            {t("continueToRoute", language)}
          </button>
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={() => router.push("/checkout")}
            className="bloom-btn-primary flex-1 rounded-2xl py-3 disabled:opacity-40"
          >
            {t("continueToTicket", language)}
          </button>
        </div>
        <StepNav showBack fallbackHref="/basket/start" />
      </div>

      {pendingRegeneratePreference && (
        <Modal
          title={t("regenerateConfirmTitle", language)}
          onClose={() => setPendingRegeneratePreference(null)}
          closeLabel={t("close", language)}
        >
          <p className="mb-2 text-sm bloom-muted">{t("regenerateConfirmBody", language)}</p>
          <p className="mb-4 text-sm bloom-muted">{t("regenerateWillKeep", language)}</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                regenerateBasket(pendingRegeneratePreference);
                setPendingRegeneratePreference(null);
              }}
              className="bloom-btn-primary rounded-2xl py-3"
            >
              {t("regenerateProceed", language)}
            </button>
            <button
              type="button"
              onClick={() => setPendingRegeneratePreference(null)}
              className="bloom-btn-secondary rounded-2xl py-3"
            >
              {t("regenerateCancel", language)}
            </button>
          </div>
        </Modal>
      )}

      {pendingOverBudgetSku && (
        <Modal
          title={t("budgetExceededTitle", language)}
          onClose={() => setPendingOverBudgetSku(null)}
          closeLabel={t("close", language)}
        >
          <p className="mb-4 text-sm bloom-muted">{t("budgetExceededBody", language)}</p>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={confirmOverBudget} className="bloom-btn-primary rounded-2xl py-3">
              {t("addAnyway", language)}
            </button>
            <button
              type="button"
              onClick={() => setPendingOverBudgetSku(null)}
              className="bloom-btn-secondary rounded-2xl py-3"
            >
              {t("cancel", language)}
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
