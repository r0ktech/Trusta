import { useId } from 'react';

// Geometric fills drawn from adire (Yoruba indigo resist-dye) motifs.
// Rendered as an absolutely positioned SVG layer behind content.
const MOTIFS = {
  // Concentric rings — the "oniko" tie-dye circle
  rings: (c) => (
    <>
      <circle cx="20" cy="20" r="14" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="20" cy="20" r="8" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="20" cy="20" r="2.5" fill={c} />
    </>
  ),
  // Stitched ladders — "alabere" machine-stitch resist
  stitch: (c) => (
    <>
      <path d="M0 10h40M0 30h40" stroke={c} strokeWidth="2" strokeDasharray="4 4" />
      <path d="M10 0v40M30 0v40" stroke={c} strokeWidth="1" opacity="0.6" />
    </>
  ),
  // Scales / leaves
  leaves: (c) => (
    <>
      <path d="M0 20q10-16 20 0q10-16 20 0" fill="none" stroke={c} strokeWidth="2" />
      <path d="M-20 40q10-16 20 0q10-16 20 0q10-16 20 0" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="20" cy="8" r="1.8" fill={c} />
    </>
  ),
  // Checkered dots — starch-paste "eleko" grid
  dots: (c) => (
    <>
      <rect x="4" y="4" width="12" height="12" rx="2" fill={c} />
      <rect x="24" y="24" width="12" height="12" rx="2" fill={c} />
      <circle cx="30" cy="10" r="2.5" fill={c} />
      <circle cx="10" cy="30" r="2.5" fill={c} />
    </>
  ),
};

export const MOTIF_NAMES = Object.keys(MOTIFS);

export function AdirePattern({ color, motif = 'rings', scale = 1, className = '' }) {
  const id = useId().replace(/:/g, '');
  const draw = MOTIFS[motif] ?? MOTIFS.rings;
  const size = 40 * scale;
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <pattern id={`adire-${id}`} width={size} height={size} patternUnits="userSpaceOnUse">
          <g transform={`scale(${scale})`}>{draw(color)}</g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#adire-${id})`} />
    </svg>
  );
}
