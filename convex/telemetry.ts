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
    >();

    for (const event of events) {
      let stats = stepStatsMap.get(event.stepIndex);
      if (!stats) {
        stats = {
          stepIndex: event.stepIndex,
          stepName: event.stepName,
          starts: 0,
          completions: 0,
          abandonments: 0,
          errors: 0,
          errorMessages: [],
        };
        stepStatsMap.set(event.stepIndex, stats);
      }

      if (event.eventType === "step_start") stats.starts += 1;
      if (event.eventType === "step_complete") stats.completions += 1;
      if (event.eventType === "step_abandon") stats.abandonments += 1;
      if (event.eventType === "step_error") {
        stats.errors += 1;
        if (event.errorMessage && !stats.errorMessages.includes(event.errorMessage)) {
          stats.errorMessages.push(event.errorMessage);
        }
      }
    }

    const funnelSteps = Array.from(stepStatsMap.values()).sort(
      (first, second) => first.stepIndex - second.stepIndex,
    );

    return {
      flowName: args.flowName,
      totalEvents: events.length,
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

