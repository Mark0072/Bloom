"use client";

import { useMemo } from "react";
import ProductVisual from "@/components/ProductVisual";
import { translateCategory } from "@/lib/categoryNames";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { getStoreProduct } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";
import type { BasketLine, StoreId, StoreProduct } from "@/types";

interface GroupedLine {
  line: BasketLine;
  product: StoreProduct;
}

export default function BasketSummary({ storeId, editable = true }: { storeId: StoreId; editable?: boolean }) {
  const language = useBloomStore((state) => state.language);
  const lines = useBloomStore((state) => state.lines);
  const budget = useBloomStore((state) => state.basketForm.budget);
  const incrementLine = useBloomStore((state) => state.incrementLine);
  const decrementLine = useBloomStore((state) => state.decrementLine);
  const removeLineById = useBloomStore((state) => state.removeLineById);
  const pushToast = useBloomStore((state) => state.pushToast);

  const total = useMemo(() => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0), [lines]);
  const remaining = budget - total;
  const budgetProgress = budget > 0 ? Math.min(100, Math.max(0, (total / budget) * 100)) : 0;

  const grouped = useMemo(() => {
    const byCategory = new Map<string, GroupedLine[]>();
    for (const line of lines) {
      const product = getStoreProduct(storeId, line.sku);
      if (!product) continue;
      const categoryLines = byCategory.get(product.category) ?? [];
      categoryLines.push({ line, product });
      byCategory.set(product.category, categoryLines);
    }
    return Array.from(byCategory.entries());
  }, [lines, storeId]);

  function handleIncrement(id: string) {
    const result = incrementLine(id);
    if (!result.ok && result.reason === "stock") pushToast(t("maxStockReached", language), "error");
    if (!result.ok && result.reason === "budget") pushToast(t("budgetExceededTitle", language), "error");
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="overflow-hidden rounded-3xl bg-[var(--brand-primary)] p-5 text-white shadow-lg">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
              {language === "en" ? "Basket total" : "Total de la canasta"}
            </p>
            <p className="mt-1 text-3xl font-black tracking-tight">{formatMoney(total)}</p>
          </div>
          <p className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
            {lines.reduce((sum, line) => sum + line.quantity, 0)} {t("cartUnits", language)}
          </p>
        </div>

        {budget > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-white/80">{t("budgetRemaining", language)}</span>
              <span className={`font-bold ${remaining < 0 ? "text-[var(--brand-highlight)]" : "text-white"}`}>
                {formatMoney(remaining)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/20" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[var(--brand-highlight)] transition-[width]"
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {lines.length === 0 ? (
        <div className="bloom-card rounded-3xl border-dashed p-8 text-center">
          <p className="text-lg font-bold">{t("emptyCartTitle", language)}</p>
          <p className="mt-2 text-sm bloom-muted">{t("emptyCartBody", language)}</p>
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <section key={category} aria-labelledby={`basket-category-${category}`}>
            <div className="mb-2 flex items-center gap-3">
              <h2
                id={`basket-category-${category}`}
                className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]"
              >
                {translateCategory(category, language)}
              </h2>
              <span className="h-px flex-1 bg-[var(--bloom-border)]" aria-hidden="true" />
            </div>

            <div className="bloom-card overflow-hidden rounded-3xl shadow-sm">
              {items.map(({ line, product }, index) => {
                const discounted = line.unitPrice < line.regularUnitPrice;
                return (
                  <article
                    key={line.id}
                    className={`flex gap-3 p-4 ${index > 0 ? "border-t bloom-border" : ""}`}
                  >
                    <ProductVisual product={product} className="h-24 w-24 shrink-0 rounded-2xl" sizes="96px" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold leading-snug">{product.name}</h3>
                          <p className="mt-0.5 text-xs bloom-muted">{product.brand}</p>
                        </div>
                        <p className="shrink-0 text-base font-black text-[var(--brand-primary)]">
                          {formatMoney(line.unitPrice * line.quantity)}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="bloom-muted">{formatMoney(line.unitPrice)} c/u</span>
                        {discounted && !line.isBundle && (
                          <span className="line-through bloom-muted">{formatMoney(line.regularUnitPrice)}</span>
                        )}
                        {line.isRescue && (
                          <span className="rounded-full bg-[var(--brand-highlight)] px-2 py-0.5 font-bold text-black">
                            {language === "en" ? "Rescue offer" : "Oferta de rescate"}
                          </span>
                        )}
                        {line.isBundle && (
                          <span className="rounded-full bg-[var(--bloom-surface-alt)] px-2 py-0.5 font-bold text-[var(--brand-primary)]">
                            Combo
                          </span>
                        )}
                      </div>

                      {line.coverageNote && <p className="mt-2 text-xs leading-relaxed bloom-muted">{line.coverageNote}</p>}

                      <div className="mt-3 flex items-center justify-between gap-2">
                        {editable && !line.isBundle ? (
                          <div className="inline-flex h-11 items-center overflow-hidden rounded-full border-2 bloom-border bg-[var(--bloom-surface)]">
                            <button
                              type="button"
                              onClick={() => decrementLine(line.id)}
                              aria-label={language === "en" ? `Decrease ${product.name}` : `Reducir ${product.name}`}
                              className="h-full w-11 text-xl font-black text-[var(--brand-primary)] active:bg-[var(--bloom-surface-alt)]"
                            >
                              −
                            </button>
                            <span className="min-w-9 text-center font-black" aria-live="polite">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrement(line.id)}
                              aria-label={language === "en" ? `Increase ${product.name}` : `Aumentar ${product.name}`}
                              className="h-full w-11 text-xl font-black text-[var(--brand-primary)] active:bg-[var(--bloom-surface-alt)]"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="rounded-full bg-[var(--bloom-surface-alt)] px-3 py-1.5 text-sm font-bold">
                            × {line.quantity}
                          </span>
                        )}

                        {editable && (
                          <button
                            type="button"
                            onClick={() => removeLineById(line.id)}
                            className="min-h-10 rounded-full px-3 text-sm font-bold bloom-danger-text active:bg-[var(--bloom-danger-bg)]"
                          >
                            {t("removeItem", language)}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
