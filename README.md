# QuestBoard

Gamified team project tracker for university students: verify each other’s work, reduce the shared boss HP, and finish the final quest together.

QuestBoard turns the messy middle of a university group project into a shared weekly quest: the team creates a boss with real remaining-work HP, optionally splits it into goblins, submits proof, and lets one assigned teammate verify each hit.

## What is included

- Responsive React + Vite frontend styled with Tailwind CSS.
- Lightweight display-name sign-in and invite-code team setup for the prototype.
- Manual project, boss, and optional goblin creation.
- One owner and exactly one verifier per goblin.
- Short proof updates with optional file names in local prototype mode, plus Convex storage upload scaffolding.
- Approval/rejection flow with a required verifier comment.
- Reactive-style HP updates in the app state, with Convex queries and mutations in `convex/` ready for cloud wiring.
- Deadline resolution to `defeated` or `survived`; a survive has no penalty anywhere in the UI or data model.
- Plain-language activity log and client-side PDF export.
- Inline SVG `Goblin`, `Dragon`, and `Wizard` components with state/color props.
- Optional, explicit AI draft flow. The server action reads `OPENROUTER_API_KEY` only from Convex.

The browser app works immediately in local prototype mode. If no Convex URL is configured, it persists the room in browser local storage so the full manual flow can be tried without a backend. The filled-in demo room is available from the sign-in screen.

## Run locally

Install Node.js 20+ and run:

```bash
pnpm install
pnpm dev
```

Then open the Vite URL shown in the terminal. For a production build:

```bash
pnpm build
pnpm preview
```

## Convex setup

1. Create or connect a Convex project.
2. Copy `.env.example` to `.env.local` and set `VITE_CONVEX_URL` to the project URL.
3. Start the Convex development process with `pnpm convex:dev`, or deploy with `pnpm convex:deploy`.
4. Configure the server-only AI secret through the Convex CLI or dashboard:

```bash
npx convex env set OPENROUTER_API_KEY <your-key>
```

Required environment variable names are:

- `VITE_CONVEX_URL` — the public Convex deployment URL used by the frontend.
- `OPENROUTER_API_KEY` — a server-only Convex environment variable used by `convex/ai.ts`.

Never put a real OpenRouter key in `.env.local`, Vercel, source code, README files, or commits. The AI call belongs in the Convex action and must read the key via `process.env.OPENROUTER_API_KEY`.

The Convex schema and functions cover teams, projects, bosses, goblins, activity logs, file upload URLs, scheduled deadline resolution, and the optional AI action. Convex Auth can provide the production identity layer; the current browser fallback intentionally keeps prototype sign-in lightweight.

## Deployment

- Deploy the frontend to Vercel with `VITE_CONVEX_URL` configured in Project Settings → Environment Variables.
- Deploy the Convex functions with `pnpm convex:deploy`.
- Do not configure `OPENROUTER_API_KEY` in Vercel; it belongs only in Convex.

## Upgrade path

The hand-coded mascot pass is a functional placeholder. A later visual pass can swap the same component props for free CC0 fantasy vector/sprite assets from Kenney.nl or community animations from LottieFiles without changing the surrounding game logic.

## Scope intentionally excluded

The prototype does not include deadline negotiation, payments, separate leveling stats, open verification pools, or recurring/background AI calls. Deadlines are fixed; HP is literal task scope; each goblin has one assigned verifier; and AI is explicit and optional.
