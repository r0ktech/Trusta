import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Hammer, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { AuthShell } from '../../components/forms/AuthShell';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { Field, Input, Checkbox } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { rules, passwordStrength } from '../../utils/validation';
import { cn } from '../../utils/format';

const ROLES = [
  { value: 'customer', label: 'I need a service', description: 'Find and book artisans', icon: UserRound },
  { value: 'provider', label: 'I offer a service', description: 'List my skills on Trusta', icon: Hammer },
];

export default function SignUpPage() {
  useDocumentTitle('Create account');
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: 'customer', name: '', email: '', password: '', confirm: '', terms: false } });

  const role = watch('role');
  const password = watch('password');
  const strength = passwordStrength(password);

  const onSubmit = async ({ name, email, role: r }) => {
    const user = await signUp({ name, email, role: r });
    toast({ title: 'Demo account ready', description: `Signed in as ${user.name}. Nothing was sent to a server.` });
    navigate(r === 'provider' ? '/become-a-provider' : location.state?.from ?? '/explore', { replace: true });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Trusta to book artisans or list your services."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/auth/sign-in" state={location.state} className="link">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">How will you use Trusta?</legend>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(({ value, label, description, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer flex-col gap-2 rounded-xl border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-accent',
                  role === value ? 'border-accent bg-accent-soft' : 'border-line hover:border-subtle/50',
                )}
              >
                <input type="radio" value={value} className="sr-only" {...register('role')} />
                <Icon className={cn('h-5 w-5', role === value ? 'text-brand' : 'text-subtle')} aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold text-ink">{label}</span>
                  <span className="block text-xs text-muted">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Full name" error={errors.name?.message}>
          <Input autoComplete="name" placeholder="e.g. Amaka Obi" {...register('name', { validate: (v) => v.trim().length >= 2 || 'Enter your full name' })} />
        </Field>
        <Field label="Email address" error={errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" {...register('email', rules.email())} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" placeholder="At least 8 characters" {...register('password', rules.password)} />
        </Field>
        {password && (
          <div className="-mt-1" aria-live="polite">
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={cn('h-1 flex-1 rounded-full', i <= strength.score ? (strength.score >= 4 ? 'bg-accent' : strength.score >= 2 ? 'bg-star' : 'bg-danger') : 'bg-line')}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-muted">Strength: {strength.label}</p>
          </div>
        )}
        <Field label="Confirm password" error={errors.confirm?.message}>
          <PasswordInput
            autoComplete="new-password"
            {...register('confirm', { required: 'Please confirm your password', validate: (v) => v === password || 'Passwords don’t match' })}
          />
        </Field>
        <div>
          <Checkbox
            invalid={!!errors.terms}
            label={
              <>
                I agree to the{' '}
                <Link to="/legal/terms" className="link" target="_blank">
                  terms of use
                </Link>{' '}
                and{' '}
                <Link to="/legal/privacy" className="link" target="_blank">
                  privacy policy
                </Link>
              </>
            }
            {...register('terms', { required: 'Please accept the terms to continue' })}
          />
          {errors.terms && <p className="mt-1.5 text-xs font-medium text-danger">{errors.terms.message}</p>}
        </div>
        <Button type="submit" block size="lg" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
