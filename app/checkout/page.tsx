"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
import StepNav from "@/components/StepNav";
import BasketSummary from "@/components/BasketSummary";
import AssistanceStatus from "@/components/AssistanceStatus";
import { formatMoney } from "@/lib/money";
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
  const total = useMemo(() => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0), [lines]);

  useEffect(() => {
    if (route) setRoute(route);
  }, [route, setRoute]);

  if (!hasHydrated || !storeId || !route) return null;

  const routeSummary = getRouteSummary(route);

  function handleGenerateTicket(): boolean {
    if (!storeId || !route) return false;
    const ticket = createTicket({ storeId, lines, promoSavings: basketSavings, route, assistance });
    setTicket(ticket);
    return true;
  }

  return (
    <KioskShell>
      <StoreHeader title={t("checkoutTitle", language)} />

      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        <BasketSummary storeId={storeId} editable={false} />

        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex justify-between text-kiosk-base font-bold">
            <span>{t("total", language)}</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide opacity-60">{t("routeTitle", language)}</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {routeSummary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>

        {assistance && (
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide opacity-60">{t("assistanceTitle", language)}</p>
            <AssistanceStatus request={assistance} />
          </div>
        )}
      </div>

      <StepNav backHref="/assistance" nextHref="/ticket" nextLabel={t("ticketGenerate", language)} onNext={handleGenerateTicket} />
    </KioskShell>
  );
}
