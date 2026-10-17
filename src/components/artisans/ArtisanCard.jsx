import { Link } from 'react-router-dom';
import { MapPin, Briefcase, ChevronRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { RatingSummaryInline } from '../ui/StarRating';
import { DemoTag } from '../ui/Badge';
import { VerificationBadge } from './VerificationBadge';
import { AvailabilityBadge } from './AvailabilityBadge';
import { SaveButton } from './SaveButton';
import { CategoryIcon } from './CategoryIcon';
import { getCategory } from '../../data/categories';
import { cn, formatPrice } from '../../utils/format';
import { buttonClasses } from '../ui/Button';
import { WorkSampleTile } from './WorkSampleTile';

export function ArtisanCard({ artisan, layout = 'grid', className }) {
  const category = getCategory(artisan.category);
  const href = `/artisan/${artisan.id}`;
  const price = formatPrice(artisan);
  const isQuote = price === 'Request a quote';

  if (layout === 'list') {
    return (
      <article className={cn('card card-lift group relative flex flex-col gap-4 p-4 hover:shadow-lift sm:flex-row sm:items-center sm:p-5', className)}>
        <div className="flex min-w-0 flex-1 gap-4">
          <Avatar name={artisan.name} src={artisan.profileImage} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="truncate text-base font-bold">
                <Link to={href} className="after:absolute after:inset-0 hover:underline">
                  {artisan.name}
                </Link>
              </h3>
              <VerificationBadge status={artisan.verificationStatus} />
              {artisan.isLocal && <DemoTag>Your listing</DemoTag>}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
              <CategoryIcon category={artisan.category} className="h-4 w-4" />
              {category?.provider}
              <span aria-hidden="true">·</span>
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {artisan.city}, {artisan.state}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <RatingSummaryInline rating={artisan.rating} count={artisan.reviewCount} />
              <span className="inline-flex items-center gap-1 text-sm text-muted">
                <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                {artisan.yearsOfExperience} yrs experience
              </span>
              <AvailabilityBadge status={artisan.availability?.status} />
            </div>
            {artisan.specialties?.length > 0 && (
              <p className="mt-2 line-clamp-1 text-sm text-muted">{artisan.specialties.join(' · ')}</p>
            )}
          </div>
        </div>
        <div className="relative flex items-center justify-between gap-3 border-t border-line pt-3 sm:w-48 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <p className={cn('text-sm font-semibold', isQuote ? 'text-muted' : 'text-ink')}>
            {price}
            {!isQuote && artisan.priceUnit && artisan.pricingType !== 'hourly' && (
              <span className="block text-xs font-normal text-subtle sm:text-right">{artisan.priceUnit}</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <SaveButton artisan={artisan} />
            <span className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'pointer-events-none hidden sm:inline-flex' })}>
              View profile
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn('card card-lift group relative flex flex-col overflow-hidden hover:shadow-lift', className)}>
      <div className="grid grid-cols-3 gap-0.5 bg-line [&>*>*]:transition-transform [&>*>*]:duration-500 group-hover:[&>*>*]:scale-[1.06]" aria-hidden="true">
        {(artisan.portfolio?.length ? artisan.portfolio : [{ id: `${artisan.id}-x`, title: '', tone: 0 }]).slice(0, 3).map((p, i, arr) => (
          <WorkSampleTile
            key={p.id}
            item={p}
            category={artisan.category}
            showCaption={false}
            showIcon={false}
            className={cn('rounded-none', arr.length === 1 && 'col-span-3 [&>div]:aspect-[4/1] [&>img]:aspect-[4/1]')}
          />
        ))}
      </div>
      <SaveButton artisan={artisan} className="absolute right-3 top-3 z-10 border-transparent bg-surface/90 shadow-card backdrop-blur" />

      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="relative z-[1] -mt-7">
          <Avatar name={artisan.name} src={artisan.profileImage} size="lg" rounded="xl" className="ring-4 ring-surface" />
        </div>
        {(artisan.verificationStatus !== 'unverified' || artisan.isLocal) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <VerificationBadge status={artisan.verificationStatus} />
            {artisan.isLocal && <DemoTag>Your listing</DemoTag>}
          </div>
        )}

        <h3 className="mt-2.5 text-[1.0625rem] font-bold leading-snug">
          <Link to={href} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
            {artisan.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-muted">
          {category?.provider} in {artisan.city}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <RatingSummaryInline rating={artisan.rating} count={artisan.reviewCount} />
          <span className="inline-flex items-center gap-1 text-sm text-muted">
            <Briefcase className="h-3.5 w-3.5 text-subtle" aria-hidden="true" />
            {artisan.yearsOfExperience} yrs
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 truncate text-sm text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden="true" />
          <span className="truncate">Covers {artisan.serviceAreas?.slice(0, 3).join(', ')}</span>
        </p>

        <div className="flex-1" />
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className={cn('font-display text-base font-bold', isQuote ? 'text-muted' : 'text-ink')}>{price}</p>
            <AvailabilityBadge status={artisan.availability?.status} className="mt-1" />
          </div>
          <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand">
            View profile
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}
