"use client";

import { useBloomStore } from "@/store/useBloomStore";

export default function KioskShell({ children }: { children: React.ReactNode }) {
  const accessibleMode = useBloomStore((s) => s.accessibleMode);

  return (
    <div
      className={`min-h-screen w-full flex justify-center ${
        accessibleMode ? "bg-black text-white" : "bg-brand-50 text-slate-900"
      }`}
    >
      <div className="w-full max-w-md min-h-screen flex flex-col px-5 py-6 gap-5">{children}</div>
    </div>
  );
}
