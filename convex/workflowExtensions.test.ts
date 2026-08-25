/// <reference types="vite/client" />

import { convexTest, type TestConvex } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
type Database = TestConvex<typeof schema>;

async function addProfile(database: Database, displayName: string, email: string) {
  const seeded = await database.run(async (ctx) => {
    const authUserId = await ctx.db.insert("users", { name: displayName, email });
    const now = Date.now();
    const profileId = await ctx.db.insert("userProfiles", { authUserId, displayName, email, skills: ["Communication"], softwareSkills: [], weeklyCapacity: 8, profileCompletedAt: now, createdAt: now, updatedAt: now });
    return { authUserId, profileId };
  });
  return {
    ...seeded,
    asUser: database.withIdentity({ subject: `${seeded.authUserId}|test-session`, name: displayName, email }),
  };
}

async function setupProject(database: Database) {
  const owner = await addProfile(database, "Owner", "owner-workflow@example.com");
  const member = await addProfile(database, "Member", "member-workflow@example.com");
  const outsider = await addProfile(database, "Outsider", "outsider-workflow@example.com");
  const teamId = await owner.asUser.mutation(api.teams.create, { name: "Workflow Team" });
  const team = await owner.asUser.query(api.teams.getWorkspace, { teamId });
  await member.asUser.mutation(api.teams.joinByCode, { code: team.team.joinCode });
  const projectId = await owner.asUser.mutation(api.projects.create, {
    teamId,
    title: "Workflow Project",
    description: "Validate availability, trades, and usage.",
    startDate: "2026-08-01",
    deadline: "2026-12-01",
    frameworkType: "none",
    frameworkName: "Flexible project",
    phases: [],
    taskCreationMode: "manual",
    allocationStrategy: "manual",
    members: [
      { profileId: owner.profileId, skills: ["Planning"], availability: "", currentWorkload: "low", preferences: "" },
      { profileId: member.profileId, skills: ["Testing"], availability: "", currentWorkload: "low", preferences: "" },
    ],
  });
  return { owner, member, outsider, projectId, teamId };
}

describe("extended project workflows", () => {
  it("does not let a team owner bypass room-creator task controls", async () => {
    const database = convexTest(schema, modules);
    const teamOwner = await addProfile(database, "Team Owner", "team-owner@example.com");
    const roomCreator = await addProfile(database, "Room Creator", "room-creator@example.com");
    const teamId = await teamOwner.asUser.mutation(api.teams.create, { name: "Creator Boundary Team" });
    const team = await teamOwner.asUser.query(api.teams.getWorkspace, { teamId });
    await roomCreator.asUser.mutation(api.teams.joinByCode, { code: team.team.joinCode });
    const projectId = await roomCreator.asUser.mutation(api.projects.create, {
      teamId,
      title: "Creator Boundary Project",
      description: "Ensure team ownership does not override room creation authority.",
      deadline: "2026-12-01",
      frameworkType: "none",
      frameworkName: "Flexible project",
      phases: [],
      members: [
        { profileId: roomCreator.profileId, skills: ["Planning"], availability: "", currentWorkload: "low", preferences: "" },
        { profileId: teamOwner.profileId, skills: ["Review"], availability: "", currentWorkload: "low", preferences: "" },
      ],
    });
    const ownerWorkspace = await teamOwner.asUser.query(api.tasks.getWorkspace, { projectId });
    expect(ownerWorkspace.canManageProject).toBe(false);

    await expect(teamOwner.asUser.mutation(api.tasks.createPhase, {
      projectId,
      title: "Unauthorised phase",
    })).rejects.toThrow(/only the room creator/i);
    await expect(teamOwner.asUser.mutation(api.projects.updateBrief, {
      projectId,
      title: "Changed without permission",
      description: "This direct write must be rejected.",
      deadline: "2026-12-01",
    })).rejects.toThrow(/only the room creator/i);
    await expect(teamOwner.asUser.mutation(api.projects.deletePermanently, {
      projectId,
      confirmationName: "Creator Boundary Project",
    })).rejects.toThrow(/only the room creator/i);
  });

  it("calculates calendar overlap from saved blocks and protects it from outsiders", async () => {
    const database = convexTest(schema, modules);
    const { owner, member, outsider, projectId } = await setupProject(database);
    const common = { projectId, timezone: "Asia/Ho_Chi_Minh", meetingDurationMinutes: 60, meetingCadence: "weekly" as const };
    await owner.asUser.mutation(api.availability.updateMine, { ...common, blocks: [{ dayOfWeek: 1, startMinute: 600, endMinute: 780 }] });
    await member.asUser.mutation(api.availability.updateMine, { ...common, blocks: [{ dayOfWeek: 1, startMinute: 660, endMinute: 840 }] });
    const result = await owner.asUser.query(api.availability.getForProject, { projectId });
    expect(result).not.toBeNull();
    expect(result!.suggestions[0]).toMatchObject({ dayOfWeek: 0, startMinute: 480, endMinute: 540 });
    expect(result!.suggestions[0].attendeeProfileIds).toHaveLength(2);
    expect(result!.suggestions.find((slot) => slot.dayOfWeek === 1 && slot.startMinute === 660)).toBeUndefined();
    await expect(outsider.asUser.query(api.availability.getForProject, { projectId })).rejects.toThrow(/do not have access/i);
  });

  it("records meeting votes and lets only the room creator select the final time", async () => {
    const database = convexTest(schema, modules);
    const { owner, member, projectId } = await setupProject(database);
    const meetingPlanId = await owner.asUser.mutation(api.availability.saveMeetingPlan, {
      projectId,
      title: "Weekly studio check-in",
      dayOfWeek: 2,
      startMinute: 600,
      durationMinutes: 60,
      timezone: "Asia/Ho_Chi_Minh",
      attendeeProfileIds: [owner.profileId, member.profileId],
      source: "deterministic",
      meetingMode: "online",
    });
    await owner.asUser.mutation(api.availability.voteMeeting, { meetingPlanId, suitable: true });
    await member.asUser.mutation(api.availability.voteMeeting, { meetingPlanId, suitable: true });
    await expect(member.asUser.mutation(api.availability.selectMeeting, { meetingPlanId }))
      .rejects.toThrow(/only the room creator/i);
    await owner.asUser.mutation(api.availability.selectMeeting, { meetingPlanId });

    const result = await member.asUser.query(api.availability.getForProject, { projectId });
    expect(result).not.toBeNull();
    expect(result!.plans[0]).toMatchObject({
      _id: meetingPlanId,
      status: "selected",
      meetingMode: "online",
      suitableCount: 2,
    });
  });

  it("enforces balanced reviewer capacity while another eligible reviewer has room", async () => {
    const database = convexTest(schema, modules);
    const { owner, member, projectId } = await setupProject(database);
    const secondReviewer = await addProfile(database, "Second Reviewer", "second-reviewer@example.com");
    const project = await owner.asUser.query(api.tasks.getWorkspace, { projectId });
    const team = await owner.asUser.query(api.teams.getWorkspace, { teamId: project.project.teamId });
    await secondReviewer.asUser.mutation(api.teams.joinByCode, { code: team.team.joinCode });
    const taskInput = {
      projectId,
      phaseId: project.phases[0]._id,
      description: "A review-capacity test task.",
      primaryOwnerProfileId: owner.profileId,
      collaboratorProfileIds: [],
      weight: 1,
      required: true,
      startDate: "2026-08-02",
      dueDate: "2026-08-20",
      requiresReview: true,
    };

    await owner.asUser.mutation(api.tasks.createTask, {
      ...taskInput,
      title: "First reviewed task",
      reviewerProfileId: member.profileId,
    });
    await expect(owner.asUser.mutation(api.tasks.createTask, {
      ...taskInput,
      title: "Overloaded review task",
      reviewerProfileId: member.profileId,
    })).rejects.toThrow(/reviewer capacity reached/i);
    await expect(owner.asUser.mutation(api.tasks.createTask, {
      ...taskInput,
      title: "Balanced review task",
      reviewerProfileId: secondReviewer.profileId,
    })).resolves.toBeDefined();
  });

  it("transfers an accepted task only through an explicit atomic trade", async () => {
    const database = convexTest(schema, modules);
    const { owner, member, outsider, projectId } = await setupProject(database);
    const workspace = await owner.asUser.query(api.tasks.getWorkspace, { projectId });
    const taskId = await owner.asUser.mutation(api.tasks.createTask, {
      projectId,
      phaseId: workspace.phases[0]._id,
      title: "Prepare prototype",
      description: "Build the first interactive version.",
      primaryOwnerProfileId: owner.profileId,
      collaboratorProfileIds: [],
      weight: 1,
      required: true,
      startDate: "2026-08-02",
      dueDate: "2026-08-20",
      requiresReview: false,
    });
    const tradeId = await owner.asUser.mutation(api.taskTrades.request, { taskId, requestedToProfileId: member.profileId });
    await expect(outsider.asUser.mutation(api.taskTrades.resolve, { tradeId, decision: "accepted" })).rejects.toThrow(/do not have access/i);
    await member.asUser.mutation(api.taskTrades.resolve, { tradeId, decision: "accepted" });
    const updated = await member.asUser.query(api.tasks.getWorkspace, { projectId });
    expect(updated.tasks[0]).toMatchObject({ primaryOwnerProfileId: member.profileId, acceptanceStatus: "accepted" });
  });

  it("requires project-owner authority and exact-name confirmation for deletion", async () => {
    const database = convexTest(schema, modules);
    const { owner, member, projectId } = await setupProject(database);
    const ownerProjects = await owner.asUser.query(api.projects.listMineAcrossRooms, {});
    const memberProjects = await member.asUser.query(api.projects.listMineAcrossRooms, {});
    expect(ownerProjects[0]).toMatchObject({ _id: projectId, title: "Workflow Project", canDelete: true });
    expect(memberProjects[0]).toMatchObject({ _id: projectId, title: "Workflow Project", canDelete: false });
    await expect(member.asUser.mutation(api.projects.deletePermanently, { projectId, confirmationName: "Workflow Project" })).rejects.toThrow(/room creator/i);
    await expect(owner.asUser.mutation(api.projects.deletePermanently, { projectId, confirmationName: "wrong name" })).rejects.toThrow(/exact project name/i);
    expect(await owner.asUser.query(api.projects.listForTeam, { teamId: (await owner.asUser.query(api.tasks.getWorkspace, { projectId })).project.teamId })).toHaveLength(1);
  });

  it("removes a deleted project from every reactive project list and persistent project storage", async () => {
    const database = convexTest(schema, modules);
    const { owner, member, projectId } = await setupProject(database);
    const feedId = await database.run((ctx) => ctx.db.insert("dailyFeed", {
      projectId,
      authorProfileId: owner.profileId,
      text: "Deletion regression evidence",
      imageUrls: [],
      wordCount: 3,
      imageCount: 0,
      isValid: true,
      createdAt: Date.now(),
    }));

    await owner.asUser.mutation(api.projects.deletePermanently, {
      projectId,
      confirmationName: "Workflow Project",
    });

    expect(await owner.asUser.query(api.projects.listMineAcrossRooms, {})).toEqual([]);
    expect(await member.asUser.query(api.projects.listMineAcrossRooms, {})).toEqual([]);
    expect(await database.run((ctx) => ctx.db.get(projectId))).toBeNull();
    expect(await database.run((ctx) => ctx.db.get(feedId))).toBeNull();
  });

  it("enforces the Free platform generation allowance on backend records", async () => {
    const database = convexTest(schema, modules);
    const { owner, projectId } = await setupProject(database);
    expect(await owner.asUser.query(api.aiUsage.getProjectUsage, { projectId })).toMatchObject({ tier: "free", limit: 1, used: 0, platformGenerationAvailable: true });
    const reservationId = await database.mutation(internal.aiUsage.reservePlatformGeneration, { projectId, profileId: owner.profileId });
    await database.mutation(internal.aiUsage.finishPlatformGeneration, { usageId: reservationId, success: false, model: "failed" });
    await database.run((ctx) => ctx.db.insert("aiUsage", {
      projectId,
      profileId: owner.profileId,
      source: "platform",
      operation: "project_plan",
      model: "free-test-model",
      success: true,
      createdAt: Date.now(),
    }));
    expect(await owner.asUser.query(api.aiUsage.getProjectUsage, { projectId })).toMatchObject({ used: 1, platformGenerationAvailable: false });
  });
});
