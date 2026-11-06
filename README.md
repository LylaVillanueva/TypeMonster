# Type Monster

A responsive typing-practice website with local progress tracking and optional Supabase sign-in and sync.

## Project layout

```text
assets/              Hand-drawn logo
src/                 Website JavaScript and styles
supabase/            Browser client, RLS schema, and setup notes
index.html           Vite HTML entry point
.env.example         Safe environment-variable template
```

Supabase provides the app's backend. There is no separate Node API server; the browser uses only the Supabase project URL and publishable key, while row-level security restricts database access to each signed-in user.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Add the project URL and publishable key to `.env.local`. See [Supabase setup](supabase/README.md) for the database schema, sign-in redirect configuration, and Vercel environment variables. Never put a Supabase secret or `service_role` key in the browser or a `VITE_` variable.

## Build    

```sh
npm run build
npm run preview
```

Vite writes the production site to `dist/`. The lockfile is committed so installs use reproducible dependency versions.

## Practice features

- Timed rounds (30 seconds by default), word-count, quote, and free-type modes.
- A separate daily-practice goal, saved streaks, and results after each completed round.
- Letter-focused paragraphs with optional capitalization and punctuation.
- Touch-typing lessons and per-round speed and accuracy history.
- Local-first storage with optional account sync through Supabase.
# TypeMonster
