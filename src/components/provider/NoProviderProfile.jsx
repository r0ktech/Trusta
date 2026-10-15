import { useNavigate } from 'react-router-dom';
import { Hammer, Sparkles } from 'lucide-react';
import { useProvider } from '../../context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import { ButtonLink, Button } from '../ui/Button';

export function NoProviderProfile() {
  const { loadSampleProfile } = useProvider();
  const { toast } = useToast();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-brand">
          <Hammer className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">You don’t have a provider profile yet</h1>
        <p className="mt-2 text-muted">
          Register as a provider to manage your profile, services and booking requests. Or load a sample profile to explore the dashboard right away.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <ButtonLink to="/become-a-provider">Create provider profile</ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              loadSampleProfile();
              toast({ title: 'Sample profile loaded', description: 'Edit anything — changes stay in this browser.' });
              navigate('/provider/dashboard');
            }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Use a sample profile
          </Button>
        </div>
      </div>
    </div>
  );
}
