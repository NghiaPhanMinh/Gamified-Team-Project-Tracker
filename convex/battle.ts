import { v } from "convex/values";

import { query } from "./_generated/server";
import { requireTeamMember } from "./lib/auth";

export const getState = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (project === null) throw new Error("This project no longer exists.");
    const { profile } = await requireTeamMember(ctx, project.teamId);

    const [tasks, events, memberships, dailyPosts] = await Promise.all([
      ctx.db.query("tasks").withIndex("by_project", (q) => q.eq("projectId", project._id)).collect(),
      ctx.db.query("combatEvents").withIndex("by_project_and_time", (q) => q.eq("projectId", project._id)).order("asc").collect(),
      ctx.db.query("teamMembers").withIndex("by_team", (q) => q.eq("teamId", project.teamId)).collect(),
      ctx.db.query("dailyFeed").withIndex("by_project_and_time", (q) => q.eq("projectId", project._id)).collect(),
    ]);

    const requiredTasks = tasks.filter((task) => task.required);
    const userCount = Math.max(1, memberships.length);
    const hpSharePerPlayer = 100;
    const maximumHp = userCount * hpSharePerPlayer; // Each user in the room = 100 HP share

    // Count required tasks assigned to each user
    const requiredTaskCountByOwner = new Map<string, number>();
    for (const task of requiredTasks) {
      const ownerId = task.primaryOwnerProfileId;
      requiredTaskCountByOwner.set(ownerId, (requiredTaskCountByOwner.get(ownerId) ?? 0) + 1);
    }

    const appliedTaskIds = new Set<string>();
    const uniqueEvents = events.filter((event) => {
      if (appliedTaskIds.has(event.taskId)) return false;
      appliedTaskIds.add(event.taskId);
      return true;
    });

    // Track damage dealt per user (each user capped at 100 HP max)
    const memberDamageMap = new Map<string, number>();

    for (const event of uniqueEvents) {
      const attackerId = event.attackerProfileId;
      const ownerTaskCount = requiredTaskCountByOwner.get(attackerId) ?? 1;
      const damageForTask = Math.max(1, Math.round(100 / ownerTaskCount));
      const current = memberDamageMap.get(attackerId) ?? 0;
      memberDamageMap.set(attackerId, Math.min(100, current + damageForTask));
    }

    const eventTaskIds = new Set(uniqueEvents.map((e) => e.taskId));
    for (const task of requiredTasks) {
      if ((task.status === "completed" || task.status === "verified") && !eventTaskIds.has(task._id)) {
        const ownerId = task.primaryOwnerProfileId;
        const ownerTaskCount = requiredTaskCountByOwner.get(ownerId) ?? 1;
        const damageForTask = Math.max(1, Math.round(100 / ownerTaskCount));
        const current = memberDamageMap.get(ownerId) ?? 0;
        memberDamageMap.set(ownerId, Math.min(100, current + damageForTask));
      }
    }

    const damageDealt = Math.min(
      maximumHp,
      [...memberDamageMap.values()].reduce((sum, val) => sum + val, 0),
    );

    const profileIds = new Set([
      ...memberships.map((member) => member.profileId),
      ...uniqueEvents.flatMap((event) => [event.attackerProfileId, event.reviewerProfileId]),
    ]);
    const profiles = await Promise.all([...profileIds].map((profileId) => ctx.db.get(profileId)));
    const profileById = new Map(profiles.filter(Boolean).map((item) => [item!._id, item!]));
    const taskById = new Map(tasks.map((task) => [task._id, task]));

    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const isOverdue = project.deadline ? new Date(`${project.deadline}T23:59:59Z`).getTime() < Date.now() : false;
    const overdueTaskCount = requiredTasks.filter(
      (task) => task.status !== "verified" && task.status !== "completed" && task.dueDate && new Date(`${task.dueDate}T23:59:59Z`).getTime() < Date.now(),
    ).length;

    const villageHpPercent = (maximumHp === 0 || maximumHp - damageDealt <= 0)
      ? 100
      : isOverdue
      ? 20
      : overdueTaskCount > 0
      ? Math.max(25, 100 - overdueTaskCount * 25)
      : 100;

    const remainingHp = Math.max(0, maximumHp - damageDealt);

    return {
      project: {
        _id: project._id,
        title: project.title,
        deadline: project.deadline,
        status: project.status,
        launchedAt: project.launchedAt,
        targetMemberCount: userCount,
      },
      currentProfileId: profile._id,
      maximumHp,
      damageDealt,
      remainingHp,
      villageHpPercent,
      isOverdue,
      hpSharePerPlayer,
      remainingRequiredTasks: requiredTasks.filter(
        (task) => task.status !== "verified" && task.status !== "completed",
      ).length,
      members: memberships.map((member) => {
        const hasValidDailyToday = dailyPosts.some(
          (p) => p.authorProfileId === member.profileId && p.isValid && p.createdAt >= startOfToday,
        );
        const hasSubmittedToday = hasValidDailyToday || uniqueEvents.some(
          (event) => event.attackerProfileId === member.profileId && event.createdAt >= startOfToday,
        ) || tasks.some(
          (task) => (task.primaryOwnerProfileId === member.profileId || task.collaboratorProfileIds.includes(member.profileId)) &&
            (task.status === "submitted" || task.status === "verified" || task.status === "completed") &&
            task.updatedAt >= startOfToday,
        );
        const memberDamage = memberDamageMap.get(member.profileId) ?? 0;
        return {
          profileId: member.profileId,
          displayName: profileById.get(member.profileId)?.displayName ?? "Team member",
          characterFill: member.characterFill,
          characterOutline: member.characterOutline,
          spellType: member.spellType ?? "spark",
          hasSubmittedToday,
          hasPendingGoblin: !hasSubmittedToday,
          damageDealt: memberDamage,
          targetHpShare: hpSharePerPlayer,
          isShareComplete: memberDamage >= hpSharePerPlayer,
        };
      }),
      events: uniqueEvents.map((event) => ({
        ...event,
        attackerName: profileById.get(event.attackerProfileId)?.displayName ?? "Team member",
        reviewerName: profileById.get(event.reviewerProfileId)?.displayName ?? "Reviewer",
        taskTitle: taskById.get(event.taskId)?.title ?? "Deleted task",
      })),
    };
  },
});

export const getLeaderboard = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (project === null) throw new Error("This project no longer exists.");
    await requireTeamMember(ctx, project.teamId);

    // Get all team memberships
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", project.teamId))
      .collect();

    const leaderboard = await Promise.all(
      memberships.map(async (m) => {
        const userProfile = await ctx.db.get(m.profileId);
        if (!userProfile) return null;

        // Count dailyFeed unique valid days (1 goblin kill per day maximum)
        const posts = await ctx.db
          .query("dailyFeed")
          .withIndex("by_project_author_and_time", (q) =>
            q.eq("projectId", project._id).eq("authorProfileId", m.profileId)
          )
          .collect();

        const uniqueKillDays = new Set(
          posts
            .filter((p) => p.isValid)
            .map((p) => new Date(p.createdAt).toISOString().split("T")[0])
        );
        const goblinsKilled = uniqueKillDays.size;

        // Count completed / verified tasks
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_project_and_owner", (q) =>
            q.eq("projectId", project._id).eq("primaryOwnerProfileId", m.profileId)
          )
          .collect();
        const tasksCompleted = tasks.filter((t) => t.status === "completed" || t.status === "verified").length;

        return {
          profileId: m.profileId,
          displayName: userProfile.displayName,
          goblinsKilled,
          tasksCompleted,
        };
      })
    );

    return leaderboard
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.goblinsKilled - a.goblinsKilled);
  },
});

