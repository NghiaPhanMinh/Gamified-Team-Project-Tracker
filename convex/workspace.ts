import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;
    const members = await Promise.all(team.members.map((id) => ctx.db.get(id)));
    const projects = await ctx.db.query("projects").withIndex("by_team", (q) => q.eq("teamId", args.teamId)).collect();
    const project = projects.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
    if (!project) return { team, members: members.filter(Boolean), project: null, boss: null, goblins: [], activity: [] };
    const bosses = await ctx.db.query("bosses").withIndex("by_project", (q) => q.eq("projectId", project._id)).order("desc").collect();
    const boss = bosses[0] ?? null;
    if (!boss) return { team, members: members.filter(Boolean), project, boss: null, goblins: [], activity: [] };
    const goblins = await ctx.db.query("goblins").withIndex("by_boss", (q) => q.eq("bossId", boss._id)).collect();
    const activity = await ctx.db.query("activityLog").withIndex("by_project_time", (q) => q.eq("projectId", project._id)).order("desc").collect();
    return { team, members: members.filter(Boolean), project, boss, goblins, activity };
  },
});
