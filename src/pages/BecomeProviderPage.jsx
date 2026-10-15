import { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Images, MapPinned, Star, UserRoundCheck, LayoutDashboard } from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { DetailsFields, ServiceFields, DETAILS_FIELDS, SERVICE_FIELDS, PROVIDER_DEFAULTS, toProfile } from '../components/provider/ProviderFormFields';
import { ProfilePhotoInput, PortfolioInput } from '../components/forms/ImageUploads';
import { Button, ButtonLink } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Field';
import { Notice } from '../components/ui/Notice';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { getCategory } from '../data/categories';
import { PRICING_LABELS, CONTACT_LABELS, formatNaira, cn } from '../utils/format';

const STEPS = [
  { id: 'details', title: 'About you', fields: DETAILS_FIELDS },
  { id: 'services', title: 'Your services', fields: SERVICE_FIELDS },
  { id: 'showcase', title: 'Photos & confirm', fields: ['terms'] },
];

const BENEFITS = [
  [UserRoundCheck, 'A professional profile', 'One link that shows your skills, experience and how you price your work.'],
  [Images, 'Showcase completed projects', 'Photos of finished jobs speak louder than a business card.'],
  [MapPinned, 'Reach nearby customers', 'Appear when people search for your service in the communities you cover.'],
  [Star, 'Grow your reputation', 'Customer feedback from completed jobs builds a public track record.'],
];

export default function BecomeProviderPage() {
  useDocumentTitle('Become a provider');
  const { profile, createProfile, deleteProfile } = useProvider();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const formTop = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: { ...PROVIDER_DEFAULTS, name: user?.name ?? '', email: user?.email ?? '', profileImage: null, portfolio: [], terms: false },
  });

  const scrollToForm = () => formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const next = async () => {
    const ok = await trigger(STEPS[step].fields);
    if (!ok) {
      toast({ title: 'Please check the highlighted fields', variant: 'error' });
      return;
    }
    setStep((s) => s + 1);
    scrollToForm();
  };

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 700));
    const { terms, ...rest } = values;
    createProfile({ ...toProfile(rest), profileImage: values.profileImage, portfolio: values.portfolio });
    toast({ title: 'Provider profile created', description: 'Saved on this device. Customers can’t see it yet.' });
    navigate('/provider/dashboard');
  };

  const fieldProps = { register, control, errors, watch, setValue };

  return (
    <div className="flex-1">
      <section className="border-b border-line bg-surface">
        <div className="container-page grid grid-cols-1 gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Get found by customers who need your skill.</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              Create a free Trusta profile in a few minutes. No ID documents or bank details needed to get started.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={scrollToForm}>
                Start registration
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <ButtonLink to="/how-it-works#artisans" size="lg" variant="secondary">
                How it works
              </ButtonLink>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BENEFITS.map(([Icon, title, body]) => (
              <li key={title} className="rounded-2xl border border-line bg-canvas p-4">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-2.5 text-[15px] font-bold">{title}</h2>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section ref={formTop} className="container-page scroll-mt-20 py-10 sm:py-14" aria-labelledby="register-heading">
        <div className="mx-auto max-w-3xl">
          {profile && (
            <Notice tone="info" title="You already have a provider profile on this device" className="mb-6">
              <p>
                {profile.name} · {getCategory(profile.category)?.name}. Registering again will replace it.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ButtonLink to="/provider/dashboard" size="sm">
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  Go to dashboard
                </ButtonLink>
              </div>
            </Notice>
          )}

          <h2 id="register-heading" className="text-2xl font-extrabold">
            Create your provider profile
          </h2>
          <p className="mt-1 text-muted">Fields marked * are required.</p>

          {/* Stepper */}
          <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Registration progress">
            {STEPS.map((s, i) => (
              <li key={s.id} aria-current={i === step ? 'step' : undefined}>
                <div className={cn('h-1.5 rounded-full', i <= step ? 'bg-primary' : 'bg-line')} />
                <p className={cn('mt-2 flex items-center gap-1.5 text-xs font-semibold sm:text-sm', i <= step ? 'text-ink' : 'text-subtle')}>
                  {i < step ? <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> : <span className="text-subtle">{i + 1}.</span>}
                  {s.title}
                </p>
              </li>
            ))}
          </ol>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="card mt-6 p-5 sm:p-8">
            {step === 0 && <DetailsFields {...fieldProps} />}
            {step === 1 && <ServiceFields {...fieldProps} />}
            {step === 2 && (
              <div className="space-y-7">
                <div>
                  <h3 className="mb-3 text-sm font-semibold">
                    Profile photo <span className="font-normal text-subtle">(optional)</span>
                  </h3>
                  <Controller name="profileImage" control={control} render={({ field }) => <ProfilePhotoInput value={field.value} onChange={field.onChange} name={watch('name')} />} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Work samples <span className="font-normal text-subtle">(optional, up to 6)</span>
                  </h3>
                  <p className="mb-3 mt-0.5 text-sm text-muted">Photos of jobs you’ve completed. Add a short caption to each.</p>
                  <Controller
                    name="portfolio"
                    control={control}
                    render={({ field }) => <PortfolioInput value={field.value} onChange={field.onChange} defaultLocation={watch('serviceAreas')?.[0] ?? watch('city')} />}
                  />
                </div>
                <Summary values={getValues()} onEdit={setStep} />
                <Notice>
                  We don’t ask for NIN, BVN, bank details or ID documents at this stage. Verification will be introduced later as a separate, optional step.
                  Your profile is stored only in this browser.
                </Notice>
                <div>
                  <Checkbox
                    invalid={!!errors.terms}
                    label="I confirm the information above is accurate and I agree to Trusta’s terms of use."
                    description="I understand this preview stores my profile on this device only and does not verify my identity."
                    {...register('terms', { required: 'Please confirm to continue' })}
                  />
                  {errors.terms && <p className="mt-1.5 text-xs font-medium text-danger">{errors.terms.message}</p>}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
              ) : (
                <span />
              )}
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Continue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : profile ? (
                <Button
                  onClick={async () => {
                    if (await trigger()) setConfirmReplace(true);
                  }}
                  loading={isSubmitting}
                >
                  Replace my profile
                </Button>
              ) : (
                <Button type="submit" loading={isSubmitting}>
                  Create profile
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>

      <ConfirmDialog
        open={confirmReplace}
        onClose={() => setConfirmReplace(false)}
        title="Replace your existing profile?"
        description="Your current provider profile, its sample requests and notifications will be replaced."
        confirmLabel="Replace profile"
        onConfirm={() => {
          deleteProfile();
          handleSubmit(onSubmit)();
        }}
      />
    </div>
  );
}

function Summary({ values, onEdit }) {
  const rows = [
    ['Name', values.name, 0],
    ['Location', [values.city, values.state].filter(Boolean).join(', '), 0],
    ['Communities', values.serviceAreas?.join(', '), 0],
    ['Contact', CONTACT_LABELS[values.contactPreference], 0],
    ['Category', getCategory(values.category)?.name, 1],
    ['Skills', values.specialties?.join(', '), 1],
    ['Experience', values.yearsOfExperience ? `${values.yearsOfExperience} years` : '', 1],
    [
      'Pricing',
      values.pricingType === 'quote'
        ? PRICING_LABELS.quote
        : `${PRICING_LABELS[values.pricingType]} · ${formatNaira(values.startingPrice)}${values.priceUnit ? ` ${values.priceUnit}` : ''}`,
      1,
    ],
  ];
  return (
    <div className="rounded-xl border border-line">
      <h3 className="border-b border-line px-4 py-3 text-sm font-semibold">Review your details</h3>
      <dl className="divide-y divide-line">
        {rows.map(([label, value, step]) => (
          <div key={label} className="grid grid-cols-[6.5rem_1fr_auto] items-start gap-3 px-4 py-2.5 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="min-w-0 break-words text-ink">{value || <span className="text-subtle">—</span>}</dd>
            <button type="button" onClick={() => onEdit(step)} className="text-xs font-semibold text-brand hover:underline" aria-label={`Edit ${label}`}>
              Edit
            </button>
          </div>
        ))}
      </dl>
    </div>
  );
}
