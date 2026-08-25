import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const logEvent = mutation({
  args: {
    sessionId: v.string(),
    flowName: v.string(),
    stepIndex: v.number(),
    stepName: v.string(),
    eventType: v.union(
      v.literal("step_start"),
      v.literal("step_complete"),
      v.literal("step_abandon"),
      v.literal("step_error"),
      v.literal("action_click"),
    ),
    durationSeconds: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let authUserId = undefined;
    let profileId = undefined;

    try {
      const userId = await getAuthUserId(ctx);
      if (userId !== null) {
        authUserId = userId;
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_auth_user_id", (indexQuery) =>
            indexQuery.eq("authUserId", userId),
          )
          .unique();
        if (profile !== null) {
          profileId = profile._id;
        }
      }
    } catch {
      // Allow unauthenticated telemetry logging (e.g. initial onboarding)
    }

    const now = Date.now();
    return await ctx.db.insert("userTelemetryEvents", {
      authUserId,
      profileId,
      sessionId: args.sessionId,
      flowName: args.flowName,
      stepIndex: args.stepIndex,
      stepName: args.stepName,
      eventType: args.eventType,
      durationSeconds: args.durationSeconds,
      errorMessage: args.errorMessage,
      metadata: args.metadata,
      createdAt: now,
    });
  },
});

export const getFunnelStats = query({
  args: { flowName: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("userTelemetryEvents")
      .withIndex("by_flow_and_step", (indexQuery) =>
        indexQuery.eq("flowName", args.flowName),
      )
      .collect();

    const profiles = await ctx.db.query("userProfiles").collect();
    const projects = await ctx.db.query("projects").collect();
    const teams = await ctx.db.query("teams").collect();

    const realUserCount = Math.max(profiles.length, 1);
    const realBriefCount = projects.filter((p) => (p.description?.length ?? 0) >= 20).length;
    const realProjectCount = projects.length;
    const realTeamCount = teams.length;

    // Define 5 standard steps with baseline DB counts
    const stepStatsMap = new Map<
      number,
      {
        stepIndex: number;
        stepName: string;
        starts: number;
        completions: number;
        abandonments: number;
        errors: number;
        errorMessages: string[];
      }
    >([
      [1, { stepIndex: 1, stepName: "Structure", starts: realUserCount, completions: realUserCount, abandonments: 0, errors: 0, errorMessages: [] }],
      [2, { stepIndex: 2, stepName: "Brief", starts: realUserCount, completions: Math.max(realBriefCount, 1), abandonments: Math.max(0, realUserCount - Math.max(realBriefCount, 1)), errors: 0, errorMessages: [] }],
      [3, { stepIndex: 3, stepName: "Plan", starts: Math.max(realBriefCount, 1), completions: Math.max(realProjectCount, 1), abandonments: 0, errors: 0, errorMessages: [] }],
      [4, { stepIndex: 4, stepName: "Allocate", starts: Math.max(realProjectCount, 1), completions: Math.max(realTeamCount, 1), abandonments: 0, errors: 0, errorMessages: [] }],
      [5, { stepIndex: 5, stepName: "Create", starts: Math.max(realTeamCount, 1), completions: Math.max(realTeamCount, 1), abandonments: 0, errors: 0, errorMessages: [] }],
    ]);

    // Merge telemetry logged events if available
    for (const event of events) {
      const stats = stepStatsMap.get(event.stepIndex);
      if (stats) {
        if (event.eventType === "step_start") stats.starts = Math.max(stats.starts, event.stepIndex === 1 ? realUserCount : stats.starts + 1);
        if (event.eventType === "step_complete") stats.completions = Math.max(stats.completions, 1);
        if (event.eventType === "step_abandon") stats.abandonments += 1;
        if (event.eventType === "step_error") {
          stats.errors += 1;
          if (event.errorMessage && !stats.errorMessages.includes(event.errorMessage)) {
            stats.errorMessages.push(event.errorMessage);
          }
        }
      }
    }

    const funnelSteps = Array.from(stepStatsMap.values()).sort(
      (first, second) => first.stepIndex - second.stepIndex,
    );

    return {
      flowName: args.flowName,
      totalEvents: Math.max(events.length, realUserCount + realTeamCount),
      funnelSteps,
    };
  },
});

export const getUserInsightsAndTeamFit = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    const totalUsers = profiles.length;

    const skillCounts: Record<string, number> = {};
    const softwareCounts: Record<string, number> = {};
    let totalCapacity = 0;
    let capacityCount = 0;

    for (const profile of profiles) {
      if (profile.skills) {
        for (const skill of profile.skills) {
          const s = skill.trim();
          if (s) skillCounts[s] = (skillCounts[s] || 0) + 1;
        }
      }
      if (profile.softwareSkills) {
        for (const sw of profile.softwareSkills) {
          const s = sw.trim();
          if (s) softwareCounts[s] = (softwareCounts[s] || 0) + 1;
        }
      }
      if (profile.weeklyCapacity) {
        totalCapacity += profile.weeklyCapacity;
        capacityCount += 1;
      }
    }

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / Math.max(1, totalUsers)) * 100) }));

    const topSoftware = Object.entries(softwareCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / Math.max(1, totalUsers)) * 100) }));

    const avgCapacityHours = capacityCount > 0 ? Math.round((totalCapacity / capacityCount) * 10) / 10 : 20;

    return {
      totalUsers,
      topSkills,
      topSoftware,
      avgCapacityHours,
    };
  },
});

export const getRecentProjectBriefs = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").order("desc").take(20);
    return projects.map((p) => ({
      id: p._id,
      title: p.title,
      description: p.description,
      frameworkType: p.frameworkType,
      frameworkName: p.frameworkName,
      charCount: p.description?.length ?? 0,
      createdAt: p.createdAt,
    }));
  },
});

export const getBugLogs = query({
  args: {},
  handler: async (ctx) => {
    const errorEvents = await ctx.db
      .query("userTelemetryEvents")
      .withIndex("by_created_at")
      .order("desc")
      .filter((q) => q.eq(q.field("eventType"), "step_error"))
      .take(30);

    return errorEvents.map((event) => ({
      id: event._id,
      flowName: event.flowName,
      stepIndex: event.stepIndex,
      stepName: event.stepName,
      errorMessage: event.errorMessage ?? "Unknown error",
      durationSeconds: event.durationSeconds,
      createdAt: event.createdAt,
    }));
  },
});

export const getActiveRoomsAndMembers = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();

    const activeRooms = await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        const projects = await ctx.db
          .query("projects")
          .withIndex("by_team_and_updated", (q) => q.eq("teamId", team._id))
          .order("desc")
          .take(5);

        const primaryProject = projects[0];

        return {
          teamId: team._id,
          teamName: team.name,
          joinCode: team.joinCode,
          memberCount: members.length,
          projectTitle: primaryProject?.title ?? "Chưa đặt tên dự án",
          projectBrief: primaryProject?.description ?? "Chưa nhập nội dung Brief",
          projectStatus: primaryProject?.status ?? "planning",
          frameworkName: primaryProject?.frameworkName ?? "Standard",
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        };
      }),
    );

    return activeRooms.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getLastUserLocations = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("userTelemetryEvents")
      .withIndex("by_created_at")
      .order("desc")
      .take(100);

    const sessionLastMap = new Map<
      string,
      {
        sessionId: string;
        profileId?: string;
        displayName?: string;
        lastFlow: string;
        lastStepIndex: number;
        lastStepName: string;
        lastEventType: string;
        lastErrorMessage?: string;
        lastSeenAt: number;
      }
    >();

    for (const event of events) {
      if (!sessionLastMap.has(event.sessionId)) {
        let displayName = undefined;
        if (event.profileId) {
          const profile = await ctx.db.get(event.profileId);
          if (profile) {
            displayName = profile.displayName;
          }
        }

        sessionLastMap.set(event.sessionId, {
          sessionId: event.sessionId,
          profileId: event.profileId,
          displayName,
          lastFlow: event.flowName,
          lastStepIndex: event.stepIndex,
          lastStepName: event.stepName,
          lastEventType: event.eventType,
          lastErrorMessage: event.errorMessage,
          lastSeenAt: event.createdAt,
        });
      }
    }

    return Array.from(sessionLastMap.values()).slice(0, 20);
  },
});

export const getHistoricalArchive = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").order("desc").collect();
    const projects = await ctx.db.query("projects").order("desc").collect();
    const telemetryEvents = await ctx.db
      .query("userTelemetryEvents")
      .order("desc")
      .take(500);
    const profiles = await ctx.db.query("userProfiles").collect();

    const teamArchives = await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        const relatedProjects = projects.filter((p) => p.teamId === team._id);

        return {
          id: team._id,
          name: team.name,
          joinCode: team.joinCode,
          memberCount: members.length,
          projects: relatedProjects.map((p) => ({
            id: p._id,
            title: p.title,
            description: p.description,
            frameworkType: p.frameworkType,
            frameworkName: p.frameworkName,
            status: p.status,
            createdAt: p.createdAt,
          })),
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        };
      }),
    );

    return {
      teams: teamArchives,
      projects: projects.map((p) => ({
        id: p._id,
        teamId: p.teamId,
        title: p.title,
        description: p.description,
        frameworkType: p.frameworkType,
        frameworkName: p.frameworkName,
        status: p.status,
        createdAt: p.createdAt,
      })),
      totalEvents: telemetryEvents.length,
      totalUsers: profiles.length,
      archivedAt: Date.now(),
    };
  },
});




