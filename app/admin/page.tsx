"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney, round2 } from "@/lib/money";
import { getAllProducts, getManualBundle, getStore } from "@/lib/products";
import { getAssistanceRequests, ASSISTANCE_STATUS_LABELS, ASSISTANCE_TYPE_LABELS } from "@/lib/assistance";
import { useBloomStore } from "@/store/useBloomStore";
import type { AssistanceRequest } from "@/types";

export default function AdminPage() {
  const storeId = useBloomStore((s) => s.storeId);
  const generatedBaskets = useBloomStore((s) => s.generatedBaskets);
  const rescueAdditions = useBloomStore((s) => s.rescueAdditions);
  const bundleAdditions = useBloomStore((s) => s.bundleAdditions);

  const [assistanceRequests, setAssistanceRequests] = useState<AssistanceRequest[]>([]);

  useEffect(() => {
    setAssistanceRequests(getAssistanceRequests());
  }, []);

  const store = storeId ? getStore(storeId) : null;

  const avgBudget = useMemo(() => {
    if (generatedBaskets.length === 0) return 0;
    return round2(generatedBaskets.reduce((sum, b) => sum + b.budget, 0) / generatedBaskets.length);
  }, [generatedBaskets]);

  const avgSavings = useMemo(() => {
    if (generatedBaskets.length === 0) return 0;
    return round2(generatedBaskets.reduce((sum, b) => sum + b.savings, 0) / generatedBaskets.length);
  }, [generatedBaskets]);

  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const basket of generatedBaskets) {
      for (const sku of basket.itemSkus) {
        counts.set(sku, (counts.get(sku) ?? 0) + 1);
      }
    }
    const products = getAllProducts();
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sku, count]) => ({ sku, count, name: products.find((p) => p.sku === sku)?.name ?? sku }));
  }, [generatedBaskets]);

  return (
    <div className="min-h-screen w-full bg-slate-100 px-4 py-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Panel administrativo</h1>
          <Link href="/home" className="text-sm font-semibold text-brand-700">
            ← Volver
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Local seleccionado" value={store?.publicDisplayName ?? "—"} />
          <Stat label="Canastas generadas" value={String(generatedBaskets.length)} />
          <Stat label="Presupuesto promedio" value={formatMoney(avgBudget)} />
          <Stat label="Ahorro promedio" value={formatMoney(avgSavings)} />
          <Stat label="Ofertas de Rescate agregadas" value={String(rescueAdditions.length)} />
          <Stat label="Bundles agregados" value={String(bundleAdditions.length)} />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 font-bold">Solicitudes de asistencia</p>
          {assistanceRequests.length === 0 && <p className="text-sm opacity-60">Sin solicitudes registradas.</p>}
          <ul className="flex flex-col gap-2">
            {assistanceRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span>{ASSISTANCE_TYPE_LABELS[r.type]}</span>
                <span className="opacity-60">{ASSISTANCE_STATUS_LABELS[r.status]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 font-bold">Productos más recomendados</p>
          {topProducts.length === 0 && <p className="text-sm opacity-60">Aún no hay datos.</p>}
          <ul className="flex flex-col gap-2">
            {topProducts.map((p) => (
              <li key={p.sku} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <span className="opacity-60">{p.count}×</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 font-bold">Bundles agregados</p>
          {bundleAdditions.length === 0 && <p className="text-sm opacity-60">Aún no hay bundles agregados.</p>}
          <ul className="flex flex-col gap-2">
            {bundleAdditions.map((b, i) => (
              <li key={i} className="text-sm">
                {getManualBundle(b.bundleId)?.name ?? b.bundleId}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-center text-xs opacity-50">Panel demostrativo del PoC.</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide opacity-60">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
    </div>
  );
}
