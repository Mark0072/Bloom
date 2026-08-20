import Image from "next/image";
import type { BrandTheme } from "@/lib/brandTheme";

interface BrandLogoProps {
  theme: BrandTheme;
  inverse?: boolean;
  className?: string;
}

/**
 * The text stays behind the transparent logo so the brand remains identifiable while
 * local campaign assets are loading or when an asset is unavailable on a kiosk.
 */
export default function BrandLogo({ theme, inverse = false, className = "" }: BrandLogoProps) {
  return (
    <div
      role="img"
      aria-label={theme.name}
      className={`relative flex min-h-10 min-w-28 items-center ${className}`}
    >
      <span
        aria-hidden="true"
        className={`text-2xl font-black tracking-tight ${inverse ? "text-white" : "text-[var(--brand-primary)]"}`}
      >
        {theme.name}
      </span>
      <Image
        aria-hidden="true"
        src={inverse ? theme.inverseLogo : theme.logo}
        alt=""
        fill
        sizes="240px"
        className="object-contain object-left"
      />
    </div>
  );
}
