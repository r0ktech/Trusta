import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SuccessCheck } from '../../components/ui/Motion';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { AuthShell } from '../../components/forms/AuthShell';
import { Field, Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { rules } from '../../utils/validation';

export default function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [sentTo, setSentTo] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    await new Promise((r) => setTimeout(r, 700));
    setSentTo(email);
  };

  return (
    <AuthShell
      title={sentTo ? 'Check your inbox' : 'Reset your password'}
      subtitle={sentTo ? undefined : 'Enter the email you use for Trusta.'}
      footer={
        <Link to="/auth/sign-in" className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      }
    >
      {sentTo ? (
        <div className="rounded-2xl border border-line p-5 text-center" role="status">
          <SuccessCheck />
          <p className="mt-4 text-sm text-ink">
            In the live product, a reset link would be sent to <span className="font-semibold">{sentTo}</span>.
          </p>
          <p className="mt-2 text-sm text-muted">This is a mock-up — no email has been sent.</p>
          <Button variant="secondary" className="mt-5" onClick={() => setSentTo('')}>
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Email address" error={errors.email?.message}>
            <Input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" {...register('email', rules.email())} />
          </Field>
          <Button type="submit" block size="lg" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
