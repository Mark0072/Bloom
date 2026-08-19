"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
import ProductCard from "@/components/ProductCard";
import { getCategories, searchProducts } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [onlyRescue, setOnlyRescue] = useState(false);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  const categories = useMemo(() => (storeId ? getCategories(storeId) : []), [storeId]);

  const results = useMemo(() => {
    if (!storeId) return [];
    return searchProducts(storeId, {
      query,
      category: category || undefined,
      onlyAvailable,
      onlyPromo,
      onlyRescue,
    });
  }, [storeId, query, category, onlyAvailable, onlyPromo, onlyRescue]);

  if (!hasHydrated || !storeId) return null;

  return (
    <KioskShell>
      <StoreHeader title={t("navProducts", language)} />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder", language)}
        className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-kiosk-sm"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            category === "" ? "bg-brand-600 text-white" : "bg-white border border-slate-300"
          }`}
        >
          {t("allCategories", language)}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              category === c ? "bg-brand-600 text-white" : "bg-white border border-slate-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          {t("onlyAvailable", language)}
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={onlyPromo} onChange={(e) => setOnlyPromo(e.target.checked)} />
          {t("onlyPromo", language)}
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={onlyRescue} onChange={(e) => setOnlyRescue(e.target.checked)} />
          {t("onlyRescue", language)}
        </label>
      </div>

      <div className="flex flex-col gap-3 pb-4">
        {results.length === 0 && <p className="text-center opacity-60 py-8">{t("noResults", language)}</p>}
        {results.map((product) => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>
    </KioskShell>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
