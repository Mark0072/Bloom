/**
 * SVG color-matrix filters for the visual accessibility profiles, mounted once and referenced
 * elsewhere via `filter: url(#bloom-filter-...)`. Kept invisible (0x0, aria-hidden) — this element
 * has no visual presence of its own.
 */
export default function ColorFilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="bloom-filter-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0
                    0.558 0.442 0 0 0
                    0     0.242 0.758 0 0
                    0     0     0     1 0"
          />
        </filter>
        <filter id="bloom-filter-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0
                    0.7   0.3   0 0 0
                    0     0.3   0.7 0 0
                    0     0     0   1 0"
          />
        </filter>
        <filter id="bloom-filter-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05  0     0 0
                    0    0.433 0.567 0 0
                    0    0.475 0.525 0 0
                    0    0     0     1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
