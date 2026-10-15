import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useProvider, getProfileCompletion } from '../../context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { DetailsFields, ServiceFields, DETAILS_FIELDS, SERVICE_FIELDS, PROVIDER_DEFAULTS, toProfile } from '../../components/provider/ProviderFormFields';
import { ProfilePhotoInput, PortfolioInput } from '../../components/forms/ImageUploads';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select } from '../../components/ui/Field';
import { Toggle } from '../../components/ui/Toggle';
import { Notice } from '../../components/ui/Notice';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatNaira, uid, cn } from '../../utils/format';

const TABS = [
  { value: 'details', label: 'Details' },
  { value: 'services', label: 'Services & pricing' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'listing', label: 'Availability & listing' },
];

const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k] ?? PROVIDER_DEFAULTS[k]]));

export default function ProviderProfilePage() {
  useDocumentTitle('Edit provider profile');
  const { profile } = useProvider();
  const [tab, setTab] = useState('details');
  const completion = getProfileCompletion(profile);

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Profile & services</h1>
          <p className="mt-1 text-muted">Profile strength: {completion.percent}%. Changes are saved in this browser.</p>
        </div>
        <Link to="/artisan/local-provider" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View public profile
        </Link>
      </div>
      <Tabs className="mt-6" label="Profile sections" tabs={TABS} value={tab} onChange={setTab} />
      <div className="mt-6" role="tabpanel">
        {/* key forces fresh defaults if the profile is replaced */}
        {tab === 'details' && <DetailsForm key={profile.createdAt} />}
        {tab === 'services' && <ServicesForm key={profile.createdAt} />}
        {tab === 'portfolio' && <PortfolioForm key={profile.createdAt} />}
        {tab === 'listing' && <ListingSettings />}
      </div>
    </div>
  );
}

function SaveBar({ isDirty, isSubmitting, onReset }) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-6 flex items-center justify-end gap-2 border-t border-line bg-surface px-5 py-4 sm:-mx-6 sm:px-6">
      {isDirty && <span className="mr-auto text-sm text-muted">Unsaved changes</span>}
      {isDirty && (
        <Button variant="ghost" onClick={onReset}>
          Discard
        </Button>
      )}
      <Button type="submit" disabled={!isDirty} loading={isSubmitting}>
        Save changes
      </Button>
    </div>
  );
}

function DetailsForm() {
  const { profile, updateProfile } = useProvider();
  const { toast } = useToast();
  const form = useForm({ mode: 'onTouched', defaultValues: { ...pick(profile, DETAILS_FIELDS), profileImage: profile.profileImage ?? null } });
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, isSubmitting },
  } = form;

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 400));
    const phone = values.phone.replace(/[\s-()]/g, '');
    updateProfile({ ...values, name: values.name.trim(), email: values.email.trim(), phone });
    reset({ ...values, phone });
    toast({ title: 'Details saved' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card p-5 pb-0 sm:p-6 sm:pb-0">
      <h2 className="mb-3 text-sm font-semibold">Profile photo</h2>
      <Controller name="profileImage" control={control} render={({ field }) => <ProfilePhotoInput value={field.value} onChange={field.onChange} name={watch('name')} />} />
      <hr className="my-6 border-line" />
      <DetailsFields {...form} errors={form.formState.errors} />
      <SaveBar isDirty={isDirty} isSubmitting={isSubmitting} onReset={() => reset()} />
    </form>
  );
}

function ServicesForm() {
  const { profile, updateProfile } = useProvider();
  const { toast } = useToast();
  const form = useForm({
    mode: 'onTouched',
    defaultValues: {
      ...pick(profile, SERVICE_FIELDS),
      startingPrice: profile.startingPrice ?? '',
      services: profile.services ?? [],
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = form;

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 400));
    const { services, ...rest } = values;
    const normalised = toProfile({ ...PROVIDER_DEFAULTS, ...pick(profile, DETAILS_FIELDS), ...rest });
    updateProfile({ ...pick(normalised, SERVICE_FIELDS), services });
    reset(values);
    toast({ title: 'Services saved' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card p-5 pb-0 sm:p-6 sm:pb-0">
      <ServiceFields {...form} errors={form.formState.errors} />
      <hr className="my-6 border-line" />
      <h2 className="text-base font-bold">Service menu</h2>
      <p className="mt-0.5 text-sm text-muted">List individual services with their own prices. These appear on your public profile.</p>
      <Controller name="services" control={control} render={({ field }) => <ServiceMenu value={field.value} onChange={field.onChange} />} />
      <SaveBar isDirty={isDirty} isSubmitting={isSubmitting} onReset={() => reset()} />
    </form>
  );
}

function ServiceMenu({ value, onChange }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('fixed');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    if (name.trim().length < 3) return setError('Enter a service name');
    if (type !== 'quote' && !(Number(price) >= 500)) return setError('Enter a price of at least ₦500, or choose quote');
    if (value.length >= 12) return setError('You can list up to 12 services');
    onChange([...value, { id: uid('s'), name: name.trim(), pricingType: type, price: type === 'quote' ? null : Number(price) }]);
    setName('');
    setPrice('');
    setError('');
  };

  return (
    <div className="mt-4">
      {value.length > 0 && (
        <ul className="mb-4 divide-y divide-line rounded-xl border border-line">
          {value.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{s.name}</span>
              <span className="text-sm font-medium text-muted">
                {s.pricingType === 'quote' ? 'Quote' : `${formatNaira(s.price)}${s.pricingType === 'hourly' ? '/hr' : ''}`}
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x.id !== s.id))}
                className="rounded-lg p-1.5 text-subtle hover:bg-danger-soft hover:text-danger"
                aria-label={`Remove ${s.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_9rem_9rem_auto] sm:items-end">
        <Field label="Service name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ceiling fan installation" maxLength={60} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
        </Field>
        <Field label="Pricing">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
            <option value="quote">Quote</option>
          </Select>
        </Field>
        <Field label="Price (₦)">
          <Input type="number" inputMode="numeric" min="0" step="500" value={price} disabled={type === 'quote'} onChange={(e) => setPrice(e.target.value)} placeholder={type === 'quote' ? '—' : '5000'} />
        </Field>
        <Button variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-danger" role="alert">{error}</p>}
    </div>
  );
}

function PortfolioForm() {
  const { profile, updateProfile } = useProvider();
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({ defaultValues: { portfolio: profile.portfolio ?? [] } });

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 400));
    updateProfile({ portfolio: values.portfolio });
    reset(values);
    toast({ title: 'Portfolio saved' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5 pb-0 sm:p-6 sm:pb-0">
      <h2 className="text-base font-bold">Work samples</h2>
      <p className="mb-4 mt-0.5 text-sm text-muted">Show up to 6 completed jobs. Photos are resized on your device and stored in this browser.</p>
      <Controller
        name="portfolio"
        control={control}
        render={({ field }) => <PortfolioInput value={field.value} onChange={field.onChange} defaultLocation={profile.serviceAreas?.[0] ?? profile.city} />}
      />
      <SaveBar isDirty={isDirty} isSubmitting={isSubmitting} onReset={() => reset()} />
    </form>
  );
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ListingSettings() {
  const { profile, updateProfile, deleteProfile } = useProvider();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [hours, setHours] = useState(profile.hours ?? '8:00 AM – 6:00 PM');
  const days = profile.days ?? DAYS.slice(0, 6);

  return (
    <div className="space-y-5">
      <section className="card space-y-5 p-5 sm:p-6">
        <Toggle
          checked={profile.available !== false}
          onChange={(v) => {
            updateProfile({ available: v });
            toast({ title: v ? 'Marked as taking new jobs' : 'Marked as not taking jobs', variant: 'info' });
          }}
          label="Taking new jobs"
          description="Customers see this on your profile. They can still send requests when you’re unavailable."
        />
        <div>
          <p className="text-sm font-medium text-ink">Working days</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Working days">
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const next = on ? days.filter((x) => x !== d) : DAYS.filter((x) => days.includes(x) || x === d);
                    if (!next.length) return toast({ title: 'Keep at least one working day', variant: 'error' });
                    updateProfile({ days: next });
                  }}
                  className={cn(
                    'h-10 w-12 rounded-lg border text-sm font-semibold transition-colors',
                    on ? 'border-accent bg-accent-soft text-brand' : 'border-line text-subtle hover:text-ink',
                  )}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label="Working hours" className="flex-1">
            <Input value={hours} onChange={(e) => setHours(e.target.value)} maxLength={40} />
          </Field>
          <Button
            variant="secondary"
            disabled={hours.trim() === (profile.hours ?? '8:00 AM – 6:00 PM') || !hours.trim()}
            onClick={() => {
              updateProfile({ hours: hours.trim() });
              toast({ title: 'Working hours saved' });
            }}
          >
            Save hours
          </Button>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <Toggle
          checked={profile.listed !== false}
          onChange={(v) => {
            updateProfile({ listed: v });
            toast({ title: v ? 'Listing shown in Discover' : 'Listing hidden from Discover', variant: 'info' });
          }}
          label="Show my listing in Discover (this device)"
          description="Preview how customers would find you in search results. Nobody else can see it."
        />
        <Notice className="mt-4">Your profile is never marked as verified. Identity and skills verification will be a separate step in a future release.</Notice>
      </section>

      <section className="card border-danger/30 p-5 sm:p-6">
        <h2 className="font-bold text-danger">Delete provider profile</h2>
        <p className="mt-1 text-sm text-muted">Removes your profile, sample requests and notifications from this browser.</p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirm(true)}>
          Delete profile
        </Button>
      </section>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete your provider profile?"
        description="This can’t be undone. Bookings you made as a customer are kept."
        confirmLabel="Delete profile"
        onConfirm={() => {
          deleteProfile();
          toast({ title: 'Provider profile deleted', variant: 'info' });
          navigate('/become-a-provider');
        }}
      />
    </div>
  );
}
