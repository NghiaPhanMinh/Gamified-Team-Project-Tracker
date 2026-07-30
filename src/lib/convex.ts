import { ConvexReactClient } from "convex/react";

import { requireConvexUrl } from "./env";

export const convexClient = new ConvexReactClient(
  requireConvexUrl(import.meta.env.VITE_CONVEX_URL),
);
