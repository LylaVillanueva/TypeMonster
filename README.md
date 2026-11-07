# Type Monster

Type Monster is a responsive typing practice website for building speed, accuracy, and touch-typing habits. Visitors can practice as guests, with progress stored in their browser. Each signed-in account also gets its own browser storage scope; optional Supabase sign-in syncs that account's practice history and preferences across devices.

## Features

- **Practice:** Timed, Words, Free type, and Quote modes; configurable round length and word count; optional uppercase, punctuation, number, and letter-focus settings.
- **Daily practice:** Set a daily goal, track practice time, and maintain a streak.
- **Learn:** Guided home, top, and bottom row lessons with finger-color keyboard guidance.
- **Progress:** Review recent rounds, unique speeds, accuracy, and pace trends.
- **Personalization:** Color themes, passage size, four typing sounds with volume control, and background music with volume control.
- **Responsive layout:** Works on desktop, tablet, and mobile screens.

## Pages

The navigation follows the practice flow: **Practice → Learn → Progress**.

## Deploy to Vercel

1. Push this repository to GitHub and import it as a project in Vercel.
2. Use the included Vite settings: build command `npm run build`, output directory `dist`.
3. Deploy. Vercel applies the security headers in `vercel.json`.

Practice works without account credentials. To enable sign-in and cloud sync:

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor. The schema enables row-level security and limits each account to its own records.
2. In Vercel **Project Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the environments you deploy.
3. In Supabase **Authentication → URL Configuration**, add your Vercel production URL (and any preview URLs you use) to the allowed redirect URLs.
4. Redeploy so the build can include the configured public project URL and publishable key.

The Supabase publishable key is intended for browser use; database access is protected by the schema's row-level security policies. On a browser's first sign-in, its guest progress moves into that account and the guest profile resets; each signed-in account then has its own local data scope. Never put a Supabase secret or `service_role` key in a `VITE_*` variable or client-side code.

## Project structure

```text
assets/       Brand icons and practice audio
src/          Website behavior and styles
supabase/     Browser client and RLS-protected database schema
index.html    App markup and page structure
vercel.json   Vercel build settings and security headers
```
