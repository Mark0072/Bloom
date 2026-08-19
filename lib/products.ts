import productosData from "@/data/productos.json";
import type {
  ProductosData,
  Product,
  Store,
  StoreId,
  StoreProduct,
  ManualBundle,
} from "@/types";

const data = productosData as unknown as ProductosData;

export function getStores(): Store[] {
  return data.stores;
}

export function getStore(storeId: StoreId): Store | undefined {
  return data.stores.find((s) => s.storeId === storeId);
}

export function getBasketOptions() {
  return data.basketOptions;
}

export function getRescuePolicy() {
  return data.rescuePolicy;
}

export function getAllProducts(): Product[] {
  return data.products;
}

/** Flatten a raw product's store-specific data into a single StoreProduct. */
export function toStoreProduct(product: Product, storeId: StoreId): StoreProduct | null {
  const storeInfo = product.stores[storeId];
  if (!storeInfo) return null;
  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    grupoRamosBrand: product.grupoRamosBrand,
    attributes: product.attributes,
    price: storeInfo.price,
    stock: storeInfo.stock,
    available: storeInfo.available,
    zoneId: storeInfo.zoneId,
    aisle: storeInfo.aisle,
    shelf: storeInfo.shelf,
    promo: storeInfo.promo,
    rescue: storeInfo.rescue,
  };
}

export function getStoreProducts(storeId: StoreId): StoreProduct[] {
  return data.products
    .map((p) => toStoreProduct(p, storeId))
    .filter((p): p is StoreProduct => p !== null);
}

export function getStoreProduct(storeId: StoreId, sku: string): StoreProduct | null {
  const product = data.products.find((p) => p.sku === sku);
  if (!product) return null;
  return toStoreProduct(product, storeId);
}

export function getCategories(storeId: StoreId): string[] {
  const cats = new Set<string>();
  for (const p of getStoreProducts(storeId)) cats.add(p.category);
  return Array.from(cats).sort();
}

export interface ProductSearchFilters {
  query?: string;
  category?: string;
  onlyAvailable?: boolean;
  onlyPromo?: boolean;
  onlyRescue?: boolean;
}

export function searchProducts(storeId: StoreId, filters: ProductSearchFilters): StoreProduct[] {
  let items = getStoreProducts(storeId);

  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    );
  }

  if (filters.category) {
    items = items.filter((p) => p.category === filters.category);
  }

  if (filters.onlyAvailable) {
    items = items.filter((p) => p.available && p.stock > 0);
  }

  if (filters.onlyPromo) {
    items = items.filter((p) => !!p.promo);
  }

  if (filters.onlyRescue) {
    items = items.filter((p) => !!p.rescue && p.rescue.eligible);
  }

  return items;
}

export function getAvailabilityState(product: StoreProduct): "disponible" | "pocas_unidades" | "no_disponible" {
  if (!product.available || product.stock <= 0) return "no_disponible";
  if (product.stock <= 10) return "pocas_unidades";
  return "disponible";
}

export function getManualBundles(storeId: StoreId): ManualBundle[] {
  return data.manualBundles.filter((b) => b.storeId === storeId && b.visibleToCustomer);
}

export function getManualBundle(bundleId: string): ManualBundle | undefined {
  return data.manualBundles.find((b) => b.bundleId === bundleId);
}
