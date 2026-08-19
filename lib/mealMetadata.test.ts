import { describe, expect, it } from "vitest";
import { computePortionInfo } from "@/lib/mealMetadata";
import { getStoreProduct } from "@/lib/products";
import type { StoreId } from "@/types";

const STORE: StoreId = "APZ-001";

describe("computePortionInfo", () => {
  it("scales quantity up for more people when a unit doesn't cover everyone", () => {
    const eggs = getStoreProduct(STORE, "HUEVOS-12")!;
    const forOne = computePortionInfo(eggs, "comida_semanal", 1);
    const forFour = computePortionInfo(eggs, "comida_semanal", 4);
    expect(forFour.idealQuantity).toBeGreaterThan(forOne.idealQuantity);
  });

  it("can settle on a single unit for one person when that unit is enough", () => {
    const rice = getStoreProduct(STORE, "PIMCO-ARROZ-10LB")!;
    const info = computePortionInfo(rice, "compra_basica", 1);
    expect(info.idealQuantity).toBe(1);
  });

  it("never asks for more servings than the basket type/people combination needs", () => {
    const chicken = getStoreProduct(STORE, "POLLO-ENTERO-LB")!;
    const info = computePortionInfo(chicken, "desayuno", 4);
    // desayuno = 1 occasion, so needed servings should be exactly people * 1
    expect(info.neededServings).toBe(4);
  });

  it("keeps condiments flat at one unit regardless of people", () => {
    const salt = getStoreProduct(STORE, "SAL-MOLIDA-1LB")!;
    const forOne = computePortionInfo(salt, "comida_semanal", 1);
    const forEight = computePortionInfo(salt, "comida_semanal", 8);
    expect(forOne.idealQuantity).toBe(1);
    expect(forEight.idealQuantity).toBe(1);
  });

  it("gives different-yield ingredients different quantities for the same people count", () => {
    const eggs = getStoreProduct(STORE, "HUEVOS-12")!; // yields several servings/unit
    const chicken = getStoreProduct(STORE, "POLLO-ENTERO-LB")!; // yields fewer servings/unit
    const eggInfo = computePortionInfo(eggs, "comida_semanal", 4);
    const chickenInfo = computePortionInfo(chicken, "comida_semanal", 4);
    expect(eggInfo.servingsPerUnit).not.toBe(chickenInfo.servingsPerUnit);
  });
});
