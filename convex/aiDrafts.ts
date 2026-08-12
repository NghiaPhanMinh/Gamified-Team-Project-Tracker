import { v } from "convex/values";

import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireTeamMember } from "./lib/auth";
import { validateAiPlan } from "./lib/aiPlanValidation";
import { refreshProjectProgress } from "./lib/projectProgress";

function damageForDifficulty(difficulty: number) {
  return difficulty <= 1 ? 10 : difficulty === 2 ? 20 : 30;
}

export const savePlan = mutation({
  args: { projectId: v.id("projects"), plan: v.any() },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("This project no longer exists.");
    if (project.status === "archived") throw new Error("Restore this project before saving a plan.");
    const { profile } = await requireTeamMember(ctx, project.teamId);
    if (project.creatorProfileId !== profile._id) {
      throw new Error("Only the room creator can save an AI plan.");
    }
    const [phases, members, existingTasks] = await Promise.all([
      ctx.db.query("phases").withIndex("by_project_and_order", (q) => q.eq("projectId", project._id)).collect(),
      ctx.db.query("projectMembers").withIndex("by_project", (q) => q.eq("projectId", project._id)).collect(),
      ctx.db.query("tasks").withIndex("by_project", (q) => q.eq("projectId", project._id)).collect(),
    ]);
    if (existingTasks.length > 0) {
      throw new Error("This plan already contains tasks. Adjust existing tasks manually to avoid duplicates.");
    }
    const plan = validateAiPlan(args.plan, {
      project: { startDate: project.startDate, deadline: project.deadline },
      phases: phases.map((phase) => ({ phaseId: phase._id })),
      members: members.map((member) => ({ profileId: member.profileId })),
    });
    const now = Date.now();
    const taskIds = new Map<string, Id<"tasks">>();
    for (const task of plan.tasks) {
      const isOpenForClaiming = project.allocationStrategy === "self_selection";
      const taskId = await ctx.db.insert("tasks", {
        projectId: project._id,
        phaseId: task.phaseId as Id<"phases">,
        milestoneId: undefined,
        title: task.title,
        description: task.description,
        primaryOwnerProfileId: task.primaryOwnerProfileId as Id<"userProfiles">,
        collaboratorProfileIds: task.collaboratorProfileIds as Id<"userProfiles">[],
        requiredSkills: task.requiredSkills,
        estimatedEffortHours: task.estimatedEffortHours,
        difficulty: task.difficulty,
        weight: task.weight,
        damage: damageForDifficulty(task.difficulty),
        required: true,
        isOpenForClaiming,
        collaboratorCanSubmit: false,
        startDate: task.startDate,
        dueDate: task.dueDate,
        status: "todo",
        acceptanceStatus: isOpenForClaiming || task.primaryOwnerProfileId === profile._id ? "accepted" : "pending",
        assignmentState: isOpenForClaiming
          ? "open"
          : task.primaryOwnerProfileId === profile._id
            ? "assigned"
            : "proposed",
        dependencyTaskIds: [],
        source: "ai",
        requiresReview: true,
        reviewerProfileId: task.reviewerProfileId
          ? (task.reviewerProfileId as Id<"userProfiles">)
          : undefined,
        createdByProfileId: profile._id,
        createdAt: now,
        updatedAt: now,
      });
      taskIds.set(task.tempId, taskId);
    }

    for (const task of plan.tasks) {
      const taskId = taskIds.get(task.tempId)!;
      await ctx.db.patch(taskId, {
        dependencyTaskIds: task.dependencyTempIds.map((tempId) => taskIds.get(tempId)!),
      });
      await ctx.db.insert("activityLogs", {
        teamId: project.teamId,
        projectId: project._id,
        actorProfileId: profile._id,
        action: "task_created",
        metadata: { projectId: project._id, taskId, taskTitle: task.title, taskStatus: "todo" },
        createdAt: now,
      });
    }
    await refreshProjectProgress(ctx, project, profile._id);
    return { taskCount: plan.tasks.length, milestoneCount: 0 };
  },
});
