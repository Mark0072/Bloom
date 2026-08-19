"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
import SpeakButton from "@/components/SpeakButton";
import { getCategories } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

const NAV_ITEMS = [
  { key: "navProducts" as const, href: "/products", emoji: "🔍" },
  { key: "navBasket" as const, href: "/basket/start", emoji: "🧺" },
  { key: "navRescue" as const, href: "/rescue", emoji: "💚" },
];

export default function HomePage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  if (!hasHydrated || !storeId) return null;

  const categories = getCategories(storeId);

  return (
    <KioskShell>
      <StoreHeader title={t("homeGreeting", language)} />

      <SpeakButton text={t("homeGreeting", language)} />

      <nav className="grid grid-cols-1 gap-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200 active:scale-[0.98]"
          >
            <span className="text-3xl">{item.emoji}</span>
            <span className="text-kiosk-base font-bold">{t(item.key, language)}</span>
          </Link>
        ))}
      </nav>

      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide opacity-60">{t("categoriesTitle", language)}</p>
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <span className="font-medium">{category}</span>
              <span aria-hidden>›</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Link
          href="/assistance"
          className="rounded-2xl border-2 border-brand-600 bg-white py-4 text-center text-kiosk-base font-bold text-brand-700"
        >
          🙋 {t("assistanceCta", language)}
        </Link>
        <Link href="/admin" className="text-center text-xs opacity-40">
          Admin
        </Link>
      </div>
    </KioskShell>
  );
}
