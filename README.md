# Type Monster

Type Monster is a responsive typing practice website for building speed, accuracy, and touch-typing habits. Visitors can practice as guests, with progress stored in their browser. Each signed-in account also gets its own browser storage scope; optional Supabase sign-in syncs that account's practice history and preferences across devices.

## Features

- **Practice:** Timed, Words, Free type, and Quote modes; configurable round length and word count; optional uppercase, punctuation, number, and letter-focus settings.
- **Daily practice:** Set a daily goal, track practice time, and maintain a streak.
- **Learn:** Guided home, top, and bottom row lessons with finger-color keyboard guidance.
- **Progress:** Review recent rounds, unique speeds, accuracy, and pace trends.
- **Help & feedback:** Send a suggestion or report a problem without creating an account.
- **Personalization:** Color themes, passage size, four typing sounds with volume control, and background music with volume control.
- **Responsive layout:** Works on desktop, tablet, and mobile screens.

## Pages

The navigation follows the practice flow: **Practice → Learn → Progress**.

## Deploy to Vercel

1. Push this repository to GitHub and import it as a project in Vercel.
2. Use the included Vite settings: build command `npm run build`, output directory `dist`.
3. Deploy. Vercel applies the security headers in `vercel.json`.

Practice works without account credentials. To enable sign-in and cloud sync:

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor. The schema enables row-level security, limits account data to its owner, and lets guests submit feedback without reading feedback records.
   If you already created the tables with an earlier version, also run [`supabase/align_column_types.sql`](supabase/align_column_types.sql) to align the bounded counters with the diagram's `int2` types.
2. In Vercel **Project Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for each environment you deploy. Copy both values from the **same** Supabase project. Use its browser-safe publishable key (`sb_publishable_…`) or legacy anon key (`eyJ…`); never use a secret or `service_role` key. If the Vercel project already uses `VITE_SUPABASE_ANON_KEY`, that name is also supported.
3. In Supabase **Authentication → URL Configuration**, add your Vercel production URL (and any preview URLs you use) to the allowed redirect URLs.
4. Redeploy after adding or changing environment variables. Vite embeds these values during the build, so updating Vercel settings alone does not update an existing deployment.

If sign-in reports **invalid API key**, verify the deployed environment has the URL and key from the same Supabase project and that the key is publishable/anon, then redeploy. If Help cannot send feedback, make sure the latest `supabase/schema.sql` has been run in that project's SQL Editor; feedback uses the `user_feedback` table.

The Supabase publishable key is intended for browser use; database access is protected by the schema's row-level security policies. On a browser's first sign-in, its guest progress moves into that account and the guest profile resets; each signed-in account then has its own local data scope. Never put a Supabase secret or `service_role` key in a `VITE_*` variable or client-side code.

## Project structure

```text
assets/       Brand icons and practice audio
src/          Website behavior and styles
supabase/     Browser client, RLS-protected schema, and type-alignment migration
index.html    App markup and page structure
vercel.json   Vercel build settings and security headers
```
