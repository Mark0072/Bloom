"use client";

import { getAvailabilityState } from "@/lib/products";
import { formatMoney } from "@/lib/money";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import { translateAisle, translateCategory } from "@/lib/categoryNames";
import type { StoreProduct } from "@/types";

const CATEGORY_EMOJI: Record<string, string> = {
  Despensa: "🥫",
  "Lácteos y huevos": "🥛",
  "Limpieza y desechables": "🧽",
  "Carnes y pescados": "🍖",
  "Frutas y vegetales": "🍎",
  Panadería: "🍞",
  "Comida preparada": "🍽️",
  Bebidas: "🥤",
  "Higiene personal": "🧴",
};

interface ProductCardProps {
  product: StoreProduct;
  compact?: boolean;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, compact, onAddToCart }: ProductCardProps) {
  const language = useBloomStore((s) => s.language);
  const state = getAvailabilityState(product);
  const emoji = CATEGORY_EMOJI[product.category] ?? "🛒";
  const isUnavailable = state === "no_disponible";

  const stateStyles: Record<string, string> = {
    disponible: "bg-[var(--bloom-accent)] text-[var(--bloom-accent-text)]",
    pocas_unidades: "bg-[var(--bloom-warning-bg)] text-[var(--bloom-warning)]",
    no_disponible: "bg-[var(--bloom-danger-bg)] text-[var(--bloom-danger)]",
  };

  const stateLabel: Record<string, string> = {
    disponible: t("available", language),
    pocas_unidades: t("lowStock", language),
    no_disponible: t("unavailable", language),
  };

  return (
    <div className="bloom-card rounded-2xl p-4 flex gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--bloom-surface-alt)] text-3xl">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold leading-snug ${compact ? "text-kiosk-sm" : "text-kiosk-sm"}`}>{product.name}</p>
        <p className="text-sm bloom-muted">
          {product.brand} · {translateCategory(product.category, language)}
        </p>
        {!compact && (
          <p className="text-sm bloom-muted">
            {t("aisle", language)}: {translateAisle(product.aisle, language)}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${stateStyles[state]}`}>
            {stateLabel[state]}
          </span>
          {product.promo && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
              {t("promotionBadge", language)}
            </span>
          )}
          {product.rescue?.eligible && (
            <span className="rounded-full bg-[var(--bloom-warning-bg)] px-2 py-1 text-xs font-semibold text-[var(--bloom-warning)]">
              {t("rescueBadge", language)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-kiosk-base font-bold">{formatMoney(product.price)}</p>
          {onAddToCart && (
            <button
              type="button"
              disabled={isUnavailable}
              onClick={onAddToCart}
              className="bloom-btn-primary rounded-xl px-3 py-2 text-sm disabled:opacity-40"
            >
              {isUnavailable ? t("unavailableProduct", language) : t("addToCart", language)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
