Email Dashboard Sorter – MVP

## Getting Started

Prereqs
- Node 18+
- Supabase project (URL and anon key)
- OpenAI API key
- Google OAuth credentials (OAuth consent + Web app)

Setup
1. Copy ENV.EXAMPLE to .env and fill values
2. In Supabase SQL editor, run `supabase/schema.sql`
3. npm install
4. npm run dev

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

Auth & Inbox Connect
- Sign in via Supabase (magic link or providers you enable)
- Click "Connect Gmail" to authorize Google and save tokens
- Click "Sync Gmail" to fetch and classify recent emails

MVP Flow
- Log in → connect inbox → see categorized emails → see extracted leads in dashboard

Notes
- Update `APP_URL` when deploying
- Review RLS policies in `supabase/schema.sql`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
