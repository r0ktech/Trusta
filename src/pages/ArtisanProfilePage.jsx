import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase,
  CalendarCheck,
  ChevronRight,
  Clock,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  ShieldAlert,
  UserX,
  PenLine,
} from 'lucide-react';
import { useArtisan } from '../hooks/useArtisans';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMessages } from '../context/MessagesContext';
import { useBookings } from '../context/BookingsContext';
import { useToast } from '../context/ToastContext';
import { getCategory } from '../data/categories';
import { Avatar } from '../components/ui/Avatar';
import { Button, ButtonLink } from '../components/ui/Button';
import { DemoTag } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Notice } from '../components/ui/Notice';
import { RatingSummaryInline } from '../components/ui/StarRating';
import { VerificationBadge } from '../components/artisans/VerificationBadge';
import { AvailabilityBadge } from '../components/artisans/AvailabilityBadge';
import { SaveButton } from '../components/artisans/SaveButton';
import { CategoryIcon } from '../components/artisans/CategoryIcon';
import { PortfolioGallery } from '../components/artisans/PortfolioGallery';
import { ReviewSummary } from '../components/reviews/ReviewSummary';
import { ReviewItem } from '../components/reviews/ReviewItem';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { BookingModal } from '../components/bookings/BookingModal';
import { CONTACT_LABELS, PRICING_LABELS, formatDate, formatNaira, formatPrice, cn } from '../utils/format';
import { shareOrCopy } from '../utils/share';
import { AdirePattern } from '../components/ui/AdirePattern';
import { tone } from '../components/ui/tones';
import { Reveal } from '../components/ui/Motion';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REVIEWS_STEP = 5;

function Section({ id, title, children, action }) {
  return (
    <Reveal as="section" aria-labelledby={id} className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={id} className="text-lg font-bold">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Reveal>
  );
}

export default function ArtisanProfilePage() {
  const { id } = useParams();
  const artisan = useArtisan(id);
  useDocumentTitle(artisan ? artisan.name : 'Provider not found');

  if (!artisan) {
    return (
      <div className="container-page flex-1 py-16">
        <EmptyState icon={UserX} title="We couldn’t find this provider" description="The profile may have been removed, or the link might be wrong. Try searching for the service you need instead.">
          <ButtonLink to="/explore">Browse providers</ButtonLink>
          <ButtonLink to="/" variant="secondary">
            Go home
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return <Profile artisan={artisan} />;
}

function Profile({ artisan }) {
  const navigate = useNavigate();
  const { startConversation } = useMessages();
  const { customerBookings } = useBookings();
  const { toast } = useToast();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [reviewLimit, setReviewLimit] = useState(REVIEWS_STEP);

  const category = getCategory(artisan.category);
  const paint = tone(category?.tone);
  const price = formatPrice(artisan);

  const filteredReviews = useMemo(
    () => (ratingFilter ? artisan.reviews.filter((r) => r.rating === ratingFilter) : artisan.reviews),
    [artisan.reviews, ratingFilter],
  );

  const reviewable = customerBookings.find((b) => b.artisanId === artisan.id && b.status === 'completed' && !b.reviewed);
  const hasAnyBooking = customerBookings.some((b) => b.artisanId === artisan.id);

  const message = () => {
    const convId = startConversation(artisan);
    navigate(`/messages?c=${convId}`);
  };

  const share = async () => {
    const result = await shareOrCopy({
      title: `${artisan.name} on Trusta`,
      text: `${artisan.name} — ${category?.provider} in ${artisan.city}`,
      url: window.location.href,
    });
    if (result === 'copied') toast({ title: 'Link copied', description: 'Profile link copied to your clipboard.' });
    if (result === 'failed') toast({ title: 'Couldn’t share', description: 'Copy the address from your browser bar instead.', variant: 'error' });
  };

  const writeReview = () => {
    if (reviewable) setReviewBooking(reviewable);
    else
      toast({
        title: 'Reviews follow completed bookings',
        description: hasAnyBooking
          ? 'Once your booking with this provider is marked completed, you can review it from here or My bookings.'
          : 'Request a booking first. After it’s marked completed, you can leave a review.',
        variant: 'info',
        duration: 6000,
      });
  };

  return (
    <div className="flex-1 pb-28 lg:pb-0">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container-page pt-5">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <li>
            <Link to="/explore" className="hover:text-ink">
              Discover
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4 text-subtle" />
          </li>
          <li>
            <Link to={`/explore?category=${artisan.category}`} className="hover:text-ink">
              {category?.name}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4 text-subtle" />
          </li>
          <li aria-current="page" className="truncate font-medium text-ink">
            {artisan.name}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="container-page mt-5">
        <div className="card overflow-hidden">
          <div className="relative h-28 overflow-hidden sm:h-40" style={{ backgroundColor: paint.board, color: paint.ink }} aria-hidden="true">
            <AdirePattern color={paint.pattern} motif="rings" scale={1.1} />
            <p className="font-sign absolute bottom-3 right-5 hidden text-3xl font-extrabold uppercase leading-none opacity-90 sm:block">{category?.board}</p>
          </div>
          <div className="relative flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-5 sm:px-7 sm:pb-7">
            <Avatar name={artisan.name} src={artisan.profileImage} size="xl" rounded="xl" className="-mt-12 ring-4 ring-surface sm:-mt-14" />
            <div className="min-w-0 flex-1 sm:pt-5">
              <div className="flex flex-wrap items-center gap-2">
                {artisan.isLocal ? <DemoTag>Your listing · local preview</DemoTag> : <DemoTag>Demo profile</DemoTag>}
                <VerificationBadge status={artisan.verificationStatus} />
              </div>
              <h1 className="mt-2 text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[2.5rem]">{artisan.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CategoryIcon category={artisan.category} className="h-4 w-4" />
                  {category?.provider}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {artisan.city}, {artisan.state}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <a href="#reviews" className="hover:underline">
                  <RatingSummaryInline rating={artisan.rating} count={artisan.reviewCount} />
                </a>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                  {artisan.yearsOfExperience} years experience
                </span>
                <AvailabilityBadge status={artisan.availability?.status} className="text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={share} aria-label="Share profile">
                <Share2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <SaveButton artisan={artisan} withLabel />
            </div>
          </div>
        </div>
      </header>

      <div className="container-page mt-6 grid grid-cols-1 gap-6 pb-12 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Section id="about" title="About">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{artisan.bio}</p>
            {artisan.isDemo && !artisan.isLocal && (
              <p className="mt-3 text-xs text-subtle">This is a fictional profile created to demonstrate Trusta. It does not represent a real person.</p>
            )}
            <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted">Specialties</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {artisan.specialties.map((s) => (
                    <span key={s} className="rounded-full border border-line bg-surface2 px-2.5 py-1 text-sm">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Service areas</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {artisan.serviceAreas.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-sm">
                      <MapPin className="h-3 w-3 text-subtle" aria-hidden="true" />
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
              {artisan.languages?.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-muted">Languages</dt>
                  <dd className="mt-2 flex items-center gap-2 text-sm text-ink">
                    <Languages className="h-4 w-4 text-subtle" aria-hidden="true" />
                    {artisan.languages.join(', ')}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted">On Trusta since</dt>
                <dd className="mt-2 text-sm text-ink">{formatDate(artisan.joinedAt, { month: 'long', year: 'numeric' })}</dd>
              </div>
            </dl>
          </Section>

          <Section id="services" title="Services & pricing">
            <ul className="divide-y divide-line">
              {(artisan.services?.length
                ? artisan.services.map((s) => ({ name: s.name, price: s.pricingType === 'quote' || s.price == null ? 'Quote' : formatNaira(s.price) }))
                : artisan.specialties.map((s, i) => ({ name: s, price: i === 0 && artisan.startingPrice ? price : 'Quote on request' }))
              ).map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="text-[15px] text-ink">{s.name}</span>
                  <span className="shrink-0 text-sm font-medium text-muted">{s.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-subtle">
              Prices are illustrative sample values. Final cost depends on the job, materials and distance — agree the full price before work begins.
            </p>
          </Section>

          <Section id="portfolio" title="Work samples">
            <PortfolioGallery items={artisan.portfolio} category={artisan.category} />
          </Section>

          <section id="reviews" aria-labelledby="reviews-heading" className="card scroll-mt-24 p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 id="reviews-heading" className="text-lg font-bold">
                  Reviews
                </h2>
                {artisan.reviews.some((r) => r.isSample) && <DemoTag>Sample reviews</DemoTag>}
              </div>
              <Button variant="secondary" size="sm" onClick={writeReview}>
                <PenLine className="h-4 w-4" aria-hidden="true" />
                Write a review
              </Button>
            </div>
            {artisan.reviews.length ? (
              <>
                <ReviewSummary
                  reviews={artisan.reviews}
                  activeRating={ratingFilter}
                  onSelectRating={(r) => {
                    setRatingFilter(r);
                    setReviewLimit(REVIEWS_STEP);
                  }}
                />
                <div className="mt-6 border-t border-line pt-5">
                  {ratingFilter && (
                    <div className="mb-4 flex items-center justify-between rounded-lg bg-surface2 px-3 py-2 text-sm">
                      <span>
                        Showing {filteredReviews.length} {ratingFilter}-star {filteredReviews.length === 1 ? 'review' : 'reviews'}
                      </span>
                      <button type="button" className="font-semibold text-brand hover:underline" onClick={() => setRatingFilter(null)}>
                        Show all
                      </button>
                    </div>
                  )}
                  <div className="divide-y divide-line">
                    {filteredReviews.slice(0, reviewLimit).map((r) => (
                      <ReviewItem key={r.id} review={r} category={artisan.category} />
                    ))}
                  </div>
                  {reviewLimit < filteredReviews.length && (
                    <Button variant="secondary" block className="mt-5" onClick={() => setReviewLimit((n) => n + REVIEWS_STEP)}>
                      Show more reviews ({filteredReviews.length - reviewLimit} more)
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <EmptyState compact icon={PenLine} title="No reviews yet" description="Reviews appear here after customers complete a booking." />
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Booking and contact">
          <div className="card p-5">
            <p className="text-sm font-medium text-muted">{PRICING_LABELS[artisan.pricingType]}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{price}</p>
            {artisan.priceUnit && artisan.pricingType !== 'quote' && <p className="text-sm text-muted">{artisan.priceUnit}</p>}
            <div className="mt-5 hidden space-y-2 lg:block">
              <Button block size="lg" onClick={() => setBookingOpen(true)}>
                <CalendarCheck className="h-[18px] w-[18px]" aria-hidden="true" />
                Request a Booking
              </Button>
              <Button block variant="secondary" onClick={message}>
                <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                Send Message
              </Button>
            </div>
            <p className="mt-3 text-xs text-subtle">Requests and messages are simulated in this preview.</p>
          </div>

          <div className="card divide-y divide-line">
            <div className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <Clock className="h-4 w-4 text-subtle" aria-hidden="true" />
                Availability
              </h2>
              <AvailabilityBadge status={artisan.availability?.status} className="mt-2" />
              {artisan.availability?.note && <p className="mt-1 text-sm text-muted">{artisan.availability.note}</p>}
              <ul className="mt-3 grid grid-cols-7 gap-1" aria-label="Working days">
                {ALL_DAYS.map((d) => {
                  const on = artisan.availability?.days?.includes(d);
                  return (
                    <li
                      key={d}
                      className={cn(
                        'rounded-md py-1.5 text-center text-[11px] font-semibold',
                        on ? 'bg-accent-soft text-brand' : 'bg-surface2 text-subtle line-through',
                      )}
                      aria-label={`${d}: ${on ? 'working' : 'not working'}`}
                    >
                      {d.slice(0, 2)}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-sm text-muted">{artisan.availability?.hours}</p>
              <p className="mt-2 text-xs text-subtle">As stated by the provider — not live availability.</p>
            </div>
            <div className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <Phone className="h-4 w-4 text-subtle" aria-hidden="true" />
                Preferred contact
              </h2>
              <p className="mt-2 text-sm text-ink">{CONTACT_LABELS[artisan.contactPreference] ?? 'In-app message'}</p>
              <p className="mt-1 text-xs text-subtle">Phone and WhatsApp details will be shared after a booking is accepted once the live service launches.</p>
            </div>
          </div>

          <Notice tone="info" title="Hiring safely">
            Agree the scope and full price before work starts, avoid large upfront payments, and keep records of what was agreed.{' '}
            <Link to="/legal/safety" className="link">
              Safety tips
            </Link>
          </Notice>
          {artisan.verificationStatus === 'verified' && (
            <p className="flex gap-2 px-1 text-xs text-subtle">
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              The “Verified” badge on this demo profile is sample data. Trusta hasn’t launched verification yet.
            </p>
          )}
        </aside>
      </div>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-content gap-2">
          <Button variant="secondary" onClick={message} aria-label="Send message" className="px-3.5">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button className="min-w-0 flex-1" onClick={() => setBookingOpen(true)}>
            <CalendarCheck className="h-[18px] w-[18px]" aria-hidden="true" />
            Request a Booking
          </Button>
        </div>
      </div>

      <BookingModal artisan={artisan} open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <ReviewModal booking={reviewBooking} open={!!reviewBooking} onClose={() => setReviewBooking(null)} />
    </div>
  );
}
