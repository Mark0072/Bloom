"use client";

import { QRCodeSVG } from "qrcode.react";
import { useBloomStore } from "@/store/useBloomStore";

const MAX_QR_LENGTH = 1800;

export default function QRCodeTicket({ url }: { url: string }) {
  const language = useBloomStore((state) => state.language);

  if (url.length > MAX_QR_LENGTH) {
    return (
      <div className="rounded-3xl border-2 border-[var(--brand-highlight)] bg-[var(--bloom-surface-alt)] p-5 text-center">
        <p className="font-bold text-[var(--brand-primary)]">
          {language === "en" ? "This basket is too large for one QR code." : "Esta canasta es muy grande para un solo código QR."}
        </p>
        <p className="mt-2 text-sm bloom-muted">
          {language === "en" ? "Use the ticket link below instead." : "Usa el enlace del ticket que aparece debajo."}
        </p>
        <p className="mt-3 break-all rounded-xl bg-white p-3 text-xs text-slate-600">{url}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-[var(--brand-primary)] p-2 shadow-xl">
      <div className="qr-safe flex flex-col items-center rounded-[1.6rem] bg-white px-5 py-6 text-slate-900">
        <div className="relative rounded-2xl border-4 border-slate-900 bg-white p-3">
          <QRCodeSVG value={url} size={220} level="L" includeMargin={false} fgColor="#000000" bgColor="#ffffff" />
          <span className="absolute -left-2 -top-2 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-[var(--brand-highlight)]" />
          <span className="absolute -bottom-2 -right-2 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-[var(--brand-highlight)]" />
        </div>
        <p className="mt-4 text-center text-sm font-bold text-slate-900">
          {language === "en" ? "Scan to open your shopping ticket" : "Escanea para abrir tu ticket de compra"}
        </p>
        <details className="mt-2 w-full text-center">
          <summary className="cursor-pointer text-xs font-semibold text-slate-500">
            {language === "en" ? "Show ticket link" : "Mostrar enlace del ticket"}
          </summary>
          <p className="mt-2 break-all rounded-xl bg-slate-50 p-2 text-left text-[10px] text-slate-500">{url}</p>
        </details>
      </div>
    </div>
  );
}
