"use client";

import ProductVisual from "@/components/ProductVisual";
import { formatMoney } from "@/lib/money";
import type { Language, ManualBundle, StoreProduct } from "@/types";

interface RescueBundleCardProps {
  bundle: ManualBundle;
  products: StoreProduct[];
  language: Language;
  total: number;
  savings: number;
  alreadyAdded: boolean;
  onAdd: () => void;
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function BundleFallback() {
  return (
    <div className="flex h-full min-h-40 items-center justify-center bg-[var(--bloom-surface-alt)] text-[var(--bloom-accent)]">
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-20 w-20" fill="none">
        <path d="M20 35h56l-5 43H25l-5-43Z" fill="currentColor" opacity="0.14" />
        <path d="M20 35h56l-5 43H25l-5-43Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M34 37c1-13 6-20 14-20s13 7 14 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M38 55h20M48 45v20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function RescueBundleCard({
  bundle,
  products,
  language,
  total,
  savings,
  alreadyAdded,
  onAdd,
}: RescueBundleCardProps) {
  const regularTotal = total + savings;

  return (
    <article className="bloom-card flex h-full flex-col overflow-hidden rounded-[1.35rem] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
      <div className={`grid aspect-[16/8] overflow-hidden ${products.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {products.length > 0 ? (
          products.slice(0, 2).map((product) => (
            <ProductVisual
              key={product.sku}
              product={product}
              className="h-full min-h-40 w-full"
              sizes="(min-width: 768px) 22vw, 44vw"
            />
          ))
        ) : (
          <BundleFallback />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[var(--bloom-surface-alt)] px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[var(--bloom-accent)]">
            {language === "en" ? "Rescue combo" : "Combo de rescate"}
          </span>
          {savings > 0 && (
            <span className="text-xs font-extrabold text-[var(--bloom-danger)]">
              {language === "en" ? `Save ${formatMoney(savings)}` : `Ahorras ${formatMoney(savings)}`}
            </span>
          )}
        </div>

        <h2 className="mt-3 text-base font-extrabold leading-snug sm:text-lg">{bundle.name}</h2>
        <p className="mt-1 text-xs leading-relaxed bloom-muted">{bundle.description}</p>

        <div className="mt-auto flex min-h-12 flex-wrap items-end gap-x-2 gap-y-0.5 pt-4">
          {savings > 0 && <span className="text-xs font-medium line-through bloom-muted">{formatMoney(regularTotal)}</span>}
          <span className="text-xl font-extrabold leading-none">{formatMoney(total)}</span>
        </div>

        <button
          type="button"
          disabled={alreadyAdded}
          onClick={onAdd}
          className="bloom-btn-primary mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {!alreadyAdded && <PlusIcon />}
          {alreadyAdded
            ? language === "en"
              ? "Already added"
              : "Ya agregado"
            : language === "en"
              ? "Add combo"
              : "Agregar combo"}
        </button>
      </div>
    </article>
  );
}
