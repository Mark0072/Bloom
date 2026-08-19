"use client";

import { useMemo } from "react";
import { getStoreProduct } from "@/lib/products";
import { formatMoney } from "@/lib/money";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import { translateCategory } from "@/lib/categoryNames";
import type { StoreId } from "@/types";

export default function BasketSummary({ storeId, editable = true }: { storeId: StoreId; editable?: boolean }) {
  const language = useBloomStore((s) => s.language);
  const lines = useBloomStore((s) => s.lines);
  const budget = useBloomStore((s) => s.basketForm.budget);
  const incrementLine = useBloomStore((s) => s.incrementLine);
  const decrementLine = useBloomStore((s) => s.decrementLine);
  const removeLineById = useBloomStore((s) => s.removeLineById);
  const pushToast = useBloomStore((s) => s.pushToast);

  const total = useMemo(() => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0), [lines]);
  const remaining = budget - total;

  const grouped = useMemo(() => {
    const byCategory = new Map<string, { line: (typeof lines)[number]; name: string; price: number }[]>();
    for (const line of lines) {
      const product = getStoreProduct(storeId, line.sku);
      if (!product) continue;
      const category = product.category;
      const list = byCategory.get(category) ?? [];
      list.push({ line, name: product.name, price: product.price });
      byCategory.set(category, list);
    }
    return Array.from(byCategory.entries());
  }, [lines, storeId]);

  function handleIncrement(id: string) {
    const result = incrementLine(id);
    if (!result.ok && result.reason === "stock") pushToast(t("maxStockReached", language), "error");
    if (!result.ok && result.reason === "budget") pushToast(t("budgetExceededTitle", language), "error");
  }

  return (
    <div className="flex flex-col gap-4">
      {budget > 0 && (
        <div className="bloom-card rounded-2xl p-4">
          <div className="flex justify-between text-kiosk-base font-bold">
            <span>{t("total", language)}</span>
            <span>{formatMoney(total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm bloom-muted">
            <span>{t("budgetRemaining", language)}</span>
            <span className={remaining < 0 ? "bloom-danger-text font-semibold" : ""}>{formatMoney(remaining)}</span>
          </div>
        </div>
      )}

      {lines.length === 0 ? (
        <div className="bloom-card rounded-2xl border-dashed p-6 text-center">
          <p className="font-semibold">{t("emptyCartTitle", language)}</p>
          <p className="mt-1 text-sm bloom-muted">{t("emptyCartBody", language)}</p>
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <div key={category}>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide bloom-muted">
              {translateCategory(category, language)}
            </p>
            <div className="flex flex-col gap-2">
              {items.map(({ line, name, price }) => (
                <div key={line.id} className="bloom-card flex items-center justify-between gap-2 rounded-xl p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{name}</p>
                    <p className="text-sm bloom-muted">
                      {formatMoney(line.unitPrice)}{" "}
                      {line.unitPrice !== price && !line.isBundle ? `(reg. ${formatMoney(price)})` : ""}
                    </p>
                    {line.isRescue && <p className="text-xs font-semibold text-[var(--bloom-warning)]">Oferta de Rescate</p>}
                    {line.isBundle && <p className="text-xs font-semibold text-blue-600">Bundle</p>}
                    {line.coverageNote && <p className="text-xs bloom-muted">{line.coverageNote}</p>}
                  </div>
                  {editable && !line.isBundle ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decrementLine(line.id)}
                        className="bloom-btn-secondary h-8 w-8 rounded-lg font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(line.id)}
                        className="bloom-btn-secondary h-8 w-8 rounded-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold">×{line.quantity}</span>
                  )}
                  {editable && (
                    <button
                      type="button"
                      onClick={() => removeLineById(line.id)}
                      className="bloom-danger-text ml-1 text-sm font-semibold"
                    >
                      {t("removeItem", language)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
