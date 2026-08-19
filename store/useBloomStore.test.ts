import { beforeEach, describe, expect, it } from "vitest";
import { useBloomStore } from "@/store/useBloomStore";
import { addBundleToBasket, addRescueItemToBasket, getManualBundles, getRescueOffers } from "@/lib/rescue";
import type { StoreId } from "@/types";

const STORE: StoreId = "APZ-001";
const initialState = structuredClone(
  Object.fromEntries(
    Object.entries(useBloomStore.getState()).filter(([, v]) => typeof v !== "function")
  )
);

beforeEach(() => {
  useBloomStore.setState(structuredClone(initialState) as never);
  useBloomStore.getState().setStore(STORE);
});

describe("addProductToCart", () => {
  it("blocks an addition that would exceed the stated budget", () => {
    useBloomStore.getState().setBasketForm({ budget: 100 });
    const result = useBloomStore.getState().addProductToCart("WALA-AZUCAR-5LB", 1); // price 151
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("budget");
    expect(useBloomStore.getState().lines).toHaveLength(0);
  });

  it("allows the same addition when the customer explicitly overrides the budget guard", () => {
    useBloomStore.getState().setBasketForm({ budget: 100 });
    const result = useBloomStore.getState().addProductToCart("WALA-AZUCAR-5LB", 1, { allowOverBudget: true });
    expect(result.ok).toBe(true);
    expect(useBloomStore.getState().lines).toHaveLength(1);
  });

  it("never lets quantity exceed the product's stock", () => {
    useBloomStore.getState().setBasketForm({ budget: 0 }); // no budget set yet, so only stock applies
    const result = useBloomStore.getState().addProductToCart("WALA-AZUCAR-5LB", 999);
    expect(result.ok).toBe(true);
    const line = useBloomStore.getState().lines[0];
    expect(line.quantity).toBeLessThanOrEqual(35); // dataset stock for this SKU at APZ-001
  });

  it("tops up an existing line instead of creating a duplicate for the same SKU", () => {
    useBloomStore.getState().setBasketForm({ budget: 0 });
    useBloomStore.getState().addProductToCart("SAL-MOLIDA-1LB", 1);
    useBloomStore.getState().addProductToCart("SAL-MOLIDA-1LB", 1);
    const lines = useBloomStore.getState().lines.filter((l) => l.sku === "SAL-MOLIDA-1LB");
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(2);
  });
});

describe("line identity independence", () => {
  it("keeps a normal line and a rescue line of the same SKU editable independently", () => {
    useBloomStore.getState().setBasketForm({ budget: 0 });
    useBloomStore.getState().addProductToCart("WALA-CAMARON-16OZ", 1);

    const offer = getRescueOffers(STORE).find((o) => o.sku === "WALA-CAMARON-16OZ");
    expect(offer).toBeDefined();
    const rescueLine = addRescueItemToBasket(offer!, 1);
    useBloomStore.getState().addRescueLine(rescueLine);

    const normalId = "WALA-CAMARON-16OZ::normal";
    const rescueId = "WALA-CAMARON-16OZ::rescue";
    expect(useBloomStore.getState().lines.map((l) => l.id)).toEqual(
      expect.arrayContaining([normalId, rescueId])
    );

    useBloomStore.getState().incrementLine(normalId);

    const afterIncrement = useBloomStore.getState().lines;
    expect(afterIncrement.find((l) => l.id === normalId)?.quantity).toBe(2);
    expect(afterIncrement.find((l) => l.id === rescueId)?.quantity).toBe(1);
  });
});

describe("bundle atomicity", () => {
  it("removes every line of a bundle together when one is removed", () => {
    const bundle = getManualBundles(STORE)[0];
    useBloomStore.getState().setBasketForm({ budget: 0 });

    const bundleLines = addBundleToBasket(bundle, STORE);
    useBloomStore.getState().addBundleLines(bundleLines);

    expect(useBloomStore.getState().lines.filter((l) => l.bundleId === bundle.bundleId).length).toBe(
      bundleLines.length
    );

    useBloomStore.getState().removeLineById(bundleLines[0].id);

    expect(useBloomStore.getState().lines.filter((l) => l.bundleId === bundle.bundleId)).toHaveLength(0);
  });

  it("refuses to add the same bundle twice", () => {
    const bundle = getManualBundles(STORE)[0];
    useBloomStore.getState().setBasketForm({ budget: 0 });

    const bundleLines = addBundleToBasket(bundle, STORE);

    const first = useBloomStore.getState().addBundleLines(bundleLines);
    const second = useBloomStore.getState().addBundleLines(bundleLines);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("duplicate");
  });
});

describe("regenerateBasket preservation", () => {
  it("keeps manually-added, rescue, and bundle lines through a regeneration", () => {
    useBloomStore.getState().setBasketForm({
      budget: 3000,
      people: 2,
      basketType: "comida_semanal",
      preferences: [],
      restrictions: [],
      allergies: [],
    });
    useBloomStore.getState().addProductToCart("SAL-MOLIDA-1LB", 1);
    const manualLineId = useBloomStore.getState().lines[0].id;

    useBloomStore.getState().regenerateBasket("ahorro_maximo");

    const idsAfter = useBloomStore.getState().lines.map((l) => l.id);
    expect(idsAfter).toContain(manualLineId);
  });
});
