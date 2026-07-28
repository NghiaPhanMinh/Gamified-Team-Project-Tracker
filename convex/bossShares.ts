import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function maybeDefeat(ctx: any, boss: any) {
  const shares = await ctx.db.query("bossShares").withIndex("by_boss", (q: any) => q.eq("bossId", boss._id)).collect();
  if (shares.length && shares.every((share: any) => share.status === "verified") && boss.status === "active") { await ctx.db.patch(boss._id, { status: "defeated", resolvedAt: Date.now() }); return true; }
  return false;
}

export const byBoss = query({
  args: { bossId: v.id("bosses") },
  handler: async (ctx, args) => ctx.db.query("bossShares").withIndex("by_boss", (q) => q.eq("bossId", args.bossId)).collect(),
});

export const submit = mutation({
  args: { shareId: v.id("bossShares"), memberId: v.id("users"), pdfUrl: v.string() },
  handler: async (ctx, args) => {
    const share = await ctx.db.get(args.shareId); if (!share || share.memberId !== args.memberId) throw new Error("You can only submit your own share");
    const boss = await ctx.db.get(share.bossId); if (!boss) throw new Error("Boss not found");
    await ctx.db.patch(share._id, { status: "submitted", pdfUrl: args.pdfUrl, submittedAt: Date.now() });
    await ctx.db.insert("activityLog", { teamId: boss.teamId, actorId: args.memberId, action: "submitted a boss-share PDF", detail: `${share.weight} HP share`, timestamp: Date.now() });
  },
});

export const verify = mutation({
  args: { shareId: v.id("bossShares"), verifierId: v.id("users"), approved: v.boolean(), comment: v.string() },
  handler: async (ctx, args) => {
    if (!args.comment.trim()) throw new Error("A verifier comment is required");
    const share = await ctx.db.get(args.shareId); if (!share || share.verifierId !== args.verifierId) throw new Error("Only the assigned verifier can review this share");
    const boss = await ctx.db.get(share.bossId); if (!boss) throw new Error("Boss not found");
    await ctx.db.patch(share._id, { status: args.approved ? "verified" : "rejected", verifierComment: args.comment, verifiedAt: Date.now() });
    const defeated = args.approved && await maybeDefeat(ctx, boss);
    await ctx.db.insert("activityLog", { teamId: boss.teamId, actorId: args.verifierId, action: args.approved ? "approved a boss share" : "rejected a boss share", detail: `${share.weight} HP${defeated ? " · boss defeated" : ""}`, timestamp: Date.now() });
    return { defeated };
  },
});
