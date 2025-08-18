## uConstruct Next.js app

### Production URL

- **Production**: [next.uconstruct.app](https://next.uconstruct.app)

### Overview

This repository contains the Next.js migration of the uConstruct web app. It uses the Next.js App Router with React Server Components on top of Supabase for authentication and data. The UI is built with shadcn/ui and Tailwind CSS, and data fetching/caching is managed by TanStack Query.

### Features

- **Authentication (Supabase Auth)**: Email/password, magic link, email verification, and password reset flows. The `dashboard` route is protected.
- **Site Visits**: Browse planned/completed visits, and create new visits by selecting job sites and linked employers. Tracks schedule, objective, estimated worker counts, and status.
- **Employers**: List employers (name and type).
- **Workers**: List workers with contact details and membership status. Worker placements are created when importing.
- **Projects**: Project list and minimal project detail view.
- **Upload**: CSV import of workers with basic schema normalization, employer matching/creation, optional organiser matching, and automatic creation of worker placements.
- **Admin**: Send magic-link invites and run a `sync_auth_users` RPC to reconcile users.
- **Modern UI**: shadcn/ui components, Tailwind, lucide-react icons, and recharts (available for charts).

### Tech stack

- **Next.js 15** (App Router, TypeScript)
- **React 18**
- **Supabase** (`@supabase/supabase-js`)
- **TanStack Query 5**
- **Tailwind CSS** + **shadcn/ui**

## Requirements

- **Node.js >= 20** (see `package.json` engines)
- **pnpm** (recommended) or npm/yarn
- A **Supabase** project with the required tables (e.g., `employers`, `workers`, `projects`, `job_sites`, `site_visit`, `worker_placements`, `site_contractor_trades`, `organisers`, `project_employer_roles`) and the `sync_auth_users` RPC

## Environment variables

Create a `.env.local` in the repository root with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- These are required for both client and server usage in this app. If they are missing, you will see: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY".
- For email flows to succeed locally, set the Supabase Auth Site URL and allowed redirect URLs to your local app (see below).

Optional (if using the included Supabase Edge Function `get-google-maps-key`):

```bash
# Configure these as function env vars in Supabase, not in the Next.js app
GOOGLE_MAPS_API_KEY_UCONSTRUCT=browser-restricted-key
GOOGLE_MAPS_API_KEY=browser-restricted-key
```

## Local development

```bash
pnpm install
pnpm dev
# App runs at http://localhost:3000
```

Notes:

- Ensure your Supabase project's Auth settings allow local redirects:
  - Auth > URL Configuration:
    - Site URL: `http://localhost:3000`
    - Redirect URLs: `http://localhost:3000/auth`, `http://localhost:3000/auth/reset`
- The app uses magic links and password reset flows that redirect to `/auth` and `/auth/reset` respectively.

## Build and production run

```bash
pnpm build
pnpm start
```

## Linting

```bash
pnpm lint
```

## Project structure

```
src/
  app/                # Next.js App Router routes
  components/         # UI and feature components (shadcn/ui)
  hooks/              # React hooks (e.g., auth, toasts)
  integrations/
    supabase/         # Supabase client (browser/server) and generated types
  lib/                # Utilities (e.g., supabase-browser helper, offline queue)
supabase/
  functions/          # Edge Functions (e.g., get-google-maps-key)
public/               # Static assets
```

## Supabase configuration tips

- Configure SMTP in Supabase (Auth > Email) with your domain, and set SPF/DKIM in DNS for production.
- Customize the "Confirm signup" template and include the `{{ .ConfirmationURL }}` placeholder.
- If users are not receiving emails, verify SMTP credentials and the Auth URL configuration.

## Troubleshooting

- **Missing env error**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.
- **Auth redirects not working**: Confirm Supabase Auth > URL Configuration includes `http://localhost:3000` and the `/auth` and `/auth/reset` paths.
- **401/permission errors**: Check row level security policies and service role usage in your Supabase project.
