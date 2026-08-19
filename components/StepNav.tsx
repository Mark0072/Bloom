"use client";

import { useRouter } from "next/navigation";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

interface StepNavProps {
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
  onNext?: () => boolean | void;
  nextDisabled?: boolean;
}

export default function StepNav({ backHref, nextHref, nextLabel, onNext, nextDisabled }: StepNavProps) {
  const router = useRouter();
  const language = useBloomStore((s) => s.language);

  function handleNext() {
    const result = onNext ? onNext() : true;
    if (result === false) return;
    if (nextHref) router.push(nextHref);
  }

  return (
    <div className="mt-auto flex gap-3 pt-4">
      {backHref && (
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="flex-1 rounded-2xl border-2 border-slate-300 bg-white py-4 text-kiosk-base font-semibold text-slate-700 active:scale-[0.98]"
        >
          {t("back", language)}
        </button>
      )}
      {(nextHref || onNext) && (
        <button
          type="button"
          disabled={nextDisabled}
          onClick={handleNext}
          className="flex-[2] rounded-2xl bg-brand-600 py-4 text-kiosk-base font-bold text-white shadow-md active:scale-[0.98] disabled:opacity-40"
        >
          {nextLabel ?? t("next", language)}
        </button>
      )}
    </div>
  );
}
