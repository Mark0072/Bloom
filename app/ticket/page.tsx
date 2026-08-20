"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import BrandLogo from "@/components/BrandLogo";
import ProductVisual from "@/components/ProductVisual";
import QRCodeTicket from "@/components/QRCodeTicket";
import StateIcon from "@/components/StateIcon";
import StepNav from "@/components/StepNav";
import { getBrandTheme } from "@/lib/brandTheme";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { getStoreProduct } from "@/lib/products";
import { encodeTicket } from "@/lib/ticket";
import { useBloomStore } from "@/store/useBloomStore";

export default function TicketPage() {
  const router = useRouter();
  const storeId = useBloomStore((state) => state.storeId);
  const hasHydrated = useBloomStore((state) => state.hasHydrated);
  const language = useBloomStore((state) => state.language);
  const ticket = useBloomStore((state) => state.ticket);
  const [ticketUrl, setTicketUrl] = useState("");
  const theme = getBrandTheme(storeId);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  useEffect(() => {
    if (ticket && ticket.lines.length > 0 && typeof window !== "undefined") {
      setTicketUrl(`${window.location.origin}/ticket/view?data=${encodeTicket(ticket)}`);
    }
  }, [ticket]);

  useEffect(() => {
    if (hasHydrated && (!ticket || ticket.lines.length === 0)) router.replace("/checkout");
  }, [hasHydrated, ticket, router]);

  if (!hasHydrated || !storeId || !theme || !ticket || ticket.lines.length === 0) return null;

  const totalSavings = ticket.promoSavings + ticket.rescueSavings;

  return (
    <AppShell title={t("ticketTitle", language)} preserveTrueColor>
      <div className="flex flex-col gap-5 overflow-y-auto pb-4">
        <section className="relative overflow-hidden rounded-3xl bg-[var(--brand-primary)] p-6 text-white shadow-xl">
          <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--brand-highlight)]" />
          <div className="relative">
            <BrandLogo theme={theme} inverse className="h-12 w-40" />
            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-highlight)] text-black" aria-hidden="true">
                <StateIcon name="check" className="h-7 w-7" />
              </span>
              <div>
                <p className="text-2xl font-black leading-tight">
                  {language === "en" ? "Your ticket is ready" : "Tu ticket está listo"}
                </p>
                <p className="mt-1 text-sm text-white/75">{ticket.branchName}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bloom-card rounded-3xl p-5 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] bloom-muted">
            {language === "en" ? "Ticket code" : "Código de ticket"}
          </p>
          <p className="mt-2 break-all font-mono text-xl font-black text-[var(--brand-primary)]">{ticket.ticketCode}</p>
          <p className="mt-2 text-xs bloom-muted">
            {new Date(ticket.createdAt).toLocaleString(language === "en" ? "en-US" : "es-DO")}
          </p>
        </section>

        {ticketUrl && (
          <section aria-labelledby="ticket-qr-heading">
            <div className="mb-3 text-center">
              <h2 id="ticket-qr-heading" className="text-xl font-black">
                {language === "en" ? "Take your route with you" : "Lleva tu ruta contigo"}
              </h2>
              <p className="mt-1 text-sm bloom-muted">
                {language === "en" ? "Open this same ticket from your phone." : "Abre este mismo ticket desde tu celular."}
              </p>
            </div>
            <QRCodeTicket url={ticketUrl} />
          </section>
        )}

        <section aria-labelledby="ticket-products-heading">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="ticket-products-heading" className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">
              {language === "en" ? "Purchase detail" : "Detalle de compra"}
            </h2>
            <span className="h-px flex-1 bg-[var(--bloom-border)]" />
          </div>
          <div className="bloom-card overflow-hidden rounded-3xl">
            {ticket.lines.map((line, index) => {
              const product = getStoreProduct(storeId, line.sku);
              return (
                <div key={line.id} className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? "border-t bloom-border" : ""}`}>
                  {product && <ProductVisual product={product} className="h-14 w-14 shrink-0 rounded-xl" sizes="56px" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-snug">{ticket.productNames[line.sku] ?? line.sku}</p>
                    <p className="mt-0.5 text-xs bloom-muted">× {line.quantity}</p>
                  </div>
                  <p className="shrink-0 font-black">{formatMoney(line.unitPrice * line.quantity)}</p>
                </div>
              );
            })}

            <div className="border-t-2 bloom-border bg-[var(--bloom-surface-alt)] p-4">
              <div className="flex items-end justify-between gap-3">
                <span className="font-bold">{t("total", language)}</span>
                <span className="text-2xl font-black text-[var(--brand-primary)]">{formatMoney(ticket.total)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="mt-2 flex justify-between text-sm font-bold text-[var(--brand-secondary)]">
                  <span>{language === "en" ? "Total savings" : "Ahorro total"}</span>
                  <span>−{formatMoney(totalSavings)}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {ticket.routeSummary.length > 0 && (
          <details className="bloom-card overflow-hidden rounded-2xl">
            <summary className="cursor-pointer px-4 py-3 font-bold text-[var(--brand-primary)]">
              {language === "en" ? "View route summary" : "Ver resumen de ruta"}
            </summary>
            <ol className="border-t bloom-border px-8 py-4 text-sm leading-relaxed bloom-muted">
              {ticket.routeSummary.map((line, index) => <li key={index} className="list-decimal">{line}</li>)}
            </ol>
          </details>
        )}

        <p className="rounded-2xl bg-[var(--bloom-surface-alt)] p-4 text-center text-xs font-medium leading-relaxed">
          {t("ticketDisclaimer", language)}
        </p>
      </div>

      <StepNav fallbackHref="/checkout" nextHref="/thanks" nextLabel={t("next", language)} />
    </AppShell>
  );
}
