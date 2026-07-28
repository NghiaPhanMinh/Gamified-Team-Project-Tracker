import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const shareInput = v.object({ memberId: v.id("users"), verifierId: v.id("users"), weight: v.number() });

export const byTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => ctx.db.query("bosses").withIndex("by_team", (q) => q.eq("teamId", args.teamId)).order("desc").collect(),
});

export const create = mutation({
  args: { teamId: v.id("teams"), title: v.string(), deadline: v.number(), partyMemberIds: v.array(v.id("users")), shares: v.array(shareInput), actorId: v.id("users") },
  handler: async (ctx, args) => {
    if (args.partyMemberIds.length < 2) throw new Error("A boss needs at least two party members");
    const memberSet = new Set(args.partyMemberIds.map(String));
    if (args.shares.length !== args.partyMemberIds.length || args.shares.some((share) => !memberSet.has(String(share.memberId)) || !memberSet.has(String(share.verifierId)) || String(share.memberId) === String(share.verifierId))) throw new Error("Every party member needs one teammate verifier");
    const bossId = await ctx.db.insert("bosses", { teamId: args.teamId, title: args.title, deadline: args.deadline, partyMemberIds: args.partyMemberIds, status: "active", createdAt: Date.now() });
    for (const share of args.shares) await ctx.db.insert("bossShares", { ...share, bossId, status: "pending" });
    await ctx.db.insert("activityLog", { teamId: args.teamId, actorId: args.actorId, action: "created a weekly boss", detail: args.title, timestamp: Date.now() });
    return bossId;
  },
});

export const resolveDue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const bosses = await ctx.db.query("bosses").collect(); const now = Date.now(); let count = 0;
    for (const boss of bosses) {
      if (boss.status !== "active") continue;
      const shares = await ctx.db.query("bossShares").withIndex("by_boss", (q) => q.eq("bossId", boss._id)).collect();
      const complete = shares.length > 0 && shares.every((share) => share.status === "verified");
      if (complete) { await ctx.db.patch(boss._id, { status: "defeated", resolvedAt: now }); continue; }
      if (boss.deadline <= now) {
        await ctx.db.patch(boss._id, { status: "survived", resolvedAt: now });
        const team = await ctx.db.get(boss.teamId); const actorId = team?.members[0];
        if (actorId) await ctx.db.insert("activityLog", { teamId: boss.teamId, actorId, action: "logged a surviving boss", detail: "HP remained at the deadline · no penalty", timestamp: now });
        count += 1;
      }
    }
    return count;
  },
});
