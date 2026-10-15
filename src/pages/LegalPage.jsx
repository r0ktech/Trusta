import { Link, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { EmptyState } from '../components/ui/EmptyState';
import { ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';

// Placeholder legal copy. Real terms and privacy policy must be drafted with
// legal counsel (including NDPA 2023 obligations) before launch.
const DOCS = {
  terms: {
    title: 'Terms of use',
    sections: [
      ['About this preview', 'Trusta is currently a preview. Provider listings, reviews and bookings are sample data used to demonstrate the product.'],
      ['Your relationship with providers', 'Trusta helps you discover providers. Any agreement for work, price or payment is between you and the provider. Trusta does not employ providers and does not guarantee their work.'],
      ['Acceptable use', 'Don’t post false information, impersonate others, or use the platform to harass anyone. Reviews should reflect genuine experiences.'],
      ['Changes', 'These terms will be finalised before Trusta launches publicly.'],
    ],
  },
  privacy: {
    title: 'Privacy policy',
    sections: [
      ['What this preview stores', 'Everything you enter — your demo session, saved providers, bookings, reviews, messages and preferences — is stored in your browser’s local storage. It is not sent to a server.'],
      ['Passwords', 'This preview never stores passwords. Sign-in is simulated.'],
      ['Location', 'We do not request your device location. You choose your city manually.'],
      ['Clearing your data', 'You can remove all stored data at any time from Settings → Reset all demo data, or by clearing site data in your browser.'],
    ],
  },
  safety: {
    title: 'Safety tips',
    sections: [
      ['Compare before you choose', 'Look at more than one provider. Check their work samples, how recent their reviews are, and whether they cover your area.'],
      ['Agree the details first', 'Agree the scope, total price, materials and timeline before work starts. Keep a written record — a message is fine.'],
      ['Be careful with payments', 'Avoid paying large amounts upfront. Pay for materials against receipts where possible, and pay the balance when the job is done.'],
      ['Home visits', 'Share your exact address only once you’ve agreed to the job. Where possible, have someone else at home during the visit.'],
      ['If something feels wrong', 'You can decline or cancel at any time. Trust your instincts.'],
    ],
  },
};

export default function LegalPage() {
  const { doc } = useParams();
  const page = DOCS[doc];
  useDocumentTitle(page?.title ?? 'Page not found');

  if (!page) {
    return (
      <div className="container-page flex-1 py-16">
        <EmptyState icon={FileText} title="Document not found" description="We couldn’t find that page.">
          <ButtonLink to="/">Go home</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container-page flex-1 py-10 sm:py-14">
      <article className="mx-auto max-w-2xl">
        <h1 className="mt-2 text-3xl font-extrabold">{page.title}</h1>
        {doc !== 'safety' && (
          <Notice tone="warn" className="mt-5">
            Draft placeholder for the preview build. The final version will be prepared before launch.
          </Notice>
        )}
        <div className="mt-8 space-y-7">
          {page.sections.map(([h, p]) => (
            <section key={h}>
              <h2 className="text-lg font-bold">{h}</h2>
              <p className="mt-2 leading-relaxed text-muted">{p}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          See also:{' '}
          {Object.entries(DOCS)
            .filter(([k]) => k !== doc)
            .map(([k, d], i) => (
              <span key={k}>
                {i > 0 && ' · '}
                <Link to={`/legal/${k}`} className="link">
                  {d.title}
                </Link>
              </span>
            ))}
        </p>
      </article>
    </div>
  );
}
