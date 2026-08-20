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
    <div className="mt-auto flex w-full min-w-0 max-w-full gap-3 pt-4">
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          className="bloom-btn-secondary min-w-0 flex-1 whitespace-normal rounded-2xl px-3 py-4 text-center text-kiosk-base leading-tight active:scale-[0.98]"
        >
          {t("back", language)}
        </button>
      )}
      {(nextHref || onNext) && (
        <button
          type="button"
          disabled={nextDisabled}
          onClick={handleNext}
          className="bloom-btn-primary min-w-0 flex-[2] whitespace-normal rounded-2xl px-3 py-4 text-center text-kiosk-base leading-tight shadow-md active:scale-[0.98] disabled:opacity-40"
        >
          {nextLabel ?? t("next", language)}
        </button>
      )}
    </div>
  );
}
