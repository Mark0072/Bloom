"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KioskShell from "@/components/KioskShell";
import StoreHeader from "@/components/StoreHeader";
import StepNav from "@/components/StepNav";
import { getBasketOptions } from "@/lib/products";
import { generateBasket } from "@/lib/basket";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function BasketStartPage() {
  const router = useRouter();
  const storeId = useBloomStore((s) => s.storeId);
  const hasHydrated = useBloomStore((s) => s.hasHydrated);
  const language = useBloomStore((s) => s.language);
  const basketForm = useBloomStore((s) => s.basketForm);
  const setBasketForm = useBloomStore((s) => s.setBasketForm);
  const setLines = useBloomStore((s) => s.setLines);

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

  function handleGenerate(): boolean {
    const budgetNumber = Number(budget);
    if (!budgetNumber || budgetNumber <= 0) {
      setError("Ingresa un presupuesto válido.");
      return false;
    }
    if (!storeId) return false;
    setError("");

    const form = { budget: budgetNumber, people, basketType, preferences, restrictions, allergies };
    setBasketForm(form);

    const result = generateBasket(form, storeId);
    setLines(result.lines, result.explanations, result.savings);

    return true;
  }

  return (
    <KioskShell>
      <StoreHeader title={t("basketStartTitle", language)} />

      <div className="flex flex-col gap-5 overflow-y-auto pb-4">
        <div>
          <label className="mb-1 block font-semibold">{t("budgetLabel", language)}</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="2500"
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-kiosk-base"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold">{t("peopleLabel", language)}</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPeople(Math.max(1, people - 1))}
              className="h-12 w-12 rounded-xl border-2 border-slate-300 text-xl font-bold"
            >
              −
            </button>
            <span className="w-10 text-center text-kiosk-base font-bold">{people}</span>
            <button
              type="button"
              onClick={() => setPeople(people + 1)}
              className="h-12 w-12 rounded-xl border-2 border-slate-300 text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold">{t("basketTypeLabel", language)}</label>
          <div className="flex flex-wrap gap-2">
            {options.basketTypes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setBasketType(option.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  basketType === option.id ? "bg-brand-600 text-white" : "bg-white border border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold">{t("preferencesLabel", language)}</label>
          <div className="flex flex-wrap gap-2">
            {options.preferences.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPreferences(toggleInArray(preferences, option.id))}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  preferences.includes(option.id) ? "bg-brand-600 text-white" : "bg-white border border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold">{t("restrictionsLabel", language)}</label>
          <div className="flex flex-wrap gap-2">
            {options.restrictions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRestrictions(toggleInArray(restrictions, option.id))}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  restrictions.includes(option.id) ? "bg-brand-600 text-white" : "bg-white border border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold">{t("allergiesLabel", language)}</label>
          <div className="flex flex-wrap gap-2">
            {options.allergies.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAllergies(toggleInArray(allergies, option.id))}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  allergies.includes(option.id) ? "bg-brand-600 text-white" : "bg-white border border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="font-semibold text-red-600">{error}</p>}
      </div>

      <StepNav backHref="/home" nextHref="/basket/result" nextLabel={t("generateBasket", language)} onNext={handleGenerate} />
    </KioskShell>
  );
}
