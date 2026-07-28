import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byBoss = query({
  args: { bossId: v.id("bosses") },
  handler: async (ctx, args) => ctx.db.query("goblinLogs").withIndex("by_boss_time", (q) => q.eq("bossId", args.bossId)).order("desc").collect(),
});

export const create = mutation({
  args: { teamId: v.id("teams"), bossId: v.id("bosses"), memberId: v.id("users"), note: v.optional(v.string()), proofUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("goblinLogs", { ...args, loggedAt: Date.now() });
    await ctx.db.insert("activityLog", { teamId: args.teamId, actorId: args.memberId, action: "slain a goblin", detail: args.note, timestamp: Date.now() });
    return logId;
  },
});
