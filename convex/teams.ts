import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => ctx.db.query("teams").withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode)).unique(),
});

export const create = mutation({
  args: { name: v.string(), displayName: v.string(), email: v.optional(v.string()), avatarColor: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = await ctx.db.insert("users", { displayName: args.displayName, email: args.email ?? identity?.email, avatarColor: args.avatarColor, createdAt: Date.now() });
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const teamId = await ctx.db.insert("teams", { name: args.name, inviteCode, members: [userId], createdAt: Date.now() });
    return { teamId, userId, inviteCode };
  },
});

export const join = mutation({
  args: { inviteCode: v.string(), displayName: v.string(), email: v.optional(v.string()), avatarColor: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db.query("teams").withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode.toUpperCase())).unique();
    if (!team) throw new Error("Invite code not found");
    const userId = await ctx.db.insert("users", { displayName: args.displayName, email: args.email, avatarColor: args.avatarColor, createdAt: Date.now() });
    await ctx.db.patch(team._id, { members: [...team.members, userId] });
    return { teamId: team._id, userId, inviteCode: team.inviteCode };
  },
});
