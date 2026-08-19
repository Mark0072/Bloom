"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import { formatMoney } from "@/lib/money";
import { decodeTicket } from "@/lib/ticket";

function TicketViewContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  const ticket = useMemo(() => (data ? decodeTicket(data) : null), [data]);

  if (!ticket) {
    return (
      <KioskShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="text-5xl">⚠️</span>
          <p className="text-kiosk-base font-bold">Ticket inválido o expirado</p>
          <p className="opacity-70">No pudimos leer la información de este código QR.</p>
        </div>
      </KioskShell>
    );
  }

  return (
    <KioskShell>
      <div className="text-center">
        <p className="text-kiosk-lg font-extrabold">{ticket.storeName}</p>
        <p className="opacity-70">{ticket.branchName}</p>
      </div>

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
            <span>Total</span>
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

      {ticket.routeSummary.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide opacity-60">Ruta resumida</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {ticket.routeSummary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>
      )}

      {ticket.assistance && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold">Asistencia solicitada</p>
          <p className="text-sm opacity-70">Estado: {ticket.assistance.status}</p>
        </div>
      )}

      <p className="rounded-xl bg-amber-50 p-3 text-center text-xs font-medium text-amber-800">
        Este ticket es demostrativo para PoC. No representa una compra real.
      </p>
    </KioskShell>
  );
}

export default function TicketViewPage() {
  return (
    <Suspense fallback={null}>
      <TicketViewContent />
    </Suspense>
  );
}
