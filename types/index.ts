export type Language = "es" | "en";

export type StoreId = "APZ-001" | "SIR-001";

export interface StoreZone {
  zoneId: string;
  label: string;
  order: number;
  x: number;
  y: number;
}

export interface StoreLayout {
  layoutId: string;
  entryZoneId: string;
  checkoutZoneId: string;
  zones: StoreZone[];
}

export interface StoreTerminal {
  primaryUse: string;
  screenOrientation: string;
  flow: string[];
  supportsPWA: boolean;
}

export interface Store {
  storeId: StoreId;
  internalProductName: string;
  publicDisplayName: string;
  format: string;
  branchName: string;
  currency: string;
  inventoryMode: string;
  priceTierNote: string;
  terminal: StoreTerminal;
  layout: StoreLayout;
}

export interface BasketOption {
  id: string;
  label: string;
}

export interface BasketOptions {
  basketTypes: BasketOption[];
  preferences: BasketOption[];
  restrictions: BasketOption[];
  allergies: BasketOption[];
}

export interface RescueDiscountTier {
  daysRemainingMax: number;
  discountPercent: number;
}

export interface RescueRule {
  perishableClass: string;
  displayName: string;
  maxShelfLifeDays: number;
  discountTiers: RescueDiscountTier[];
}

export interface RescuePolicy {
  policyId: string;
  description: string;
  rules: RescueRule[];
  safetyGuardrails: string[];
}

export interface ManualBundle {
  bundleId: string;
  storeId: StoreId;
  name: string;
  description: string;
  productSkus: string[];
  bundleType: string;
  discountPercent?: number;
  visibleToCustomer: boolean;
  requiresExplicitOptIn: boolean;
  source: string;
}

export interface ProductRescueInfo {
  eligible: boolean;
  expiresOn: string;
  daysRemaining: number;
  discountPercent?: number;
  rescuePrice?: number;
  label?: string;
  customerMessage?: string;
  requiresExplicitOptIn?: boolean;
}

export interface ProductPromo {
  label?: string;
  promoPrice?: number;
  discountPercent?: number;
  [key: string]: unknown;
}

export interface ProductStoreInfo {
  price: number;
  stock: number;
  available: boolean;
  zoneId: string;
  aisle: string;
  shelf: string;
  promo: ProductPromo | null;
  rescue: ProductRescueInfo | null;
}

export interface ProductAttributes {
  perishable: boolean;
  perishableClass: string | null;
  estimatedShelfLifeDays: number | null;
  basketTypes: string[];
  tags: string[];
  restrictions: string[];
  allergens: string[];
  imageHint: string;
}

export interface Product {
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  dominicanBrand: boolean;
  grupoRamosBrand: boolean;
  sourceNote: string;
  attributes: ProductAttributes;
  stores: Partial<Record<StoreId, ProductStoreInfo>>;
}

export interface ProductosData {
  metadata: Record<string, unknown>;
  stores: Store[];
  basketOptions: BasketOptions;
  rescuePolicy: RescuePolicy;
  manualBundles: ManualBundle[];
  assistanceRequests: unknown[];
  products: Product[];
}

/** A resolved product for a specific store, price/stock already flattened. */
export interface StoreProduct {
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  grupoRamosBrand: boolean;
  attributes: ProductAttributes;
  price: number;
  stock: number;
  available: boolean;
  zoneId: string;
  aisle: string;
  shelf: string;
  promo: ProductPromo | null;
  rescue: ProductRescueInfo | null;
}

export interface BasketLine {
  sku: string;
  quantity: number;
  unitPrice: number;
  isRescue: boolean;
  isBundle: boolean;
  bundleId?: string;
  reason?: string;
}

export interface BasketFormInput {
  budget: number;
  people: number;
  basketType: string;
  preferences: string[];
  restrictions: string[];
  allergies: string[];
}

export interface GeneratedBasket {
  lines: BasketLine[];
  totalSpent: number;
  budgetRemaining: number;
  savings: number;
  explanations: string[];
}

export interface RouteStop {
  zoneId: string;
  zoneLabel: string;
  order: number;
  items: { sku: string; name: string; aisle: string; category: string }[];
}

export interface ShoppingRoute {
  storeId: StoreId;
  stops: RouteStop[];
}

export type AssistanceType =
  | "preparar_carrito"
  | "acompanar_cliente"
  | "llevar_compra_caja"
  | "apoyo_movilidad";

export type AssistanceStatus = "pendiente" | "en_proceso" | "completada";

export interface AssistanceRequest {
  id: string;
  storeId: StoreId;
  type: AssistanceType;
  status: AssistanceStatus;
  createdAt: string;
}

export interface Ticket {
  ticketCode: string;
  storeId: StoreId;
  storeName: string;
  branchName: string;
  createdAt: string;
  lines: BasketLine[];
  productNames: Record<string, string>;
  total: number;
  promoSavings: number;
  rescueSavings: number;
  bundleIds: string[];
  routeSummary: string[];
  assistance: AssistanceRequest | null;
}
