# QuestBoard

QuestBoard is a shared university project room: a team joins with a code, locks a weekly boss roster, splits HP across member shares, and clears the boss only when every member’s PDF proof is verified by their assigned teammate. Separate goblin logs are lightweight, unverified daily motivation and never affect boss HP.

## Included in this rebuild

- React + Vite frontend with Tailwind CSS and responsive layouts.
- Persistent email-based prototype sign-in; the local session survives reloads and is designed to map to Convex Auth magic-link/password auth.
- Team creation or join-code entry with a shared live-room data model.
- One consolidated boss form: name, hard deadline, locked party roster, verifier per member, and even/custom HP shares.
- Boss-share PDF submission, one assigned verifier, required review comment, approval/rejection, and HP computed from unverified shares.
- Independent goblin kill logs with optional note/screenshot, fun scene animation, derived daily/period quota, personal streak, and no boss gating.
- `QuestScene` with animated clouds, trees, avatars, join notification, goblin queue, particle burst, dragon entrance/hover, and wizard presence.
- Deadline resolution to defeated/survived with no penalty for survive.
- Activity log and client-side PDF export covering bosses, shares, verifiers, outcomes, goblins, and timestamps.
- Optional server-side OpenRouter draft action; nothing is created until the editable consolidated boss form is confirmed.

The browser app includes a filled-in demo room and a local-storage fallback so the manual path can be explored without a running Convex deployment. With Convex configured, `ConvexProvider` and the live workspace query are ready for reactive shared data.

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
2. Copy `.env.example` to `.env.local` and set `VITE_CONVEX_URL` to the deployment URL.
3. Start development with `pnpm convex:dev`, or deploy with `pnpm convex:deploy`.
4. Configure the server-only AI secret through the Convex CLI or dashboard:

```bash
npx convex env set OPENROUTER_API_KEY <your-key>
```

Required environment variable names:

- `VITE_CONVEX_URL` — public Convex deployment URL used by the frontend.
- `OPENROUTER_API_KEY` — server-only Convex environment variable used by `convex/ai.ts`.

Never put a real OpenRouter key in `.env.local`, Vercel, source code, README files, or commits. The AI action reads it only via `process.env.OPENROUTER_API_KEY`.

## Deployment

- Deploy the frontend to Vercel with `VITE_CONVEX_URL` configured in Project Settings → Environment Variables.
- Deploy Convex functions with `pnpm convex:deploy`.
- Keep `OPENROUTER_API_KEY` only in Convex; nothing OpenRouter-related belongs in Vercel.

## Upgrade path

The hand-coded mascot pass is a functional placeholder. A later visual pass can swap the same component props for free CC0 fantasy vector/sprite assets from Kenney.nl or community animations from LottieFiles without changing surrounding game logic.

## Intentionally excluded

No deadline negotiation, payments, separate leveling stats, goblin verification/weights/status, open peer-verification pools, recurring AI calls, or multi-step boss wizard. Deadlines are fixed; goblins are purely unverified logs; each boss share has exactly one assigned verifier; and boss setup is one consolidated form.
