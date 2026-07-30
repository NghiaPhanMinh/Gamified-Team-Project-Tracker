const CONVEX_URL_PATTERN = /^https:\/\/[a-z0-9-]+\.convex\.cloud$/;

export function requireConvexUrl(value: string | undefined): string {
  if (!value) {
    throw new Error(
      "MayLamDi is missing VITE_CONVEX_URL. Copy .env.example to .env.local and add the existing Convex deployment URL.",
    );
  }

  if (!CONVEX_URL_PATTERN.test(value)) {
    throw new Error(
      "MayLamDi received an invalid VITE_CONVEX_URL. Expected an https://*.convex.cloud deployment URL.",
    );
  }

  return value;
}
