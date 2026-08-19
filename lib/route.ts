import { getStore, getStoreProduct } from "@/lib/products";
import type { BasketLine, RouteStop, ShoppingRoute, StoreId, StoreLayout } from "@/types";

export function sortItemsByStoreLayout(
  items: { sku: string; zoneId: string }[],
  layout: StoreLayout
): { sku: string; zoneId: string }[] {
  const zoneOrder = new Map(layout.zones.map((z) => [z.zoneId, z.order]));
  return [...items].sort((a, b) => (zoneOrder.get(a.zoneId) ?? 999) - (zoneOrder.get(b.zoneId) ?? 999));
}

export function generateShoppingRoute(basketItems: BasketLine[], storeId: StoreId): ShoppingRoute {
  const store = getStore(storeId);
  if (!store) return { storeId, stops: [] };

  const layout = store.layout;
  const zoneMap = new Map(layout.zones.map((z) => [z.zoneId, z]));

  const stopsByZone = new Map<string, RouteStop>();

  for (const zone of layout.zones) {
    stopsByZone.set(zone.zoneId, {
      zoneId: zone.zoneId,
      zoneLabel: zone.label,
      order: zone.order,
      items: [],
    });
  }

  for (const line of basketItems) {
    const product = getStoreProduct(storeId, line.sku);
    if (!product) continue;
    const zone = zoneMap.get(product.zoneId);
    const stop = stopsByZone.get(product.zoneId);
    if (!stop || !zone) continue;
    stop.items.push({
      sku: product.sku,
      name: product.name,
      aisle: product.aisle,
      category: product.category,
    });
  }

  const stops = Array.from(stopsByZone.values())
    .filter((s) => s.items.length > 0 || s.zoneId === layout.entryZoneId || s.zoneId === layout.checkoutZoneId)
    .sort((a, b) => a.order - b.order);

  return { storeId, stops };
}

export function getRouteSummary(route: ShoppingRoute): string[] {
  return route.stops.map((stop) => {
    if (stop.items.length === 0) {
      return `${stop.zoneLabel}`;
    }
    const itemNames = stop.items.map((i) => i.name).join(", ");
    return `${stop.zoneLabel}: ${itemNames}`;
  });
}
