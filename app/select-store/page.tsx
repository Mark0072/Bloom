"use client";

import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import { getStores } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";
import type { StoreId } from "@/types";

const STORE_THEME: Record<StoreId, { color: string; emoji: string }> = {
  "APZ-001": { color: "bg-orange-500", emoji: "🟠" },
  "SIR-001": { color: "bg-sky-600", emoji: "🌊" },
};

export default function SelectStorePage() {
  const router = useRouter();
  const setStore = useBloomStore((s) => s.setStore);
  const stores = getStores();

  function handleSelect(storeId: StoreId) {
    setStore(storeId);
    router.push("/language");
  }

  return (
    <KioskShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
        <div className="text-center">
          <h1 className="text-kiosk-lg font-extrabold">¿En qué tienda estás?</h1>
          <p className="mt-2 opacity-70">Selecciona tu tienda para comenzar</p>
        </div>

        <div className="flex w-full flex-col gap-5">
          {stores.map((store) => {
            const theme = STORE_THEME[store.storeId];
            return (
              <button
                key={store.storeId}
                type="button"
                onClick={() => handleSelect(store.storeId)}
                className={`flex items-center gap-4 rounded-3xl ${theme.color} p-6 text-left text-white shadow-lg active:scale-[0.98]`}
              >
                <span className="text-4xl">{theme.emoji}</span>
                <div>
                  <p className="text-kiosk-lg font-extrabold">{store.publicDisplayName}</p>
                  <p className="opacity-90">{store.branchName}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </KioskShell>
  );
}
