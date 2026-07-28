import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByJoinCode = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => ctx.db.query("teams").withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode.toUpperCase())).unique(),
});

export const create = mutation({
  args: { name: v.string(), displayName: v.string(), email: v.string(), avatarColor: v.string(), spell: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    const userId = existing ? existing._id : await ctx.db.insert("users", { displayName: args.displayName, email: args.email, avatarColor: args.avatarColor, spell: args.spell, createdAt: Date.now() });
    const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const teamId = await ctx.db.insert("teams", { name: args.name, joinCode, members: [userId], createdAt: Date.now() });
    return { teamId, userId, joinCode };
  },
});

export const join = mutation({
  args: { joinCode: v.string(), displayName: v.string(), email: v.string(), avatarColor: v.string(), spell: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db.query("teams").withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode.toUpperCase())).unique();
    if (!team) throw new Error("Join code not found");
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    const userId = existing ? existing._id : await ctx.db.insert("users", { displayName: args.displayName, email: args.email, avatarColor: args.avatarColor, spell: args.spell, createdAt: Date.now() });
    if (!team.members.includes(userId)) await ctx.db.patch(team._id, { members: [...team.members, userId] });
    return { teamId: team._id, userId, joinCode: team.joinCode };
  },
});
