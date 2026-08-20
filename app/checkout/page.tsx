"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import AssistanceStatus from "@/components/AssistanceStatus";
import BasketSummary from "@/components/BasketSummary";
import StateIcon from "@/components/StateIcon";
import StepNav from "@/components/StepNav";
import { t } from "@/lib/i18n";
import { generateShoppingRoute } from "@/lib/route";
import { createTicket } from "@/lib/ticket";
import { useBloomStore } from "@/store/useBloomStore";

export default function CheckoutPage() {
  const router = useRouter();
  const storeId = useBloomStore((state) => state.storeId);
  const hasHydrated = useBloomStore((state) => state.hasHydrated);
  const language = useBloomStore((state) => state.language);
  const lines = useBloomStore((state) => state.lines);
  const assistance = useBloomStore((state) => state.assistance);
  const basketSavings = useBloomStore((state) => state.basketSavings);
  const setRoute = useBloomStore((state) => state.setRoute);
  const setTicket = useBloomStore((state) => state.setTicket);

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
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--bloom-surface-alt)] text-[var(--brand-primary)]" aria-hidden="true">
            <StateIcon name="basket" />
          </div>
          <div>
            <p className="text-xl font-black">{t("emptyCheckoutTitle", language)}</p>
            <p className="mt-2 text-sm bloom-muted">
              {language === "en" ? "Create a basket before generating its ticket." : "Crea una canasta antes de generar su ticket."}
            </p>
          </div>
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

  function handleGenerateTicket(): boolean {
    if (!storeId || !route || lines.length === 0) return false;
    setTicket(createTicket({ storeId, lines, promoSavings: basketSavings, route, assistance }));
    return true;
  }

  return (
    <AppShell title={t("checkoutTitle", language)}>
      <div className="flex flex-col gap-5 overflow-y-auto pb-4">
        <section className="relative overflow-hidden rounded-3xl bg-[var(--brand-primary)] p-6 text-white shadow-lg">
          <div className="absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-[var(--brand-highlight)]" />
          <div className="relative max-w-[82%]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
              {language === "en" ? "Final review" : "Revisión final"}
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight">
              {language === "en" ? "Everything is ready for your route" : "Todo está listo para tu recorrido"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {language === "en"
                ? "Confirm your basket and create the QR ticket you can carry through the store."
                : "Confirma tu canasta y crea el ticket QR que podrás llevar por la tienda."}
            </p>
          </div>
        </section>

        <section aria-labelledby="checkout-basket-heading">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="checkout-basket-heading" className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">
              {language === "en" ? "Your products" : "Tus productos"}
            </h2>
            <span className="h-px flex-1 bg-[var(--bloom-border)]" />
          </div>
          <BasketSummary storeId={storeId} editable={false} />
        </section>

        <section aria-labelledby="checkout-route-heading">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="checkout-route-heading" className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">
              {t("routeTitle", language)}
            </h2>
            <span className="h-px flex-1 bg-[var(--bloom-border)]" />
          </div>
          <ol className="bloom-card overflow-hidden rounded-3xl">
            {route.stops.map((stop, index) => (
              <li key={stop.zoneId} className={`flex gap-3 px-4 py-3 ${index > 0 ? "border-t bloom-border" : ""}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-sm font-black text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold">{stop.zoneLabel}</p>
                  {stop.items.length > 0 && (
                    <p className="mt-0.5 text-sm leading-relaxed bloom-muted">
                      {stop.items.map((item) => item.name).join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {assistance && (
          <section aria-labelledby="checkout-assistance-heading">
            <div className="mb-3 flex items-center gap-3">
              <h2 id="checkout-assistance-heading" className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">
                {t("assistanceTitle", language)}
              </h2>
              <span className="h-px flex-1 bg-[var(--bloom-border)]" />
            </div>
            <AssistanceStatus request={assistance} />
          </section>
        )}

        <p className="rounded-2xl bg-[var(--bloom-surface-alt)] p-4 text-center text-xs leading-relaxed bloom-muted">
          {language === "en"
            ? "No payment will be processed. This QR is a demonstration shopping ticket."
            : "No se procesará ningún pago. Este QR es un ticket demostrativo de compra."}
        </p>
      </div>

      <StepNav
        fallbackHref="/route"
        nextHref="/ticket"
        nextLabel={t("ticketGenerate", language)}
        onNext={handleGenerateTicket}
      />
    </AppShell>
  );
}
