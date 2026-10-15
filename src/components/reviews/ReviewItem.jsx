import { ImageIcon } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Stars } from '../ui/StarRating';
import { DemoTag } from '../ui/Badge';
import { formatDate } from '../../utils/format';

export function ReviewItem({ review, category }) {
  return (
    <article className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Avatar name={review.author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-semibold text-ink">{review.author}</p>
            {review.isSample ? <DemoTag>Sample review</DemoTag> : <DemoTag>Saved on this device</DemoTag>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <Stars value={review.rating} />
            <span aria-hidden="true">·</span>
            <time dateTime={review.date}>{formatDate(review.date)}</time>
            {review.service && (
              <>
                <span aria-hidden="true">·</span>
                <span className="rounded-md bg-surface2 px-1.5 py-0.5 text-xs">{review.service}</span>
              </>
            )}
          </div>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink">{review.text}</p>
          {review.photo && <img src={review.photo} alt={`Work photo shared with review by ${review.author}`} className="mt-3 h-28 w-36 rounded-lg object-cover" loading="lazy" />}
          {!review.photo && review.hasPhoto && (
            <div className="mt-3 flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line bg-surface2 text-subtle" title="Sample review photo placeholder">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px]">{category ? 'Work photo' : 'Photo'}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
