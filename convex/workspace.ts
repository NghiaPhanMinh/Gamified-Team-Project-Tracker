import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId); if (!team) return null;
    const members = await Promise.all(team.members.map((id) => ctx.db.get(id)));
    const bosses = await ctx.db.query("bosses").withIndex("by_team", (q) => q.eq("teamId", args.teamId)).order("desc").collect();
    const boss = bosses[0] ?? null;
    const shares = boss ? await ctx.db.query("bossShares").withIndex("by_boss", (q) => q.eq("bossId", boss._id)).collect() : [];
    const goblinLogs = boss ? await ctx.db.query("goblinLogs").withIndex("by_boss_time", (q) => q.eq("bossId", boss._id)).order("desc").collect() : [];
    const activity = await ctx.db.query("activityLog").withIndex("by_team_time", (q) => q.eq("teamId", args.teamId)).order("desc").collect();
    return { team, members: members.filter(Boolean), bosses, boss, shares, goblinLogs, activity };
  },
});
