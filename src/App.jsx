import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout, ScrollToTop } from './components/layout/Layouts';
import { PageLoader } from './components/ui/Skeleton';
import HomePage from './pages/HomePage';

// Route-level code splitting keeps the first load small on slower networks.
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const ArtisanProfilePage = lazy(() => import('./pages/ArtisanProfilePage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const BecomeProviderPage = lazy(() => import('./pages/BecomeProviderPage'));
const SignInPage = lazy(() => import('./pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProviderLayout = lazy(() => import('./components/provider/ProviderLayout'));
const ProviderDashboardPage = lazy(() => import('./pages/provider/ProviderDashboardPage'));
const ProviderRequestsPage = lazy(() => import('./pages/provider/ProviderRequestsPage'));
const ProviderProfilePage = lazy(() => import('./pages/provider/ProviderProfilePage'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="artisan/:id" element={<ArtisanProfilePage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="become-a-provider" element={<BecomeProviderPage />} />
            <Route path="auth/sign-in" element={<SignInPage />} />
            <Route path="auth/sign-up" element={<SignUpPage />} />
            <Route path="auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="legal/:doc" element={<LegalPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route element={<MainLayout hideFooter />}>
            <Route path="messages" element={<MessagesPage />} />
          </Route>
          <Route path="provider" element={<ProviderLayout />}>
            <Route index element={<ProviderDashboardPage />} />
            <Route path="dashboard" element={<ProviderDashboardPage />} />
            <Route path="requests" element={<ProviderRequestsPage />} />
            <Route path="profile" element={<ProviderProfilePage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
