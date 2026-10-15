import { ToastProvider } from './ToastContext';
import { PreferencesProvider } from './PreferencesContext';
import { AuthProvider } from './AuthContext';
import { SavedProvider } from './SavedContext';
import { BookingsProvider } from './BookingsContext';
import { ReviewsProvider } from './ReviewsContext';
import { MessagesProvider } from './MessagesContext';
import { ProviderProvider } from './ProviderContext';

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <PreferencesProvider>
        <AuthProvider>
          <SavedProvider>
            <BookingsProvider>
              <ReviewsProvider>
                <MessagesProvider>
                  <ProviderProvider>{children}</ProviderProvider>
                </MessagesProvider>
              </ReviewsProvider>
            </BookingsProvider>
          </SavedProvider>
        </AuthProvider>
      </PreferencesProvider>
    </ToastProvider>
  );
}
