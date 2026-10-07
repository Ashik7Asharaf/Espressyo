# T Nation — website

Multi-page website and admin dashboard for **T Nation**, a talent management company for artists, athletes and creators from South India (Bengaluru HQ, focus on Kerala and Karnataka).

> Tagline: *Taking South India's talent to the world.*

Server-rendered Node.js (Express) with SQLite (`node:sqlite`, built into Node ≥ 22.13). It has no front-end framework or build step, and the pages work without JavaScript; JS adds animation, live filters, the calculator and inline form submission.

## Run it

```bash
cd tnation
npm install
npm start            # http://localhost:3000
npm test             # 20 end-to-end + unit tests (node:test)
```

Admin: `http://localhost:3000/admin`. Development login is `admin@tnation.local` / `change-me-now`. **Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `SESSION_SECRET` before deploying.** See `.env.example`.

The SQLite file, uploads and the dev email outbox live in `data/` (git-ignored). On first start the database is seeded with **clearly marked placeholder** talent and shows (`is_placeholder = 1`). Replace or delete them from the admin dashboard.

## Pages

| Path | What it does |
|---|---|
| `/` | Hero, four business lines, featured-talent carousel, live “upcoming shows” strip (refreshes from `/api/shows/upcoming`), audience paths, Join button |
| `/roster`, `/roster/:slug` | Filterable grid (type, city, language, sport/genre) and profile pages (bio, media, achievements, upcoming dates, Book button) |
| `/live` | India and overseas listings, promoter booking enquiry form |
| `/overseas` | End-to-end process, **Tour Net-Cash Calculator**, US$180k sample case, destination guide (US, UK, Canada, Australia, Germany/EU, UAE), pre-tour checklist, “Plan your overseas show” lead-time planner, mandatory disclaimer |
| `/brands` | Packages, case-study placeholders, brand enquiry form |
| `/rights` | Rights & royalties explainer, request-a-review form |
| `/about` | Story, team placeholders, Bengaluru HQ map (OpenStreetMap), Kerala office placeholder |
| `/join` | Talent application with file upload (reel, portfolio or stats) and consent checkbox |
| `/contact` | Enquiry form, email and WhatsApp button |
| `/privacy` | Privacy and cookie policy (draft for legal review) |
| `/admin` | Login-protected dashboard: roster and show CRUD, enquiries, applications, calculator and plan leads, status dropdown (New / In review / Signed / Declined), CSV export |

The main navigation has an **EN / മലയാളം / ಕನ್ನಡ** toggle. The choice is saved per browser. *Have a native speaker review the Malayalam and Kannada labels in `src/i18n.js` before launch.*

## Data

Tables: `talent`, `shows`, `enquiries` (booking, brand, rights, contact), `applications`, `calculator_leads` (calculator estimates and overseas plans). Schema: `src/db.js`.

Every form submission is saved first, then an email notification goes to `NOTIFY_EMAIL` via SMTP. Without SMTP, the notification is written to `data/outbox/`.

## Spam protection and security

* Honeypot field, signed render-time token (rejects instant bot posts and stale forms), per-IP rate limit, link-stuffing check; optional Cloudflare Turnstile when keys are set.
* Uploads: extension allowlist, size limit, random filenames, stored outside the public folder, downloadable only by admins.
* Admin: scrypt-checked credentials, signed HttpOnly session cookie, CSRF tokens on every admin POST, login rate limit, `noindex`.
* Strict CSP and security headers; all output HTML-escaped; CSV exports guard against spreadsheet formula injection.
* Cookie consent banner. Only strictly necessary cookies are used; analytics hooks should wait for `window.tnConsent.analytics` / the `tn:consent` event.

## SEO

Per-page titles, meta descriptions, canonical URLs, Open Graph and Twitter tags (`public/img/og.png`), `/sitemap.xml` (includes published, non-placeholder talent), `/robots.txt`, and JSON-LD: `Organization` on every page, `Person` on talent profiles and `Event` for shows. **Placeholder rows never emit schema and placeholder profiles are `noindex`**, so search engines are not fed fictional people or events. Untick “Placeholder” in the admin to publish real entries.

`scripts/build-images.js` regenerates `og.png` and `logo.png` (needs Playwright).

## Tour Net-Cash Calculator: method

Shared code in `public/js/tour-calc.js` (browser and server). For each scenario:

* **No planning**: destination withholding on **gross** fees.
* **With relief** (CWA / waiver / exemption certificate): foreign tax on **net** income at the destination's relief rate, plus adviser/filing costs.
* Commission and band, ground, visa and travel costs are deducted. The artist's Indian tax on net income (default 35.88% = 30% + 15% surcharge + 4% cess) is reduced by a foreign tax credit capped at the Indian tax, so any foreign tax above that is lost.

Sample case (US$180,000 gross over 6 US shows, 20% commission, US$48,000 band and ground, US$24,900 visa and travel): artist keeps **US$17,100 (9.5%)** with no planning and **≈US$43,089 (23.9%)** with planning.

> **Illustrative estimates. Tax, GST, FEMA and visa rules change; confirm with a chartered accountant or lawyer before any booking.** Rates, routes and lead times in the destination guide are planning assumptions to verify, not advice.

## Content rules

No real clients, revenue figures or testimonials are included. All roster entries, shows, team members, case studies, addresses, email and WhatsApp number are **labelled placeholders**. Replace them before launch.

## Deploying

Run anywhere that runs Node 22.13+ with a persistent disk for `data/` (e.g. Render, Railway or Fly.io with a volume, or a VPS). Put it behind HTTPS, set `NODE_ENV=production`, the env vars above and `TRUST_PROXY`. Back up `data/tnation.db` and `data/uploads/`.
