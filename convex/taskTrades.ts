import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireTeamMember } from "./lib/auth";

async function requireProjectMember(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);
  if (!project) throw new Error("This project no longer exists.");
  const { profile } = await requireTeamMember(ctx, project.teamId);
  const member = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_and_user", (q) =>
      q.eq("projectId", projectId).eq("profileId", profile._id),
    )
    .unique();
  if (!member) throw new Error("Only project members can trade tasks.");
  return { project, profile };
}

function isTradeableStatus(status: string) {
  return ["todo", "in_progress", "blocked", "changes_requested"].includes(status);
}

export const listForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return { currentProfileId: null, trades: [] };
    const { profile } = await requireTeamMember(ctx, project.teamId);
    const member = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", args.projectId).eq("profileId", profile._id),
      )
      .unique();

    if (!member) {
      return {
        currentProfileId: profile._id,
        trades: [],
      };
    }

    const trades = await ctx.db
      .query("taskTrades")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
    const decorated = await Promise.all(trades.filter((trade) =>
      trade.requestedByProfileId === profile._id || trade.requestedToProfileId === profile._id,
    ).map(async (trade) => {
      const [task, offeredTask, requester, recipient] = await Promise.all([
        ctx.db.get(trade.taskId),
        trade.offeredTaskId ? ctx.db.get(trade.offeredTaskId) : null,
        ctx.db.get(trade.requestedByProfileId),
        ctx.db.get(trade.requestedToProfileId),
      ]);
      return {
        ...trade,
        taskTitle: task?.title ?? "Removed task",
        offeredTaskTitle: offeredTask?.title,
        requesterName: requester?.displayName ?? "Former teammate",
        recipientName: recipient?.displayName ?? "Former teammate",
      };
    }));
    return {
      currentProfileId: profile._id,
      trades: decorated,
    };
  },
});

export const request = mutation({
  args: {
    taskId: v.id("tasks"),
    requestedToProfileId: v.id("userProfiles"),
    offeredTaskId: v.optional(v.id("tasks")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("This task no longer exists.");
    const { project, profile } = await requireProjectMember(ctx, task.projectId);
    if (project.status === "archived") throw new Error("Restore this project before trading tasks.");
    if (task.primaryOwnerProfileId !== profile._id || task.isOpenForClaiming || task.acceptanceStatus !== "accepted") {
      throw new Error("You can only trade one of your accepted tasks.");
    }
    if (!isTradeableStatus(task.status)) throw new Error("This task is too far along to trade.");
    if (args.requestedToProfileId === profile._id) throw new Error("Choose another teammate.");
    const recipient = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (q) =>
        q.eq("projectId", project._id).eq("profileId", args.requestedToProfileId),
      )
      .unique();
    if (!recipient) throw new Error("Choose a current project teammate.");

    let offeredTaskId: Id<"tasks"> | undefined;
    if (args.offeredTaskId) {
      const offeredTask = await ctx.db.get(args.offeredTaskId);
      if (
        !offeredTask ||
        offeredTask.projectId !== project._id ||
        offeredTask.primaryOwnerProfileId !== args.requestedToProfileId ||
        offeredTask.acceptanceStatus !== "accepted" ||
        offeredTask.isOpenForClaiming ||
        !isTradeableStatus(offeredTask.status)
      ) {
        throw new Error("The offered task is not available for a trade.");
      }
      offeredTaskId = offeredTask._id;
    }

    const active = await ctx.db.query("taskTrades").withIndex("by_task", (q) => q.eq("taskId", task._id)).collect();
    if (active.some((trade) => trade.status === "pending")) {
      throw new Error("This task already has a pending trade request.");
    }
    const now = Date.now();
    const tradeId = await ctx.db.insert("taskTrades", {
      projectId: project._id,
      taskId: task._id,
      requestedByProfileId: profile._id,
      requestedToProfileId: args.requestedToProfileId,
      offeredTaskId,
      message: args.message?.trim().slice(0, 500) || undefined,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "task_trade_requested",
      metadata: { projectId: project._id, taskId: task._id, taskTitle: task.title },
      createdAt: now,
    });
    return tradeId;
  },
});

export const resolve = mutation({
  args: {
    tradeId: v.id("taskTrades"),
    decision: v.union(v.literal("accepted"), v.literal("declined"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const trade = await ctx.db.get(args.tradeId);
    if (!trade) throw new Error("This trade request no longer exists.");
    const { project, profile } = await requireProjectMember(ctx, trade.projectId);
    if (trade.status !== "pending") throw new Error("This trade request has already been resolved.");
    if (args.decision === "cancelled") {
      if (trade.requestedByProfileId !== profile._id) throw new Error("Only the requester can cancel this trade.");
    } else if (trade.requestedToProfileId !== profile._id) {
      throw new Error("Only the invited teammate can answer this trade.");
    }

    const task = await ctx.db.get(trade.taskId);
    if (!task || task.primaryOwnerProfileId !== trade.requestedByProfileId || !isTradeableStatus(task.status)) {
      throw new Error("The requested task changed and can no longer be traded.");
    }
    const now = Date.now();
    if (args.decision === "accepted") {
      if (trade.offeredTaskId) {
        const offeredTask = await ctx.db.get(trade.offeredTaskId);
        if (!offeredTask || offeredTask.primaryOwnerProfileId !== trade.requestedToProfileId || !isTradeableStatus(offeredTask.status)) {
          throw new Error("The offered task changed and can no longer be traded.");
        }
        await ctx.db.patch(offeredTask._id, {
          primaryOwnerProfileId: trade.requestedByProfileId,
          acceptanceStatus: "accepted",
          updatedAt: now,
        });
      }
      await ctx.db.patch(task._id, {
        primaryOwnerProfileId: trade.requestedToProfileId,
        acceptanceStatus: "accepted",
        updatedAt: now,
      });
    }
    await ctx.db.patch(trade._id, { status: args.decision, updatedAt: now, resolvedAt: now });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "task_trade_resolved",
      metadata: { projectId: project._id, taskId: task._id, taskTitle: task.title },
      createdAt: now,
    });
    return trade._id;
  },
});
