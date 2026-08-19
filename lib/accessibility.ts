import type { ColorProfile } from "@/types";

/** CSS `filter` value for a given color-blindness/grayscale profile. "none" is a real no-op filter. */
export function getColorFilterValue(profile: ColorProfile): string {
  switch (profile) {
    case "protanopia":
      return "url(#bloom-filter-protanopia)";
    case "deuteranopia":
      return "url(#bloom-filter-deuteranopia)";
    case "tritanopia":
      return "url(#bloom-filter-tritanopia)";
    case "grayscale":
      return "grayscale(1)";
    default:
      return "none";
  }
}
