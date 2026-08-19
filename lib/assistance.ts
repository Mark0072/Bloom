import type { AssistanceRequest, AssistanceStatus, AssistanceType, StoreId } from "@/types";

const STORAGE_KEY = "bloom_assistance_requests";

function readAll(): AssistanceRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AssistanceRequest[]) : [];
  } catch {
    return [];
  }
}

function writeAll(requests: AssistanceRequest[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function createAssistanceRequest(data: { storeId: StoreId; type: AssistanceType }): AssistanceRequest {
  const request: AssistanceRequest = {
    id: `AST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    storeId: data.storeId,
    type: data.type,
    status: "pendiente",
    createdAt: new Date().toISOString(),
  };
  const all = readAll();
  all.unshift(request);
  writeAll(all);
  return request;
}

export function getAssistanceRequests(): AssistanceRequest[] {
  return readAll();
}

export function updateAssistanceStatus(id: string, status: AssistanceStatus): AssistanceRequest | null {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status };
  writeAll(all);
  return all[idx];
}

export const ASSISTANCE_TYPE_LABELS: Record<AssistanceType, string> = {
  preparar_carrito: "Preparar carrito",
  acompanar_cliente: "Acompañar al cliente",
  llevar_compra_caja: "Llevar compra a caja",
  apoyo_movilidad: "Apoyo por movilidad reducida",
};

export const ASSISTANCE_STATUS_LABELS: Record<AssistanceStatus, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completada: "Completada",
};
