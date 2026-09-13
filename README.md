# أكاديمية قصي للذكاء الاصطناعي

An Arabic-first education platform for Qusai Karki. Next.js App Router, TypeScript, Tailwind CSS, Supabase/PostgreSQL, React Hook Form and Zod. The repository contains the application, complete Arabic content, migrations, administration, email templates, social assets and local test infrastructure.

Turkish deployment guide: [YAYINLAMA.md](YAYINLAMA.md). It covers account setup, current API key types, Vercel configuration, sender verification, scheduling and live acceptance checks. `.github/workflows/ci.yml` runs tests and a production build without production secrets.

## Start locally

Use Node.js 22+ and pnpm. From this directory:

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

On PowerShell, use `Copy-Item .env.example .env.local`. For this restricted desktop runtime, `pnpm dev:desktop` uses a single-process development server. Set `NEXT_PUBLIC_SITE_URL` to the exact origin you open, for example `http://127.0.0.1:3000`. Origin checking intentionally rejects a different host or port.

Without Supabase credentials the public website works, but registration, contact submission and admin login remain explicitly unavailable. No application is falsely accepted or stored in browser storage. The initial cohort is **upcoming / registration disabled** and has no invented price, capacity or dates.

## Database and admin setup

1. Create a Supabase project in the region appropriate for your privacy requirements.
2. Run `supabase/migrations/001_academy.sql`, then `002_management.sql` in SQL Editor, once and in order. These are migrations for a new project, not a script to run repeatedly against an existing production schema.
3. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to server environment variables. None is exposed by a `NEXT_PUBLIC_` variable. Never put the service-role key in browser code.
4. In Supabase Authentication create your real admin user and set a strong password. Disable public account sign-up if it is not needed. Copy the user's UUID, then run:

```sql
insert into public.profiles(id, role)
values ('YOUR_AUTH_USER_UUID', 'admin');
```

5. Generate independent random secrets for `RATE_LIMIT_SECRET` and `CRON_SECRET`. A convenient local command is `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Do not commit the results.
6. Visit `/admin/login`. The application validates the session with Supabase Auth and checks `profiles.role` on every protected page and endpoint. `proxy.ts` refreshes cookies; it is not the sole authorization boundary.
7. Open `/admin/course` and supply the real dates, schedule, capacity, fees, deadline and any payment instructions. Select `التسجيل مفتوح` and enable registration only when ready. The waitlist can be enabled independently.

RLS is enabled on every table. Browser roles cannot read applications, contacts, notes, outbox, rate limits or private cohort information. Authenticated users can read only their own profile. Registration RPCs are executable only by the server's service role. Admin RPCs also verify the acting admin UUID.

## Emails

The default adapter uses Resend; the database-backed outbox separates admission transactions from email delivery. Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, a verified `EMAIL_FROM`, and `ADMIN_NOTIFICATION_EMAIL`. No email is actually sent without these credentials.

- Registration and its student/admin email jobs are committed in one database transaction.
- Successful submissions attempt delivery after the response.
- Schedule `GET /api/cron/email` every 5 minutes using an external scheduler or Vercel Cron compatible with your plan. Send `Authorization: Bearer <CRON_SECRET>`.
- The worker atomically claims up to 20 jobs, uses provider idempotency keys and retries up to five times. Stale processing claims are recoverable after ten minutes.
- `/admin/emails` shows the latest 50 jobs and allows sending a session reminder or starting-soon message to a selected approved student.
- After correcting a delivery issue, inspect failed jobs and reset a specific job to `pending` with `attempts=0` in SQL Editor. Do not bulk-reset successfully sent jobs.

Templates are in `lib/email-templates.ts`: received, approved, waitlisted, reminder, starting and admin notification. All interpolated content is HTML-escaped. The contact form stores messages for review in `/admin/messages`; it does not silently send external replies.

## Payments and enrollment behavior

V1 uses manual approval and private payment instructions. The form never collects card details or claims to have taken payment. Admin payment states are pending, received, scholarship and free. `lib/payments.ts` defines the future provider boundary; verify signed webhooks before updating payment status if adding a gateway.

Pending and approved applications reserve capacity. Rejected, cancelled and waitlisted applications do not. Admission, approval and capacity changes lock the cohort row to prevent oversubscription. A full cohort either accepts a waitlist application or returns a clear error. Closing registration or passing the deadline rejects new requests server-side. One email can register once per cohort. Admin notes are append-only through the application.

## Customization and content

- `lib/config.ts`: instructor biography, brand, initial course identifiers and fallback configuration. Put a real portrait under `public/` and set `instructor.photo` to its local path. Until then an abstract monogram is used, never a fake portrait.
- `lib/content.ts`: eight curriculum modules, outcomes, FAQ, interests and university years.
- `/admin/course`: live course name/description and cohort schedule, price, capacity, registration state, private meeting URL, payment instructions and support visibility. Changes require no deployment.
- `.env.local`: verified contact email, WhatsApp and LinkedIn. Unset channels are omitted, not replaced with fictional information.
- `app/globals.css`: navy/teal design tokens, spacing, Arabic typography and responsive behavior. Fonts are bundled locally; there is no Google Fonts request.
- Arabic is the only active locale. `brand.locales` reserves English and Turkish. When adding a locale, extract route copy into locale dictionaries and add localized routes/metadata; there is intentionally no nonfunctional language switch.
- `lib/lms.ts`: future lesson, resource, assignment and progress contracts. No unfinished student portal or invented certificate UI is exposed in v1.

## Build and deployment to Vercel

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Import the repository into Vercel, select this directory as the root, choose Next.js, use `pnpm install --frozen-lockfile` and `pnpm build`, and configure the environment variables. Set `NEXT_PUBLIC_SITE_URL` to your final HTTPS domain **before building** so canonical links, sitemap and Open Graph URLs are correct. Rebuild when the public origin changes. Set up the email scheduler separately; no deployment assumes a paid cron plan.

Do not set `ACADEMY_TEST_FIXTURE` in a deployment. Never run `scripts/fixture-server.mjs` on a public host. The live app contains no fixture auth bypass. The test server is loopback-only, uses a separate database, and refuses production mode.

The application is Vercel-compatible but has **not been deployed to a public account** in this workspace. Production activation requires your Supabase project, email provider, real admin identity, domain and course details. Do not publish `.env.local`, test output, `node_modules` or `.next-fixture`.

## SEO and social card

Arabic metadata, canonical links, Course JSON-LD, sitemap and robots are implemented. Admin and confirmation pages are noindex. `public/opengraph-image.png` is a 1200×630 Arabic sharing card; `public/social-card.svg` is its editable vector template. Run `pnpm social-card` to regenerate; set `ARABIC_FONT_FILE` to a suitable local TTF font on non-Windows systems. The generated PNG is committed, so deployment does not need that font.

## Tests

`pnpm test` runs validation, CSV formula escaping, all RTL email templates and the actual SQL migrations using PGlite, a PostgreSQL engine. It verifies closed registration, empty database, capacity, waitlist, duplicate email, admin authorization, approval, cancellation, notes, payment state, RLS, rate limiting and outbox claiming. PGlite provides UUID generation directly, so the test omits only the `pgcrypto` extension declaration.

For interactive end-to-end QA:

```sh
node scripts/fixture-server.mjs
```

Open `http://127.0.0.1:3001`. The yellow notice labels every page as test-only. It uses real application code and real SQL with **simulated Supabase HTTP/Auth**, an in-memory database, capacity two and no real email transport. Test login: `admin@example.test` / `Local-test-only-2026!`. These credentials do not work in production. Restarting discards all fixture data.

See `QA.md` for actual results and the remaining live-service checks. A local fixture pass is not a claim that live Supabase Auth, real inbox delivery, provider webhooks or production Core Web Vitals have been verified.

## Operations and privacy

- Configure Supabase backups and regularly test restoration.
- Review the Arabic privacy/terms text against your actual operational practices and applicable jurisdiction before launch. It makes no blanket legal-compliance claim.
- Handle access/correction/deletion requests after verifying the requester. Retention review is an operational process, not an implemented automatic deletion job.
- Public form rate limiting is database-backed. On Vercel the trusted `x-vercel-forwarded-for` header is used. Other hosts use a shared fallback bucket; add a trusted proxy-specific adapter that strips spoofed IP headers before launching at scale.
- Analytics emit allowlisted event names locally only. No analytics data leaves the browser by default. Attach an aggregate-only, privacy-reviewed adapter if needed; never include sensitive field values.
- Keep dependency lockfiles and security updates under review. Security headers are set in `next.config.ts`; `unsafe-eval` is enabled only for development HMR, not production.

Reference implementation docs: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
