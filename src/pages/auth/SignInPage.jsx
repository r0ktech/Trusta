import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { AuthShell } from '../../components/forms/AuthShell';
import { PasswordInput } from '../../components/forms/PasswordInput';
import { Field, Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { rules } from '../../utils/validation';

export default function SignInPage() {
  useDocumentTitle('Sign in');
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const from = location.state?.from && !location.state.from.startsWith('/auth') ? location.state.from : '/bookings';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async ({ email }) => {
    setFormError('');
    try {
      // The password is validated for shape only and then discarded.
      const user = await signIn({ email });
      toast({ title: `Welcome, ${user.name.split(' ')[0]}`, description: 'Demo session started on this device.' });
      navigate(from, { replace: true });
    } catch {
      setFormError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your bookings and saved artisans."
      footer={
        <>
          New to Trusta?{' '}
          <Link to="/auth/sign-up" state={location.state} className="link">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {formError}
          </p>
        )}
        <Field label="Email address" error={errors.email?.message}>
          <Input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" {...register('email', rules.email())} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" placeholder="At least 8 characters" {...register('password', rules.password)} />
        </Field>
        <div className="flex justify-end">
          <Link to="/auth/reset-password" className="text-sm font-semibold text-brand hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" block size="lg" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
