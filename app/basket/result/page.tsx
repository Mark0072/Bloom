"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
import StepNav from "@/components/StepNav";
import BasketSummary from "@/components/BasketSummary";
import ProductCard from "@/components/ProductCard";
import { formatMoney } from "@/lib/money";
import { searchProducts } from "@/lib/products";
import { generateBasket } from "@/lib/basket";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

export default function BasketResultPage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const basketForm = useBloomStore((s) => s.basketForm);
  const lines = useBloomStore((s) => s.lines);
  const explanations = useBloomStore((s) => s.basketExplanations);
  const setBasketForm = useBloomStore((s) => s.setBasketForm);
  const setLines = useBloomStore((s) => s.setLines);
  const addLine = useBloomStore((s) => s.addLine);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  const totalSpent = useMemo(
    () => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    [lines]
  );
  const budgetRemaining = basketForm.budget - totalSpent;

  const searchResults = useMemo(() => {
    if (!storeId || !searchQuery.trim()) return [];
    return searchProducts(storeId, { query: searchQuery, onlyAvailable: true }).slice(0, 8);
  }, [storeId, searchQuery]);

  if (!hasHydrated || !storeId) return null;

  function regenerateWithPreference(extraPreference: string) {
    const form = {
      ...basketForm,
      preferences: basketForm.preferences.includes(extraPreference)
        ? basketForm.preferences
        : [...basketForm.preferences, extraPreference],
    };
    setBasketForm(form);
    const result = generateBasket(form, storeId!);
    setLines(result.lines, result.explanations, result.savings);
  }

  return (
    <KioskShell>
      <StoreHeader title={t("basketResultTitle", language)} />

      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex justify-between text-kiosk-base font-bold">
            <span>{t("total", language)}</span>
            <span>{formatMoney(totalSpent)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm opacity-80">
            <span>{t("budgetRemaining", language)}</span>
            <span className={budgetRemaining < 0 ? "text-red-600 font-semibold" : ""}>{formatMoney(budgetRemaining)}</span>
          </div>
        </div>

        {explanations.length > 0 && (
          <div className="rounded-2xl bg-brand-50 border border-brand-200 p-4">
            <p className="mb-1 text-sm font-bold text-brand-800">{t("whyTheseProducts", language)}</p>
            <ul className="list-disc pl-5 text-sm text-brand-900 space-y-1">
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
            onClick={() => regenerateWithPreference("ahorro_maximo")}
            className="flex-1 rounded-xl border-2 border-brand-600 bg-white py-3 text-sm font-bold text-brand-700"
          >
            {t("saveMore", language)}
          </button>
          <button
            type="button"
            onClick={() => regenerateWithPreference("marcas_conocidas")}
            className="flex-1 rounded-xl border-2 border-slate-300 bg-white py-3 text-sm font-bold text-slate-700"
          >
            {t("improveQuality", language)}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          className="rounded-xl border-2 border-dashed border-slate-300 bg-white py-3 text-sm font-bold text-slate-700"
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
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-3"
            />
            {searchResults.map((product) => (
              <ProductCard
                key={product.sku}
                product={product}
                compact
                actionLabel="+"
                onAction={() =>
                  addLine({
                    sku: product.sku,
                    quantity: 1,
                    unitPrice: product.price,
                    isRescue: false,
                    isBundle: false,
                    reason: "Agregado manualmente por el cliente.",
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push("/rescue")}
          className="rounded-2xl bg-rescue-500 py-4 text-kiosk-base font-bold text-white active:scale-[0.98]"
        >
          {t("continueToRescue", language)}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/route")}
            className="flex-1 rounded-2xl border-2 border-slate-300 bg-white py-3 font-bold text-slate-700"
          >
            {t("continueToRoute", language)}
          </button>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="flex-1 rounded-2xl bg-brand-600 py-3 font-bold text-white"
          >
            {t("continueToTicket", language)}
          </button>
        </div>
        <StepNav backHref="/basket/start" />
      </div>
    </KioskShell>
  );
}
