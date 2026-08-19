import type { Metadata, Viewport } from "next";
import "./globals.css";
import ColorFilterDefs from "@/components/ColorFilterDefs";
import HtmlLangUpdater from "@/components/HtmlLangUpdater";

export const metadata: Metadata = {
  title: "Compra Asistida",
  description: "PoC de compra asistida en tienda.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ColorFilterDefs />
        <HtmlLangUpdater />
        {children}
      </body>
    </html>
  );
}
