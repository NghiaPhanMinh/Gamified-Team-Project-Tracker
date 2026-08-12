import { v } from "convex/values";

import { query } from "./_generated/server";
import { rankAllocationCandidates } from "./lib/allocationEngine";
import { requireTeamMember } from "./lib/auth";

export const getForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (project === null) {
      throw new Error("This project no longer exists.");
    }

    const { profile } = await requireTeamMember(ctx, project.teamId);
    const [projectMembers, tasks, phases, milestones] = await Promise.all([
      ctx.db
        .query("projectMembers")
        .withIndex("by_project", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
      ctx.db
        .query("tasks")
        .withIndex("by_project", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
      ctx.db
        .query("phases")
        .withIndex("by_project_and_order", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
      ctx.db
        .query("milestones")
        .withIndex("by_project_and_due_date", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
    ]);
    const profiles = await Promise.all(
      projectMembers.map((member) => ctx.db.get(member.profileId)),
    );
    const profileById = new Map(
      profiles
        .filter((memberProfile) => memberProfile !== null)
        .map((memberProfile) => [memberProfile._id, memberProfile]),
    );
    const openTasks = tasks.filter((task) => task.status !== "completed");
    const completedTaskIds = new Set(
      tasks
        .filter((task) => task.status === "completed")
        .map((task) => task._id as string),
    );
    const openEffortByOwner = new Map<string, number>();

    for (const task of openTasks) {
      openEffortByOwner.set(
        task.primaryOwnerProfileId,
        (openEffortByOwner.get(task.primaryOwnerProfileId) ?? 0) +
          (task.estimatedEffortHours ?? 1),
      );
    }

    const members = projectMembers.flatMap((member) => {
      const memberProfile = profileById.get(member.profileId);

      return memberProfile
        ? [
            {
              id: member.profileId as string,
              displayName: memberProfile.displayName,
              skills: member.skills,
              availability: member.availability,
              currentWorkload: member.currentWorkload,
              preferences: member.preferences,
              weeklyCapacity: member.weeklyCapacity,
              assignedOpenEffort:
                openEffortByOwner.get(member.profileId) ?? 0,
            },
          ]
        : [];
    });
    const suggestions = openTasks
      .map((task) => ({
        taskId: task._id,
        taskTitle: task.title,
        currentOwnerProfileId: task.primaryOwnerProfileId,
        candidates: rankAllocationCandidates({
          members,
          task: {
            id: task._id,
            title: task.title,
            description: task.description,
            requiredSkills: task.requiredSkills ?? [],
            estimatedEffortHours: task.estimatedEffortHours ?? 1,
            dependencyTaskIds: (task.dependencyTaskIds ?? []).map(String),
          },
          completedTaskIds,
        }),
      }))
      .sort((first, second) => first.taskTitle.localeCompare(second.taskTitle));
    const phaseTitleById = new Map(
      phases.map((phase) => [phase._id, phase.title]),
    );
    const workload = members.map((member) => {
      const memberTasks = openTasks.filter(
        (task) => task.primaryOwnerProfileId === member.id,
      );
      const phaseEffort = [...new Set(memberTasks.map((task) => task.phaseId))]
        .map((phaseId) => ({
          phaseId,
          phaseTitle: phaseTitleById.get(phaseId) ?? "Unknown phase",
          effortHours: memberTasks
            .filter((task) => task.phaseId === phaseId)
            .reduce((sum, task) => sum + (task.estimatedEffortHours ?? 1), 0),
        }))
        .sort((first, second) => second.effortHours - first.effortHours);
      const overloaded =
        (member.weeklyCapacity !== undefined &&
          member.assignedOpenEffort > member.weeklyCapacity) ||
        (member.currentWorkload === "high" && member.assignedOpenEffort > 0);

      return {
        profileId: member.id,
        displayName: member.displayName,
        currentWorkload: member.currentWorkload,
        availability: member.availability,
        weeklyCapacity: member.weeklyCapacity,
        openTaskCount: memberTasks.length,
        openEffortHours: member.assignedOpenEffort,
        overdueTaskCount: memberTasks.filter(
          (task) => task.dueDate < new Date().toISOString().slice(0, 10),
        ).length,
        overloaded,
        phaseEffort,
      };
    });
    const today = new Date().toISOString().slice(0, 10);
    const taskById = new Map(tasks.map((task) => [task._id, task]));
    const latestReviews = await Promise.all(
      tasks.map(async (task) => {
        const reviews = await ctx.db
          .query("taskReviews")
          .withIndex("by_task_and_time", (indexQuery) =>
            indexQuery.eq("taskId", task._id),
          )
          .order("desc")
          .take(1);

        return [task._id, reviews[0]] as const;
      }),
    );
    const latestReviewByTask = new Map(latestReviews);
    const risks: Array<{
      id: string;
      kind:
        | "overdue"
        | "blocked_dependency"
        | "pending_review"
        | "overloaded"
        | "due_date_overlap"
        | "milestone_at_risk";
      severity: "attention" | "high";
      title: string;
      detail: string;
      taskId?: string;
      profileId?: string;
      milestoneId?: string;
    }> = [];

    for (const task of openTasks) {
      if (task.dueDate < today) {
        risks.push({
          id: `overdue:${task._id}`,
          kind: "overdue",
          severity: "high",
          title: `${task.title} is overdue`,
          detail: `Due ${task.dueDate}; update its date, owner, or status.`,
          taskId: task._id,
        });
      }

      const incompleteDependencies = (task.dependencyTaskIds ?? []).filter(
        (dependencyId) => taskById.get(dependencyId)?.status !== "completed",
      );

      if (task.status === "blocked" || incompleteDependencies.length > 0) {
        risks.push({
          id: `dependency:${task._id}`,
          kind: "blocked_dependency",
          severity: task.status === "blocked" ? "high" : "attention",
          title: `${task.title} is waiting on dependencies`,
          detail: `${incompleteDependencies.length} recorded dependencies are incomplete.`,
          taskId: task._id,
        });
      }

      if (latestReviewByTask.get(task._id)?.status === "pending") {
        risks.push({
          id: `review:${task._id}`,
          kind: "pending_review",
          severity: "attention",
          title: `${task.title} is awaiting review`,
          detail: "The assigned reviewer has not approved or requested changes yet.",
          taskId: task._id,
        });
      }
    }

    for (const member of workload.filter((entry) => entry.overloaded)) {
      risks.push({
        id: `overloaded:${member.profileId}`,
        kind: "overloaded",
        severity: "high",
        title: `${member.displayName} may be overloaded`,
        detail:
          member.weeklyCapacity === undefined
            ? `${member.openEffortHours} open estimated hours alongside a self-reported high workload.`
            : `${member.openEffortHours} open estimated hours exceed ${member.weeklyCapacity} self-reported weekly hours.`,
        profileId: member.profileId,
      });
    }

    const heavyTasksByOwnerAndDate = new Map<string, typeof openTasks>();

    for (const task of openTasks.filter(
      (candidate) =>
        (candidate.estimatedEffortHours ?? 1) >= 8 || (candidate.difficulty ?? 1) >= 4,
    )) {
      const key = `${task.primaryOwnerProfileId}:${task.dueDate}`;
      heavyTasksByOwnerAndDate.set(key, [
        ...(heavyTasksByOwnerAndDate.get(key) ?? []),
        task,
      ]);
    }

    for (const overlappingTasks of heavyTasksByOwnerAndDate.values()) {
      if (overlappingTasks.length < 2) continue;
      const ownerId = overlappingTasks[0].primaryOwnerProfileId;
      const ownerName = profileById.get(ownerId)?.displayName ?? "A project member";
      risks.push({
        id: `overlap:${ownerId}:${overlappingTasks[0].dueDate}`,
        kind: "due_date_overlap",
        severity: "attention",
        title: `${ownerName} has ${overlappingTasks.length} heavy tasks due together`,
        detail: `These tasks share the ${overlappingTasks[0].dueDate} due date.`,
        profileId: ownerId,
      });
    }

    for (const milestone of milestones.filter(
      (candidate) => candidate.status !== "completed",
    )) {
      const milestoneTasks = milestone.requiredTaskIds.flatMap((taskId) => {
        const task = taskById.get(taskId);
        return task ? [task] : [];
      });
      const linkedRisk = milestoneTasks.some(
        (task) =>
          task.status === "blocked" ||
          (task.status !== "completed" && task.dueDate < today),
      );

      if (milestone.dueDate < today || linkedRisk) {
        risks.push({
          id: `milestone:${milestone._id}`,
          kind: "milestone_at_risk",
          severity: milestone.dueDate < today ? "high" : "attention",
          title: `${milestone.title} may be at risk`,
          detail:
            milestone.dueDate < today
              ? `Its ${milestone.dueDate} due date has passed.`
              : "At least one linked task is blocked or overdue.",
          milestoneId: milestone._id,
        });
      }
    }

    return {
      canWrite:
        project.status !== "archived" &&
        project.creatorProfileId === profile._id,
      caveat:
        "These suggestions are transparent decision support, not an objective measure of fairness or teammate performance.",
      scoreWeights: {
        skillMatch: 40,
        availabilityFit: 25,
        workloadBalance: 20,
        preferenceFit: 10,
        dependencyTiming: 5,
      },
      workload,
      suggestions,
      risks: risks.sort(
        (first, second) =>
          Number(second.severity === "high") -
            Number(first.severity === "high") ||
          first.title.localeCompare(second.title),
      ),
    };
  },
});
