"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import SpeakButton from "@/components/SpeakButton";
import { getCategories } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";
import { translateCategory } from "@/lib/categoryNames";

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
    <AppShell title={t("homeGreeting", language)}>
      <SpeakButton text={t("homeGreeting", language)} />

      <nav className="grid grid-cols-1 gap-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bloom-card flex items-center gap-4 rounded-2xl p-5 shadow-sm active:scale-[0.98]"
          >
            <span className="text-3xl">{item.emoji}</span>
            <span className="text-kiosk-base font-bold">{t(item.key, language)}</span>
          </Link>
        ))}
      </nav>

      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide bloom-muted">{t("categoriesTitle", language)}</p>
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="bloom-card flex items-center justify-between rounded-xl px-4 py-3"
            >
              <span className="font-medium">{translateCategory(category, language)}</span>
              <span aria-hidden>›</span>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/admin" className="mt-auto pt-4 text-center text-xs bloom-muted">
        Admin
      </Link>
    </AppShell>
  );
}
