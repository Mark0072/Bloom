import { describe, expect, it } from "vitest";
import { addBundleToBasket, calculateBundlePrice, getManualBundles } from "@/lib/rescue";
import type { StoreId } from "@/types";

const STORE: StoreId = "APZ-001";

describe("bundle pricing", () => {
  it("never prices a single-SKU 2x1 bundle at zero", () => {
    const bundle = getManualBundles(STORE).find((b) => b.bundleType === "2x1");
    expect(bundle).toBeDefined();
    const { total, savings } = calculateBundlePrice(bundle!, STORE);
    expect(total).toBeGreaterThan(0);
    expect(savings).toBeGreaterThan(0);
  });

  it("produces basket lines whose total matches the calculated bundle price", () => {
    const bundle = getManualBundles(STORE).find((b) => b.bundleType === "2x1");
    expect(bundle).toBeDefined();
    const { total } = calculateBundlePrice(bundle!, STORE);
    const lines = addBundleToBasket(bundle!, STORE);
    const linesTotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    expect(linesTotal).toBeCloseTo(total, 1);
  });

  it("tags every bundle line with the same bundleId for atomic removal", () => {
    const bundle = getManualBundles(STORE)[0];
    const lines = addBundleToBasket(bundle, STORE);
    for (const line of lines) {
      expect(line.bundleId).toBe(bundle.bundleId);
      expect(line.isBundle).toBe(true);
    }
  });
});
