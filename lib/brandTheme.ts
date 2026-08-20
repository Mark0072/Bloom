import type { CSSProperties } from "react";
import type { StoreId } from "@/types";

export type BrandKey = "sirena" | "aprezio";

export interface BrandTheme {
  key: BrandKey;
  storeId: StoreId;
  name: string;
  shortTagline: string;
  logo: string;
  inverseLogo: string;
  closingLogo: string;
  welcomeHero: string;
  languagePromo: string;
  homeImages: {
    fresh: string;
    meat: string;
    beauty: string;
    brands: string;
  };
  welcome: {
    eyebrow: string;
    headline: string;
    accent: string;
    description: string;
  };
  colors: {
    page: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    muted: string;
    border: string;
    accent: string;
    accentText: string;
    primary: string;
    secondary: string;
    highlight: string;
    sidebar: string;
    sidebarText: string;
    sidebarMuted: string;
  };
}

export const BRAND_THEMES: Record<StoreId, BrandTheme> = {
  "SIR-001": {
    key: "sirena",
    storeId: "SIR-001",
    name: "Sirena",
    shortTagline: "Lo más valioso por menos",
    logo: "/brand/sirena/logo.png",
    inverseLogo: "/brand/sirena/logo-white.png",
    closingLogo: "/brand/sirena/closing-logo.png",
    welcomeHero: "/brand/sirena/welcome-hero.png",
    languagePromo: "/brand/sirena/language-promo.png",
    homeImages: {
      fresh: "/brand/sirena/home-fresh.jpg",
      meat: "/brand/sirena/home-meat.jpg",
      beauty: "/brand/sirena/home-beauty.jpg",
      brands: "/brand/sirena/home-brands.jpg",
    },
    welcome: {
      eyebrow: "Que su única tarea sea",
      headline: "soñar en grande",
      accent: "Descubre una forma más fácil de comprar",
      description: "Consulta, arma tu canasta y encuentra cada producto sin perder tiempo.",
    },
    colors: {
      page: "#f5fbfd",
      surface: "#ffffff",
      surfaceAlt: "#eaf8fc",
      text: "#004f91",
      muted: "#496a82",
      border: "#c8e4ed",
      accent: "#09a9d1",
      accentText: "#ffffff",
      primary: "#005596",
      secondary: "#09a9d1",
      highlight: "#ffeb22",
      sidebar: "#004f91",
      sidebarText: "#ffffff",
      sidebarMuted: "#bee8f4",
    },
  },
  "APZ-001": {
    key: "aprezio",
    storeId: "APZ-001",
    name: "Aprezio",
    shortTagline: "Cerca de ti, con los precios más bajos",
    logo: "/brand/aprezio/logo.png",
    inverseLogo: "/brand/aprezio/logo-white.png",
    closingLogo: "/brand/aprezio/closing-logo.png",
    welcomeHero: "/brand/aprezio/welcome-hero.png",
    languagePromo: "/brand/aprezio/language-promo.png",
    homeImages: {
      fresh: "/brand/aprezio/home-fresh.jpg",
      meat: "/brand/aprezio/home-meat.jpg",
      beauty: "/brand/aprezio/home-beauty.jpg",
      brands: "/brand/aprezio/home-brands.jpg",
    },
    welcome: {
      eyebrow: "Tu coro compra mejor",
      headline: "cuando compra junto",
      accent: "Rinde tu presupuesto",
      description: "Planifica una compra completa, práctica y pensada para compartir.",
    },
    colors: {
      page: "#f7fbf4",
      surface: "#ffffff",
      surfaceAlt: "#edf7e8",
      text: "#087f4d",
      muted: "#527062",
      border: "#cfe2ce",
      accent: "#079447",
      accentText: "#ffffff",
      primary: "#087f4d",
      secondary: "#6da533",
      highlight: "#ffd600",
      sidebar: "#087f4d",
      sidebarText: "#ffffff",
      sidebarMuted: "#d8efcf",
    },
  },
};

const NEUTRAL_COLORS: BrandTheme["colors"] = {
  page: "#f4f7f5",
  surface: "#ffffff",
  surfaceAlt: "#edf2ef",
  text: "#17352b",
  muted: "#617169",
  border: "#d9e2dd",
  accent: "#137a51",
  accentText: "#ffffff",
  primary: "#17352b",
  secondary: "#137a51",
  highlight: "#ffd600",
  sidebar: "#17352b",
  sidebarText: "#ffffff",
  sidebarMuted: "#d8e5df",
};

export function getBrandTheme(storeId: StoreId | null | undefined): BrandTheme | null {
  return storeId ? BRAND_THEMES[storeId] : null;
}

export function getBrandVariables(
  storeId: StoreId | null | undefined,
  options: { neutral?: boolean; highContrast?: boolean } = {}
): CSSProperties {
  const colors = options.neutral ? NEUTRAL_COLORS : getBrandTheme(storeId)?.colors ?? NEUTRAL_COLORS;

  if (options.highContrast) {
    return {
      "--bloom-bg": "#000000",
      "--bloom-surface": "#000000",
      "--bloom-surface-alt": "#111111",
      "--bloom-text": "#ffffff",
      "--bloom-text-muted": "#f3f3f3",
      "--bloom-border": "#ffffff",
      "--bloom-accent": "#ffd400",
      "--bloom-accent-text": "#000000",
      "--brand-primary": "#000000",
      "--brand-secondary": "#ffd400",
      "--brand-highlight": "#ffd400",
      "--brand-sidebar": "#000000",
      "--brand-sidebar-text": "#ffffff",
      "--brand-sidebar-muted": "#f3f3f3",
    } as CSSProperties;
  }

  return {
    "--bloom-bg": colors.page,
    "--bloom-surface": colors.surface,
    "--bloom-surface-alt": colors.surfaceAlt,
    "--bloom-text": colors.text,
    "--bloom-text-muted": colors.muted,
    "--bloom-border": colors.border,
    "--bloom-accent": colors.accent,
    "--bloom-accent-text": colors.accentText,
    "--brand-primary": colors.primary,
    "--brand-secondary": colors.secondary,
    "--brand-highlight": colors.highlight,
    "--brand-sidebar": colors.sidebar,
    "--brand-sidebar-text": colors.sidebarText,
    "--brand-sidebar-muted": colors.sidebarMuted,
  } as CSSProperties;
}

const CATEGORY_ASSET: Record<string, string> = {
  Despensa: "/brand/shared/products/wala-azucar-5lb.jpg",
  "Lácteos y huevos": "/brand/shared/products/rica-leche-vaquita-1l.jpg",
  "Limpieza y desechables": "/brand/shared/products/wala-cloro-1gl.jpg",
  "Carnes y pescados": "/brand/shared/products/res-molida-lb.jpg",
  "Frutas y vegetales": "/brand/shared/products/platano-un.jpg",
  Panadería: "/brand/shared/products/pan-sobao-fam.jpg",
  "Comida preparada": "/brand/shared/fallbacks/prepared.svg",
  Bebidas: "/brand/shared/products/jugo-rica-naranja-1l.jpg",
  "Higiene personal": "/brand/shared/fallbacks/personal.svg",
};

export function getCategoryImage(_theme: BrandTheme, category: string): string {
  return CATEGORY_ASSET[category] ?? "/brand/shared/fallbacks/pantry.svg";
}
