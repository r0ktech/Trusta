import { useState } from 'react';
import { CategoryIcon } from './CategoryIcon';
import { AdirePattern, MOTIF_NAMES } from '../ui/AdirePattern';
import { tone } from '../ui/tones';
import { getCategory } from '../../data/categories';
import { cn } from '../../utils/format';

// Placeholder treatment for work samples without photography: the category's
// paint colour with an adire motif. Pure SVG, so it costs nothing on slow networks.

export function WorkSampleTile({ item, category, className, showCaption = true, showIcon = true, onClick }) {
  const [failed, setFailed] = useState(false);
  const Tag = onClick ? 'button' : 'div';
  const hasImage = item.image && !failed;
  const t = tone(getCategory(category)?.tone);

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn('group relative block w-full overflow-hidden rounded-xl text-left', onClick && 'cursor-zoom-in', className)}
      aria-label={onClick ? `View ${item.title}` : undefined}
    >
      {hasImage ? (
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="relative flex aspect-[4/3] w-full items-center justify-center" style={{ backgroundColor: t.board, color: t.ink }}>
          <AdirePattern color={t.pattern} motif={MOTIF_NAMES[(item.tone ?? 0) % MOTIF_NAMES.length]} scale={0.8} />
          {showIcon && (
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: t.board }}>
              <CategoryIcon category={category} className="h-6 w-6" />
            </span>
          )}
          <span className="sr-only">{item.title} — illustration placeholder</span>
        </div>
      )}
      {showCaption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8">
          <p className="truncate text-sm font-semibold text-white">{item.title}</p>
          {item.location && <p className="truncate text-xs text-white/75">{item.location}</p>}
        </div>
      )}
    </Tag>
  );
}
