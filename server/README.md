# Trusta API

REST API for Trusta: accounts, provider search, provider profiles, bookings, reviews, saved providers, messaging, notifications and image uploads.

**Stack:** Node.js 22.18+, Express 5, PostgreSQL 14+, Prisma ORM 7, Zod, argon2, sharp.

## Setup

```bash
cd server
npm install                      # also generates the Prisma client
cp .env.example .env             # set DATABASE_URL
createdb trusta
npx prisma migrate deploy        # create tables
npm run db:seed                  # categories, cities and the 30 demo providers
npm run dev                      # http://localhost:4000/api
```

Run the web app at the same time (`npm run dev` in the repo root). Vite forwards `/api` and `/uploads` to port 4000, so the browser treats the API as the same origin and the session cookie just works.

### Tests

```bash
createdb trusta_test
cp .env.test.example .env.test   # set your database user
npm test                          # migrates + seeds trusta_test, then runs the suite
```

The tests run against a real PostgreSQL database. They cover authentication, search, provider profiles, the booking lifecycle (including a race between an accept and a cancel), reviews, messaging, uploads and admin permissions.

### Schema changes

Edit `prisma/schema.prisma`, then run `npm run db:migrate -- --name describe_change`. That creates a migration in `prisma/migrations` and regenerates the client. Commit the migration. In production, run `npm run db:deploy`.

## Conventions

- All routes are under `/api`. Requests and responses are JSON, apart from image uploads.
- **Errors** have the shape `{ "error": { "code", "message", "details"? } }`. Validation failures return `400` with `code: "validation_failed"` and a `details` list of `{ field, message }`.
- **Lists** accept `page` and `limit` (maximum 50) and return `total` and `hasMore`.
- **Money** is whole naira. **Booking dates** are `YYYY-MM-DD` in Nigerian time (WAT).
- Response shapes match the objects the web app already uses (`src/data/artisans.js`), so the UI can switch from mock data without reshaping anything.

### Authentication

Signing up or logging in sets an httpOnly, `SameSite=Lax` session cookie (`trusta_session`), and also returns a `token`. Browsers should rely on the cookie. Mobile or other non-browser clients can send `Authorization: Bearer <token>` instead.

## Endpoints

🔒 = signed in · 🛠 = has a provider profile · 👑 = admin

**Accounts**

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/signup` | `{ name, email, password, role: customer\|provider }` |
| POST | `/auth/login` | `{ email, password }` |
| POST | `/auth/logout` | |
| POST | `/auth/logout-others` 🔒 | Ends all your other sessions |
| POST | `/auth/password/forgot` | `{ email }`. Always returns `202`, whether or not the account exists |
| POST | `/auth/password/reset` | `{ token, password }`. Single use; signs out every session |
| POST | `/auth/password/change` 🔒 | `{ currentPassword, newPassword }` |
| GET / PATCH | `/me` 🔒 | Profile: `name`, `email`, `phone`, `city` |
| GET / PATCH | `/me/preferences` 🔒 | Notification settings, default location |
| DELETE | `/me` 🔒 | `{ password }`. Deletes the account |

**Browsing (public)**

| Method | Path | Notes |
|---|---|---|
| GET | `/categories` | With a `providerCount` for each category |
| GET | `/locations` | Cities, their states and community areas |
| GET | `/artisans` | Query parameters: `q`, `location`, `category`, `minRating`, `verified=1`, `pricing`, `maxPrice`, `availability=available\|weekends`, `sort=relevance\|rating\|reviews\|experience\|price-asc\|newest`, `page`, `limit` |
| GET | `/artisans/:idOrSlug` | Full profile with a `reviewSummary` (average, count, distribution). Each view is counted |
| GET | `/artisans/:idOrSlug/reviews` | `rating`, `page`, `limit` |

**Customers**

| Method | Path | Notes |
|---|---|---|
| POST | `/bookings` 🔒 | `{ artisanId, service, description, date, time, address, budget?, notes? }` |
| GET | `/bookings` 🔒 | `scope=upcoming\|past\|all`. Also returns counts for each status |
| GET | `/bookings/:id` 🔒 | Only the customer or the provider can see it |
| POST | `/bookings/:id/cancel` 🔒 | Customer cancels a pending or accepted booking. `{ reason? }` |
| POST | `/bookings/:id/review` 🔒 | `{ rating, text, photo? }`. Only for a completed booking, once |
| GET | `/saved` 🔒 | |
| PUT / DELETE | `/saved/:artisanId` 🔒 | Repeating the call is harmless |
| GET / POST | `/conversations` 🔒 | POST `{ artisanId }` opens a conversation, or returns the existing one |
| GET / POST | `/conversations/:id/messages` 🔒 | GET accepts `after=<ISO time>` to poll for new messages; POST `{ text }` |
| POST | `/conversations/:id/read` 🔒 | |
| GET | `/notifications` 🔒 | `unread=1` |
| POST | `/notifications/:id/read`, `/notifications/read-all` 🔒 | |
| POST | `/uploads` 🔒 | Multipart, field `image`. Returns `{ url }` to use in profile, work-sample or review fields |

**Providers**

| Method | Path | Notes |
|---|---|---|
| POST | `/provider/profile` 🔒 | Creates the profile (with up to 6 work samples) and makes the user a provider |
| GET / PATCH / DELETE | `/provider/profile` 🛠 | PATCH also covers availability, working days, hours and `listed`. DELETE unlists the profile instead of deleting it if it has booking history |
| PUT | `/provider/services` 🛠 | Replaces the whole service list |
| POST | `/provider/portfolio` 🛠 | `{ title, location?, imageUrl }` |
| PATCH / DELETE | `/provider/portfolio/:id` 🛠 | |
| GET | `/provider/bookings` 🛠 | `status=pending\|accepted\|completed\|cancelled\|all` |
| POST | `/provider/bookings/:id/accept\|decline\|complete\|cancel` 🛠 | |
| GET | `/provider/stats` 🛠 | Weekly profile views (8 weeks), booking counts, review summary, profile completion |

**Admin**

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/providers` 👑 | `verification=unverified\|pending\|verified\|all` |
| PATCH | `/admin/providers/:id/verification` 👑 | `{ status }`. The only way a provider becomes verified |
| PATCH | `/admin/reviews/:id` 👑 | `{ hidden }`. Hidden reviews no longer count towards the rating |

To make someone an admin, run `UPDATE "User" SET role = 'ADMIN' WHERE email = '…';`. Sign-up can't create admins.

## Booking rules (enforced by the server)

| Who | Action | Allowed from | Result |
|---|---|---|---|
| Customer | cancel | pending, accepted | cancelled (by customer) |
| Provider | accept | pending | accepted |
| Provider | decline | pending | cancelled (by provider) |
| Provider | complete | accepted | completed |
| Provider | cancel | accepted | cancelled (by provider) |

Each change is checked and written in one transaction, so two simultaneous actions can't both succeed. Every change is recorded in the booking's history and notifies the other person. Nobody can book their own listing.

## Security

- **Passwords:** hashed with argon2id. Logins with an unknown email take as long as wrong-password ones, so they can't be used to discover accounts.
- **Sessions:** random 256-bit tokens. The database stores only their SHA-256 hash, so a database leak doesn't expose usable sessions. A password reset or change signs out other sessions.
- **Cross-site requests (CSRF):** the session cookie is `SameSite=Lax`, and any change request carrying an `Origin` header must come from `APP_URL` or `CORS_ORIGINS`.
- **Rate limits:** sign-up, login and password endpoints, write-heavy endpoints, and the API overall. Helmet sets security headers.
- **Input validation:** every input is checked with Zod and size-limited, and JSON bodies are capped at 100 KB.
- **Uploads:** images are decoded and re-encoded to WebP by sharp, which rejects non-images and strips EXIF data, including GPS location. Profiles, work samples and reviews can only reference images the same user uploaded.
- **Private data:** a provider's phone and email are never returned by public endpoints.
- **Logs:** cookies, authorization headers and passwords are redacted. Reset-link emails are never logged in production.

## Not done yet

- **Email delivery.** `src/lib/mailer.js` logs messages instead of sending them. Plug in SMTP or a transactional email service there. Password reset depends on it in production.
- **SMS / WhatsApp notifications.** Preferences are stored; the place to send them is `src/lib/notify.js`.
- **Real-time messaging.** Clients poll `GET /conversations/:id/messages?after=`. A websocket or SSE channel can be added later without changing the data model.
- **Object storage.** Uploads go to local disk (`UPLOAD_DIR`). Replace `src/lib/storage.js` with S3, R2 or GCS before running more than one server instance.
- **Verification workflow.** Admins can set the status, but there is no document collection or identity check yet.
- **Payments.** Not included.
- **Search at scale.** Relevance ranking happens in memory on up to 500 matches. Move to Postgres full-text search or a search service as the catalogue grows.
- **The web app still uses mock data.** Switching the React contexts to call this API is the next step.
