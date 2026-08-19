import { describe, expect, it } from "vitest";
import { generateBasket } from "@/lib/basket";
import { getStoreProduct } from "@/lib/products";
import type { BasketFormInput, StoreId } from "@/types";

const STORE: StoreId = "APZ-001";

const baseInput: BasketFormInput = {
  budget: 3000,
  people: 1,
  basketType: "comida_semanal",
  preferences: [],
  restrictions: [],
  allergies: [],
};

describe("generateBasket", () => {
  it("never exceeds the stated budget", () => {
    const result = generateBasket({ ...baseInput, budget: 500 }, STORE);
    expect(result.totalSpent).toBeLessThanOrEqual(500);
  });

  it("never asks for more units than a product has in stock", () => {
    const result = generateBasket({ ...baseInput, people: 12, budget: 20000 }, STORE);
    for (const line of result.lines) {
      const product = getStoreProduct(STORE, line.sku);
      expect(product).not.toBeNull();
      expect(line.quantity).toBeLessThanOrEqual(product!.stock);
    }
  });

  it("increases quantities for a larger household on the same basket type", () => {
    const forOne = generateBasket({ ...baseInput, basketType: "desayuno", people: 1, budget: 5000 }, STORE);
    const forFour = generateBasket({ ...baseInput, basketType: "desayuno", people: 4, budget: 5000 }, STORE);

    const eggsOne = forOne.lines.find((l) => l.sku === "HUEVOS-12");
    const eggsFour = forFour.lines.find((l) => l.sku === "HUEVOS-12");
    expect(eggsOne).toBeDefined();
    expect(eggsFour).toBeDefined();
    expect(eggsFour!.quantity).toBeGreaterThanOrEqual(eggsOne!.quantity);
  });

  it("reports an empty basket gracefully when the budget is far too low", () => {
    const result = generateBasket({ ...baseInput, budget: 1 }, STORE);
    expect(result.lines.length).toBe(0);
    expect(result.explanations.length).toBeGreaterThan(0);
  });

  it("gives every line a stable composite id and a regular price for savings math", () => {
    const result = generateBasket({ ...baseInput, budget: 2000 }, STORE);
    for (const line of result.lines) {
      expect(line.id).toBe(`${line.sku}::normal`);
      expect(line.regularUnitPrice).toBeGreaterThan(0);
    }
  });

  it("never scores on the removed marcas_grupo_ramos/mas_cantidad preferences", () => {
    // Passing the old preference ids should not throw, and should have no special effect
    // since they no longer exist in the basket options — the generator just ignores them.
    const result = generateBasket(
      { ...baseInput, budget: 2000, preferences: ["marcas_grupo_ramos", "mas_cantidad"] },
      STORE
    );
    expect(result.lines.length).toBeGreaterThan(0);
  });
});
