"use client";

import { getAvailabilityState } from "@/lib/products";
import { formatMoney } from "@/lib/money";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
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
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export default function ProductCard({ product, actionLabel, onAction, compact }: ProductCardProps) {
  const language = useBloomStore((s) => s.language);
  const accessibleMode = useBloomStore((s) => s.accessibleMode);
  const state = getAvailabilityState(product);
  const emoji = CATEGORY_EMOJI[product.category] ?? "🛒";

  const stateStyles: Record<string, string> = {
    disponible: "bg-brand-100 text-brand-800",
    pocas_unidades: "bg-amber-100 text-amber-800",
    no_disponible: "bg-red-100 text-red-700",
  };

  const stateLabel: Record<string, string> = {
    disponible: t("available", language),
    pocas_unidades: t("lowStock", language),
    no_disponible: t("unavailable", language),
  };

  return (
    <div
      className={`rounded-2xl border ${
        accessibleMode ? "border-white bg-black" : "border-slate-200 bg-white"
      } p-4 flex gap-4`}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-3xl">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold leading-snug ${accessibleMode ? "text-xl" : "text-kiosk-sm"}`}>{product.name}</p>
        <p className="text-sm opacity-70">
          {product.brand} · {product.category}
        </p>
        {!compact && (
          <p className="text-sm opacity-70">
            {t("aisle", language)}: {product.aisle}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${stateStyles[state]}`}>
            {stateLabel[state]}
          </span>
          {product.promo && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">Promoción</span>
          )}
          {product.rescue?.eligible && (
            <span className="rounded-full bg-rescue-100 px-2 py-1 text-xs font-semibold text-rescue-700">
              {product.rescue.label ?? "Oferta de Rescate"}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-kiosk-base font-bold">{formatMoney(product.price)}</p>
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white active:scale-95"
            >
              {actionLabel ?? "+"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
