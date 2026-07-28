import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: { displayName: v.string(), email: v.string(), avatarColor: v.string(), spell: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existing) { await ctx.db.patch(existing._id, args); return existing._id; }
    return ctx.db.insert("users", { ...args, createdAt: Date.now() });
  },
});
