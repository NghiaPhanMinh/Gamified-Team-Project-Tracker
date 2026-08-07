import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { describeActivity } from "./lib/activityPresentation";
import { requireTeamMember } from "./lib/auth";

async function getReadState(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">,
  profileId: Id<"userProfiles">,
) {
  return ctx.db
    .query("activityReadStates")
    .withIndex("by_team_and_profile", (indexQuery) =>
      indexQuery.eq("teamId", teamId).eq("profileId", profileId),
    )
    .unique();
}

export const list = query({
  args: {
    teamId: v.id("teams"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { profile } = await requireTeamMember(ctx, args.teamId);
    const [readState, page] = await Promise.all([
      getReadState(ctx, args.teamId, profile._id),
      ctx.db
        .query("activityLogs")
        .withIndex("by_team_and_time", (indexQuery) =>
          indexQuery.eq("teamId", args.teamId),
        )
        .order("desc")
        .paginate(args.paginationOpts),
    ]);
    const enrichedPage = await Promise.all(
      page.page.map(async (activity) => {
        const actor = await ctx.db.get(activity.actorProfileId);
        const actorName = actor?.displayName ?? "A former teammate";

        return {
          _id: activity._id,
          action: activity.action,
          createdAt: activity.createdAt,
          projectId: activity.projectId,
          actorProfileId: activity.actorProfileId,
          actorName,
          isOwn: activity.actorProfileId === profile._id,
          isUnread:
            activity.actorProfileId !== profile._id &&
            activity.createdAt > (readState?.lastReadAt ?? 0),
          ...describeActivity(activity, actorName),
        };
      }),
    );

    return { ...page, page: enrichedPage };
  },
});

export const getUnreadSummary = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const { profile } = await requireTeamMember(ctx, args.teamId);
    const readState = await getReadState(ctx, args.teamId, profile._id);
    const recent = await ctx.db
      .query("activityLogs")
      .withIndex("by_team_and_time", (indexQuery) =>
        indexQuery
          .eq("teamId", args.teamId)
          .gt("createdAt", readState?.lastReadAt ?? 0),
      )
      .order("desc")
      .take(100);
    const unread = recent.filter(
      (activity) => activity.actorProfileId !== profile._id,
    );

    return {
      count: Math.min(unread.length, 99),
      hasMore: unread.length === 100,
      lastReadAt: readState?.lastReadAt,
    };
  },
});

export const markAllRead = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const { profile } = await requireTeamMember(ctx, args.teamId);
    const [readState, latestActivity] = await Promise.all([
      getReadState(ctx, args.teamId, profile._id),
      ctx.db
        .query("activityLogs")
        .withIndex("by_team_and_time", (indexQuery) =>
          indexQuery.eq("teamId", args.teamId),
        )
        .order("desc")
        .first(),
    ]);
    const now = Date.now();
    const lastReadAt = latestActivity?.createdAt ?? now;

    if (readState) {
      await ctx.db.patch(readState._id, { lastReadAt, updatedAt: now });
    } else {
      await ctx.db.insert("activityReadStates", {
        teamId: args.teamId,
        profileId: profile._id,
        lastReadAt,
        updatedAt: now,
      });
    }

    return lastReadAt;
  },
});
