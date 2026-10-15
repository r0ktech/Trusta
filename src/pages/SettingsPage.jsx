import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Monitor, Moon, Sun, UserRound, Bell, Palette, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Field, Input } from '../components/ui/Field';
import { Button, ButtonLink } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Notice } from '../components/ui/Notice';
import { LocationSelect } from '../components/search/LocationSelect';
import { clearAllStorage } from '../utils/storage';
import { rules, NG_PHONE_PATTERN, normalisePhone } from '../utils/validation';
import { cn } from '../utils/format';

function Card({ icon: Icon, title, description, children, id }) {
  return (
    <section aria-labelledby={id} className="card p-5 sm:p-6">
      <div className="mb-5 flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface2 text-muted">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id={id} className="text-base font-bold">
            {title}
          </h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { user } = useAuth();
  const { theme, setTheme, notifications, setNotification, defaultLocation, setDefaultLocation } = usePreferences();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="container-page flex-1 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-muted">Preferences are saved in this browser.</p>

        <div className="mt-8 space-y-5">
          <Card icon={UserRound} title="Profile" description="Basic information for your demo account." id="profile-h">
            {user ? (
              <ProfileForm />
            ) : (
              <div className="rounded-xl bg-surface2 p-4 text-sm text-muted">
                You’re not signed in.{' '}
                <Link to="/auth/sign-in" state={{ from: '/settings' }} className="link">
                  Start a demo session
                </Link>{' '}
                to edit profile details.
              </div>
            )}
          </Card>

          <Card icon={Palette} title="Appearance" id="appearance-h">
            <div role="radiogroup" aria-labelledby="appearance-h" className="grid grid-cols-3 gap-2">
              {[
                ['light', 'Light', Sun],
                ['dark', 'Dark', Moon],
                ['system', 'System', Monitor],
              ].map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={theme === value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors',
                    theme === value ? 'border-accent bg-accent-soft text-brand' : 'border-line text-muted hover:text-ink',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <label htmlFor="default-location" className="mb-1.5 block text-sm font-medium">
                Default search location
              </label>
              <LocationSelect id="default-location" value={defaultLocation} onChange={setDefaultLocation} placeholder="No default" />
              <p className="mt-1.5 text-xs text-muted">Pre-fills the homepage search. We never ask for your device location.</p>
            </div>
          </Card>

          <Card icon={Bell} title="Notifications" description="Choose what you’d like to hear about." id="notif-h">
            <div className="space-y-5">
              <Toggle checked={notifications.bookingUpdates} onChange={(v) => setNotification('bookingUpdates', v)} label="Booking updates" description="When a provider accepts, declines or completes a booking." />
              <Toggle checked={notifications.messages} onChange={(v) => setNotification('messages', v)} label="New messages" description="When a provider replies to you." />
              <Toggle checked={notifications.reviewReminders} onChange={(v) => setNotification('reviewReminders', v)} label="Review reminders" description="A reminder to rate completed jobs." />
              <Toggle checked={notifications.sms} onChange={(v) => setNotification('sms', v)} label="SMS alerts" description="Text messages for important updates (coming later)." />
              <Toggle checked={notifications.productNews} onChange={(v) => setNotification('productNews', v)} label="Product news" description="Occasional updates about new Trusta features." />
            </div>
            <Notice className="mt-5">These preferences are saved, but no emails, SMS or push notifications are sent in this preview.</Notice>
          </Card>

          <Card icon={Database} title="Demo data" description="Everything you do here is stored only in this browser." id="data-h">
            <p className="text-sm text-muted">
              Resetting removes your demo session, saved artisans, bookings, reviews, messages, provider profile and preferences, then restores the original sample data.
            </p>
            <Button variant="danger-ghost" className="mt-4 border border-danger/30" onClick={() => setConfirmReset(true)}>
              Reset all demo data
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all demo data?"
        description="This clears everything saved in this browser for Trusta and reloads the page with fresh sample data."
        confirmLabel="Reset data"
        onConfirm={() => {
          clearAllStorage();
          toast({ title: 'Demo data reset', variant: 'info' });
          setTimeout(() => window.location.assign('/'), 300);
        }}
      />
    </div>
  );
}

function ProfileForm() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ defaultValues: { name: user.name, email: user.email, phone: user.phone ?? '', city: user.city ?? '' } });

  const onSubmit = async (values) => {
    await new Promise((r) => setTimeout(r, 400));
    const next = { ...values, name: values.name.trim(), phone: values.phone ? normalisePhone(values.phone) : '' };
    updateUser(next);
    reset(next);
    toast({ title: 'Profile updated', description: 'Saved in this browser.' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name?.message}>
          <Input autoComplete="name" {...register('name', { validate: (v) => v.trim().length >= 2 || 'Enter your name' })} />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email', rules.email())} />
        </Field>
        <Field label="Phone number" optional error={errors.phone?.message} hint="Nigerian mobile number">
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            {...register('phone', { validate: (v) => !v || NG_PHONE_PATTERN.test(normalisePhone(v)) || 'Enter a valid Nigerian phone number' })}
          />
        </Field>
        <Field label="City" optional>
          <Input autoComplete="address-level2" placeholder="e.g. Awka" {...register('city')} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!isDirty} loading={isSubmitting}>
          Save changes
        </Button>
        {isDirty && (
          <Button variant="ghost" onClick={() => reset()}>
            Discard
          </Button>
        )}
        <ButtonLink to="/auth/reset-password" variant="ghost" className="ml-auto">
          Change password
        </ButtonLink>
      </div>
    </form>
  );
}
