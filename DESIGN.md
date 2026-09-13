# Design system and information architecture

## Brand thesis

A calm, rigorous Arabic learning environment: a practical engineer's classroom rather than a marketplace. An orbit-based knowledge diagram makes the path from understanding to building visible without stock robots or invented authority.

- Midnight navy `#142E3D`: structure, headings, methodology and instructor monogram.
- Deep teal `#176F5B`: primary action and educational emphasis.
- Off-white `#F8FAF9`: reading surface.
- Pale mint `#DEF2E9`: contextual emphasis.
- Restrained gold `#D3AD71`: nonessential geometric detail.
- IBM Plex Sans Arabic, locally bundled, weights 400/500/600/700.
- Body 16–18 px, generous Arabic line height; responsive headings 28–58 px.
- Logical inline spacing, native RTL document order, isolated LTR emails/numbers.
- Native details/summary for keyboard-operable FAQ and curriculum, explicit form labels, focus outlines, skip link and reduced-motion support.

The instructor portrait remains an honest monogram until a real photograph is supplied. All examples describe possible projects; no student achievements, testimonials, partner logos or enrollment counts are invented.

## Routes

| Route                        | Purpose                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| `/`                          | Mission, instructor, format, outcomes, curriculum and next step |
| `/courses`                   | Current course catalog                                          |
| `/courses/ai-for-university` | Flagship course, schedule, curriculum and FAQ                   |
| `/about`                     | Editable instructor background and educational mission          |
| `/method`                    | Understand → practice → verify → apply → build                  |
| `/register`                  | Validated application with explicit availability                |
| `/registration-success`      | Private-cookie confirmation reference                           |
| `/faq`                       | Clear student questions and ethical academic use                |
| `/contact`                   | Message form and configured contact channels                    |
| `/privacy`, `/terms`         | Arabic data-use and registration terms                          |
| `/admin/login`               | Supabase-backed admin sign-in                                   |
| `/admin`                     | Counts, filters, applications and CSV export                    |
| `/admin/registrations/[id]`  | Application review, status, payment and notes                   |
| `/admin/course`              | Persistent course/cohort management                             |
| `/admin/messages`            | Contact inbox                                                   |
| `/admin/emails`              | Delivery queue visibility and student reminders                 |

## State and flow

Course → application → server Zod validation → rate-limited atomic PostgreSQL admission → UUID + outbox → confirmation → administrative review → optional manual payment instructions.

Upcoming/closed/deadline-passed states do not accept applications. Open/full transitions are enforced inside the database transaction. A waitlist is only available when explicitly enabled. Support interest is only collected when enabled by the admin and never promises a scholarship.

## Extension boundaries

Course/cohort separation supports later cohorts without rewriting registration records. Profiles and LMS contracts support a future student portal. Payment and email modules can gain providers independently. Only Arabic is shipped as an active locale; language placeholders are not presented to users.
