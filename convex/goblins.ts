import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byBoss = query({
  args: { bossId: v.id("bosses") },
  handler: async (ctx, args) => ctx.db.query("goblins").withIndex("by_boss", (q) => q.eq("bossId", args.bossId)).collect(),
});

export const pendingForVerifier = query({
  args: { verifierId: v.id("users") },
  handler: async (ctx, args) => ctx.db.query("goblins").withIndex("by_verifier_status", (q) => q.eq("verifierId", args.verifierId).eq("status", "submitted")).collect(),
});

export const create = mutation({
  args: { bossId: v.id("bosses"), title: v.string(), ownerId: v.id("users"), verifierId: v.id("users"), weight: v.number() },
  handler: async (ctx, args) => {
    const goblinId = await ctx.db.insert("goblins", { ...args, status: "pending" });
    const boss = await ctx.db.get(args.bossId); if (boss) { const project = await ctx.db.get(boss.projectId); if (project) await ctx.db.insert("activityLog", { projectId: project._id, actorId: args.ownerId, action: "added a goblin task", detail: args.title, timestamp: Date.now() }); }
    return goblinId;
  },
});

export const submit = mutation({
  args: { goblinId: v.id("goblins"), proofText: v.string(), proofUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const goblin = await ctx.db.get(args.goblinId); if (!goblin) throw new Error("Goblin not found");
    const boss = await ctx.db.get(goblin.bossId); const project = boss ? await ctx.db.get(boss.projectId) : null;
    if (project) await ctx.db.insert("activityLog", { projectId: project._id, actorId: goblin.ownerId, action: "submitted proof", detail: goblin.title, timestamp: Date.now() });
    return ctx.db.patch(args.goblinId, { status: "submitted", proofText: args.proofText, proofUrl: args.proofUrl, submittedAt: Date.now() });
  },
});

export const verify = mutation({
  args: { goblinId: v.id("goblins"), approved: v.boolean(), comment: v.string() },
  handler: async (ctx, args) => {
    const goblin = await ctx.db.get(args.goblinId);
    if (!goblin) throw new Error("Goblin not found");
    const boss = await ctx.db.get(goblin.bossId);
    if (!boss) throw new Error("Boss not found");
    await ctx.db.patch(goblin._id, { status: args.approved ? "verified" : "rejected", verifierComment: args.comment, verifiedAt: Date.now() });
    if (args.approved) await ctx.db.patch(boss._id, { remainingHP: Math.max(0, boss.remainingHP - goblin.weight) });
    const project = await ctx.db.get(boss.projectId);
    if (project) await ctx.db.insert("activityLog", { projectId: project._id, actorId: goblin.verifierId, action: args.approved ? "approved a goblin" : "requested another pass", detail: `${goblin.title}${args.approved ? ` · −${goblin.weight} HP` : ""}`, timestamp: Date.now() });
    return { approved: args.approved };
  },
});
