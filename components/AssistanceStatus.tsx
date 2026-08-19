"use client";

import { ASSISTANCE_STATUS_LABELS, ASSISTANCE_TYPE_LABELS } from "@/lib/assistance";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import type { AssistanceRequest } from "@/types";

const STATUS_STYLES: Record<AssistanceRequest["status"], string> = {
  pendiente: "bg-amber-100 text-amber-800",
  en_proceso: "bg-blue-100 text-blue-800",
  completada: "bg-brand-100 text-brand-800",
};

export default function AssistanceStatus({ request }: { request: AssistanceRequest }) {
  const language = useBloomStore((s) => s.language);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="font-semibold">{ASSISTANCE_TYPE_LABELS[request.type]}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm opacity-70">{t("assistanceStatusLabel", language)}:</span>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLES[request.status]}`}>
          {ASSISTANCE_STATUS_LABELS[request.status]}
        </span>
      </div>
    </div>
  );
}
