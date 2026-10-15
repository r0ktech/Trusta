import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Trusta` : 'Trusta — Find skilled hands. Hire with confidence.';
  }, [title]);
}
