import { Hero } from '../components/home/Hero';
import { TrustStrip } from '../components/home/TrustStrip';
import {
  PopularCategories,
  RecommendedArtisans,
  HowItWorksSteps,
  ProviderCTA,
  NearbyServices,
  RecentlyAdded,
} from '../components/home/HomeSections';
import { SectionHeading } from '../components/home/SectionHeading';
import { Accordion } from '../components/ui/Accordion';
import { Reveal } from '../components/motion/Reveal';
import { FAQS } from '../data/faqs';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle();
  return (
    <>
      <Hero />
      <TrustStrip />
      <PopularCategories />
      <RecommendedArtisans />
      <HowItWorksSteps />
      <ProviderCTA />
      <NearbyServices />
      <RecentlyAdded />
      <section aria-labelledby="faq-heading" className="border-t border-line py-16 sm:py-20">
        <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading
            id="faq-heading"
            title="Questions people ask"
            description="Straight answers about what Trusta does today — and what it doesn’t do yet."
            action={{ to: '/how-it-works#faq', label: 'All FAQs' }}
            className="sm:flex-col sm:items-start lg:sticky lg:top-24 lg:self-start"
          />
          <Reveal>
            <Accordion items={FAQS.slice(0, 5)} defaultOpen="verification" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
