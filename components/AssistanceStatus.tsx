"use client";

import { getAssistanceStatusLabel, getAssistanceTypeLabel } from "@/lib/assistance";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import type { AssistanceRequest } from "@/types";

const STATUS_STYLES: Record<AssistanceRequest["status"], string> = {
  activa: "bg-[var(--bloom-warning-bg)] text-[var(--bloom-warning)]",
  completada: "bg-[var(--bloom-accent)] text-[var(--bloom-accent-text)]",
};

export default function AssistanceStatus({ request }: { request: AssistanceRequest }) {
  const language = useBloomStore((s) => s.language);

  return (
    <div className="bloom-card rounded-2xl p-4">
      <p className="font-semibold">{getAssistanceTypeLabel(request.type, language)}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm bloom-muted">{t("assistanceStatusLabel", language)}:</span>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLES[request.status]}`}>
          {getAssistanceStatusLabel(request.status, language)}
        </span>
      </div>
    </div>
  );
}
