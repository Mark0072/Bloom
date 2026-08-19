"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AssistanceRequest,
  BasketFormInput,
  BasketLine,
  Language,
  ShoppingRoute,
  StoreId,
  Ticket,
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

interface BloomState {
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  storeId: StoreId | null;
  language: Language;
  accessibleMode: boolean;

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
  setAccessibleMode: (value: boolean) => void;

  setBasketForm: (form: Partial<BasketFormInput>) => void;
  setLines: (lines: BasketLine[], explanations: string[], savings: number) => void;
  addLine: (line: BasketLine) => void;
  removeLine: (sku: string, bundleId?: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  logRescueAddition: (sku: string) => void;
  logBundleAddition: (bundleId: string) => void;

  setRoute: (route: ShoppingRoute) => void;
  setAssistance: (request: AssistanceRequest | null) => void;
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

export const useBloomStore = create<BloomState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      storeId: null,
      language: "es",
      accessibleMode: false,

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
      setAccessibleMode: (value) => set({ accessibleMode: value }),

      setBasketForm: (form) => set({ basketForm: { ...get().basketForm, ...form } }),

      setLines: (lines, explanations, savings) => {
        const state = get();
        set({
          lines,
          basketExplanations: explanations,
          basketSavings: savings,
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

      addLine: (line) => {
        const lines = [...get().lines];
        const existingIdx = lines.findIndex(
          (l) => l.sku === line.sku && l.isRescue === line.isRescue && l.bundleId === line.bundleId
        );
        if (existingIdx >= 0) {
          lines[existingIdx] = {
            ...lines[existingIdx],
            quantity: lines[existingIdx].quantity + line.quantity,
          };
        } else {
          lines.push(line);
        }
        set({ lines });
      },

      removeLine: (sku, bundleId) => {
        set({
          lines: get().lines.filter((l) => !(l.sku === sku && l.bundleId === bundleId)),
        });
      },

      updateQuantity: (sku, quantity) => {
        set({
          lines: get().lines.map((l) => (l.sku === sku ? { ...l, quantity: Math.max(1, quantity) } : l)),
        });
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
      setAssistance: (assistance) => set({ assistance }),
      setTicket: (ticket) => set({ ticket }),

      resetFlow: () =>
        set({
          storeId: null,
          language: "es",
          accessibleMode: false,
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
      name: "bloom-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : noopStorage)),
      partialize: (state) => ({
        storeId: state.storeId,
        language: state.language,
        accessibleMode: state.accessibleMode,
        basketForm: state.basketForm,
        lines: state.lines,
        basketExplanations: state.basketExplanations,
        basketSavings: state.basketSavings,
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
