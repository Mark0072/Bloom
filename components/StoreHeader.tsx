"use client";

import { useBloomStore } from "@/store/useBloomStore";
import { getStore } from "@/lib/products";
import { t } from "@/lib/i18n";

export default function StoreHeader({ title }: { title?: string }) {
  const storeId = useBloomStore((s) => s.storeId);
  const language = useBloomStore((s) => s.language);
  const accessibleMode = useBloomStore((s) => s.accessibleMode);
  const setAccessibleMode = useBloomStore((s) => s.setAccessibleMode);

  const store = storeId ? getStore(storeId) : null;

  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <p className={`font-bold ${accessibleMode ? "text-3xl" : "text-2xl"}`}>
          {store?.publicDisplayName ?? "Bloom"}
        </p>
        {title && <p className={`${accessibleMode ? "text-xl" : "text-kiosk-sm"} opacity-80`}>{title}</p>}
      </div>
      <button
        type="button"
        onClick={() => setAccessibleMode(!accessibleMode)}
        className={`shrink-0 rounded-xl border-2 px-3 py-2 font-semibold ${
          accessibleMode
            ? "border-white bg-white text-black"
            : "border-brand-700 bg-white text-brand-800"
        }`}
      >
        {accessibleMode ? t("accessibleModeOn", language) : t("accessibleModeOff", language)}
      </button>
    </header>
  );
}
