import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireTeamMember } from "./lib/auth";
import {
  validateEvidenceMetadata,
  validateReviewComment,
} from "./lib/evidenceValidation";
import { refreshProjectProgress } from "./lib/projectProgress";

type TaskContext = {
  task: Doc<"tasks">;
  project: Doc<"projects">;
  profile: Doc<"userProfiles">;
  canWrite: boolean;
  isTeamOwner: boolean;
};

async function getTaskContext(
  ctx: QueryCtx | MutationCtx,
  taskId: Id<"tasks">,
): Promise<TaskContext> {
  const task = await ctx.db.get(taskId);

  if (task === null) {
    throw new Error("This task no longer exists.");
  }

  const project = await ctx.db.get(task.projectId);

  if (project === null) {
    throw new Error("This project no longer exists.");
  }

  const { membership, profile } = await requireTeamMember(ctx, project.teamId);
  const projectMembership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_and_user", (indexQuery) =>
      indexQuery.eq("projectId", project._id).eq("profileId", profile._id),
    )
    .unique();

  return {
    task,
    project,
    profile,
    canWrite:
      project.status !== "archived" &&
      (membership.role === "owner" || projectMembership !== null),
    isTeamOwner: membership.role === "owner",
  };
}

function requireEvidenceWriteAccess(context: TaskContext) {
  if (context.project.status === "archived") {
    throw new Error("Restore this archived project before adding evidence.");
  }

  const isOwner = context.task.primaryOwnerProfileId === context.profile._id;
  const isAllowedCollaborator =
    context.task.collaboratorCanSubmit === true &&
    context.task.collaboratorProfileIds.includes(context.profile._id);
  if (context.task.acceptanceStatus === "pending") {
    throw new Error("Accept this task before adding evidence.");
  }
  if (!context.canWrite || context.task.isOpenForClaiming || (!isOwner && !isAllowedCollaborator)) {
    throw new Error("Only the assigned owner or an explicitly permitted collaborator can submit evidence.");
  }
}

function taskDamage(task: Doc<"tasks">) {
  return task.damage ?? ((task.difficulty ?? 1) <= 1 ? 10 : task.difficulty === 2 ? 20 : 30);
}

export const listForTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const context = await getTaskContext(ctx, args.taskId);
    const [evidenceItems, reviews] = await Promise.all([
      ctx.db
        .query("taskEvidence")
        .withIndex("by_task", (indexQuery) =>
          indexQuery.eq("taskId", args.taskId),
        )
        .order("desc")
        .collect(),
      ctx.db
        .query("taskReviews")
        .withIndex("by_task_and_time", (indexQuery) =>
          indexQuery.eq("taskId", args.taskId),
        )
        .order("desc")
        .collect(),
    ]);
    const evidence = await Promise.all(
      evidenceItems.map(async (item) => {
        const submitter = await ctx.db.get(item.submitterProfileId);
        const fileUrl = item.storageId
          ? await ctx.storage.getUrl(item.storageId)
          : null;

        return {
          ...item,
          submitterName: submitter?.displayName ?? "Former team member",
          fileUrl,
        };
      }),
    );

    return {
      evidence,
      reviews,
      latestReview: reviews[0] ?? null,
      currentProfileId: context.profile._id,
      canSubmit:
        context.canWrite &&
        !context.task.isOpenForClaiming &&
        context.task.acceptanceStatus !== "pending" &&
        (context.task.primaryOwnerProfileId === context.profile._id ||
          (context.task.collaboratorCanSubmit === true &&
            context.task.collaboratorProfileIds.includes(context.profile._id))),
      isAssignedReviewer:
        context.task.reviewerProfileId === context.profile._id,
      canReview:
        context.canWrite &&
        context.task.primaryOwnerProfileId !== context.profile._id &&
        ["review", "submitted"].includes(context.task.status) &&
        reviews[0]?.status === "pending",
      isTaskOwner: context.task.primaryOwnerProfileId === context.profile._id,
    };
  },
});

export const generateUploadUrl = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const context = await getTaskContext(ctx, args.taskId);
    requireEvidenceWriteAccess(context);
    return await ctx.storage.generateUploadUrl();
  },
});

export const add = mutation({
  args: {
    taskId: v.id("tasks"),
    type: v.union(
      v.literal("note"),
      v.literal("link"),
      v.literal("image"),
      v.literal("pdf"),
    ),
    note: v.optional(v.string()),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    contentType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const context = await getTaskContext(ctx, args.taskId);
    requireEvidenceWriteAccess(context);
    let actualContentType = args.contentType;
    let actualFileSize = args.fileSize;

    if (args.storageId) {
      const storedFile = await ctx.db.system.get(args.storageId);

      if (storedFile === null) {
        throw new Error("The uploaded evidence file could not be found.");
      }

      actualContentType = storedFile.contentType ?? args.contentType;
      actualFileSize = storedFile.size;
    }

    const validated = validateEvidenceMetadata({
      type: args.type,
      note: args.note,
      url: args.url,
      hasStorageId: args.storageId !== undefined,
      fileName: args.fileName,
      contentType: actualContentType,
      fileSize: actualFileSize,
    });

    if ((args.type === "note" || args.type === "link") && args.storageId) {
      throw new Error("Notes and links cannot include an uploaded file.");
    }

    const now = Date.now();
    const evidenceId = await ctx.db.insert("taskEvidence", {
      taskId: context.task._id,
      submitterProfileId: context.profile._id,
      type: args.type,
      note: validated.note,
      url: "url" in validated ? validated.url : undefined,
      storageId: args.storageId,
      fileName: "fileName" in validated ? validated.fileName : undefined,
      contentType:
        "contentType" in validated ? validated.contentType : undefined,
      fileSize: "fileSize" in validated ? validated.fileSize : undefined,
      submittedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      teamId: context.project.teamId,
      projectId: context.project._id,
      actorProfileId: context.profile._id,
      action: "evidence_submitted",
      metadata: {
        projectId: context.project._id,
        taskId: context.task._id,
        taskTitle: context.task.title,
        evidenceId,
        evidenceType: args.type,
      },
      createdAt: now,
    });

    return evidenceId;
  },
});

export const submitReview = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("approved"), v.literal("changes_requested")),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const context = await getTaskContext(ctx, args.taskId);

    if (context.project.status === "archived") {
      throw new Error("Restore this archived project before reviewing its tasks.");
    }

    if (context.task.status !== "review" && context.task.status !== "submitted") {
      throw new Error("This task is not currently waiting for review.");
    }

    const latestReviews = await ctx.db
      .query("taskReviews")
      .withIndex("by_task_and_time", (indexQuery) =>
        indexQuery.eq("taskId", context.task._id),
      )
      .order("desc")
      .take(1);
    const review = latestReviews[0];

    if (!review || review.status !== "pending") {
      throw new Error("This task does not have a pending review request.");
    }

    if (context.task.primaryOwnerProfileId === context.profile._id) {
      throw new Error("A task owner cannot review their own task.");
    }
    if (!context.canWrite) {
      throw new Error("Only a current project teammate can review this task.");
    }

    const comment = validateReviewComment(args.status, args.comment);
    const now = Date.now();
    await ctx.db.patch(review._id, {
      reviewerProfileId: context.profile._id,
      status: args.status,
      comment,
      updatedAt: now,
      reviewedAt: now,
    });
    await ctx.db.patch(context.task._id, {
      status: args.status === "approved" ? "verified" : "changes_requested",
      updatedAt: now,
      completedAt: args.status === "approved" ? now : undefined,
    });
    let combatEventId: Id<"combatEvents"> | undefined;
    if (args.status === "approved") {
      const existingCombatEvent = await ctx.db
        .query("combatEvents")
        .withIndex("by_task", (query) => query.eq("taskId", context.task._id))
        .unique();
      if (existingCombatEvent === null) {
        if (context.project.status === "completed") {
          throw new Error("This project is already complete; no additional damage can be applied.");
        }
        const attackerMembership = await ctx.db
          .query("teamMembers")
          .withIndex("by_team_and_user", (query) =>
            query
              .eq("teamId", context.project.teamId)
              .eq("profileId", context.task.primaryOwnerProfileId),
          )
          .unique();
        combatEventId = await ctx.db.insert("combatEvents", {
          projectId: context.project._id,
          taskId: context.task._id,
          attackerProfileId: context.task.primaryOwnerProfileId,
          reviewerProfileId: context.profile._id,
          damage: taskDamage(context.task),
          spellType: attackerMembership?.spellType ?? "spark",
          createdAt: now,
        });
        await ctx.db.insert("activityLogs", {
          teamId: context.project.teamId,
          projectId: context.project._id,
          actorProfileId: context.profile._id,
          action: "combat_event_created",
          metadata: {
            projectId: context.project._id,
            taskId: context.task._id,
            taskTitle: context.task.title,
            combatEventId,
            damage: taskDamage(context.task),
          },
          createdAt: now,
        });
      }
    }
    await ctx.db.insert("activityLogs", {
      teamId: context.project.teamId,
      projectId: context.project._id,
      actorProfileId: context.profile._id,
      action:
        args.status === "approved"
          ? "review_approved"
          : "review_changes_requested",
      metadata: {
        projectId: context.project._id,
        taskId: context.task._id,
        taskTitle: context.task.title,
        reviewId: review._id,
        reviewStatus: args.status,
        combatEventId,
        damage: args.status === "approved" ? taskDamage(context.task) : undefined,
      },
      createdAt: now,
    });
    await refreshProjectProgress(ctx, context.project, context.profile._id);

    return review._id;
  },
});

export const submitForReview = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const context = await getTaskContext(ctx, args.taskId);
    requireEvidenceWriteAccess(context);
    if (context.task.primaryOwnerProfileId !== context.profile._id) {
      throw new Error("Only the assigned task owner can submit this task for review.");
    }
    if (context.task.acceptanceStatus === "pending") {
      throw new Error("Accept this task before submitting it for review.");
    }
    if (!context.task.requiresReview) {
      throw new Error("Enable peer review before submitting this task.");
    }
    if (!["todo", "in_progress", "changes_requested"].includes(context.task.status)) {
      throw new Error("This task cannot be submitted from its current state.");
    }
    const evidence = await ctx.db
      .query("taskEvidence")
      .withIndex("by_task", (query) => query.eq("taskId", context.task._id))
      .take(1);
    if (evidence.length === 0) throw new Error("Add evidence before submitting for review.");

    const now = Date.now();
    const reviewId = await ctx.db.insert("taskReviews", {
      taskId: context.task._id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(context.task._id, { status: "submitted", updatedAt: now, completedAt: undefined });
    await ctx.db.insert("activityLogs", {
      teamId: context.project.teamId,
      projectId: context.project._id,
      actorProfileId: context.profile._id,
      action: "review_requested",
      metadata: {
        projectId: context.project._id,
        taskId: context.task._id,
        taskTitle: context.task.title,
        reviewId,
        reviewStatus: "pending",
      },
      createdAt: now,
    });
    return reviewId;
  },
});
