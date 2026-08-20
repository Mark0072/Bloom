"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { resolveProductMedia, type ProductMediaCategory } from "@/lib/productMedia";
import type { StoreProduct } from "@/types";

type ProductVisualProduct = Pick<StoreProduct, "sku" | "name" | "category">;

interface ProductVisualProps {
  product: ProductVisualProduct;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const FALLBACK_LABEL: Record<ProductMediaCategory, string> = {
  produce: "Frutas y vegetales",
  meat: "Carnes y pescados",
  dairy: "Lácteos y huevos",
  pantry: "Despensa",
  bakery: "Panadería",
  beverages: "Bebidas",
  cleaning: "Limpieza",
  personal: "Cuidado personal",
  prepared: "Comida preparada",
};

function InlineFallback({ category, label }: { category: ProductMediaCategory; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,var(--bloom-surface-alt),var(--bloom-surface))] text-[var(--bloom-accent)]"
    >
      <svg viewBox="0 0 160 140" aria-hidden="true" className="h-4/5 w-4/5 max-h-36 max-w-40">
        <path
          d="M47 46c0-9 7-16 16-16h34c9 0 16 7 16 16l9 63c1 9-6 17-15 17H53c-9 0-16-8-15-17l9-63Z"
          fill="currentColor"
          opacity=".12"
        />
        <path
          d="M55 54h50l7 58a5 5 0 0 1-5 6H53a5 5 0 0 1-5-6l7-58Zm10-4c0-13 7-22 15-22s15 9 15 22"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
        <path
          d="M80 69c12-14 27-11 29-10-2 16-12 27-29 26-13 0-22-7-28-17 12-5 21-4 28 1Z"
          fill="currentColor"
          opacity=".72"
        />
        <path d="M80 69c-1-8 2-15 8-21" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
      </svg>
      <span className="sr-only">{FALLBACK_LABEL[category]}</span>
    </div>
  );
}

export default function ProductVisual({ product, className = "aspect-square w-full", sizes = "(min-width: 768px) 22vw, 44vw", priority }: ProductVisualProps) {
  const media = useMemo(() => resolveProductMedia(product), [product.sku, product.name, product.category]);
  const [src, setSrc] = useState(media.src);
  const [showInlineFallback, setShowInlineFallback] = useState(false);

  useEffect(() => {
    setSrc(media.src);
    setShowInlineFallback(false);
  }, [media.src]);

  function handleError() {
    if (src !== media.fallbackSrc) {
      setSrc(media.fallbackSrc);
      return;
    }
    setShowInlineFallback(true);
  }

  return (
    <div className={`relative overflow-hidden bg-[var(--bloom-surface-alt)] ${className}`}>
      {showInlineFallback ? (
        <InlineFallback category={media.category} label={media.alt} />
      ) : (
        <Image
          key={src}
          src={src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          onError={handleError}
          className={`object-contain ${media.isProductPhoto && src === media.src ? "p-3 sm:p-4" : "p-4"}`}
        />
      )}
    </div>
  );
}

