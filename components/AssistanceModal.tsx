"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import type { AssistanceType } from "@/types";

const OPTIONS: { type: AssistanceType; labelKey: "assistanceOptionMobility" | "assistanceOptionVisual" | "assistanceOptionOther" }[] = [
  { type: "movilidad", labelKey: "assistanceOptionMobility" },
  { type: "visual", labelKey: "assistanceOptionVisual" },
  { type: "otro", labelKey: "assistanceOptionOther" },
];

export default function AssistanceModal({
  onClose,
  onOpenAccessibilityPanel,
}: {
  onClose: () => void;
  onOpenAccessibilityPanel: () => void;
}) {
  const language = useBloomStore((s) => s.language);
  const createAssistance = useBloomStore((s) => s.createAssistance);
  const pushToast = useBloomStore((s) => s.pushToast);
  const setLargeText = useBloomStore((s) => s.setLargeText);
  const setReadAloud = useBloomStore((s) => s.setReadAloud);

  const [selectedType, setSelectedType] = useState<AssistanceType | null>(null);

  function handleSelect(type: AssistanceType) {
    createAssistance(type);
    pushToast(t("assistanceRegisteredToast", language), "success");
    setSelectedType(type);
  }

  return (
    <Modal title={t("assistanceModalTitle", language)} onClose={onClose} closeLabel={t("close", language)}>
      {!selectedType ? (
        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => handleSelect(option.type)}
              className="bloom-btn-secondary rounded-2xl p-4 text-left text-kiosk-sm"
            >
              {t(option.labelKey, language)}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bloom-card-alt rounded-2xl p-4">
            <p className="font-semibold">{t("assistanceRegisteredToast", language)}</p>
            <p className="mt-1 text-sm bloom-muted">{t("assistanceRegisteredNote", language)}</p>
          </div>

          {selectedType === "visual" && (
            <div className="bloom-card rounded-2xl p-4">
              <p className="mb-3 font-semibold">{t("assistanceVisualOfferTitle", language)}</p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setLargeText(true)}
                  className="bloom-btn-secondary rounded-xl py-3 text-sm"
                >
                  {t("enableLargeText", language)}
                </button>
                <button
                  type="button"
                  onClick={() => setReadAloud(true)}
                  className="bloom-btn-secondary rounded-xl py-3 text-sm"
                >
                  {t("enableReadAloud", language)}
                </button>
                <button
                  type="button"
                  onClick={onOpenAccessibilityPanel}
                  className="bloom-btn-secondary rounded-xl py-3 text-sm"
                >
                  {t("openAccessibilityPanel", language)}
                </button>
              </div>
            </div>
          )}

          <button type="button" onClick={onClose} className="bloom-btn-primary rounded-2xl py-4 text-kiosk-base">
            {t("doneLabel", language)}
          </button>
        </div>
      )}
    </Modal>
  );
}
