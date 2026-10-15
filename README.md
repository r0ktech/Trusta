# Trusta

**Find skilled hands. Hire with confidence.**

Trusta is a marketplace for finding reliable artisans and local service professionals in Nigeria. This repository is the **frontend-only MVP**. It runs entirely in the browser on sample data, and nothing is sent to a server.

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

The app uses client-side routing. When you deploy `dist/`, configure the host to fall back to `index.html` for unknown paths (SPA rewrite). Without that, deep links such as `/artisan/a01` will 404.

## Stack

React 18 + Vite, JavaScript, Tailwind CSS 3, React Router 6, React Hook Form, Lucide icons, Recharts (one lazy-loaded chart on the provider dashboard). There are no other runtime dependencies.

## Project structure

```
src/
  App.jsx                 Routes (pages are lazy-loaded per route)
  main.jsx                Entry; wraps the app in providers
  index.css               Design tokens (CSS variables) for light + dark
  context/                App state, persisted to localStorage
    AuthContext           Demo session (never stores passwords)
    SavedContext          Saved artisans
    BookingsContext       Customer bookings + requests to your provider listing
    ReviewsContext        Locally written reviews + eligibility rules
    MessagesContext       Local conversations
    ProviderContext       Your provider profile, notifications, completion score
    PreferencesContext    Theme, notification prefs, default location
    ToastContext          Toast notifications
  data/                   Mock data, kept separate from the UI
    artisans.js           30 fictional providers; reviews/portfolio generated deterministically
    categories.js         14 service categories + search suggestions
    locations.js          Cities and community-level service areas
    seeds.js              First-visit bookings, conversations, sample provider
    faqs.js, reviewPool.js
  hooks/                  useArtisans (single source for listings), usePersistentState, …
  utils/                  filters.js (search/filter/sort), format, validation, storage, image, share
  components/
    ui/                   Button, Field/Input/Select, Modal, Drawer, ConfirmDialog, Tabs, Toggle, …
    layout/               Navbar, mobile menu, bottom nav, footer, layouts
    home/ search/ artisans/ bookings/ reviews/ forms/ provider/ messages/
  pages/                  One file per route (+ auth/ and provider/)
```

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/explore` | Search and filters. State lives in the URL, e.g. `?category=plumber&location=Awka` |
| `/categories` | All categories |
| `/artisan/:id` | Provider profile (`a01`–`a30`, plus `local-provider` for your own listing) |
| `/how-it-works` | Customer and provider explainer, what's simulated, FAQ |
| `/become-a-provider` | Provider landing page and 3-step registration |
| `/auth/sign-in`, `/auth/sign-up`, `/auth/reset-password` | Demo authentication |
| `/saved`, `/bookings`, `/messages`, `/settings` | Customer account |
| `/provider/dashboard`, `/provider/requests`, `/provider/profile` | Provider dashboard (separate layout) |
| `/legal/terms`, `/legal/privacy`, `/legal/safety` | Placeholder legal pages and safety tips |
| anything else | 404 page |

## What is simulated

Everything you do is saved in `localStorage` under keys prefixed `trusta:v1:`. **Settings → Reset all demo data** clears it all.

| Feature | In this MVP | Needs a backend |
|---|---|---|
| Providers, ratings, reviews | Fictional sample data, labelled "Demo", "Sample review" and so on | Real listings, moderated reviews tied to verified bookings |
| Verification badges | Shown only where the sample data sets `verificationStatus`, always marked "(demo)" | Identity and skills verification |
| Sign in / sign up | Stores a profile object locally. Passwords are validated for shape and then discarded | Real authentication, password hashing, password reset email |
| Booking requests | Saved locally. A "Demo controls" panel lets you simulate the provider accepting, declining or completing | Delivering requests to providers, notifications |
| Provider registration | Creates a local profile that shows up in Explore on this device only | Publishing profiles, image storage, verification |
| Accept / decline requests | Works on sample requests and on any request you send to your own listing | Real requests from customers |
| Messages | Sent and stored locally. Providers never reply | Real-time messaging |
| Reviews | Allowed only for a completed booking, one per booking. These are client-side guard rails, not anti-fraud controls | Server-side eligibility, moderation, fraud detection |
| Photos | Resized in the browser and stored as data URLs | Object storage / CDN |
| Profile views chart | Illustrative numbers, labelled as such | Analytics |
| Notifications and preferences | Preferences are saved. No email, SMS or push is sent | Email, SMS, WhatsApp integrations |
| Payments | Not implemented | Payments, escrow |
| Location | Chosen manually. Geolocation is never requested | Geo search |

## Replacing mock data with an API

- Listings flow through `src/hooks/useArtisans.js`. Swap the static import for a fetch or query there.
- The shape of the artisan records in `src/data/artisans.js` is the expected API contract.
- Each context isolates one domain behind small functions (`createBooking`, `setStatus`, `sendMessage`, `signIn`, …). Replace their bodies with API calls and the components can stay as they are.
- Filtering and sorting in `src/utils/filters.js` are pure functions, so they can move server-side unchanged.

## Try the main flows

1. **Search.** On the home page, type "inverter", choose Awka and click **Find an Artisan**.
2. **Profile.** Open a profile. Save it, share it, browse the work samples and filter the reviews by star rating.
3. **Booking.** Click **Request a Booking**. Submit the form empty to see the validation, then fill it in. The booking appears in **My bookings**.
4. **Review.** In My bookings, open the booking and use **Demo controls** to accept and then complete it. Then click **Leave a review**.
5. **Provider.** Go to **Become a Provider** and register, or open `/provider/dashboard` and click **Use a sample profile**. Accept and decline requests, then edit your profile.
6. **Messaging.** From any profile, click **Send Message**.
7. **Persistence.** Refresh the page. All of the above is still there.
