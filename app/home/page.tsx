"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import SpeakButton from "@/components/SpeakButton";
import { getBrandTheme, getCategoryImage } from "@/lib/brandTheme";
import { translateCategory } from "@/lib/categoryNames";
import { t } from "@/lib/i18n";
import { getCategories } from "@/lib/products";
import { useBloomStore } from "@/store/useBloomStore";

export default function HomePage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const theme = getBrandTheme(storeId);

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  if (!hasHydrated || !storeId || !theme) return null;

  const categories = getCategories(storeId);
  const isEnglish = language === "en";
  const featureCards = [
    {
      href: `/products?category=${encodeURIComponent("Frutas y vegetales")}`,
      image: theme.homeImages.fresh,
      label: isEnglish ? "Fresh picks for every meal" : "Sé testigo de la frescura",
      cta: isEnglish ? "Shop produce" : "Comprar frescos",
      className: "col-span-2 min-h-48",
    },
    {
      href: `/products?category=${encodeURIComponent("Carnes y pescados")}`,
      image: theme.homeImages.meat,
      label: isEnglish ? "The best cuts" : "Lo mejor en carnes",
      cta: isEnglish ? "Explore" : "Explorar",
      className: "min-h-44",
    },
    {
      href: `/products?category=${encodeURIComponent("Higiene personal")}`,
      image: theme.homeImages.beauty,
      label: isEnglish ? "Personal care essentials" : "Cuidado que se nota",
      cta: isEnglish ? "Explore" : "Explorar",
      className: "min-h-44",
    },
    {
      href: "/rescue",
      image: theme.homeImages.brands,
      label: isEnglish ? "More value, less waste" : "Más valor, menos desperdicio",
      cta: t("navRescue", language),
      className: "col-span-2 min-h-36",
    },
  ];

  return (
    <AppShell title={t("homeGreeting", language)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-secondary)]">
            {isEnglish ? "Start here" : "Empieza por aquí"}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--bloom-text-muted)]">
            {isEnglish ? "Choose a section or browse by category." : "Elige una sección o compra por categoría."}
          </p>
        </div>
        <SpeakButton text={t("homeGreeting", language)} />
      </div>

      <section className="grid grid-cols-2 gap-3" aria-label={isEnglish ? "Featured sections" : "Secciones destacadas"}>
        {featureCards.map((card) => (
          <HomeFeatureCard key={card.href + card.label} {...card} />
        ))}
      </section>

      <section className="rounded-[1.8rem] bg-[var(--bloom-surface)] p-4 shadow-sm ring-1 ring-[var(--bloom-border)] sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.17em] text-[var(--brand-secondary)]">{t("categoriesTitle", language)}</p>
            <h2 className="mt-1 text-xl font-black text-[var(--bloom-text)]">
              {isEnglish ? "Find what you need faster" : "Encuentra lo que necesitas"}
            </h2>
          </div>
          <Link href="/products" className="shrink-0 text-xs font-black text-[var(--brand-primary)] underline-offset-4 hover:underline">
            {isEnglish ? "View all" : "Ver todo"}
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="group flex min-w-0 flex-col items-center gap-2 text-center"
            >
              <span
                className="aspect-square w-full max-w-24 rounded-full bg-[var(--brand-highlight)] bg-cover bg-center shadow-sm ring-2 ring-transparent transition group-hover:ring-[var(--brand-secondary)]"
                style={{ backgroundImage: `url(${getCategoryImage(theme, category)})` }}
                aria-hidden="true"
              />
              <span className="line-clamp-2 text-xs font-bold leading-tight text-[var(--bloom-text)]">
                {translateCategory(category, language)}
              </span>
            </Link>
          ))}
        </div>
      </section>

    </AppShell>
  );
}

function HomeFeatureCard({
  href,
  image,
  label,
  cta,
  className,
}: {
  href: string;
  image: string;
  label: string;
  cta: string;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex overflow-hidden rounded-[1.6rem] bg-[var(--brand-primary)] p-4 text-white shadow-md ring-1 ring-black/5 active:scale-[0.99] ${className}`}
      style={{ backgroundImage: `url(${image})`, backgroundPosition: "center", backgroundSize: "cover" }}
    >
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition group-hover:from-black/80" />
      <span className="relative mt-auto block max-w-[90%]">
        <span className="block text-lg font-black leading-tight drop-shadow-md">{label}</span>
        <span className="mt-2 inline-flex rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-[var(--brand-primary)] shadow-sm">
          {cta}
        </span>
      </span>
    </Link>
  );
}
