"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import KioskShell from "@/components/KioskShell";
import ProductVisual from "@/components/ProductVisual";
import StateIcon from "@/components/StateIcon";
import { getAssistanceStatusLabel, getAssistanceTypeLabel } from "@/lib/assistance";
import { getBrandTheme, getBrandVariables } from "@/lib/brandTheme";
import { formatMoney } from "@/lib/money";
import { getStoreProduct } from "@/lib/products";
import { decodeTicket } from "@/lib/ticket";

function TicketViewContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  const ticket = useMemo(() => {
    const decoded = data ? decodeTicket(data) : null;
    return decoded && decoded.lines.length > 0 ? decoded : null;
  }, [data]);

  if (!ticket) {
    return (
      <KioskShell neutral preserveTrueColor>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-800" aria-hidden="true">
            <StateIcon name="warning" />
          </div>
          <div>
            <p className="text-xl font-black">Ticket inválido o expirado</p>
            <p className="mt-2 bloom-muted">No pudimos leer la información de este código QR.</p>
          </div>
        </div>
      </KioskShell>
    );
  }

  const theme = getBrandTheme(ticket.storeId);
  if (!theme) return null;
  const totalSavings = ticket.promoSavings + ticket.rescueSavings;

  return (
    <KioskShell fullBleed neutral preserveTrueColor>
      <main
        className="flex min-h-[100dvh] flex-col gap-5 bg-[var(--bloom-bg)] px-5 py-6 text-[var(--bloom-text)] sm:px-8 sm:py-8"
        style={getBrandVariables(ticket.storeId)}
      >
        <header className="relative overflow-hidden rounded-3xl bg-[var(--brand-primary)] p-6 text-white shadow-xl">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--brand-highlight)]" />
          <div className="relative">
            <BrandLogo theme={theme} inverse className="h-12 w-40" />
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-white/70">Lista digital de compra</p>
            <h1 className="mt-1 text-3xl font-black">{ticket.storeName}</h1>
            <p className="mt-1 text-sm text-white/75">{ticket.branchName}</p>
          </div>
        </header>

        <section className="bloom-card rounded-3xl p-5 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] bloom-muted">Código de ticket</p>
          <p className="mt-2 break-all font-mono text-xl font-black text-[var(--brand-primary)]">{ticket.ticketCode}</p>
          <p className="mt-2 text-xs bloom-muted">{new Date(ticket.createdAt).toLocaleString("es-DO")}</p>
        </section>

        <section aria-labelledby="mobile-products-heading">
          <div className="mb-3 flex items-center gap-3">
            <h2 id="mobile-products-heading" className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">
              Tu canasta
            </h2>
            <span className="h-px flex-1 bg-[var(--bloom-border)]" />
          </div>
          <div className="bloom-card overflow-hidden rounded-3xl">
            {ticket.lines.map((line, index) => {
              const product = getStoreProduct(ticket.storeId, line.sku);
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
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black text-[var(--brand-primary)]">{formatMoney(ticket.total)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="mt-2 flex justify-between text-sm font-bold text-[var(--brand-secondary)]">
                  <span>Ahorro total</span>
                  <span>−{formatMoney(totalSavings)}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {ticket.routeSummary.length > 0 && (
          <section aria-labelledby="mobile-route-heading">
            <div className="mb-3 flex items-center gap-3">
              <h2 id="mobile-route-heading" className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)]">
                Ruta recomendada
              </h2>
              <span className="h-px flex-1 bg-[var(--bloom-border)]" />
            </div>
            <ol className="bloom-card overflow-hidden rounded-3xl">
              {ticket.routeSummary.map((line, index) => (
                <li key={index} className={`flex items-start gap-3 px-4 py-3 ${index > 0 ? "border-t bloom-border" : ""}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <span className="pt-1 text-sm leading-relaxed">{line}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {ticket.assistance && (
          <section className="rounded-3xl border-2 border-[var(--brand-highlight)] bg-[var(--bloom-surface-alt)] p-4">
            <p className="font-black text-[var(--brand-primary)]">Asistencia solicitada</p>
            <p className="mt-1 text-sm bloom-muted">
              {getAssistanceTypeLabel(ticket.assistance.type, "es")} · {getAssistanceStatusLabel(ticket.assistance.status, "es")}
            </p>
          </section>
        )}

        <p className="mt-auto rounded-2xl bg-[var(--bloom-surface-alt)] p-4 text-center text-xs font-medium leading-relaxed">
          Este ticket es demostrativo para PoC. No representa una compra real y no confirma un pago.
        </p>
      </main>
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
