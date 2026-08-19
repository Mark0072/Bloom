import type { Language } from "@/types";

/**
 * Category names come from the (Spanish) product dataset. Product/brand names stay as listed by
 * the supplier regardless of UI language — same convention real retail sites use — but the
 * category chrome (chips, section headers) is translated so English mode doesn't mix languages.
 */
const CATEGORY_EN: Record<string, string> = {
  Bebidas: "Beverages",
  "Carnes y pescados": "Meat & fish",
  "Comida preparada": "Prepared food",
  Despensa: "Pantry",
  "Frutas y vegetales": "Fruits & vegetables",
  "Higiene personal": "Personal care",
  "Limpieza y desechables": "Cleaning & disposables",
  "Lácteos y huevos": "Dairy & eggs",
  Panadería: "Bakery",
};

export function translateCategory(category: string, language: Language): string {
  if (language === "es") return category;
  return CATEGORY_EN[category] ?? category;
}

export function translateAisle(aisle: string, language: Language): string {
  if (language === "es") return aisle;
  return aisle.replace(/^Pasillo/i, "Aisle");
}
