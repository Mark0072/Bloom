"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import StepNav from "@/components/StepNav";
import QRCodeTicket from "@/components/QRCodeTicket";
import { formatMoney } from "@/lib/money";
import { encodeTicket } from "@/lib/ticket";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

export default function TicketPage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const ticket = useBloomStore((s) => s.ticket);
  const [ticketUrl, setTicketUrl] = useState("");

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  useEffect(() => {
    if (ticket && ticket.lines.length > 0 && typeof window !== "undefined") {
      const encoded = encodeTicket(ticket);
      setTicketUrl(`${window.location.origin}/ticket/view?data=${encoded}`);
    }
  }, [ticket]);

  useEffect(() => {
    if (hasHydrated && (!ticket || ticket.lines.length === 0)) router.replace("/checkout");
  }, [hasHydrated, ticket, router]);

  if (!hasHydrated || !storeId || !ticket || ticket.lines.length === 0) return null;

  return (
    <AppShell title={t("ticketTitle", language)}>
      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        <div className="bloom-card rounded-2xl p-4">
          <p className="text-xs bloom-muted">{language === "en" ? "Ticket code" : "Código de ticket"}</p>
          <p className="font-mono font-bold">{ticket.ticketCode}</p>
          <p className="mt-2 text-xs bloom-muted">{new Date(ticket.createdAt).toLocaleString(language === "en" ? "en-US" : "es-DO")}</p>
        </div>

        <div className="bloom-card rounded-2xl p-4">
          <ul className="flex flex-col gap-1 text-sm">
            {ticket.lines.map((line, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {line.quantity}× {ticket.productNames[line.sku] ?? line.sku}
                </span>
                <span>{formatMoney(line.unitPrice * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t bloom-border pt-3 flex flex-col gap-1 text-sm">
            <div className="flex justify-between font-bold text-kiosk-sm">
              <span>{t("total", language)}</span>
              <span>{formatMoney(ticket.total)}</span>
            </div>
            {ticket.promoSavings > 0 && (
              <div className="flex justify-between">
                <span>{t("savings", language)}</span>
                <span>-{formatMoney(ticket.promoSavings)}</span>
              </div>
            )}
            {ticket.rescueSavings > 0 && (
              <div className="flex justify-between text-[var(--bloom-warning)]">
                <span>{language === "en" ? "Rescue Offer savings" : "Ahorro por Ofertas de Rescate"}</span>
                <span>-{formatMoney(ticket.rescueSavings)}</span>
              </div>
            )}
          </div>
        </div>

        {ticketUrl && <QRCodeTicket url={ticketUrl} />}

        <p className="bloom-card-alt rounded-xl p-3 text-center text-xs font-medium">{t("ticketDisclaimer", language)}</p>
      </div>

      <StepNav fallbackHref="/checkout" nextHref="/thanks" />
    </AppShell>
  );
}
