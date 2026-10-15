import { useState } from 'react';
import { cn, initials } from '../../utils/format';

// Earthy palette for initial avatars — consistent per name.
const PALETTE = [
  ['#E6F0EA', '#1F5A48'],
  ['#F3EBDD', '#7A4E12'],
  ['#E7ECF4', '#2F4C7A'],
  ['#F4E6E3', '#8A3B2E'],
  ['#ECE8F3', '#5A3F86'],
  ['#E3F0EF', '#1E6563'],
  ['#F1EEDC', '#6A5D12'],
];

const hash = (s = '') => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const SIZES = {
  xs: 'h-8 w-8 text-xs',
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl sm:h-28 sm:w-28',
};

export function Avatar({ name, src, size = 'md', className, rounded = 'full' }) {
  const [failed, setFailed] = useState(false);
  const [bg, fg] = PALETTE[hash(name) % PALETTE.length];
  const shape = rounded === 'full' ? 'rounded-full' : 'rounded-2xl';

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn('shrink-0 object-cover', SIZES[size], shape, className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 select-none items-center justify-center font-display font-bold', SIZES[size], shape, className)}
      style={{ backgroundColor: bg, color: fg }}
    >
      {initials(name)}
    </span>
  );
}
