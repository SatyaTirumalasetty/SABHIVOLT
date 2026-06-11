# SABHIVOLT — Company Website

EV charging & energy infrastructure · Mangalagiri, Andhra Pradesh

Marketing site with a built-in admin panel: edit all content, manage enquiries
(with email notification on every submission), backup/restore, and CSV export.

**Stack:** React + Vite · Supabase (database + auth) · Vercel (hosting + serverless) · Resend (email)

---

## Local development

```bash
npm install
cp .env.example .env        # fill in your Supabase values (step 2 below)
npm run dev                 # http://localhost:5173
```

The site renders fully even without Supabase configured — it falls back to the
default content, and the enquiry form / admin show a "not connected" message.

---

## Deployment — step by step

### 1. Push this code to GitHub

```bash
git add -A
git commit -m "SABHIVOLT website v1"
git push origin main
```

### 2. Supabase (database + admin login) — free tier

1. Create a project at https://supabase.com (region: `ap-south-1` Mumbai for lowest latency).
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
3. **Authentication → Users → Add user**: create your admin account
   (your email + a strong password). Untick "send confirmation email" or confirm it.
4. **Authentication → Sign In / Up**: disable public sign-ups
   (only you create admin users).
5. **Project Settings → API**: copy the **Project URL** and **anon public key**.

### 3. Resend (enquiry email notifications) — free tier

1. Sign up at https://resend.com and create an API key.
2. For launch, the default `onboarding@resend.dev` sender works.
   Later, verify the `sabhivolt.com` domain in Resend and change `NOTIFY_FROM`.

### 4. Vercel (hosting) — free tier

1. https://vercel.com → **Add New Project** → import the `SABHIVOLT` GitHub repo.
   Framework preset: **Vite** (auto-detected). Build command `npm run build`,
   output `dist` (defaults are correct).
2. **Environment variables** (Settings → Environment Variables):

   | Name | Value | Used by |
   |---|---|---|
   | `VITE_SUPABASE_URL` | your Supabase project URL | frontend |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon key | frontend |
   | `RESEND_API_KEY` | your Resend key | `api/notify` |
   | `NOTIFY_EMAIL` | where enquiry alerts go | `api/notify` |

3. Deploy. Every `git push` to `main` redeploys automatically.

### 5. Domain

1. Buy `sabhivolt.com` (and ideally `sabhivolt.in`) at any registrar.
2. Vercel → Project → Settings → **Domains** → add the domain and follow the
   DNS instructions (one A/CNAME record). SSL is automatic.

### 6. After launch (15 minutes, high value)

- Create a **Google Business Profile** for "SABHIVOLT, Mangalagiri".
- Add the site to **Google Search Console** and submit the sitemap.
- Replace the placeholder phone/email via the admin panel (⚙ Admin in the footer).

---

## How the pieces fit

```
Visitor ──► Vite/React site (Vercel CDN)
              │  reads site_content (public SELECT via RLS)
              │
Enquiry ───► Supabase `enquiries` table (anon INSERT only)
              └──► /api/notify (Vercel function) ──► Resend ──► your inbox

Admin ─────► Supabase Auth (email+password)
              └──► full read/write on content + enquiries (RLS: authenticated)
```

- **Row Level Security** is the real protection: anonymous visitors can read
  content and insert enquiries — nothing else. Reading or changing anything
  requires a signed-in admin session. There is no client-side PIN to bypass.
- **Content backups:** every save stores the previous version under the
  `backup` key; the admin Settings tab restores it in one click.
- The notification call is fire-and-forget: if email ever fails, the enquiry
  is still safely stored in Supabase.

## Project structure

```
api/notify.js            Serverless email alert on new enquiry (Resend)
supabase/schema.sql      Tables + RLS policies — run once in Supabase
src/App.jsx              Site shell: sections, scroll spy, reveals, auth state
src/components/
  widgets.jsx            Map of AP, flow diagram, count-up stats, privacy modal
  forms.jsx              Enquiry form, admin login
  AdminPanel.jsx         Content editor, enquiry inbox + CSV, settings
src/lib/
  content.js             Default content, migration, shared helpers
  data.js                All Supabase calls (content, enquiries, auth)
  a11y.js                Focus-trap / Escape hook for dialogs
src/styles.css           Full design system (Volt Teal #00D4AA)
```

## Later improvements

- WhatsApp alerts (Interakt / Gupshup / WhatsApp Cloud API) alongside email
- Cloudflare Turnstile on the enquiry form if spam appears
- Telugu language toggle
- Real site photography once the first charger is installed
