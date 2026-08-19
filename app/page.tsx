"use client";

import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-brand-600 px-6 text-center text-white">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-5xl shadow-lg">🛒</div>
        <div>
          <h1 className="text-kiosk-xl font-extrabold">Compra Asistida</h1>
          <p className="mt-2 text-kiosk-base opacity-90">
            Te ayudamos a comprar más fácil, más rápido y sin pasarte del presupuesto.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/select-store")}
          className="w-full rounded-2xl bg-white py-5 text-kiosk-lg font-bold text-brand-700 shadow-xl active:scale-[0.98]"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
