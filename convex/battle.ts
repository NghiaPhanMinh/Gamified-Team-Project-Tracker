import { v } from "convex/values";

import { query } from "./_generated/server";
import { requireTeamMember } from "./lib/auth";

function damageFor(task: { damage?: number; difficulty: number }) {
  return task.damage ?? (task.difficulty <= 1 ? 10 : task.difficulty === 2 ? 20 : 30);
}

export const getState = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (project === null) throw new Error("This project no longer exists.");
    const { profile } = await requireTeamMember(ctx, project.teamId);

    const [tasks, events, memberships] = await Promise.all([
      ctx.db.query("tasks").withIndex("by_project", (q) => q.eq("projectId", project._id)).collect(),
      ctx.db.query("combatEvents").withIndex("by_project_and_time", (q) => q.eq("projectId", project._id)).order("asc").collect(),
      ctx.db.query("teamMembers").withIndex("by_team", (q) => q.eq("teamId", project.teamId)).collect(),
    ]);
    const requiredTasks = tasks.filter((task) => task.required);
    const maximumHp = requiredTasks.reduce((sum, task) => sum + damageFor(task), 0);
    const appliedTaskIds = new Set<string>();
    const uniqueEvents = events.filter((event) => {
      if (appliedTaskIds.has(event.taskId)) return false;
      appliedTaskIds.add(event.taskId);
      return true;
    });
    const eventTaskIds = new Set(uniqueEvents.map((event) => event.taskId));
    const legacyVerifiedDamage = project.launchedAt === undefined
      ? requiredTasks
          .filter((task) => task.status === "completed" && !eventTaskIds.has(task._id))
          .reduce((sum, task) => sum + damageFor(task), 0)
      : 0;
    const damageDealt = Math.min(
      maximumHp,
      uniqueEvents.reduce((sum, event) => sum + event.damage, 0) + legacyVerifiedDamage,
    );
    const profileIds = new Set([
      ...memberships.map((member) => member.profileId),
      ...uniqueEvents.flatMap((event) => [event.attackerProfileId, event.reviewerProfileId]),
    ]);
    const profiles = await Promise.all([...profileIds].map((profileId) => ctx.db.get(profileId)));
    const profileById = new Map(profiles.filter(Boolean).map((item) => [item!._id, item!]));
    const taskById = new Map(tasks.map((task) => [task._id, task]));

    return {
      project: {
        _id: project._id,
        title: project.title,
        deadline: project.deadline,
        status: project.status,
        launchedAt: project.launchedAt,
      },
      currentProfileId: profile._id,
      maximumHp,
      damageDealt,
      remainingHp: Math.max(0, maximumHp - damageDealt),
      remainingRequiredTasks: requiredTasks.filter(
        (task) => task.status !== "verified" && task.status !== "completed",
      ).length,
      members: memberships.map((member) => ({
        profileId: member.profileId,
        displayName: profileById.get(member.profileId)?.displayName ?? "Team member",
        characterFill: member.characterFill,
        characterOutline: member.characterOutline,
        spellType: member.spellType ?? "spark",
      })),
      events: uniqueEvents.map((event) => ({
        ...event,
        attackerName: profileById.get(event.attackerProfileId)?.displayName ?? "Team member",
        reviewerName: profileById.get(event.reviewerProfileId)?.displayName ?? "Reviewer",
        taskTitle: taskById.get(event.taskId)?.title ?? "Deleted task",
      })),
    };
  },
});
