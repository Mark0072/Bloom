"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import StepNav from "@/components/StepNav";
import BasketSummary from "@/components/BasketSummary";
import AssistanceStatus from "@/components/AssistanceStatus";
import { generateShoppingRoute, getRouteSummary } from "@/lib/route";
import { createTicket } from "@/lib/ticket";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

export default function CheckoutPage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const lines = useBloomStore((s) => s.lines);
  const assistance = useBloomStore((s) => s.assistance);
  const basketSavings = useBloomStore((s) => s.basketSavings);
  const setRoute = useBloomStore((s) => s.setRoute);
  const setTicket = useBloomStore((s) => s.setTicket);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  const route = useMemo(() => (storeId ? generateShoppingRoute(lines, storeId) : null), [storeId, lines]);

  useEffect(() => {
    if (route && lines.length > 0) setRoute(route);
  }, [route, lines.length, setRoute]);

  if (!hasHydrated || !storeId || !route) return null;

  if (lines.length === 0) {
    return (
      <AppShell title={t("checkoutTitle", language)}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-5xl">🧺</span>
          <p className="text-kiosk-base font-bold">{t("emptyCheckoutTitle", language)}</p>
          <div className="flex w-full flex-col gap-2">
            <button type="button" onClick={() => router.push("/basket/start")} className="bloom-btn-primary rounded-2xl py-4">
              {t("goToBasketStart", language)}
            </button>
            <button type="button" onClick={() => router.push("/products")} className="bloom-btn-secondary rounded-2xl py-4">
              {t("goToProducts", language)}
            </button>
          </div>
        </div>
        <StepNav fallbackHref="/home" />
      </AppShell>
    );
  }

  const routeSummary = getRouteSummary(route);

  function handleGenerateTicket(): boolean {
    if (!storeId || !route || lines.length === 0) return false;
    const ticket = createTicket({ storeId, lines, promoSavings: basketSavings, route, assistance });
    setTicket(ticket);
    return true;
  }

  return (
    <AppShell title={t("checkoutTitle", language)}>
      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        <BasketSummary storeId={storeId} editable={false} />

        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide bloom-muted">{t("routeTitle", language)}</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {routeSummary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>

        {assistance && (
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide bloom-muted">{t("assistanceTitle", language)}</p>
            <AssistanceStatus request={assistance} />
          </div>
        )}
      </div>

      <StepNav fallbackHref="/route" nextHref="/ticket" nextLabel={t("ticketGenerate", language)} onNext={handleGenerateTicket} />
    </AppShell>
  );
}
