"use client";

import { useRouter } from "next/navigation";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

export default function ThanksPage() {
  const router = useRouter();
  const language = useBloomStore((s) => s.language);
  const resetFlow = useBloomStore((s) => s.resetFlow);

  function handleRestart() {
    resetFlow();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-brand-600 px-6 text-center text-white">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <span className="text-6xl">🎉</span>
        <div>
          <h1 className="text-kiosk-xl font-extrabold">{t("thanksTitle", language)}</h1>
          <p className="mt-2 text-kiosk-base opacity-90">{t("thanksSubtitle", language)}</p>
        </div>
        <button
          type="button"
          onClick={handleRestart}
          className="w-full rounded-2xl bg-white py-5 text-kiosk-lg font-bold text-brand-700 shadow-xl active:scale-[0.98]"
        >
          {t("restart", language)}
        </button>
      </div>
    </div>
  );
}
