import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep it',
  destructive = true,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="flex gap-4">
        <div
          className={
            destructive
              ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger'
              : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-brand'
          }
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} data-autofocus>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
