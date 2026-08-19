"use client";

import { QRCodeSVG } from "qrcode.react";

// Comfortably under a QR code's byte capacity at low error correction (~2900 bytes at version 40-L).
const MAX_QR_LENGTH = 1800;

export default function QRCodeTicket({ url }: { url: string }) {
  if (url.length > MAX_QR_LENGTH) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-center">
        <p className="text-sm font-semibold text-amber-800">
          Esta canasta es muy grande para generar un código QR. Usa el enlace del ticket en su lugar.
        </p>
        <p className="break-all text-xs opacity-60">{url}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
      <QRCodeSVG value={url} size={200} level="L" includeMargin />
      <p className="break-all text-center text-xs opacity-60">{url}</p>
    </div>
  );
}
