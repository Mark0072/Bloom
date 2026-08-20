"use client";

import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import BrandLogo from "@/components/BrandLogo";
import { getBrandTheme, getBrandVariables } from "@/lib/brandTheme";
import { getStores } from "@/lib/products";
import { t } from "@/lib/i18n";
import { useBloomStore } from "@/store/useBloomStore";
import type { StoreId } from "@/types";

export default function SelectStorePage() {
  const router = useRouter();
  const language = useBloomStore((s) => s.language);
  const setStore = useBloomStore((s) => s.setStore);
  const stores = getStores();

  function handleSelect(storeId: StoreId) {
    setStore(storeId);
    router.push("/");
  }

  return (
    <KioskShell fullBleed neutral>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--bloom-bg)] px-5 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--brand-highlight)]/35" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[var(--bloom-accent)]/10" />

        <header className="relative mx-auto max-w-xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--bloom-text-muted)]">Compra asistida</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--bloom-text)] sm:text-4xl">
            {t("selectStoreTitle", language)}
          </h1>
          <p className="mt-3 text-base text-[var(--bloom-text-muted)]">{t("selectStoreSubtitle", language)}</p>
        </header>

        <div className="relative my-auto grid w-full grid-cols-1 gap-5 py-8 md:grid-cols-2">
          {stores.map((store) => {
            const theme = getBrandTheme(store.storeId);
            if (!theme) return null;
            return (
              <div key={store.storeId} style={getBrandVariables(store.storeId)}>
                <button
                  type="button"
                  onClick={() => handleSelect(store.storeId)}
                  className="group relative flex min-h-72 w-full flex-col overflow-hidden rounded-[2rem] bg-[var(--brand-primary)] p-6 text-left text-white shadow-xl transition-transform active:scale-[0.985]"
                  style={{
                    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, var(--brand-primary) 50%, transparent), var(--brand-primary) 92%), url(${theme.welcomeHero})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                >
                  <BrandLogo theme={theme} inverse className="h-16 w-44" />
                  <div className="mt-auto">
                    <p className="text-lg font-black">{theme.shortTagline}</p>
                    <p className="mt-1 text-sm font-medium text-white/80">{store.branchName}</p>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand-highlight)] px-5 py-3 text-sm font-black text-[var(--brand-primary)] shadow-md">
                      {language === "en" ? "Choose this store" : "Elegir esta tienda"}
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <p className="relative text-center text-xs font-semibold text-[var(--bloom-text-muted)]">
          {language === "en" ? "Your catalog and route adapt to the selected location." : "El catálogo y la ruta se adaptan a la sucursal seleccionada."}
        </p>
      </div>
    </KioskShell>
  );
}
