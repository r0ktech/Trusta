import { Reveal } from '../motion/Reveal';
import { BadgeCheck, Images, MessageSquareText, ReceiptText } from 'lucide-react';

const ITEMS = [
  {
    icon: BadgeCheck,
    title: 'Profile verification',
    body: 'Verification checks are on our roadmap. Until then, every badge you see is clearly marked as a demo.',
  },
  {
    icon: MessageSquareText,
    title: 'Ratings & reviews',
    body: 'See how past customers rated punctuality, quality and price before you call anyone.',
  },
  {
    icon: Images,
    title: 'Work portfolios',
    body: 'Look at completed jobs — wardrobes, wiring, tiling, outfits — not just a phone number.',
  },
  {
    icon: ReceiptText,
    title: 'Clear service information',
    body: 'Starting prices, pricing type, areas covered and working days, all in one place.',
  },
];

export function TrustStrip() {
  return (
    <section aria-labelledby="trust-heading" className="border-b border-line bg-surface">
      <div className="container-page py-12">
        <h2 id="trust-heading" className="sr-only">
          What you can check before hiring
        </h2>
        <Reveal as="ul" stagger className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="group flex gap-4 lg:flex-col lg:gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-brand transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
