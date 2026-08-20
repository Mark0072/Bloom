"use client";

import ProductVisual from "@/components/ProductVisual";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";
import { translateCategory } from "@/lib/categoryNames";
import type { RescueOffer } from "@/lib/rescue";
import type { Language } from "@/types";

interface RescueOfferCardProps {
  offer: RescueOffer;
  language: Language;
  alreadyAdded: boolean;
  onAdd: () => void;
}

function consumptionHint(offer: RescueOffer, language: Language): string {
  const cls = offer.attributes.perishableClass;
  if (language === "en") {
    if (cls === "prepared_food") return "Enjoy today";
    if (cls === "raw_meat_fish") return "Cook within 24–48 hours";
    if (cls === "bakery") return "Enjoy within 1–2 days";
    if (cls === "fresh_dairy") return "Keep refrigerated";
    if (cls === "fresh_produce") return "Enjoy in the next few days";
    return "Consume soon";
  }
  if (cls === "prepared_food") return "Consumir hoy";
  if (cls === "raw_meat_fish") return "Cocinar en 24–48 horas";
  if (cls === "bakery") return "Consumir en 1–2 días";
  if (cls === "fresh_dairy") return "Mantener refrigerado";
  if (cls === "fresh_produce") return "Consumir en los próximos días";
  return "Consumir pronto";
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export default function RescueOfferCard({ offer, language, alreadyAdded, onAdd }: RescueOfferCardProps) {
  return (
    <article className="product-card bloom-card flex h-full flex-col overflow-hidden rounded-[1.35rem] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
      <div className="relative">
        <ProductVisual product={offer} className="aspect-[4/3] w-full" sizes="(min-width: 768px) 22vw, 44vw" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--bloom-danger)] px-3 py-1.5 text-xs font-extrabold text-white shadow-sm">
          -{offer.discountPercent}%
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[0.68rem] font-bold text-[var(--bloom-text)] shadow-sm">
          {offer.daysRemaining === 0
            ? language === "en"
              ? "Today"
              : "Hoy"
            : `${offer.daysRemaining} ${t("rescueDaysLeft", language)}`}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <p className="truncate text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[var(--bloom-accent)]">
          {translateCategory(offer.category, language)}
        </p>
        <h2 className="product-card-name mt-1 text-sm font-bold leading-snug sm:text-base" title={offer.name}>{offer.name}</h2>
        <p className="mt-1 min-h-8 text-[0.72rem] leading-snug bloom-muted">{consumptionHint(offer, language)}</p>

        <div className="mt-auto flex min-h-12 flex-col items-start justify-end gap-0.5 pt-3">
          <span className="whitespace-nowrap text-[0.7rem] font-medium line-through bloom-muted">{formatMoney(offer.price)}</span>
          <span className="product-card-price font-extrabold leading-none text-[var(--bloom-danger)]">
            {formatMoney(offer.rescuePrice)}
          </span>
        </div>

        <button
          type="button"
          disabled={alreadyAdded}
          onClick={onAdd}
          className="bloom-btn-primary mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-[0.8rem] shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 sm:px-3 sm:text-sm"
        >
          {!alreadyAdded && <PlusIcon />}
          {alreadyAdded ? t("bundleAlreadyAdded", language) : t("addToCart", language)}
        </button>
      </div>
    </article>
  );
}
