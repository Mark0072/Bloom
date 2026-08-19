"use client";

import Modal from "@/components/Modal";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import type { ColorProfile } from "@/types";

const COLOR_PROFILES: { id: ColorProfile; labelKey: "profileNone" | "profileProtanopia" | "profileDeuteranopia" | "profileTritanopia" | "profileGrayscale" }[] = [
  { id: "none", labelKey: "profileNone" },
  { id: "protanopia", labelKey: "profileProtanopia" },
  { id: "deuteranopia", labelKey: "profileDeuteranopia" },
  { id: "tritanopia", labelKey: "profileTritanopia" },
  { id: "grayscale", labelKey: "profileGrayscale" },
];

export default function AccessibilityPanel({ onClose }: { onClose: () => void }) {
  const language = useBloomStore((s) => s.language);
  const accessibility = useBloomStore((s) => s.accessibility);
  const setColorProfile = useBloomStore((s) => s.setColorProfile);
  const setHighContrast = useBloomStore((s) => s.setHighContrast);
  const setLargeText = useBloomStore((s) => s.setLargeText);
  const setReadAloud = useBloomStore((s) => s.setReadAloud);
  const resetAccessibility = useBloomStore((s) => s.resetAccessibility);

  return (
    <Modal title={t("accessibilityPanelTitle", language)} onClose={onClose} closeLabel={t("close", language)}>
      <div className="flex flex-col gap-5">
        <section>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide bloom-muted">{t("colorProfileLabel", language)}</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_PROFILES.map((profile) => (
              <button
                key={profile.id}
                type="button"
                aria-pressed={accessibility.colorProfile === profile.id}
                onClick={() => setColorProfile(profile.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border-2 ${
                  accessibility.colorProfile === profile.id
                    ? "bloom-btn-primary border-transparent"
                    : "bloom-btn-secondary"
                }`}
              >
                {t(profile.labelKey, language)}
              </button>
            ))}
          </div>
        </section>

        <ToggleRow
          label={t("highContrastLabel", language)}
          checked={accessibility.highContrast}
          onChange={setHighContrast}
        />
        <ToggleRow label={t("largeTextLabel", language)} checked={accessibility.largeText} onChange={setLargeText} />
        <ToggleRow
          label={t("readAloudDefaultLabel", language)}
          checked={accessibility.readAloud}
          onChange={setReadAloud}
        />

        <button
          type="button"
          onClick={resetAccessibility}
          className="bloom-btn-secondary rounded-2xl py-3 text-sm"
        >
          {t("disableAll", language)}
        </button>
      </div>
    </Modal>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 bloom-card rounded-2xl px-4 py-3">
      <span className="font-semibold">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-6 w-6 accent-[var(--bloom-accent)]"
      />
    </label>
  );
}
