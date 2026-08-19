import { getStoreProducts } from "@/lib/products";
import { round2 } from "@/lib/money";
import { t, tf } from "@/lib/i18n";
import { computePortionInfo, getMealRole, isEssentialRole } from "@/lib/mealMetadata";
import type { BasketFormInput, BasketLine, GeneratedBasket, Language, StoreId, StoreProduct } from "@/types";

const MAX_LINES = 22;

/** Internal, always-on nudge toward Grupo Ramos house brands — never surfaced as a customer choice. */
const GRUPO_RAMOS_INTERNAL_BOOST = 10;

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
  const wantsKnownBrands = input.preferences.includes("marcas_conocidas");
  const wantsKids = input.restrictions.includes("productos_ninos");
  const wantsSeniors = input.restrictions.includes("productos_adulto_mayor");
  const isMealType = input.basketType !== "higiene";

  return products.map((product) => {
    let score = 0;
    const isLowPrice = product.price <= (lowPriceThresholds.get(product.category) ?? Infinity);

    if (product.attributes.basketTypes.includes(input.basketType)) score += 30;
    if (product.promo) score += 20;
    if (isLowPrice) score += 15;
    if (wantsSavings && product.promo) score += 10;
    if (wantsSavings && isLowPrice) score += 10;
    if (wantsKnownBrands && !product.grupoRamosBrand) score += 10;
    if (wantsKids && product.attributes.tags.includes("niños")) score += 15;
    if (wantsSeniors && product.attributes.basketTypes.includes("adulto_mayor")) score += 15;

    // Value-oriented internal boost: house brands offer good price-to-budget value.
    // Applied unconditionally (never gated behind a customer preference), and modestly —
    // it never outweighs basket-type relevance or the category-balance pass below.
    if (product.grupoRamosBrand) score += GRUPO_RAMOS_INTERNAL_BOOST;

    // Essential meal roles (protein/carb/vegetable) outrank condiments/extras when budget is tight,
    // so trimming for budget naturally drops complements before staples.
    if (isMealType && isEssentialRole(getMealRole(product))) score += 12;

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

export function generateBasket(input: BasketFormInput, storeId: StoreId, language: Language = "es"): GeneratedBasket {
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
  let essentialServingsNeeded = 0;
  let essentialServingsCovered = 0;

  for (const { product } of ordered) {
    if (lines.length >= MAX_LINES) break;

    const portion = computePortionInfo(product, input.basketType, input.people);
    const unitPrice = product.promo?.promoPrice ?? product.price;

    let quantity = Math.min(portion.idealQuantity, product.stock);
    let lineTotal = round2(unitPrice * quantity);

    // Budget is tight: shrink the quantity (never below 1 unit) before giving up on the item —
    // a smaller amount that still contributes is better than dropping it outright.
    while (quantity > 1 && totalSpent + lineTotal > input.budget) {
      quantity -= 1;
      lineTotal = round2(unitPrice * quantity);
    }
    if (totalSpent + lineTotal > input.budget) continue;

    lines.push({
      id: `${product.sku}::normal`,
      sku: product.sku,
      quantity,
      unitPrice,
      regularUnitPrice: product.price,
      isRescue: false,
      isBundle: false,
      reason: buildLineReason(product, input, language),
      coverageNote: buildCoverageNote(product, portion, quantity, input, language),
    });
    totalSpent = round2(totalSpent + lineTotal);
    usedCategories.add(product.category);
    if (product.promo?.promoPrice != null) {
      promoSavings = round2(promoSavings + (product.price - unitPrice) * quantity);
    }
    if (isEssentialRole(portion.role)) {
      essentialServingsNeeded += portion.neededServings;
      essentialServingsCovered += quantity * portion.servingsPerUnit;
    }
  }

  const coverageRatio = essentialServingsNeeded > 0 ? essentialServingsCovered / essentialServingsNeeded : 1;
  const explanations = buildExplanations(input, lines.length, usedCategories.size, totalSpent, coverageRatio, language);

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

function buildLineReason(product: StoreProduct, input: BasketFormInput, language: Language): string {
  const reasons: string[] = [];
  if (product.attributes.basketTypes.includes(input.basketType)) {
    reasons.push(language === "en" ? "matches your basket type" : "coincide con el tipo de canasta");
  }
  if (product.promo) {
    reasons.push(language === "en" ? "on promotion" : "tiene promoción");
  }
  if (reasons.length === 0) {
    reasons.push(language === "en" ? "good price-to-budget value" : "buena relación entre precio y presupuesto");
  }
  return reasons.join(", ");
}

function buildCoverageNote(
  product: StoreProduct,
  portion: ReturnType<typeof computePortionInfo>,
  quantity: number,
  input: BasketFormInput,
  language: Language
): string | undefined {
  if (portion.role === "condimento") return undefined;
  if (portion.role === "no_alimentario") return undefined;

  const coveredServings = quantity * portion.servingsPerUnit;
  if (coveredServings >= portion.neededServings) {
    return tf("coverageFullNote", language, { people: input.people });
  }
  return tf("coveragePartialNote", language, { covered: coveredServings, needed: portion.neededServings });
}

function buildExplanations(
  input: BasketFormInput,
  itemCount: number,
  categoryCount: number,
  totalSpent: number,
  coverageRatio: number,
  language: Language
): string[] {
  const explanations: string[] = [];

  if (itemCount === 0) {
    explanations.push(
      language === "en"
        ? "The budget entered is too low to build a basket with the available products. Try raising the budget."
        : "El presupuesto ingresado es muy bajo para armar una canasta con los productos disponibles. Intenta subir el presupuesto."
    );
    return explanations;
  }

  explanations.push(
    language === "en"
      ? `${itemCount} products were selected, prioritizing the "${input.basketType.replace(/_/g, " ")}" basket type.`
      : `Se seleccionaron ${itemCount} productos priorizando la canasta de tipo "${input.basketType.replace(/_/g, " ")}".`
  );

  if (input.preferences.includes("ahorro_maximo")) {
    explanations.push(
      language === "en"
        ? "The lowest available prices were prioritized to maximize your savings."
        : "Se priorizaron los precios más bajos disponibles para maximizar tu ahorro."
    );
  }
  if (input.preferences.includes("compra_balanceada")) {
    explanations.push(
      language === "en"
        ? `The basket was spread across ${categoryCount} categories for a balanced purchase.`
        : `Se distribuyó la canasta entre ${categoryCount} categorías para una compra balanceada.`
    );
  }
  if (input.allergies.length > 0) {
    explanations.push(
      language === "en"
        ? "Products containing the selected allergens were excluded."
        : "Se excluyeron productos que contienen los alérgenos indicados."
    );
  }

  if (coverageRatio < 0.999) {
    const percent = Math.round(coverageRatio * 100);
    explanations.push(
      language === "en"
        ? `Your budget covers about ${percent}% of the portions a full meal for ${input.people} people would need.`
        : `El presupuesto permite cubrir aproximadamente ${percent}% de las porciones que necesitaría una comida completa para ${input.people} personas.`
    );
  }

  explanations.push(
    language === "en" ? `Estimated total: ${round2(totalSpent)} spent, within your budget.` : `Total estimado: quedó dentro de tu presupuesto con ${round2(totalSpent)} gastado.`
  );

  return explanations;
}
