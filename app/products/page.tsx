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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" strokeLinecap="round" />
    </svg>
  );
}

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
      <section className="space-y-4" aria-label={t("navProducts", language)}>
        <label className="bloom-card relative flex min-h-14 items-center rounded-full shadow-sm focus-within:ring-2 focus-within:ring-[var(--bloom-accent)]">
          <span className="pointer-events-none absolute left-5 bloom-muted">
            <SearchIcon />
          </span>
          <span className="sr-only">{t("searchPlaceholder", language)}</span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => setProductFilters({ query: event.target.value })}
            placeholder={t("searchPlaceholder", language)}
            className="h-14 w-full rounded-full bg-transparent pl-14 pr-5 text-base outline-none placeholder:text-[var(--bloom-text-muted)]"
          />
        </label>

        <div className="flex flex-wrap gap-2 pb-1">
          <FilterPill active={filters.category === ""} label={t("allCategories", language)} onClick={() => setProductFilters({ category: "" })} />
          {categories.map((category) => (
            <FilterPill
              key={category}
              active={filters.category === category}
              label={translateCategory(category, language)}
              onClick={() => setProductFilters({ category })}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={filters.onlyAvailable}
            label={t("onlyAvailable", language)}
            onClick={() => setProductFilters({ onlyAvailable: !filters.onlyAvailable })}
          />
          <FilterPill
            active={filters.onlyPromo}
            label={t("onlyPromo", language)}
            onClick={() => setProductFilters({ onlyPromo: !filters.onlyPromo })}
          />
          <FilterPill
            active={filters.onlyRescue}
            label={t("onlyRescue", language)}
            onClick={() => setProductFilters({ onlyRescue: !filters.onlyRescue })}
          />
        </div>
      </section>

      <div className="flex items-end justify-between gap-3 pt-1">
        <div>
          <p className="text-lg font-extrabold">
            {filters.category ? translateCategory(filters.category, language) : t("allCategories", language)}
          </p>
          <p className="text-sm bloom-muted">
            {language === "en"
              ? `${results.length} ${results.length === 1 ? "product" : "products"}`
              : `${results.length} ${results.length === 1 ? "producto" : "productos"}`}
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bloom-card-alt flex min-h-52 items-center justify-center rounded-[1.5rem] p-8 text-center">
          <p className="max-w-sm font-semibold bloom-muted">{t("noResults", language)}</p>
        </div>
      ) : (
        <div className="product-grid pb-6">
          {results.map((product) => (
            <ProductCard key={product.sku} product={product} onAddToCart={() => handleAddToCart(product.sku)} />
          ))}
        </div>
      )}

      {pendingOverBudgetSku && (
        <Modal
          title={t("budgetExceededTitle", language)}
          onClose={() => setPendingOverBudgetSku(null)}
          closeLabel={t("close", language)}
        >
          <p className="mb-4 text-sm bloom-muted">{t("budgetExceededBody", language)}</p>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={confirmOverBudget} className="bloom-btn-primary rounded-full py-3.5">
              {t("addAnyway", language)}
            </button>
            <button
              type="button"
              onClick={() => setPendingOverBudgetSku(null)}
              className="bloom-btn-secondary rounded-full py-3.5"
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
