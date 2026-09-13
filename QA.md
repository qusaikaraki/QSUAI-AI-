# Quality assurance — 12 September 2026

This report distinguishes tests completed locally from checks that require real deployment credentials.

## Completed

| Area | Result and evidence |
| --- | --- |
| TypeScript | Strict compiler checks passed; production build also performs type checking. |
| Automated suite | 8 tests passed via `node scripts/test.mjs`. |
| PostgreSQL schema | Both migration files executed on PGlite (PostgreSQL engine); only the unnecessary pgcrypto extension declaration was omitted for this engine. |
| Registration | Browser: empty form exposed 8 invalid fields, then a valid Arabic test application produced a UUID confirmation and appeared in the admin table. |
| Server validation | Invalid payload rejected with HTTP 400. Phone formatting requires 8–15 digits; markup, bad emails, unknown options, honeypot values and missing consent are rejected. |
| Capacity | Pending and approved applications consume seats. Overflow entered the enabled waitlist. Full-without-waitlist and expired deadlines reject applications. |
| Duplicates/rate limiting | Duplicate application returned 409; repeated submissions returned 429. |
| Admin access | Test authentication allowed the dashboard; unauthenticated admin endpoints returned 401. Database RPCs also rejected non-admin mutations. |
| Admin workflow | Browser: status, scholarship payment state and a new internal note were saved. The note persisted after refresh. |
| Course management | Browser: session count and closed state saved; student page displayed closed registration and disabled submission. |
| Search/filter/export | Waitlist filter displayed only the matching application. Authenticated CSV export contained only the requested approved row, correct attachment headers and UTF-8 BOM. Formula escaping has automated tests. |
| Contact | HTTP submission persisted; the protected inbox displayed the test message. |
| Email templates/outbox | All six Arabic RTL templates passed escaping checks. Registration/status/reminder jobs were queued. Atomic claiming and interrupted fifth-attempt cleanup passed PostgreSQL tests. |
| Authorization/privacy | RLS and browser-role table/RPC denial passed. Cross-origin admin mutation was rejected. Private meeting URL is excluded from public cohort reads. |
| Routes/assets | 15 public routes/assets returned 200; nonexistent route returned 404. Unauthenticated confirmation page redirected. |
| SEO | Arabic title, lang/dir, canonical metadata, Course JSON-LD, robots, sitemap and social PNG are present. Admin/confirmation noindex is configured. |
| Visual review | Desktop and narrow layouts inspected in browser. Arabic shaping and RTL navigation/form order checked. Hero, curriculum, methodology, project cards and social sharing image reviewed visually. |
| Accessibility fixes | Visible keyboard focus, skip link, native disclosure controls, labeled form errors, reduced-motion support. Darkened low-contrast secondary text and form borders. Replaced an offscreen honeypot that caused RTL horizontal overflow with a clipped fixed element. |

## Test environment limits

The end-to-end fixture runs the actual Next.js pages/API handlers and SQL, with a local simulated Supabase HTTP/Auth service and in-memory PostgreSQL. It is visibly labeled, loopback-only and never used for real enrollment. No fictional student appears in the default application.

Real Supabase Auth, live database connectivity, real inbox delivery, sender-domain authentication, production cron execution, backup recovery and a deployed-domain performance audit remain deployment acceptance checks. No actual student email was sent. The suite verifies templates and queue behavior, not mailbox receipt.

Desktop/narrow visual and keyboard checks are not a complete assistive-technology certification. A full Lighthouse/axe audit, screen-reader testing and real mobile-device Core Web Vitals should be run against the deployed domain; no numerical score or field performance claim is invented here.

## Reproduction

```sh
pnpm typecheck
pnpm test
pnpm build
node scripts/fixture-server.mjs
```

In a fresh fixture, submit the first test student from the browser using `student1@example.test`. Then `node scripts/http-qa.mjs` checks routes, unauthorized access, invalid input, contact storage, capacity/waitlist, duplicates and rate limits. Approve that first student in the browser, then `node scripts/admin-http-qa.mjs` verifies filtered CSV, reminder queuing, cross-origin rejection and the contact inbox. These two scripts intentionally depend on that documented fixture sequence and must not be pointed at production.

The local fixture intentionally never exercises real payment gateways or certificate generation: those are future extensions, not shipped v1 promises.
