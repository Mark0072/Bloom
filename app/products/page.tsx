"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProductCard from "@/components/ProductCard";
import Modal from "@/components/Modal";
import { getCategories, searchProducts } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import { translateCategory } from "@/lib/categoryNames";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const filters = useBloomStore((s) => s.productFilters);
  const setProductFilters = useBloomStore((s) => s.setProductFilters);
  const addProductToCart = useBloomStore((s) => s.addProductToCart);
  const pushToast = useBloomStore((s) => s.pushToast);

  const [pendingOverBudgetSku, setPendingOverBudgetSku] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categoryParam !== filters.category) {
      setProductFilters({ category: categoryParam });
    }
    // Only seed from the URL once on arrival — after that, the store is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const categories = useMemo(() => (storeId ? getCategories(storeId) : []), [storeId]);

  const results = useMemo(() => {
    if (!storeId) return [];
    return searchProducts(storeId, {
      query: filters.query,
      category: filters.category || undefined,
      onlyAvailable: filters.onlyAvailable,
      onlyPromo: filters.onlyPromo,
      onlyRescue: filters.onlyRescue,
    });
  }, [storeId, filters]);

  if (!hasHydrated || !storeId) return null;

  function handleAddToCart(sku: string) {
    const result = addProductToCart(sku, 1);
    if (result.ok) {
      pushToast(t("addedToCartToast", language), "success");
    } else if (result.reason === "budget") {
      setPendingOverBudgetSku(sku);
    } else if (result.reason === "stock") {
      pushToast(t("maxStockReached", language), "error");
    }
  }

  function confirmOverBudget() {
    if (!pendingOverBudgetSku) return;
    addProductToCart(pendingOverBudgetSku, 1, { allowOverBudget: true });
    pushToast(t("addedToCartToast", language), "success");
    setPendingOverBudgetSku(null);
  }

  return (
    <AppShell title={t("navProducts", language)}>
      <input
        type="text"
        value={filters.query}
        onChange={(e) => setProductFilters({ query: e.target.value })}
        placeholder={t("searchPlaceholder", language)}
        className="bloom-card w-full rounded-xl px-4 py-3 text-kiosk-sm"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setProductFilters({ category: "" })}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            filters.category === "" ? "bloom-btn-primary" : "bloom-btn-secondary"
          }`}
        >
          {t("allCategories", language)}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setProductFilters({ category: c })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              filters.category === c ? "bloom-btn-primary" : "bloom-btn-secondary"
            }`}
          >
            {translateCategory(c, language)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => setProductFilters({ onlyAvailable: e.target.checked })}
          />
          {t("onlyAvailable", language)}
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.onlyPromo}
            onChange={(e) => setProductFilters({ onlyPromo: e.target.checked })}
          />
          {t("onlyPromo", language)}
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.onlyRescue}
            onChange={(e) => setProductFilters({ onlyRescue: e.target.checked })}
          />
          {t("onlyRescue", language)}
        </label>
      </div>

      <div className="flex flex-col gap-3 pb-4">
        {results.length === 0 && <p className="text-center bloom-muted py-8">{t("noResults", language)}</p>}
        {results.map((product) => (
          <ProductCard key={product.sku} product={product} onAddToCart={() => handleAddToCart(product.sku)} />
        ))}
      </div>

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

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
