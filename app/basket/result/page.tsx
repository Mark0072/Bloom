"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import BasketSummary from "@/components/BasketSummary";
import Modal from "@/components/Modal";
import ProductCard from "@/components/ProductCard";
import StepNav from "@/components/StepNav";
import { t } from "@/lib/i18n";
import { searchProducts } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";

export default function BasketResultPage() {
  const router = useRouter();
  const storeId = useBloomStore((state) => state.storeId);
  const hasHydrated = useBloomStore((state) => state.hasHydrated);
  const language = useBloomStore((state) => state.language);
  const lines = useBloomStore((state) => state.lines);
  const basketForm = useBloomStore((state) => state.basketForm);
  const explanations = useBloomStore((state) => state.basketExplanations);
  const hasManualBasketEdits = useBloomStore((state) => state.hasManualBasketEdits);
  const regenerateBasket = useBloomStore((state) => state.regenerateBasket);
  const addProductToCart = useBloomStore((state) => state.addProductToCart);
  const pushToast = useBloomStore((state) => state.pushToast);

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

  function requestRegenerate() {
    if (hasManualBasketEdits) setPendingRegeneratePreference("ahorro_maximo");
    else regenerateBasket("ahorro_maximo");
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
      <div className="flex flex-col gap-5 overflow-y-auto pb-4">
        <section className="relative overflow-hidden rounded-3xl bg-[var(--bloom-surface-alt)] p-5">
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[var(--brand-highlight)]/80" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              {language === "en" ? "Recommendation ready" : "Recomendación lista"}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight">
              {language === "en"
                ? `A basket calculated for ${basketForm.people} people`
                : `Una canasta calculada para ${basketForm.people} persona(s)`}
            </h1>
            <p className="mt-2 max-w-[85%] text-sm bloom-muted">
              {language === "en"
                ? "Adjust quantities whenever you need. Your route updates with your cart."
                : "Ajusta las cantidades cuando lo necesites. Tu ruta se actualizará con el carrito."}
            </p>
          </div>
        </section>

        {explanations.length > 0 && (
          <details className="bloom-card overflow-hidden rounded-2xl">
            <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-[var(--brand-primary)]">
              {t("whyTheseProducts", language)}
            </summary>
            <ul className="border-t bloom-border px-5 py-4 text-sm leading-relaxed bloom-muted">
              {explanations.map((explanation, index) => (
                <li key={index} className={index > 0 ? "mt-2" : ""}>• {explanation}</li>
              ))}
            </ul>
          </details>
        )}

        <BasketSummary storeId={storeId} />

        <section className="rounded-3xl bg-[var(--bloom-surface-alt)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">{language === "en" ? "Want to spend less?" : "¿Quieres gastar menos?"}</p>
              <p className="mt-0.5 text-xs bloom-muted">
                {language === "en" ? "We will keep items you selected." : "Mantendremos los productos que elegiste."}
              </p>
            </div>
            <button
              type="button"
              onClick={requestRegenerate}
              className="shrink-0 rounded-full bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
            >
              {t("saveMore", language)}
            </button>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setShowSearch((visible) => !visible)}
          aria-expanded={showSearch}
          className="bloom-btn-secondary min-h-12 rounded-2xl px-4 py-3 text-sm"
        >
          {showSearch ? (language === "en" ? "Close search" : "Cerrar búsqueda") : `+ ${t("addFromSearch", language)}`}
        </button>

        {showSearch && (
          <section className="flex flex-col gap-3 rounded-3xl bg-[var(--bloom-surface-alt)] p-4">
            <label>
              <span className="sr-only">{t("searchPlaceholder", language)}</span>
              <input
                type="search"
                value={searchQuery}
                autoFocus
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("searchPlaceholder", language)}
                className="bloom-card w-full rounded-2xl px-4 py-3 outline-none focus:border-[var(--brand-primary)]"
              />
            </label>
            {searchResults.map((product) => (
              <ProductCard
                key={product.sku}
                product={product}
                compact
                onAddToCart={() => handleAddFromSearch(product.sku)}
              />
            ))}
            {searchQuery.trim() && searchResults.length === 0 && (
              <p className="py-4 text-center text-sm bloom-muted">{t("noResults", language)}</p>
            )}
          </section>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={() => router.push("/rescue")}
          className="min-h-14 rounded-2xl bg-[var(--brand-highlight)] px-5 py-4 text-lg font-black text-black shadow-md active:scale-[0.98] disabled:opacity-40"
        >
          {t("continueToRescue", language)}
        </button>
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={() => router.push("/route")}
          className="bloom-btn-secondary min-h-12 rounded-2xl px-4 py-3 disabled:opacity-40"
        >
          {language === "en" ? "Skip offers and view route" : "Omitir ofertas y ver ruta"}
        </button>
        <StepNav showBack fallbackHref="/basket/start" />
      </div>

      {pendingRegeneratePreference && (
        <Modal
          title={t("regenerateConfirmTitle", language)}
          onClose={() => setPendingRegeneratePreference(null)}
          closeLabel={t("close", language)}
        >
          <p className="mb-2 text-sm bloom-muted">{t("regenerateConfirmBody", language)}</p>
          <p className="mb-4 text-sm font-semibold text-[var(--brand-primary)]">
            {language === "en"
              ? "Your manually selected products, combos and Rescue Offers will be kept."
              : "Tus productos manuales, combos y Ofertas de Rescate se conservarán."}
          </p>
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
