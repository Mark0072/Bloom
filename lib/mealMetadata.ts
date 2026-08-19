import type { StoreProduct } from "@/types";

export type MealRole = "proteina" | "carbohidrato" | "vegetal" | "bebida" | "condimento" | "no_alimentario";

/**
 * How many single-person "occasions" (breakfasts, lunches, dinners) a basket type is meant to cover.
 * Used together with per-product servings-per-unit to size quantities — not a full meal planner,
 * just enough to make quantities respond sensibly to people count and product size.
 */
const BASKET_TYPE_OCCASIONS: Record<string, number> = {
  desayuno: 1,
  lonchera_escolar: 1,
  compra_basica: 3,
  comida_semanal: 5,
  adulto_mayor: 3,
  emergencia: 3,
  higiene: 0,
};

const NON_FOOD_CATEGORIES = new Set(["Limpieza y desechables", "Higiene personal"]);

/** Classifies a product's role in a meal, purely from its category/subcategory/tags. */
export function getMealRole(product: StoreProduct): MealRole {
  if (NON_FOOD_CATEGORIES.has(product.category)) return "no_alimentario";

  const sub = product.subcategory.toLowerCase();
  const cat = product.category.toLowerCase();
  const tags = product.attributes.tags.map((t) => t.toLowerCase());

  if (
    cat === "carnes y pescados" ||
    cat === "comida preparada" ||
    sub.includes("quesos") ||
    sub.includes("huevos") ||
    sub.includes("embutidos") ||
    tags.includes("proteina")
  ) {
    return "proteina";
  }

  if (
    sub.includes("arroz") ||
    sub.includes("pastas") ||
    sub.includes("pan fresco") ||
    sub.includes("cereales") ||
    sub.includes("víveres") ||
    sub.includes("avenas")
  ) {
    return "carbohidrato";
  }

  if (cat === "frutas y vegetales") return "vegetal";

  if (
    cat === "bebidas" ||
    sub.includes("leche líquida") ||
    sub.includes("leche en polvo") ||
    sub.includes("leches enlatadas") ||
    sub.includes("jugos") ||
    sub.includes("agua")
  ) {
    return "bebida";
  }

  if (
    sub.includes("sazones") ||
    sub.includes("salsas") ||
    sub.includes("condimentos") ||
    sub.includes("aceites") ||
    sub.includes("azúcar") ||
    sub.includes("café") ||
    sub.includes("conservas")
  ) {
    return "condimento";
  }

  return "condimento";
}

const ESSENTIAL_ROLES: ReadonlySet<MealRole> = new Set(["proteina", "carbohidrato", "vegetal"]);

export function isEssentialRole(role: MealRole): boolean {
  return ESSENTIAL_ROLES.has(role);
}

/** Rough single-serving yield of a purchased unit — enough to make quantities scale sensibly. */
export function getServingsPerUnit(product: StoreProduct): number {
  const name = product.name.toLowerCase();
  const sub = product.subcategory.toLowerCase();

  if (sub.includes("arroz")) return name.includes("10 lb") ? 20 : 10;
  if (sub.includes("pastas")) return 4;
  if (sub.includes("pan fresco")) return 6;
  if (sub.includes("cereales")) return 8;
  if (sub.includes("avenas")) return 6;
  if (sub.includes("víveres")) return 2;

  if (sub.includes("huevos")) return 6; // 12-unit carton, ~2 eggs per serving
  if (sub.includes("quesos")) return 4;
  if (sub.includes("embutidos")) return 4;
  if (sub.includes("leche líquida")) return 4;
  if (sub.includes("leche en polvo")) return 15;
  if (sub.includes("leches enlatadas")) return 3;
  if (sub.includes("jugos")) return 4;
  if (sub.includes("agua")) return 8;

  if (product.category === "Carnes y pescados") return name.includes("libra") || name.includes("lb") ? 3 : 4;
  if (product.category === "Comida preparada") return 1;

  if (product.category === "Frutas y vegetales") {
    return name.includes("libra") || name.includes(" lb") ? 2 : 1;
  }

  return 1;
}

export interface PortionInfo {
  role: MealRole;
  neededServings: number;
  servingsPerUnit: number;
  idealQuantity: number;
}

/**
 * Computes how many units of a product are needed. Food items use servings/occasions math
 * (ceil(neededServings / servingsPerUnit)); condiments stay flat at 1 regardless of people;
 * non-food items follow a household-consumption rule instead of a recipe rule.
 */
export function computePortionInfo(product: StoreProduct, basketType: string, people: number): PortionInfo {
  const role = getMealRole(product);
  const occasions = BASKET_TYPE_OCCASIONS[basketType] ?? 2;

  if (role === "no_alimentario") {
    const idealQuantity = Math.min(3, Math.max(1, Math.ceil(people / 4)));
    return { role, neededServings: idealQuantity, servingsPerUnit: 1, idealQuantity };
  }

  if (role === "condimento") {
    return { role, neededServings: 1, servingsPerUnit: 1, idealQuantity: 1 };
  }

  const servingsPerUnit = getServingsPerUnit(product);
  const neededServings = Math.max(1, people * occasions);
  const idealQuantity = Math.max(1, Math.ceil(neededServings / servingsPerUnit));

  return { role, neededServings, servingsPerUnit, idealQuantity };
}
