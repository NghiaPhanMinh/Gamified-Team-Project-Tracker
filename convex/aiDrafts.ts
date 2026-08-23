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
    let [phases, members, existingTasks] = await Promise.all([
      ctx.db.query("phases").withIndex("by_project_and_order", (q) => q.eq("projectId", project._id)).collect(),
      ctx.db.query("projectMembers").withIndex("by_project", (q) => q.eq("projectId", project._id)).collect(),
      ctx.db.query("tasks").withIndex("by_project", (q) => q.eq("projectId", project._id)).collect(),
    ]);

    if (existingTasks.length > 0) {
      throw new Error("This plan already contains tasks. Adjust existing tasks manually to avoid duplicates.");
    }

    const now = Date.now();

    // Auto-create phases if DB phases table is empty
    if (phases.length === 0) {
      const defaultPhaseTitles = ["Discovery & Research", "Design & Prototype", "Development & Testing", "Review & Launch"];
      const createdPhases = [];
      for (let i = 0; i < defaultPhaseTitles.length; i++) {
        const phaseId = await ctx.db.insert("phases", {
          projectId: project._id,
          frameworkPhaseKey: `phase_${i + 1}`,
          title: defaultPhaseTitles[i],
          description: defaultPhaseTitles[i],
          order: i + 1,
          status: i === 0 ? "active" : "not_started",
          canOverlap: true,
          reviewCheckpoint: i === defaultPhaseTitles.length - 1,
          dependencyKeys: [],
        });
        createdPhases.push({ _id: phaseId, title: defaultPhaseTitles[i], order: i + 1 });
      }
      phases = createdPhases as unknown as typeof phases;
    }

    // Ensure members list contains at least creator/user
    if (members.length === 0) {
      const pmId = await ctx.db.insert("projectMembers", {
        projectId: project._id,
        profileId: profile._id,
        skills: [],
        availability: "available",
        currentWorkload: "medium",
        preferences: "",
        joinedAt: now,
      });
      members = [{ _id: pmId, projectId: project._id, profileId: profile._id, skills: [], availability: "available", currentWorkload: "medium", preferences: "", joinedAt: now }] as unknown as typeof members;
    }

    const validPhaseIds = new Set(phases.map((p) => p._id as string));
    const validMemberIds = new Set(members.map((m) => m.profileId as string));
    const defaultPhaseId = phases[0]._id;
    const defaultOwnerId = profile._id;

    // Pre-sanitize plan data so validation never throws on minor AI quirks
    const rawPlan = typeof args.plan === "object" && args.plan !== null ? args.plan : {};
    const rawTasks = Array.isArray(rawPlan.tasks) ? rawPlan.tasks : [];
    const rawMilestones = Array.isArray(rawPlan.milestones) ? rawPlan.milestones : [];

    const sanitizedTasks = rawTasks.map((t: any, idx: number) => {
      const phaseId = validPhaseIds.has(t.phaseId) ? t.phaseId : defaultPhaseId;
      const ownerId = validMemberIds.has(t.primaryOwnerProfileId) ? t.primaryOwnerProfileId : defaultOwnerId;
      let reviewerId = validMemberIds.has(t.reviewerProfileId) ? t.reviewerProfileId : null;
      if (reviewerId === ownerId) reviewerId = null;

      let startDate = typeof t.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.startDate)
        ? t.startDate
        : project.startDate;
      let dueDate = typeof t.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate)
        ? t.dueDate
        : project.deadline;

      if (startDate < project.startDate) startDate = project.startDate;
      if (startDate > project.deadline) startDate = project.deadline;
      if (dueDate < startDate) dueDate = startDate;
      if (dueDate > project.deadline) dueDate = project.deadline;

      return {
        ...t,
        tempId: t.tempId || `task_${idx + 1}`,
        title: typeof t.title === "string" && t.title.trim() ? t.title.trim() : `Task ${idx + 1}`,
        description: typeof t.description === "string" ? t.description.trim() : "",
        phaseId,
        milestoneTempId: typeof t.milestoneTempId === "string" ? t.milestoneTempId : null,
        primaryOwnerProfileId: ownerId,
        collaboratorProfileIds: Array.isArray(t.collaboratorProfileIds)
          ? t.collaboratorProfileIds.filter((id: string) => validMemberIds.has(id) && id !== ownerId)
          : [],
        requiredSkills: Array.isArray(t.requiredSkills) ? t.requiredSkills : [],
        estimatedEffortHours: typeof t.estimatedEffortHours === "number" ? Math.max(0.5, Math.min(2000, t.estimatedEffortHours)) : 4,
        difficulty: typeof t.difficulty === "number" ? Math.max(1, Math.min(5, Math.round(t.difficulty))) : 2,
        weight: typeof t.weight === "number" ? Math.max(0.5, Math.min(100, t.weight)) : 1,
        required: true,
        startDate,
        dueDate,
        dependencyTempIds: Array.isArray(t.dependencyTempIds) ? t.dependencyTempIds : [],
        requiresReview: true,
        reviewerProfileId: reviewerId,
        allocationExplanation: typeof t.allocationExplanation === "string" ? t.allocationExplanation : "Assigned based on team capacity.",
        longTaskBreakdown: typeof t.longTaskBreakdown === "string" ? t.longTaskBreakdown : "",
      };
    });

    const sanitizedMilestones = rawMilestones.map((m: any, idx: number) => {
      const phaseId = validPhaseIds.has(m.phaseId) ? m.phaseId : defaultPhaseId;
      let dueDate = typeof m.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(m.dueDate) ? m.dueDate : project.deadline;
      if (dueDate < project.startDate) dueDate = project.startDate;
      if (dueDate > project.deadline) dueDate = project.deadline;
      return {
        ...m,
        tempId: m.tempId || `milestone_${idx + 1}`,
        title: typeof m.title === "string" && m.title.trim() ? m.title.trim() : `Milestone ${idx + 1}`,
        description: typeof m.description === "string" ? m.description.trim() : "",
        phaseId,
        dueDate,
      };
    });

    const sanitizedPlan = {
      ...rawPlan,
      milestones: sanitizedMilestones,
      tasks: sanitizedTasks,
    };

    const plan = validateAiPlan(sanitizedPlan, {
      project: { startDate: project.startDate, deadline: project.deadline },
      phases: phases.map((phase) => ({ phaseId: phase._id })),
      members: members.map((member) => ({ profileId: member.profileId })),
    });

    // 1. Insert Milestones
    const milestoneIds = new Map<string, Id<"milestones">>();
    for (const milestone of plan.milestones) {
      const milestoneId = await ctx.db.insert("milestones", {
        projectId: project._id,
        phaseId: milestone.phaseId as Id<"phases">,
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate,
        status: "planned",
        requiredTaskIds: [],
        createdAt: now,
        updatedAt: now,
      });
      milestoneIds.set(milestone.tempId, milestoneId);
    }

    // 2. Insert Tasks
    const taskIds = new Map<string, Id<"tasks">>();
    for (const task of plan.tasks) {
      const isOpenForClaiming = project.allocationStrategy === "self_selection";
      const dbMilestoneId = task.milestoneTempId ? milestoneIds.get(task.milestoneTempId) : undefined;
      const taskId = await ctx.db.insert("tasks", {
        projectId: project._id,
        phaseId: task.phaseId as Id<"phases">,
        milestoneId: dbMilestoneId,
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

    // 3. Update task dependencies & milestone requiredTaskIds
    for (const task of plan.tasks) {
      const taskId = taskIds.get(task.tempId)!;
      await ctx.db.patch(taskId, {
        dependencyTaskIds: task.dependencyTempIds.map((tempId) => taskIds.get(tempId)!).filter(Boolean),
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

    for (const milestone of plan.milestones) {
      const dbMilestoneId = milestoneIds.get(milestone.tempId);
      if (!dbMilestoneId) continue;
      const matchingTaskIds = plan.tasks
        .filter((t) => t.milestoneTempId === milestone.tempId)
        .map((t) => taskIds.get(t.tempId)!)
        .filter(Boolean);
      await ctx.db.patch(dbMilestoneId, {
        requiredTaskIds: matchingTaskIds,
      });
    }

    await refreshProjectProgress(ctx, project, profile._id);
    return { taskCount: plan.tasks.length, milestoneCount: plan.milestones.length };
  },
});
