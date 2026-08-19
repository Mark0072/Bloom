import type { AssistanceRequest, AssistanceStatus, AssistanceType, Language, StoreId } from "@/types";

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
    status: "activa",
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

const TYPE_LABELS: Record<Language, Record<AssistanceType, string>> = {
  es: {
    movilidad: "Ayuda para moverse",
    visual: "No puede ver bien",
    otro: "Otro tipo de asistencia",
  },
  en: {
    movilidad: "Help moving around",
    visual: "Can't see well",
    otro: "Other kind of assistance",
  },
};

const STATUS_LABELS: Record<Language, Record<AssistanceStatus, string>> = {
  es: {
    activa: "Activa",
    completada: "Completada",
  },
  en: {
    activa: "Active",
    completada: "Completed",
  },
};

export function getAssistanceTypeLabel(type: AssistanceType, language: Language = "es"): string {
  return TYPE_LABELS[language][type];
}

export function getAssistanceStatusLabel(status: AssistanceStatus, language: Language = "es"): string {
  return STATUS_LABELS[language][status];
}
