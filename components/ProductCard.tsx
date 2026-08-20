"use client";

import ProductVisual from "@/components/ProductVisual";
import { getAvailabilityState } from "@/lib/products";
import { formatMoney } from "@/lib/money";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import { translateCategory } from "@/lib/categoryNames";
import type { StoreProduct } from "@/types";

interface ProductCardProps {
  product: StoreProduct;
  compact?: boolean;
  onAddToCart?: () => void;
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export default function ProductCard({ product, compact = false, onAddToCart }: ProductCardProps) {
  const language = useBloomStore((s) => s.language);
  const state = getAvailabilityState(product);
  const isUnavailable = state === "no_disponible";
  const promoPrice = typeof product.promo?.promoPrice === "number" ? product.promo.promoPrice : null;
  const currentPrice = promoPrice ?? product.price;
  const promoDiscount =
    product.promo?.discountPercent ??
    (promoPrice != null && product.price > 0 ? Math.round((1 - promoPrice / product.price) * 100) : null);

  const stateLabel: Record<typeof state, string> = {
    disponible: t("available", language),
    pocas_unidades: t("lowStock", language),
    no_disponible: t("unavailable", language),
  };

  return (
    <article
      className={`product-card bloom-card group overflow-hidden rounded-[1.35rem] shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-0.5 ${
        compact ? "flex items-stretch p-3" : "flex h-full flex-col"
      } ${isUnavailable ? "opacity-70" : ""}`}
    >
      <div className={`relative shrink-0 ${compact ? "w-24 sm:w-28" : "w-full"}`}>
        <ProductVisual
          product={product}
          className={compact ? "h-full min-h-28 w-full rounded-xl" : "aspect-[4/3] w-full"}
          sizes={compact ? "112px" : "(min-width: 768px) 22vw, 44vw"}
        />

        {(product.rescue?.eligible || promoDiscount != null) && (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--bloom-danger)] px-2.5 py-1 text-[0.7rem] font-extrabold text-white shadow-sm">
            {promoDiscount != null ? `-${promoDiscount}%` : t("rescueBadge", language)}
          </span>
        )}
        {state !== "disponible" && (
          <span
            className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[0.68rem] font-bold shadow-sm ${
              isUnavailable
                ? "bg-[var(--bloom-danger-bg)] text-[var(--bloom-danger)]"
                : "bg-[var(--bloom-warning-bg)] text-[var(--bloom-warning)]"
            }`}
          >
            {stateLabel[state]}
          </span>
        )}
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${compact ? "pl-3" : "p-3 sm:p-3.5"}`}>
        <p className="truncate text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[var(--bloom-accent)]">
          {product.brand}
        </p>
        <h2 className={`mt-1 font-bold leading-snug ${compact ? "text-sm sm:text-base" : "product-card-name text-sm sm:text-base"}`} title={product.name}>
          {product.name}
        </h2>
        {!compact && <p className="mt-1 truncate text-[0.72rem] bloom-muted">{translateCategory(product.category, language)}</p>}

        <div className="mt-auto pt-3">
          <div className="flex min-h-11 flex-col items-start justify-end gap-0.5">
            {promoPrice != null && (
              <span className="whitespace-nowrap text-[0.7rem] font-medium line-through bloom-muted">{formatMoney(product.price)}</span>
            )}
            <span className={`font-extrabold leading-none ${compact ? "text-base" : "product-card-price"}`}>
              {formatMoney(currentPrice)}
            </span>
          </div>

          {onAddToCart && (
            <button
              type="button"
              disabled={isUnavailable}
              onClick={onAddToCart}
              className="bloom-btn-primary mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-[0.8rem] shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 sm:px-3 sm:text-sm"
            >
              {!isUnavailable && <PlusIcon />}
              <span>{isUnavailable ? t("unavailableProduct", language) : t("addToCart", language)}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
