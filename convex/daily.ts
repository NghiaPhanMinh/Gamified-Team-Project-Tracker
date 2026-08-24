import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireTeamMember } from "./lib/auth";

export const listForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (project === null) throw new Error("This project no longer exists.");
    await requireTeamMember(ctx, project.teamId);

    const items = await ctx.db
      .query("dailyFeed")
      .withIndex("by_project_and_time", (q) => q.eq("projectId", project._id))
      .order("desc")
      .take(100);

    const authorIds = [...new Set(items.map((item) => item.authorProfileId))];
    const [authors, teamMemberships] = await Promise.all([
      Promise.all(authorIds.map((id) => ctx.db.get(id))),
      Promise.all(
        authorIds.map((id) =>
          ctx.db
            .query("teamMembers")
            .withIndex("by_team_and_user", (q) => q.eq("teamId", project.teamId).eq("profileId", id))
            .unique(),
        ),
      ),
    ]);
    const authorMap = new Map(authors.filter(Boolean).map((a) => [a!._id, a!]));
    const teamMemberMap = new Map(teamMemberships.filter(Boolean).map((m) => [m!.profileId, m!]));

    return items.map((item) => {
      const author = authorMap.get(item.authorProfileId);
      const teamMember = teamMemberMap.get(item.authorProfileId);
      return {
        ...item,
        authorName: author?.displayName ?? "Team member",
        authorFill: teamMember?.characterFill ?? author?.characterFill ?? "#FFF73F",
        authorOutline: teamMember?.characterOutline ?? author?.characterOutline ?? "#4CA0FE",
        authorSpellType: teamMember?.spellType ?? author?.spellType,
      };
    });
  },
});

export const postDailyEvidence = mutation({
  args: {
    projectId: v.id("projects"),
    text: v.string(),
    imageUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (project === null) throw new Error("This project no longer exists.");
    const { profile } = await requireTeamMember(ctx, project.teamId);

    const textTrimmed = args.text.trim();
    const wordCount = textTrimmed.length > 0 ? textTrimmed.split(/\s+/).filter(Boolean).length : 0;
    const imageCount = args.imageUrls.length;

    // Rule: Any daily progress note or screenshot is valid proof of work
    const isValid = wordCount > 0 || imageCount > 0;

    const now = Date.now();
    const id = await ctx.db.insert("dailyFeed", {
      projectId: project._id,
      authorProfileId: profile._id,
      text: textTrimmed,
      imageUrls: args.imageUrls,
      wordCount,
      imageCount,
      isValid,
      createdAt: now,
    });

    await ctx.db.patch(project._id, { updatedAt: now });

    return {
      _id: id,
      wordCount,
      imageCount,
      isValid,
    };
  },
});
