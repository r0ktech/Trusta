import { useState } from 'react';
import {
  CalendarCheck,
  Check,
  ClipboardList,
  Compass,
  Images,
  MapPinned,
  MessageSquareText,
  Scale,
  Star,
  UserRoundPlus,
  Inbox,
  TrendingUp,
  X,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { FAQS } from '../data/faqs';
import { Accordion } from '../components/ui/Accordion';
import { ButtonLink } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Reveal } from '../components/motion/Reveal';

const CUSTOMER_STEPS = [
  { icon: Compass, title: 'Discover local service providers', body: 'Search by service and choose your city. Browse providers who list your area in their coverage.' },
  { icon: Images, title: 'Review profiles and work samples', body: 'Look at completed jobs, specialties, experience and how long they have been on Trusta.' },
  { icon: Scale, title: 'Compare pricing and feedback', body: 'Check starting prices or whether they quote per job, and read what past customers said.' },
  { icon: CalendarCheck, title: 'Send booking requests', body: 'Pick a date and time window, describe the job and share a general area — not your full address.' },
  { icon: ClipboardList, title: 'Keep track of appointments', body: 'See pending, accepted, completed and cancelled requests in one dashboard, then leave a review.' },
];

const ARTISAN_STEPS = [
  { icon: UserRoundPlus, title: 'Create a professional profile', body: 'Add your skills, years of experience and a short description of how you work.' },
  { icon: MapPinned, title: 'List services and locations', body: 'Set your pricing type and the communities you cover, so customers nearby can find you.' },
  { icon: Images, title: 'Upload work samples', body: 'Photos of finished jobs help customers trust your skill before they call.' },
  { icon: Inbox, title: 'Receive customer enquiries', body: 'Accept or decline booking requests and reply to messages from your dashboard.' },
  { icon: TrendingUp, title: 'Build a reputation over time', body: 'Reviews from completed jobs grow your public track record.' },
];

const LIMITS = [
  ['Browsing, search, filters and sorting', true],
  ['Saving providers, booking requests and messages (stored in your browser)', true],
  ['Provider sign-up, profile editing and responding to requests (local demo)', true],
  ['Writing a review after a completed booking (local demo)', true],
  ['Identity or skills verification of providers', false],
  ['Delivering messages or booking requests to real people', false],
  ['Payments, escrow or refunds', false],
  ['Secure accounts and password storage', false],
  ['SMS, WhatsApp or email notifications', false],
  ['Moderated, fraud-resistant reviews', false],
];

function Steps({ steps }) {
  return (
    <Reveal as="ol" stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {steps.map(({ icon: Icon, title, body }, i) => (
        <li key={title} className="card card-lift flex gap-4 p-5 hover:shadow-lift">
          <div className="flex flex-col items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-brand">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-2 text-xs font-bold text-subtle">0{i + 1}</span>
          </div>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        </li>
      ))}
    </Reveal>
  );
}

export default function HowItWorksPage() {
  useDocumentTitle('How it works');
  const [audience, setAudience] = useState(() => (window.location.hash === '#artisans' ? 'artisans' : 'customers'));

  return (
    <div className="flex-1">
      <section className="border-b border-line bg-surface">
        <div className="container-page py-12 sm:py-16">
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold sm:text-5xl">A clearer way to find, compare and hire skilled hands.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Trusta puts the information you’d normally gather through phone calls and recommendations into one place — and is honest about what it
            can and can’t check yet.
          </p>
        </div>
      </section>

      <section id="artisans" className="container-page scroll-mt-24 py-12 sm:py-16" aria-labelledby="audience-heading">
        <h2 id="audience-heading" className="sr-only">
          Steps for each audience
        </h2>
        <Tabs
          label="Audience"
          value={audience}
          onChange={setAudience}
          tabs={[
            { value: 'customers', label: 'For customers' },
            { value: 'artisans', label: 'For artisans & providers' },
          ]}
        />
        <div className="mt-8" role="tabpanel">
          {audience === 'customers' ? <Steps steps={CUSTOMER_STEPS} /> : <Steps steps={ARTISAN_STEPS} />}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {audience === 'customers' ? (
            <ButtonLink to="/explore">Find an artisan</ButtonLink>
          ) : (
            <ButtonLink to="/become-a-provider">Create a provider profile</ButtonLink>
          )}
        </div>
      </section>

      <section id="limits" className="scroll-mt-24 border-y border-line bg-surface2/50 py-12 sm:py-16" aria-labelledby="limits-heading">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="limits-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">
              What works today, and what’s still coming
            </h2>
            <p className="mt-3 text-muted">
              This version of Trusta runs entirely in your browser with sample data. Some features are simulated so you can try the experience;
              others need a secure backend and haven’t been built yet.
            </p>
          </div>
          <ul className="card divide-y divide-line">
            {LIMITS.map(([label, ok]) => (
              <li key={label} className="flex items-start gap-3 px-5 py-3.5 text-sm">
                {ok ? (
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-brand">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                ) : (
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface2 text-subtle">
                    <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
                <span className={ok ? 'text-ink' : 'text-muted'}>
                  <span className="sr-only">{ok ? 'Available in preview: ' : 'Not available yet: '}</span>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16" aria-labelledby="trust-signals-heading">
        <h2 id="trust-signals-heading" className="text-2xl font-extrabold sm:text-3xl">
          Reading a profile
        </h2>
        <Reveal stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            [Star, 'Ratings & distribution', 'Look beyond the average. A spread of honest 4s and 5s across many jobs often says more than a perfect score from two.'],
            [Images, 'Work samples', 'Check whether past jobs match the kind and size of work you need.'],
            [MessageSquareText, 'Review details', 'Reviews show the service and date, so you can see recent, relevant feedback.'],
          ].map(([Icon, t, b]) => (
            <div key={t} className="card-lift rounded-2xl border border-line p-5 hover:border-accent/40 hover:shadow-card">
              <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="mt-3 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{b}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section id="faq" className="scroll-mt-24 border-t border-line py-12 sm:py-16" aria-labelledby="faq-h">
        <div className="container-page max-w-3xl">
          <h2 id="faq-h" className="text-2xl font-extrabold sm:text-3xl">
            Frequently asked questions
          </h2>
          <Accordion items={FAQS} className="mt-6" defaultOpen="verification" />
        </div>
      </section>
    </div>
  );
}
