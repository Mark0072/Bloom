import { getStoreProducts } from "@/lib/products";
import { round2 } from "@/lib/money";
import type { BasketFormInput, BasketLine, GeneratedBasket, StoreId, StoreProduct } from "@/types";

const MAX_LINES = 22;

interface ScoredProduct {
  product: StoreProduct;
  score: number;
  isLowPrice: boolean;
}

function computeCategoryLowPriceThresholds(products: StoreProduct[]): Map<string, number> {
  const byCategory = new Map<string, number[]>();
  for (const p of products) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p.price);
    byCategory.set(p.category, list);
  }
  const thresholds = new Map<string, number>();
  for (const [category, prices] of byCategory) {
    const sorted = [...prices].sort((a, b) => a - b);
    const idx = Math.max(0, Math.floor(sorted.length * 0.4) - 1);
    thresholds.set(category, sorted[idx] ?? sorted[0]);
  }
  return thresholds;
}

function scoreProducts(products: StoreProduct[], input: BasketFormInput): ScoredProduct[] {
  const lowPriceThresholds = computeCategoryLowPriceThresholds(products);
  const wantsSavings = input.preferences.includes("ahorro_maximo");
  const wantsRamos = input.preferences.includes("marcas_grupo_ramos");
  const wantsKnownBrands = input.preferences.includes("marcas_conocidas");
  const wantsKids = input.restrictions.includes("productos_ninos");
  const wantsSeniors = input.restrictions.includes("productos_adulto_mayor");

  return products.map((product) => {
    let score = 0;
    const isLowPrice = product.price <= (lowPriceThresholds.get(product.category) ?? Infinity);

    if (product.attributes.basketTypes.includes(input.basketType)) score += 30;
    if (product.promo) score += 20;
    if (product.grupoRamosBrand && wantsRamos) score += 20;
    if (isLowPrice) score += 15;
    if (wantsSavings && product.promo) score += 10;
    if (wantsSavings && isLowPrice) score += 10;
    if (wantsKnownBrands && !product.grupoRamosBrand) score += 10;
    if (wantsKids && product.attributes.tags.includes("niños")) score += 15;
    if (wantsSeniors && product.attributes.basketTypes.includes("adulto_mayor")) score += 15;

    return { product, score, isLowPrice };
  });
}

function violatesAllergy(product: StoreProduct, allergies: string[]): boolean {
  if (allergies.length === 0) return false;
  return product.attributes.allergens.some((a) => allergies.includes(a));
}

function violatesRestriction(product: StoreProduct, restrictions: string[]): boolean {
  const hardRestrictions: string[] = restrictions.filter(
    (r) => r === "sin_azucar" || r === "bajo_sodio" || r === "sin_cerdo"
  );
  if (hardRestrictions.length === 0) return false;
  return product.attributes.restrictions.some((r) => hardRestrictions.includes(r));
}

function quantityFor(product: StoreProduct, input: BasketFormInput): number {
  const wantsMore = input.preferences.includes("mas_cantidad");
  if (!wantsMore) return 1;
  const suggested = Math.max(1, Math.round(input.people / 2));
  return Math.min(suggested, product.stock, 5);
}

export function generateBasket(input: BasketFormInput, storeId: StoreId): GeneratedBasket {
  const allProducts = getStoreProducts(storeId).filter((p) => p.available && p.stock > 0);

  const eligible = allProducts.filter(
    (p) => !violatesAllergy(p, input.allergies) && !violatesRestriction(p, input.restrictions)
  );

  const scored = scoreProducts(eligible, input)
    .filter((s) => s.score > 0 || eligible.length <= MAX_LINES)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  const balanced = input.preferences.includes("compra_balanceada");
  const ordered = balanced ? balanceByCategory(scored) : scored;

  const lines: BasketLine[] = [];
  const usedCategories = new Set<string>();
  let totalSpent = 0;
  let promoSavings = 0;

  for (const { product } of ordered) {
    if (lines.length >= MAX_LINES) break;
    const quantity = quantityFor(product, input);
    const unitPrice = product.promo?.promoPrice ?? product.price;
    const lineTotal = round2(unitPrice * quantity);
    if (totalSpent + lineTotal > input.budget) continue;

    lines.push({
      sku: product.sku,
      quantity,
      unitPrice,
      isRescue: false,
      isBundle: false,
      reason: buildLineReason(product, input),
    });
    totalSpent = round2(totalSpent + lineTotal);
    usedCategories.add(product.category);
    if (product.promo?.promoPrice != null) {
      promoSavings = round2(promoSavings + (product.price - unitPrice) * quantity);
    }
  }

  const explanations = buildExplanations(input, lines.length, usedCategories.size, totalSpent);

  return {
    lines,
    totalSpent,
    budgetRemaining: round2(input.budget - totalSpent),
    savings: promoSavings,
    explanations,
  };
}

/** Round-robins candidates across categories so a balanced basket doesn't pile into one aisle. */
function balanceByCategory(scored: ScoredProduct[]): ScoredProduct[] {
  const byCategory = new Map<string, ScoredProduct[]>();
  for (const item of scored) {
    const list = byCategory.get(item.product.category) ?? [];
    list.push(item);
    byCategory.set(item.product.category, list);
  }
  const queues = Array.from(byCategory.values());
  const result: ScoredProduct[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (next) {
        result.push(next);
        added = true;
      }
    }
  }
  return result;
}

function buildLineReason(product: StoreProduct, input: BasketFormInput): string {
  const reasons: string[] = [];
  if (product.attributes.basketTypes.includes(input.basketType)) reasons.push("coincide con el tipo de canasta");
  if (product.grupoRamosBrand && input.preferences.includes("marcas_grupo_ramos")) reasons.push("marca Wala/Zerca priorizada");
  if (product.promo) reasons.push("tiene promoción");
  return reasons.length > 0 ? reasons.join(", ") : "buen precio para tu presupuesto";
}

function buildExplanations(input: BasketFormInput, itemCount: number, categoryCount: number, totalSpent: number): string[] {
  const explanations: string[] = [];

  if (itemCount === 0) {
    explanations.push("El presupuesto ingresado es muy bajo para armar una canasta con los productos disponibles. Intenta subir el presupuesto.");
    return explanations;
  }

  explanations.push(`Se seleccionaron ${itemCount} productos priorizando la canasta de tipo "${input.basketType.replace(/_/g, " ")}".`);

  if (input.preferences.includes("marcas_grupo_ramos")) {
    explanations.push("Se priorizaron marcas Wala/Zerca del grupo por tu preferencia de marcas propias.");
  }
  if (input.preferences.includes("ahorro_maximo")) {
    explanations.push("Se priorizaron los precios más bajos disponibles para maximizar tu ahorro.");
  }
  if (input.preferences.includes("compra_balanceada")) {
    explanations.push(`Se distribuyó la canasta entre ${categoryCount} categorías para una compra balanceada.`);
  }
  if (input.allergies.length > 0) {
    explanations.push("Se excluyeron productos que contienen los alérgenos indicados.");
  }
  explanations.push(`Total estimado: quedó dentro de tu presupuesto con ${round2(totalSpent)} gastado.`);

  return explanations;
}
