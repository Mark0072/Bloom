"use client";

import { useBloomStore } from "@/store/useBloomStore";
import { getColorFilterValue } from "@/lib/accessibility";

export default function KioskShell({ children }: { children: React.ReactNode }) {
  const accessibility = useBloomStore((s) => s.accessibility);

  return (
    <div
      className="bloom-page min-h-screen w-full flex justify-center"
      data-contrast={accessibility.highContrast ? "high" : undefined}
      data-textsize={accessibility.largeText ? "large" : undefined}
      style={{ filter: getColorFilterValue(accessibility.colorProfile) }}
    >
      <div className="w-full max-w-md min-h-screen flex flex-col px-5 py-6 gap-5">{children}</div>
    </div>
  );
}
