# Next.js sandbox (web-next)

This app is part of the `nextjs-migration` branch. The original Vite app remains intact at the repo root.

## Setup
1. Copy `.env.local.example` to `.env.local` and set values for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Install dependencies and run dev server:
```bash
cd web-next
npm install
npm run dev
```

The app will start on http://localhost:3000.