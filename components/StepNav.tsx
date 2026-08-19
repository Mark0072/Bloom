"use client";

import { useRouter } from "next/navigation";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

interface StepNavProps {
  /** Used only when there's no browser history to go back to (e.g. the screen was opened directly). */
  fallbackHref?: string;
  showBack?: boolean;
  nextHref?: string;
  nextLabel?: string;
  onNext?: () => boolean | void;
  nextDisabled?: boolean;
}

export default function StepNav({ fallbackHref = "/home", showBack = true, nextHref, nextLabel, onNext, nextDisabled }: StepNavProps) {
  const router = useRouter();
  const language = useBloomStore((s) => s.language);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  function handleNext() {
    const result = onNext ? onNext() : true;
    if (result === false) return;
    if (nextHref) router.push(nextHref);
  }

  return (
    <div className="mt-auto flex gap-3 pt-4">
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          className="bloom-btn-secondary flex-1 rounded-2xl py-4 text-kiosk-base active:scale-[0.98]"
        >
          {t("back", language)}
        </button>
      )}
      {(nextHref || onNext) && (
        <button
          type="button"
          disabled={nextDisabled}
          onClick={handleNext}
          className="bloom-btn-primary flex-[2] rounded-2xl py-4 text-kiosk-base shadow-md active:scale-[0.98] disabled:opacity-40"
        >
          {nextLabel ?? t("next", language)}
        </button>
      )}
    </div>
  );
}
