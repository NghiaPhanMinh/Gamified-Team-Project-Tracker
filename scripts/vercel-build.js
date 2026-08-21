import { spawnSync } from "node:child_process";

const hasProductionDeployKey = Boolean(process.env.CONVEX_DEPLOY_KEY?.trim());

const command = hasProductionDeployKey ? "npx" : "npm";
const args = hasProductionDeployKey
  ? [
      "convex",
      "deploy",
      "--cmd",
      "npm run build",
      "--cmd-url-env-var-name",
      "VITE_CONVEX_URL",
    ]
  : ["run", "build"];

if (!hasProductionDeployKey) {
  console.log("CONVEX_DEPLOY_KEY is unavailable; building the frontend without deploying Convex.");
}

const result = spawnSync(command, args, {
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
