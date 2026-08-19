"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
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
    if (ticket && typeof window !== "undefined") {
      const encoded = encodeTicket(ticket);
      setTicketUrl(`${window.location.origin}/ticket/view?data=${encoded}`);
    }
  }, [ticket]);

  useEffect(() => {
    if (hasHydrated && !ticket) router.replace("/checkout");
  }, [hasHydrated, ticket, router]);

  if (!hasHydrated || !storeId || !ticket) return null;

  return (
    <KioskShell>
      <StoreHeader title={t("ticketTitle", language)} />

      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs opacity-60">Código de ticket</p>
          <p className="font-mono font-bold">{ticket.ticketCode}</p>
          <p className="mt-2 text-xs opacity-60">{new Date(ticket.createdAt).toLocaleString("es-DO")}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
          <div className="mt-3 border-t border-slate-200 pt-3 flex flex-col gap-1 text-sm">
            <div className="flex justify-between font-bold text-kiosk-sm">
              <span>{t("total", language)}</span>
              <span>{formatMoney(ticket.total)}</span>
            </div>
            {ticket.promoSavings > 0 && (
              <div className="flex justify-between text-brand-700">
                <span>Ahorro por promociones</span>
                <span>-{formatMoney(ticket.promoSavings)}</span>
              </div>
            )}
            {ticket.rescueSavings > 0 && (
              <div className="flex justify-between text-rescue-700">
                <span>Ahorro por Ofertas de Rescate</span>
                <span>-{formatMoney(ticket.rescueSavings)}</span>
              </div>
            )}
          </div>
        </div>

        {ticketUrl && <QRCodeTicket url={ticketUrl} />}

        <p className="rounded-xl bg-amber-50 p-3 text-center text-xs font-medium text-amber-800">
          {t("ticketDisclaimer", language)}
        </p>
      </div>

      <StepNav backHref="/checkout" nextHref="/thanks" />
    </KioskShell>
  );
}
