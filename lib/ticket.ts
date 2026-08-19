import { getStore, getStoreProduct } from "@/lib/products";
import { generateShoppingRoute, getRouteSummary } from "@/lib/route";
import { round2 } from "@/lib/money";
import type { AssistanceRequest, BasketLine, ShoppingRoute, StoreId, Ticket } from "@/types";

export function createTicket(params: {
  storeId: StoreId;
  lines: BasketLine[];
  promoSavings: number;
  route: ShoppingRoute;
  assistance: AssistanceRequest | null;
}): Ticket {
  const { storeId, lines, promoSavings, route, assistance } = params;
  const store = getStore(storeId);

  const productNames: Record<string, string> = {};
  let total = 0;
  let rescueSavings = 0;

  for (const line of lines) {
    const product = getStoreProduct(storeId, line.sku);
    if (product) {
      productNames[line.sku] = product.name;
      if (line.isRescue) {
        rescueSavings = round2(rescueSavings + (product.price - line.unitPrice) * line.quantity);
      }
    }
    total = round2(total + line.unitPrice * line.quantity);
  }

  const bundleIds = Array.from(
    new Set(lines.filter((l) => l.isBundle && l.bundleId).map((l) => l.bundleId as string))
  );

  return {
    ticketCode: `BLM-${storeId}-${Date.now().toString(36).toUpperCase()}`,
    storeId,
    storeName: store?.publicDisplayName ?? storeId,
    branchName: store?.branchName ?? "",
    createdAt: new Date().toISOString(),
    lines,
    productNames,
    total,
    promoSavings: round2(promoSavings),
    rescueSavings,
    bundleIds,
    routeSummary: getRouteSummary(route),
    assistance,
  };
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(encoded: string): string {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Only the fields that can't be recomputed from the store data get encoded into the
 * QR payload — a full ticket (with product names, route text, etc.) for a large basket
 * can easily exceed what a QR code can hold. decodeTicket rebuilds the rest.
 */
interface SlimTicket {
  c: string; // ticketCode
  s: StoreId;
  t: string; // createdAt
  l: { sku: string; q: number; p: number; r?: 1; b?: string }[];
  ps: number; // promoSavings
  a: { type: AssistanceRequest["type"]; status: AssistanceRequest["status"] } | null;
}

export function encodeTicket(ticket: Ticket): string {
  const slim: SlimTicket = {
    c: ticket.ticketCode,
    s: ticket.storeId,
    t: ticket.createdAt,
    l: ticket.lines.map((line) => ({
      sku: line.sku,
      q: line.quantity,
      p: line.unitPrice,
      ...(line.isRescue ? { r: 1 as const } : {}),
      ...(line.bundleId ? { b: line.bundleId } : {}),
    })),
    ps: ticket.promoSavings,
    a: ticket.assistance ? { type: ticket.assistance.type, status: ticket.assistance.status } : null,
  };
  return base64UrlEncode(JSON.stringify(slim));
}

export function decodeTicket(encoded: string): Ticket | null {
  try {
    const json = base64UrlDecode(encoded);
    const slim = JSON.parse(json) as SlimTicket;
    const store = getStore(slim.s);

    const productNames: Record<string, string> = {};
    let total = 0;
    let rescueSavings = 0;

    const lines: BasketLine[] = slim.l.map((line) => {
      const product = getStoreProduct(slim.s, line.sku);
      const kind = line.r ? "rescue" : line.b ? `bundle::${line.b}` : "normal";
      if (product) {
        productNames[line.sku] = product.name;
        if (line.r) {
          rescueSavings = round2(rescueSavings + (product.price - line.p) * line.q);
        }
      }
      total = round2(total + line.p * line.q);
      return {
        id: `${line.sku}::${kind}`,
        sku: line.sku,
        quantity: line.q,
        unitPrice: line.p,
        regularUnitPrice: product?.price ?? line.p,
        isRescue: !!line.r,
        isBundle: !!line.b,
        bundleId: line.b,
      };
    });

    const bundleIds = Array.from(
      new Set(lines.filter((l) => l.isBundle && l.bundleId).map((l) => l.bundleId as string))
    );

    const route = generateShoppingRoute(lines, slim.s);

    return {
      ticketCode: slim.c,
      storeId: slim.s,
      storeName: store?.publicDisplayName ?? slim.s,
      branchName: store?.branchName ?? "",
      createdAt: slim.t,
      lines,
      productNames,
      total,
      promoSavings: slim.ps,
      rescueSavings,
      bundleIds,
      routeSummary: getRouteSummary(route),
      assistance: slim.a
        ? {
            id: "",
            storeId: slim.s,
            type: slim.a.type,
            status: slim.a.status,
            createdAt: slim.t,
          }
        : null,
    };
  } catch {
    return null;
  }
}

export function calculateTicketTotals(ticket: Ticket): { total: number; promoSavings: number; rescueSavings: number } {
  return {
    total: ticket.total,
    promoSavings: ticket.promoSavings,
    rescueSavings: ticket.rescueSavings,
  };
}
