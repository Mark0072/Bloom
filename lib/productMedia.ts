import type { StoreProduct } from "@/types";

export type ProductMediaCategory =
  | "produce"
  | "meat"
  | "dairy"
  | "pantry"
  | "bakery"
  | "beverages"
  | "cleaning"
  | "personal"
  | "prepared";

type ProductMediaInput = Pick<StoreProduct, "sku" | "name" | "category">;

/**
 * Product photographs extracted from the approved visual references.
 * Keeping this list explicit prevents the UI from requesting a photo that was
 * never produced; every other SKU goes directly to its category illustration.
 */
export const PRODUCT_MEDIA_BY_SKU: Readonly<Record<string, string>> = {
  "PLATANO-UN": "/brand/shared/products/platano-un.jpg",
  "CEBOLLA-ROJA-LB": "/brand/shared/products/cebolla-roja-lb.jpg",
  "TOMATE-LB": "/brand/shared/products/tomate-lb.jpg",
  "GUINEO-UN": "/brand/shared/products/guineo-un.jpg",
  "RES-MOLIDA-LB": "/brand/shared/products/res-molida-lb.jpg",
  "POLLO-ENTERO-LB": "/brand/shared/products/pollo-entero-lb.jpg",
  "WALA-AZUCAR-5LB": "/brand/shared/products/wala-azucar-5lb.jpg",
  "HUEVOS-12": "/brand/shared/products/huevos-12.jpg",
  "SOSUA-QUESO-BARRA-1LB": "/brand/shared/products/sosua-queso-barra-1lb.jpg",
  "RICA-LECHE-VAQUITA-1L": "/brand/shared/products/rica-leche-vaquita-1l.jpg",
  "WALA-CLORO-1GL": "/brand/shared/products/wala-cloro-1gl.jpg",
  "ZERCA-PAPEL-TOALLA-136": "/brand/shared/products/zerca-papel-toalla-136.jpg",
  "PAN-SOBAO-FAM": "/brand/shared/products/pan-sobao-fam.jpg",
  "JUGO-RICA-NARANJA-1L": "/brand/shared/products/jugo-rica-naranja-1l.jpg",
  "WALA-PAPEL-HIG-12": "/brand/shared/products/wala-papel-hig-12.jpg",
  "KINDU-ACEITE-128OZ": "/brand/shared/products/kindu-aceite-128oz.jpg",
};

const CATEGORY_MEDIA: Readonly<Record<string, ProductMediaCategory>> = {
  "Frutas y vegetales": "produce",
  "Carnes y pescados": "meat",
  "Lácteos y huevos": "dairy",
  Despensa: "pantry",
  Panadería: "bakery",
  Bebidas: "beverages",
  "Limpieza y desechables": "cleaning",
  "Higiene personal": "personal",
  "Comida preparada": "prepared",
};

export interface ResolvedProductMedia {
  src: string;
  fallbackSrc: string;
  alt: string;
  category: ProductMediaCategory;
  isProductPhoto: boolean;
}

export function normalizeProductSku(sku: string): string {
  return sku
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .toLowerCase();
}

export function getProductMediaCategory(category: string): ProductMediaCategory {
  return CATEGORY_MEDIA[category] ?? "pantry";
}

export function getProductFallbackSrc(category: string): string {
  return `/brand/shared/fallbacks/${getProductMediaCategory(category)}.svg`;
}

export function resolveProductMedia(product: ProductMediaInput): ResolvedProductMedia {
  const fallbackSrc = getProductFallbackSrc(product.category);
  const explicitSrc = PRODUCT_MEDIA_BY_SKU[product.sku];

  return {
    src: explicitSrc ?? fallbackSrc,
    fallbackSrc,
    alt: product.name,
    category: getProductMediaCategory(product.category),
    isProductPhoto: Boolean(explicitSrc),
  };
}

