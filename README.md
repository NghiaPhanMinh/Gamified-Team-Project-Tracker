# MayLamDi

## Local fonts

The repository does not currently contain licensed Blode Starkly or Glacial Indifference font files. The interface therefore uses reliable system fallbacks on every computer. To self-host the intended typography, provide licensed WOFF2 files at `public/fonts/BlodeStarkly.woff2` and `public/fonts/GlacialIndifference-Regular.woff2`; then add matching `@font-face` declarations in `src/styles/index.css`. Do not hotlink font-download websites.

MayLamDi is a realtime project-planning platform for university teams. It helps
teams structure long projects, allocate work transparently, track progress, and
preserve contribution evidence without punitive ranking.

This repository is an intentional clean start. No deleted QuestBoard code has
been restored or migrated.

## Foundation status

- Phase 0: clean React/Vite/TypeScript/Tailwind bootstrap
- Phase 1: link and verify the existing Convex development deployment
- Product features remain gated until the foundation checks pass

See `mldchecklist-v5.md` for the honest implementation and test status.

## Local setup

Requirements:

- Node.js 22 or a compatible current LTS release
- npm
- access to the existing Convex project for backend development

Install and run:

```sh
npm install
npm run dev
```

Create `.env.local` from `.env.example` and set:

```env
VITE_CONVEX_URL=https://resilient-mastiff-759.convex.cloud
VITE_CONVEX_SITE_URL=https://resilient-mastiff-759.convex.site
```

Do not place Google, OpenRouter, Convex deploy, GitHub, or Vercel secrets in
frontend `VITE_` variables.

## Google authentication development setup

MayLamDi uses Convex Auth with Google only. Configure Google Cloud with:

- Authorized JavaScript origin: `http://localhost:5173`
- Authorized redirect URI:
  `https://resilient-mastiff-759.convex.site/api/auth/callback/google`
- Basic OpenID, email, and profile identity only

Set the Google client values privately on the Convex development deployment:

```sh
npx convex env set AUTH_GOOGLE_ID
npx convex env set AUTH_GOOGLE_SECRET
```

The Convex Auth initializer already sets `SITE_URL`, `JWT_PRIVATE_KEY`, and
`JWKS` for the development deployment. Never commit their values.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Production deployment

- GitHub stores source code.
- Vercel hosts the React/Vite frontend.
- Convex provides data, functions, realtime subscriptions, file storage,
  authentication integration, and scheduled functions.
- Google Cloud provides the Google OAuth client.
- OpenRouter is an optional server-side AI provider.

The Vercel project uses:

```text
Framework preset: Vite
Root directory: .
Install command: npm install
Build command: npm run vercel-build
Output directory: dist
Production branch: main
```

Set `CONVEX_DEPLOY_KEY` as a private Vercel Production environment variable.
The build command deploys the Convex schema and functions, then builds the Vite
frontend with the production `VITE_CONVEX_URL`. Do not manually point a
production Vercel build at the development deployment.

Configure these values privately on the production Convex deployment:

```text
SITE_URL
JWT_PRIVATE_KEY
JWKS
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
```

AI planning is optional. To enable it, set the private OpenRouter values on
both Convex deployments. Omitting the model values uses the documented app
defaults in this free-only order: `google/gemma-4-26b-a4b-it:free`,
`google/gemma-4-31b-it:free`, `google/gemma-3-27b-it:free`, then
`openrouter/free`. `OPENROUTER_FREE_FALLBACK_MODELS` accepts a comma-separated
list and ignores non-free model identifiers:

```sh
npx convex env set OPENROUTER_API_KEY
npx convex env set OPENROUTER_MODEL
npx convex env set OPENROUTER_FALLBACK_MODEL
npx convex env set OPENROUTER_FREE_FALLBACK_MODELS

npx convex env set --prod OPENROUTER_API_KEY
npx convex env set --prod OPENROUTER_MODEL
npx convex env set --prod OPENROUTER_FALLBACK_MODEL
npx convex env set --prod OPENROUTER_FREE_FALLBACK_MODELS
```

Never add OpenRouter values to a `VITE_` variable or commit them to a file.

For Google OAuth, register:

```text
Production JavaScript origin:
https://maylamdi.vercel.app

Production redirect URI:
https://reminiscent-narwhal-80.convex.site/api/auth/callback/google

Local JavaScript origin:
http://localhost:5173

Development redirect URI:
https://resilient-mastiff-759.convex.site/api/auth/callback/google
```

The production frontend uses the separate Convex deployment
`reminiscent-narwhal-80`. The repository owner must connect
`NghiaPhanMinh/Gamified-Team-Project-Tracker` to the Vercel project for
automatic deployments from `main`; GitHub does not allow a collaborator on a
personal repository to establish that Vercel connection.

## Fonts

The design specifies Blode Starkly for headings and Glacial Indifference for
body text. Font files are not bundled because licensed files were not supplied.
The interface uses documented system fallbacks and remains functional without
those fonts.
