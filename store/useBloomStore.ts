"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getStoreProduct } from "@/lib/products";
import { round2 } from "@/lib/money";
import { createAssistanceRequest, updateAssistanceStatus } from "@/lib/assistance";
import { generateBasket } from "@/lib/basket";
import type {
  AccessibilitySettings,
  AssistanceRequest,
  AssistanceType,
  BasketFormInput,
  BasketLine,
  Language,
  ProductFilters,
  ShoppingRoute,
  StoreId,
  Ticket,
  Toast,
  ToastTone,
} from "@/types";

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

interface GeneratedBasketLog {
  storeId: StoreId;
  budget: number;
  savings: number;
  itemSkus: string[];
  createdAt: string;
}

interface RescueAdditionLog {
  sku: string;
  storeId: StoreId;
  createdAt: string;
}

interface BundleAdditionLog {
  bundleId: string;
  storeId: StoreId;
  createdAt: string;
}

export interface CartActionResult {
  ok: boolean;
  reason?: "budget" | "stock" | "duplicate" | "not_found";
  cappedQuantity?: number;
}

function computeCartTotal(lines: BasketLine[]): number {
  return round2(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));
}

function lineIdFor(sku: string, kind: "normal" | "rescue", bundleId?: string): string {
  if (bundleId) return `${sku}::bundle::${bundleId}`;
  return `${sku}::${kind}`;
}

interface BloomState {
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  storeId: StoreId | null;
  language: Language;
  accessibility: AccessibilitySettings;

  productFilters: ProductFilters;
  setProductFilters: (filters: Partial<ProductFilters>) => void;

  toasts: Toast[];
  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;

  assistanceModalOpen: boolean;
  openAssistanceModal: () => void;
  closeAssistanceModal: () => void;

  hasManualBasketEdits: boolean;

  basketForm: BasketFormInput;
  lines: BasketLine[];
  basketExplanations: string[];
  basketSavings: number;

  route: ShoppingRoute | null;
  assistance: AssistanceRequest | null;
  ticket: Ticket | null;

  generatedBaskets: GeneratedBasketLog[];
  rescueAdditions: RescueAdditionLog[];
  bundleAdditions: BundleAdditionLog[];

  setStore: (storeId: StoreId) => void;
  setLanguage: (language: Language) => void;
  setColorProfile: (profile: AccessibilitySettings["colorProfile"]) => void;
  setHighContrast: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
  setReadAloud: (value: boolean) => void;
  resetAccessibility: () => void;

  setBasketForm: (form: Partial<BasketFormInput>) => void;
  setLines: (lines: BasketLine[], explanations: string[], savings: number) => void;
  /** Re-runs the generator with an extra preference, keeping rescue/bundle/manually-added lines when possible. */
  regenerateBasket: (extraPreference: string) => void;

  /** Adds (or tops up) a normal catalog line. Budget is only enforced once the customer has set one (> 0). */
  addProductToCart: (sku: string, quantity: number, opts?: { allowOverBudget?: boolean }) => CartActionResult;
  addRescueLine: (line: BasketLine, opts?: { allowOverBudget?: boolean }) => CartActionResult;
  addBundleLines: (lines: BasketLine[], opts?: { allowOverBudget?: boolean }) => CartActionResult;

  incrementLine: (id: string) => CartActionResult;
  decrementLine: (id: string) => void;
  removeLineById: (id: string) => void;

  logRescueAddition: (sku: string) => void;
  logBundleAddition: (bundleId: string) => void;

  setRoute: (route: ShoppingRoute) => void;
  createAssistance: (type: AssistanceType) => AssistanceRequest;
  completeAssistance: () => void;
  setTicket: (ticket: Ticket) => void;

  resetFlow: () => void;
}

const defaultBasketForm: BasketFormInput = {
  budget: 0,
  people: 1,
  basketType: "compra_basica",
  preferences: [],
  restrictions: [],
  allergies: [],
};

const defaultAccessibility: AccessibilitySettings = {
  colorProfile: "none",
  highContrast: false,
  largeText: false,
  readAloud: true,
};

const defaultProductFilters: ProductFilters = {
  query: "",
  category: "",
  onlyAvailable: false,
  onlyPromo: false,
  onlyRescue: false,
};

export const useBloomStore = create<BloomState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      storeId: null,
      language: "es",
      accessibility: defaultAccessibility,

      productFilters: defaultProductFilters,
      setProductFilters: (filters) => set({ productFilters: { ...get().productFilters, ...filters } }),

      toasts: [],
      pushToast: (message, tone = "info") => {
        const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        set({ toasts: [...get().toasts, { id, message, tone }] });
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((tst) => tst.id !== id) }),

      assistanceModalOpen: false,
      openAssistanceModal: () => set({ assistanceModalOpen: true }),
      closeAssistanceModal: () => set({ assistanceModalOpen: false }),

      hasManualBasketEdits: false,

      basketForm: defaultBasketForm,
      lines: [],
      basketExplanations: [],
      basketSavings: 0,

      route: null,
      assistance: null,
      ticket: null,

      generatedBaskets: [],
      rescueAdditions: [],
      bundleAdditions: [],

      setStore: (storeId) => set({ storeId }),
      setLanguage: (language) => set({ language }),

      setColorProfile: (colorProfile) => set({ accessibility: { ...get().accessibility, colorProfile } }),
      setHighContrast: (highContrast) => set({ accessibility: { ...get().accessibility, highContrast } }),
      setLargeText: (largeText) => set({ accessibility: { ...get().accessibility, largeText } }),
      setReadAloud: (readAloud) => set({ accessibility: { ...get().accessibility, readAloud } }),
      resetAccessibility: () => set({ accessibility: defaultAccessibility }),

      setBasketForm: (form) => set({ basketForm: { ...get().basketForm, ...form } }),

      setLines: (lines, explanations, savings) => {
        const state = get();
        set({
          lines,
          basketExplanations: explanations,
          basketSavings: savings,
          hasManualBasketEdits: false,
          generatedBaskets: [
            ...state.generatedBaskets,
            {
              storeId: state.storeId as StoreId,
              budget: state.basketForm.budget,
              savings,
              itemSkus: lines.map((l) => l.sku),
              createdAt: new Date().toISOString(),
            },
          ],
        });
      },

      regenerateBasket: (extraPreference) => {
        const state = get();
        if (!state.storeId) return;

        const preserved = state.lines.filter((l) => l.isRescue || l.isBundle || l.manuallyAdded);
        const form: BasketFormInput = {
          ...state.basketForm,
          preferences: state.basketForm.preferences.includes(extraPreference)
            ? state.basketForm.preferences
            : [...state.basketForm.preferences, extraPreference],
        };

        const result = generateBasket(form, state.storeId, state.language);
        const resultIds = new Set(result.lines.map((l) => l.id));
        const mergedLines = [...result.lines, ...preserved.filter((l) => !resultIds.has(l.id))];

        set({
          basketForm: form,
          lines: mergedLines,
          basketExplanations: result.explanations,
          basketSavings: result.savings,
          hasManualBasketEdits: false,
          generatedBaskets: [
            ...state.generatedBaskets,
            {
              storeId: state.storeId,
              budget: form.budget,
              savings: result.savings,
              itemSkus: mergedLines.map((l) => l.sku),
              createdAt: new Date().toISOString(),
            },
          ],
        });
      },

      addProductToCart: (sku, quantity, opts) => {
        const state = get();
        if (!state.storeId) return { ok: false, reason: "not_found" };
        const product = getStoreProduct(state.storeId, sku);
        if (!product || !product.available || product.stock <= 0) return { ok: false, reason: "stock" };

        const id = lineIdFor(sku, "normal");
        const lines = [...state.lines];
        const existingIdx = lines.findIndex((l) => l.id === id);
        const existingQty = existingIdx >= 0 ? lines[existingIdx].quantity : 0;
        const requestedTotalQty = existingQty + quantity;

        const cappedQty = Math.min(requestedTotalQty, product.stock);
        if (cappedQty <= existingQty) return { ok: false, reason: "stock" };

        const addedQty = cappedQty - existingQty;
        const unitPrice = product.promo?.promoPrice ?? product.price;
        const addedCost = round2(unitPrice * addedQty);
        const budget = state.basketForm.budget;

        if (budget > 0 && !opts?.allowOverBudget) {
          const currentTotal = computeCartTotal(state.lines);
          if (round2(currentTotal + addedCost) > budget) {
            return { ok: false, reason: "budget" };
          }
        }

        if (existingIdx >= 0) {
          lines[existingIdx] = { ...lines[existingIdx], quantity: cappedQty };
        } else {
          lines.push({
            id,
            sku,
            quantity: cappedQty,
            unitPrice,
            regularUnitPrice: product.price,
            isRescue: false,
            isBundle: false,
            manuallyAdded: true,
          });
        }
        set({ lines, hasManualBasketEdits: true });
        return { ok: true, cappedQuantity: cappedQty < requestedTotalQty ? cappedQty : undefined };
      },

      addRescueLine: (line, opts) => {
        const state = get();
        if (!state.storeId) return { ok: false, reason: "not_found" };
        const product = getStoreProduct(state.storeId, line.sku);
        if (!product) return { ok: false, reason: "not_found" };

        const existingIdx = state.lines.findIndex((l) => l.id === line.id);
        if (existingIdx >= 0) return { ok: false, reason: "duplicate" };

        const quantity = Math.min(line.quantity, product.stock);
        if (quantity <= 0) return { ok: false, reason: "stock" };

        const cost = round2(line.unitPrice * quantity);
        const budget = state.basketForm.budget;
        if (budget > 0 && !opts?.allowOverBudget) {
          const currentTotal = computeCartTotal(state.lines);
          if (round2(currentTotal + cost) > budget) return { ok: false, reason: "budget" };
        }

        set({ lines: [...state.lines, { ...line, quantity }], hasManualBasketEdits: true });
        return { ok: true };
      },

      addBundleLines: (bundleLines, opts) => {
        const state = get();
        if (bundleLines.length === 0) return { ok: false, reason: "not_found" };
        const bundleId = bundleLines[0].bundleId;
        if (bundleId && state.lines.some((l) => l.bundleId === bundleId)) {
          return { ok: false, reason: "duplicate" };
        }

        const cost = round2(bundleLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));
        const budget = state.basketForm.budget;
        if (budget > 0 && !opts?.allowOverBudget) {
          const currentTotal = computeCartTotal(state.lines);
          if (round2(currentTotal + cost) > budget) return { ok: false, reason: "budget" };
        }

        set({ lines: [...state.lines, ...bundleLines], hasManualBasketEdits: true });
        return { ok: true };
      },

      incrementLine: (id) => {
        const state = get();
        const line = state.lines.find((l) => l.id === id);
        if (!line || !state.storeId) return { ok: false, reason: "not_found" };
        const product = getStoreProduct(state.storeId, line.sku);
        if (!product) return { ok: false, reason: "not_found" };

        if (line.quantity + 1 > product.stock) return { ok: false, reason: "stock" };

        const addedCost = round2(line.unitPrice);
        const budget = state.basketForm.budget;
        if (budget > 0) {
          const currentTotal = computeCartTotal(state.lines);
          if (round2(currentTotal + addedCost) > budget) return { ok: false, reason: "budget" };
        }

        set({
          lines: state.lines.map((l) => (l.id === id ? { ...l, quantity: l.quantity + 1 } : l)),
          hasManualBasketEdits: true,
        });
        return { ok: true };
      },

      decrementLine: (id) => {
        const state = get();
        const line = state.lines.find((l) => l.id === id);
        if (!line) return;
        if (line.quantity <= 1) {
          get().removeLineById(id);
          return;
        }
        set({
          lines: state.lines.map((l) => (l.id === id ? { ...l, quantity: l.quantity - 1 } : l)),
          hasManualBasketEdits: true,
        });
      },

      removeLineById: (id) => {
        const state = get();
        const line = state.lines.find((l) => l.id === id);
        if (!line) return;
        // Bundles are atomic: removing one component removes the whole combo and its discount.
        if (line.isBundle && line.bundleId) {
          set({
            lines: state.lines.filter((l) => l.bundleId !== line.bundleId),
            hasManualBasketEdits: true,
          });
          return;
        }
        set({ lines: state.lines.filter((l) => l.id !== id), hasManualBasketEdits: true });
      },

      logRescueAddition: (sku) => {
        const state = get();
        set({
          rescueAdditions: [
            ...state.rescueAdditions,
            { sku, storeId: state.storeId as StoreId, createdAt: new Date().toISOString() },
          ],
        });
      },

      logBundleAddition: (bundleId) => {
        const state = get();
        set({
          bundleAdditions: [
            ...state.bundleAdditions,
            { bundleId, storeId: state.storeId as StoreId, createdAt: new Date().toISOString() },
          ],
        });
      },

      setRoute: (route) => set({ route }),

      createAssistance: (type) => {
        const state = get();
        const request = createAssistanceRequest({ storeId: state.storeId as StoreId, type });
        set({ assistance: request });
        return request;
      },
      completeAssistance: () => {
        const current = get().assistance;
        if (!current) return;
        const updated = updateAssistanceStatus(current.id, "completada");
        set({ assistance: updated ?? { ...current, status: "completada" } });
      },

      setTicket: (ticket) => set({ ticket }),

      resetFlow: () =>
        set({
          storeId: null,
          language: "es",
          accessibility: get().accessibility, // accessibility preferences persist across customers on the same device
          productFilters: defaultProductFilters,
          hasManualBasketEdits: false,
          basketForm: defaultBasketForm,
          lines: [],
          basketExplanations: [],
          basketSavings: 0,
          route: null,
          assistance: null,
          ticket: null,
        }),
    }),
    {
      name: "bloom-store-v2",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : noopStorage)),
      partialize: (state) => ({
        storeId: state.storeId,
        language: state.language,
        accessibility: state.accessibility,
        basketForm: state.basketForm,
        lines: state.lines,
        basketExplanations: state.basketExplanations,
        basketSavings: state.basketSavings,
        hasManualBasketEdits: state.hasManualBasketEdits,
        route: state.route,
        assistance: state.assistance,
        ticket: state.ticket,
        generatedBaskets: state.generatedBaskets,
        rescueAdditions: state.rescueAdditions,
        bundleAdditions: state.bundleAdditions,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
