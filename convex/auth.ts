import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

const ALLOWED_ORIGINS = [
  "https://may-lam-di-a3.vercel.app",
  "https://maylamdi.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function isAllowedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (ALLOWED_ORIGINS.includes(parsed.origin)) {
      return true;
    }
    if (
      parsed.hostname.endsWith(".vercel.app") &&
      (parsed.hostname.includes("may-lam-di") || parsed.hostname.includes("maylamdi"))
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async redirect({ redirectTo }) {
      if (typeof redirectTo === "string") {
        if (isAllowedUrl(redirectTo)) {
          return redirectTo;
        }
        if (redirectTo.startsWith("/")) {
          const siteUrl = (process.env.SITE_URL || "https://maylamdi.vercel.app").replace(/\/$/, "");
          return `${siteUrl}${redirectTo}`;
        }
      }
      return (process.env.SITE_URL || "https://maylamdi.vercel.app").replace(/\/$/, "");
    },
  },
});

