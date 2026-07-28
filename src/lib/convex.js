import { anyApi } from "convex/server";

export const convexUrl = import.meta.env.VITE_CONVEX_URL || "";
export const convexApi = anyApi;
