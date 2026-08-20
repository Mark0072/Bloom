"use client";

import { useBloomStore } from "@/store/useBloomStore";
import { getColorFilterValue } from "@/lib/accessibility";
import { getBrandTheme, getBrandVariables } from "@/lib/brandTheme";

interface KioskShellProps {
  children: React.ReactNode;
  fullBleed?: boolean;
  neutral?: boolean;
  contentClassName?: string;
  preserveTrueColor?: boolean;
}

export default function KioskShell({
  children,
  fullBleed = false,
  neutral = false,
  contentClassName = "",
  preserveTrueColor = false,
}: KioskShellProps) {
  const storeId = useBloomStore((s) => s.storeId);
  const accessibility = useBloomStore((s) => s.accessibility);
  const theme = neutral ? null : getBrandTheme(storeId);
  const brandVariables = getBrandVariables(storeId, { neutral, highContrast: accessibility.highContrast });

  return (
    <div
      className="min-h-[100dvh] w-full bg-[var(--bloom-bg)]"
      style={brandVariables}
      data-brand={theme?.key ?? "neutral"}
    >
      <div
        className="bloom-page flex min-h-[100dvh] w-full justify-center"
        data-contrast={accessibility.highContrast ? "high" : undefined}
        data-textsize={accessibility.largeText ? "large" : undefined}
        style={{ filter: preserveTrueColor ? "none" : getColorFilterValue(accessibility.colorProfile) }}
      >
        <div
          className={`flex min-h-[100dvh] w-full flex-col overflow-hidden shadow-2xl ${
            fullBleed ? "" : "gap-6 px-5 py-6 sm:px-8 sm:py-8"
          } ${contentClassName}`}
          style={{ maxWidth: "min(100vw, 75vh)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
