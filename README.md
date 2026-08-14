# AgriEnv

AgriEnv is an interactive study workspace for Agricultural and Environmental Engineering students. It combines engineering simulations, AI-assisted revision, real-time quiz battles, voice study, and project-idea development in a responsive green-and-white interface.

## Features

- Hydrology, irrigation, drainage, and erosion simulations
- AI-generated practice questions and past-paper analysis
- Live group quiz rooms with scoring and leaderboards
- Voice-led study sessions with AI feedback
- Context-aware final-year project ideas
- Email/password and Google Identity Services authentication through Supabase
- Responsive, installable PWA interface

## Local development

Requirements: Node.js 20+ and a Supabase project.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Configure these variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
OPENAI_API_KEY=
```

Run [`supabase-schema.sql`](./supabase-schema.sql) in the Supabase SQL editor before using profiles, question storage, or Showdown rooms. Enable the Google provider in Supabase and add your local and production origins to the matching Google Web OAuth client.

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

The project is ready for Vercel. Add all four environment variables to the Vercel project, deploy, and then add the production URL to:

- Supabase Authentication → URL Configuration
- Google OAuth client → Authorized JavaScript origins

Never commit `.env.local` or a Supabase service-role key.
