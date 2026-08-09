# MayLamDi deployment

The official production site is deployed from the `main` branch by
`.github/workflows/deploy-production.yml`.

## Team workflow

1. Create a branch for each change.
2. Open a pull request into `main`.
3. Wait for the automated tests and build to pass.
4. Merge the pull request.
5. GitHub Actions deploys the Convex backend and the Vercel frontend to
   <https://maylamdi.vercel.app>.

## Required repository secret

The repository must contain a GitHub Actions secret named `VERCEL_TOKEN`.
Use a Vercel access token scoped to the `maylamdi` project. Never commit or
paste the token into a source file, workflow, issue, or pull request.

The official Vercel project already stores `CONVEX_DEPLOY_KEY`, so its Vercel
build deploys the production Convex functions before building the frontend.
Preview projects without that key build only the frontend and never attempt to
change the production backend.
