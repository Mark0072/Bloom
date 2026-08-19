"use client";

import { useMemo } from "react";
import { getStoreProduct } from "@/lib/products";
import { formatMoney } from "@/lib/money";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import type { StoreId } from "@/types";

export default function BasketSummary({ storeId, editable = true }: { storeId: StoreId; editable?: boolean }) {
  const language = useBloomStore((s) => s.language);
  const lines = useBloomStore((s) => s.lines);
  const removeLine = useBloomStore((s) => s.removeLine);
  const updateQuantity = useBloomStore((s) => s.updateQuantity);

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

  if (lines.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-center opacity-70">—</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {grouped.map(([category, items]) => (
        <div key={category}>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide opacity-60">{category}</p>
          <div className="flex flex-col gap-2">
            {items.map(({ line, name, price }) => (
              <div
                key={`${line.sku}-${line.isRescue ? "r" : ""}${line.bundleId ?? ""}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{name}</p>
                  <p className="text-sm opacity-70">
                    {formatMoney(line.unitPrice)} {line.unitPrice !== price && !line.isBundle ? `(reg. ${formatMoney(price)})` : ""}
                  </p>
                  {line.isRescue && <p className="text-xs font-semibold text-rescue-700">Oferta de Rescate</p>}
                  {line.isBundle && <p className="text-xs font-semibold text-blue-700">Bundle</p>}
                </div>
                {editable && !line.isBundle ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.sku, line.quantity - 1)}
                      disabled={line.quantity <= 1}
                      className="h-8 w-8 rounded-lg border border-slate-300 font-bold disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.sku, line.quantity + 1)}
                      className="h-8 w-8 rounded-lg border border-slate-300 font-bold"
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
                    onClick={() => removeLine(line.sku, line.bundleId)}
                    className="ml-1 text-sm font-semibold text-red-600"
                  >
                    {t("removeItem", language)}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
