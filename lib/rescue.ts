import { getRescuePolicy, getStoreProducts, getStoreProduct, getManualBundles as getManualBundlesFromData, getManualBundle } from "@/lib/products";
import { round2 } from "@/lib/money";
import type { BasketLine, Language, ManualBundle, StoreId, StoreProduct } from "@/types";

export interface RescueOffer extends StoreProduct {
  rescuePrice: number;
  discountPercent: number;
  daysRemaining: number;
  expiresOn: string;
}

/**
 * Calculates a rescue discount for a product that has no rescue data yet,
 * based on the centralized markdown policy (perishableClass + shelf-life days).
 * Products that already carry a `rescue` block from productos.json take priority
 * over this simulation (see calculateRescueDiscount usage in getRescueOffers).
 */
export function calculateRescueDiscount(product: StoreProduct): number | null {
  if (product.rescue) {
    return product.rescue.eligible ? product.rescue.discountPercent ?? null : null;
  }
  if (!product.attributes.perishable || !product.attributes.perishableClass) return null;

  const policy = getRescuePolicy();
  const rule = policy.rules.find((r) => r.perishableClass === product.attributes.perishableClass);
  if (!rule) return null;

  // No explicit daysRemaining available outside the dataset's rescue block,
  // so default to the tightest tier (most conservative) when simulating.
  const tier = rule.discountTiers[0];
  return tier ? tier.discountPercent : null;
}

export function getRescuePrice(product: StoreProduct): number | null {
  if (product.rescue?.eligible && product.rescue.rescuePrice != null) {
    return product.rescue.rescuePrice;
  }
  const discount = calculateRescueDiscount(product);
  if (discount == null) return null;
  return round2(product.price * (1 - discount / 100));
}

export function getRescueOffers(storeId: StoreId): RescueOffer[] {
  const products = getStoreProducts(storeId);
  const offers: RescueOffer[] = [];

  for (const product of products) {
    if (!product.rescue || !product.rescue.eligible) continue;
    const rescuePrice = getRescuePrice(product);
    if (rescuePrice == null) continue;
    offers.push({
      ...product,
      rescuePrice,
      discountPercent: product.rescue.discountPercent ?? 0,
      daysRemaining: product.rescue.daysRemaining,
      expiresOn: product.rescue.expiresOn,
    });
  }

  return offers.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getManualBundles(storeId: StoreId): ManualBundle[] {
  return getManualBundlesFromData(storeId);
}

export function addRescueItemToBasket(product: RescueOffer, quantity = 1, language: Language = "es"): BasketLine {
  return {
    id: `${product.sku}::rescue`,
    sku: product.sku,
    quantity: Math.max(1, Math.min(quantity, product.stock)),
    unitPrice: product.rescuePrice,
    regularUnitPrice: product.price,
    isRescue: true,
    isBundle: false,
    reason: language === "en" ? "Rescue Offer accepted by the customer." : "Oferta de Rescate aceptada por el cliente.",
  };
}

/** Parses "2x1" / "3x1" style bundle types into { buy, pay } unit counts. */
function parseBundleRatio(bundleType: string): { buy: number; pay: number } | null {
  const match = bundleType.match(/^(\d+)x(\d+)$/);
  if (!match) return null;
  return { buy: Number(match[1]), pay: Number(match[2]) };
}

/**
 * Builds the `buy` units delivered by an NxM bundle by cycling through the
 * bundle's listed SKUs (a single-sku "2x1" means two units of that same product).
 */
function buildBundleUnits(productSkus: string[], unitPrices: Record<string, number>, buyCount: number): { sku: string; price: number }[] {
  const skusWithPrice = productSkus.filter((sku) => unitPrices[sku] != null);
  if (skusWithPrice.length === 0) return [];
  const units: { sku: string; price: number }[] = [];
  for (let i = 0; i < buyCount; i++) {
    const sku = skusWithPrice[i % skusWithPrice.length];
    units.push({ sku, price: unitPrices[sku] });
  }
  return units;
}

export function calculateBundlePrice(
  bundle: ManualBundle,
  storeId: StoreId
): { total: number; savings: number; unitPrices: Record<string, number>; unitCounts: Record<string, number> } {
  const unitPrices: Record<string, number> = {};

  for (const sku of bundle.productSkus) {
    const product = getStoreProduct(storeId, sku);
    if (!product) continue;
    unitPrices[sku] = product.price;
  }

  const ratio = parseBundleRatio(bundle.bundleType);
  const unitCounts: Record<string, number> = {};

  if (ratio) {
    const units = buildBundleUnits(bundle.productSkus, unitPrices, ratio.buy);
    for (const unit of units) {
      unitCounts[unit.sku] = (unitCounts[unit.sku] ?? 0) + 1;
    }
    const regularTotal = round2(units.reduce((sum, u) => sum + u.price, 0));
    // The cheapest units are free; the customer pays for the `pay` most expensive ones.
    const sortedDesc = [...units].sort((a, b) => b.price - a.price);
    const total = round2(sortedDesc.slice(0, ratio.pay).reduce((sum, u) => sum + u.price, 0));
    return { total, savings: round2(regularTotal - total), unitPrices, unitCounts };
  }

  for (const sku of bundle.productSkus) {
    if (unitPrices[sku] != null) unitCounts[sku] = 1;
  }
  const regularTotal = round2(Object.values(unitPrices).reduce((sum, p) => sum + p, 0));
  let total = regularTotal;
  if (bundle.bundleType === "fixed_discount" && bundle.discountPercent) {
    total = round2(regularTotal * (1 - bundle.discountPercent / 100));
  }

  return { total, savings: round2(regularTotal - total), unitPrices, unitCounts };
}

export function addBundleToBasket(bundle: ManualBundle, storeId: StoreId, language: Language = "es"): BasketLine[] {
  const { total, unitPrices, unitCounts } = calculateBundlePrice(bundle, storeId);
  const regularTotal = Object.entries(unitCounts).reduce((sum, [sku, count]) => sum + (unitPrices[sku] ?? 0) * count, 0);
  const scaleFactor = regularTotal > 0 ? total / regularTotal : 1;

  return Object.entries(unitCounts).map(([sku, quantity]) => ({
    id: `${sku}::bundle::${bundle.bundleId}`,
    sku,
    quantity,
    unitPrice: round2((unitPrices[sku] ?? 0) * scaleFactor),
    regularUnitPrice: unitPrices[sku] ?? 0,
    isRescue: false,
    isBundle: true,
    bundleId: bundle.bundleId,
    reason: language === "en" ? `Included in combo: ${bundle.name}` : `Incluido en bundle: ${bundle.name}`,
  }));
}
