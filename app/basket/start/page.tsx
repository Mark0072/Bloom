"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import StepNav from "@/components/StepNav";
import { getBasketOptions } from "@/lib/products";
import { generateBasket } from "@/lib/basket";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function BasketStartPage() {
  const router = useRouter();
  const storeId = useBloomStore((state) => state.storeId);
  const hasHydrated = useBloomStore((state) => state.hasHydrated);
  const language = useBloomStore((state) => state.language);
  const basketForm = useBloomStore((state) => state.basketForm);
  const existingLines = useBloomStore((state) => state.lines);
  const setBasketForm = useBloomStore((state) => state.setBasketForm);
  const setLines = useBloomStore((state) => state.setLines);

  const [budget, setBudget] = useState(basketForm.budget > 0 ? String(basketForm.budget) : "");
  const [people, setPeople] = useState(basketForm.people);
  const [basketType, setBasketType] = useState(basketForm.basketType);
  const [preferences, setPreferences] = useState<string[]>(basketForm.preferences);
  const [restrictions, setRestrictions] = useState<string[]>(basketForm.restrictions);
  const [allergies, setAllergies] = useState<string[]>(basketForm.allergies);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasHydrated && !storeId) router.replace("/select-store");
  }, [hasHydrated, storeId, router]);

  if (!hasHydrated || !storeId) return null;

  const options = getBasketOptions();
  const protectedLineCount = existingLines.filter(
    (line) => line.manuallyAdded || line.isRescue || line.isBundle
  ).length;

  function handleGenerate(): boolean {
    if (!storeId) return false;
    const budgetNumber = Number(budget);
    if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
      setError(language === "en" ? "Enter a valid budget." : "Ingresa un presupuesto válido.");
      return false;
    }

    setError("");
    const form = { budget: budgetNumber, people, basketType, preferences, restrictions, allergies };
    setBasketForm(form);

    const result = generateBasket(form, storeId, language);
    setLines(result.lines, result.explanations, result.savings);
    return true;
  }

  function ChoiceGroup({
    title,
    options: groupOptions,
    selected,
    onToggle,
  }: {
    title: string;
    options: { id: string; label: string }[];
    selected: string[];
    onToggle: (id: string) => void;
  }) {
    return (
      <fieldset className="bloom-card min-w-0 max-w-full rounded-3xl p-4 sm:p-5">
        <legend className="max-w-full whitespace-normal px-1 text-sm font-black uppercase tracking-[0.12em] text-[var(--brand-primary)]">
          {title}
        </legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {groupOptions.map((option) => {
            const active = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(option.id)}
                className={`min-h-11 min-w-0 max-w-full whitespace-normal break-words rounded-full px-4 py-2 text-center text-sm font-bold transition active:scale-[0.98] ${
                  active
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "border-2 bloom-border bg-[var(--bloom-surface)]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <AppShell title={t("basketStartTitle", language)}>
      <div className="flex w-full min-w-0 max-w-full flex-col gap-5 overflow-x-clip overflow-y-auto pb-4">
        <section className="relative overflow-hidden rounded-3xl bg-[var(--brand-primary)] p-6 text-white shadow-lg">
          <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-[var(--brand-highlight)] opacity-90" />
          <div className="relative max-w-[85%]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">
              {language === "en" ? "Smart basket" : "Canasta inteligente"}
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight">
              {language === "en" ? "A shop made for your table" : "Una compra hecha para tu mesa"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {language === "en"
                ? "Tell us your budget and how many people will eat. We calculate practical quantities for you."
                : "Indica tu presupuesto y cuántas personas comerán. Calculamos cantidades prácticas por ti."}
            </p>
          </div>
        </section>

        {protectedLineCount > 0 && (
          <div className="rounded-2xl border-2 border-[var(--brand-highlight)] bg-[color:var(--brand-highlight)]/20 p-4 text-sm">
            <p className="font-bold text-[var(--brand-primary)]">
              {language === "en" ? "Your selected products are safe" : "Tus productos seleccionados se conservarán"}
            </p>
            <p className="mt-1 bloom-muted">
              {language === "en"
                ? `We will keep ${protectedLineCount} manually selected item(s) and use the remaining budget.`
                : `Mantendremos ${protectedLineCount} producto(s) elegidos manualmente y usaremos el presupuesto restante.`}
            </p>
          </div>
        )}

        <div className="grid min-w-0 max-w-full grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4">
          <label className="bloom-card min-w-0 max-w-full rounded-3xl p-4">
            <span className="block text-sm font-bold bloom-muted">{t("budgetLabel", language)}</span>
            <span className="mt-2 flex min-w-0 max-w-full items-center gap-2">
              <span className="text-xl font-black text-[var(--brand-primary)]">RD$</span>
              <input
                type="number"
                inputMode="decimal"
                min={1}
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="2500"
                className="w-0 min-w-0 max-w-full flex-1 bg-transparent text-3xl font-black outline-none placeholder:text-[var(--bloom-text-muted)]/40"
              />
            </span>
          </label>

          <div className="bloom-card min-w-0 max-w-full rounded-3xl p-4">
            <p className="max-w-full whitespace-normal text-sm font-bold bloom-muted">{t("peopleLabel", language)}</p>
            <div className="mt-2 grid h-14 w-full min-w-0 max-w-full grid-cols-[minmax(2.75rem,1fr)_auto_minmax(2.75rem,1fr)] items-center overflow-hidden rounded-full border-2 bloom-border">
              <button
                type="button"
                onClick={() => setPeople((current) => Math.max(1, current - 1))}
                aria-label={language === "en" ? "Fewer people" : "Menos personas"}
                className="h-full min-w-0 w-full text-2xl font-black text-[var(--brand-primary)] active:bg-[var(--bloom-surface-alt)]"
              >
                −
              </button>
              <span className="px-2 text-center text-2xl font-black" aria-live="polite">{people}</span>
              <button
                type="button"
                onClick={() => setPeople((current) => Math.min(20, current + 1))}
                aria-label={language === "en" ? "More people" : "Más personas"}
                className="h-full min-w-0 w-full text-2xl font-black text-[var(--brand-primary)] active:bg-[var(--bloom-surface-alt)]"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <fieldset className="min-w-0 max-w-full">
          <legend className="mb-2 max-w-full whitespace-normal text-sm font-black uppercase tracking-[0.12em] text-[var(--brand-primary)]">
            {t("basketTypeLabel", language)}
          </legend>
          <div className="grid min-w-0 max-w-full grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-2">
            {options.basketTypes.map((option) => {
              const active = basketType === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setBasketType(option.id)}
                  className={`min-h-16 min-w-0 max-w-full whitespace-normal break-words rounded-2xl px-3 py-3 text-left text-sm font-bold transition active:scale-[0.98] ${
                    active
                      ? "bg-[var(--brand-primary)] text-white shadow-md"
                      : "bloom-card"
                  }`}
                >
                  <span className="mr-2 text-lg" aria-hidden="true">{active ? "✓" : "○"}</span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <ChoiceGroup
          title={t("preferencesLabel", language)}
          options={options.preferences}
          selected={preferences}
          onToggle={(id) => setPreferences(toggleInArray(preferences, id))}
        />
        <ChoiceGroup
          title={t("restrictionsLabel", language)}
          options={options.restrictions}
          selected={restrictions}
          onToggle={(id) => setRestrictions(toggleInArray(restrictions, id))}
        />
        <ChoiceGroup
          title={t("allergiesLabel", language)}
          options={options.allergies}
          selected={allergies}
          onToggle={(id) => setAllergies(toggleInArray(allergies, id))}
        />

        {error && (
          <p role="alert" className="rounded-2xl bg-[var(--bloom-danger-bg)] p-4 font-bold bloom-danger-text">
            {error}
          </p>
        )}
      </div>

      <StepNav nextHref="/basket/result" nextLabel={t("generateBasket", language)} onNext={handleGenerate} />
    </AppShell>
  );
}
