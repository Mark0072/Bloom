"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
import StepNav from "@/components/StepNav";
import AssistanceStatus from "@/components/AssistanceStatus";
import { createAssistanceRequest, updateAssistanceStatus, ASSISTANCE_TYPE_LABELS } from "@/lib/assistance";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import type { AssistanceType } from "@/types";

const TYPES: AssistanceType[] = ["preparar_carrito", "acompanar_cliente", "llevar_compra_caja", "apoyo_movilidad"];

export default function AssistancePage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const assistance = useBloomStore((s) => s.assistance);
  const setAssistance = useBloomStore((s) => s.setAssistance);

  const [phase, setPhase] = useState<"idle" | "connecting" | "received">("idle");

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  useEffect(() => {
    if (hasHydrated && assistance) setPhase("received");
  }, [hasHydrated, assistance]);

  function requestAssistance(type: AssistanceType) {
    if (!storeId) return;
    const request = createAssistanceRequest({ storeId, type });
    setAssistance(request);
    setPhase("connecting");
    window.setTimeout(() => {
      const updated = updateAssistanceStatus(request.id, "en_proceso");
      if (updated) setAssistance(updated);
      setPhase("received");
    }, 1600);
  }

  if (!hasHydrated || !storeId) return null;

  return (
    <KioskShell>
      <StoreHeader title={t("assistanceTitle", language)} />

      {phase === "idle" && (
        <div className="flex flex-1 flex-col gap-4">
          <p className="opacity-70">Selecciona el tipo de ayuda que necesitas.</p>
          {TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => requestAssistance(type)}
              className="rounded-2xl border-2 border-brand-600 bg-white p-5 text-left text-kiosk-sm font-bold text-brand-800 active:scale-[0.98]"
            >
              {ASSISTANCE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {phase === "connecting" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-kiosk-base font-semibold">{t("assistanceConnecting", language)}</p>
        </div>
      )}

      {phase === "received" && assistance && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-4xl">✅</span>
            <p className="text-kiosk-base font-semibold">{t("assistanceReceived", language)}</p>
          </div>
          <AssistanceStatus request={assistance} />
        </div>
      )}

      <StepNav backHref="/route" nextHref="/checkout" nextLabel={phase === "idle" ? t("skip", language) : t("next", language)} />
    </KioskShell>
  );
}
