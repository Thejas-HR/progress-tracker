## Progress Tracker

A personal dashboard for everyday habits, weekly goals, streaks, and consistency tracking. The current version supports local persistence, Supabase cloud sync, and magic-link sign-in so you can use it across devices.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase auth and database sync
- Ready for Vercel deployment

## What is built

- Daily dashboard with checkbox, count, and minutes-based habits
- Add and delete habits directly from the UI
- Weekly progress against self-defined goals
- Streak cards
- 12-week consistency heatmap
- Local browser storage fallback so the app works immediately
- Magic-link email sign-in for personal cloud access
- Cloud sync for habits and logs when Supabase is configured

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Paste your project URL and anon key into `.env.local`.
4. In Supabase Auth, enable email sign-ins and magic links.
5. Add your local URL like `http://localhost:3000` and your future Vercel URL to the redirect URL allow list.
6. Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.

The app uses local browser storage by default. Once the environment variables are present, you can sign in with email and sync habits and logs through Supabase.

## Deploying to Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Add the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables in Vercel.
4. After Vercel gives you the production URL, add that URL to Supabase Auth redirect settings.
5. Deploy.

## Notes

- The deployable app lives in the `progress-tracker-app` folder.
- If Supabase is not configured, the dashboard still works in local mode on the current device.
