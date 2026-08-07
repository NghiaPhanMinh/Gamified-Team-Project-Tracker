import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

import { requireTeamMember } from "./lib/auth";

export const getProjectPlanningContext = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (project === null) {
      throw new Error("This project no longer exists.");
    }

    if (project.status === "archived") {
      throw new Error("Restore this archived project before asking AI for a plan.");
    }

    const { membership, profile } = await requireTeamMember(ctx, project.teamId);
    const [projectMembers, phases, existingTasks] = await Promise.all([
      ctx.db
        .query("projectMembers")
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
        .query("tasks")
        .withIndex("by_project", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
    ]);
    const isProjectMember = projectMembers.some(
      (member) => member.profileId === profile._id,
    );

    if (membership.role !== "owner" && !isProjectMember) {
      throw new Error("Only project members or the team owner can use AI planning.");
    }

    const members = await Promise.all(
      projectMembers.map(async (member) => {
        const memberProfile = await ctx.db.get(member.profileId);

        return memberProfile
          ? {
              profileId: member.profileId,
              displayName: memberProfile.displayName,
              skills: member.skills,
              availability: member.availability,
              currentWorkload: member.currentWorkload,
              preferences: member.preferences,
              weeklyCapacity: member.weeklyCapacity,
            }
          : null;
      }),
    );

    return {
      project: {
        projectId: project._id,
        title: project.title,
        description: project.description,
        frameworkName: project.frameworkName,
        startDate: project.startDate,
        deadline: project.deadline,
      },
      phases: phases.map((phase) => ({
        phaseId: phase._id,
        title: phase.title,
        description: phase.description,
        canOverlap: phase.canOverlap,
        reviewCheckpoint: phase.reviewCheckpoint,
      })),
      members: members.filter((member) => member !== null),
      existingTasks: existingTasks.map((task) => ({
        title: task.title,
        phaseId: task.phaseId,
        ownerProfileId: task.primaryOwnerProfileId,
        status: task.status,
        dueDate: task.dueDate,
      })),
    };
  },
});
