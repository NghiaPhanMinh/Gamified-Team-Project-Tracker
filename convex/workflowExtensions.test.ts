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
    const profileId = await ctx.db.insert("userProfiles", { authUserId, displayName, email, createdAt: now, updatedAt: now });
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
  return { owner, member, outsider, projectId };
}

describe("extended project workflows", () => {
  it("calculates calendar overlap from saved blocks and protects it from outsiders", async () => {
    const database = convexTest(schema, modules);
    const { owner, member, outsider, projectId } = await setupProject(database);
    const common = { projectId, timezone: "Asia/Ho_Chi_Minh", meetingDurationMinutes: 60, meetingCadence: "weekly" as const };
    await owner.asUser.mutation(api.availability.updateMine, { ...common, blocks: [{ dayOfWeek: 1, startMinute: 600, endMinute: 780 }] });
    await member.asUser.mutation(api.availability.updateMine, { ...common, blocks: [{ dayOfWeek: 1, startMinute: 660, endMinute: 840 }] });
    const result = await owner.asUser.query(api.availability.getForProject, { projectId });
    expect(result.suggestions[0]).toMatchObject({ dayOfWeek: 1, startMinute: 660, endMinute: 780 });
    expect(result.suggestions[0].attendeeProfileIds).toHaveLength(2);
    await expect(outsider.asUser.query(api.availability.getForProject, { projectId })).rejects.toThrow(/do not have access/i);
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
    await expect(member.asUser.mutation(api.projects.deletePermanently, { projectId, confirmationName: "Workflow Project" })).rejects.toThrow(/project creator or team owner/i);
    await expect(owner.asUser.mutation(api.projects.deletePermanently, { projectId, confirmationName: "wrong name" })).rejects.toThrow(/exact project name/i);
    expect(await owner.asUser.query(api.projects.listForTeam, { teamId: (await owner.asUser.query(api.tasks.getWorkspace, { projectId })).project.teamId })).toHaveLength(1);
  });

  it("enforces the Free platform generation allowance on backend records", async () => {
    const database = convexTest(schema, modules);
    const { owner, projectId } = await setupProject(database);
    expect(await owner.asUser.query(api.aiUsage.getProjectUsage, { projectId })).toMatchObject({ tier: "free", limit: 1, used: 0, platformGenerationAvailable: true });
    const reservationId = await database.mutation(internal.aiUsage.reservePlatformGeneration, { projectId, profileId: owner.profileId, limit: 1 });
    await expect(database.mutation(internal.aiUsage.reservePlatformGeneration, { projectId, profileId: owner.profileId, limit: 1 })).rejects.toThrow(/AI GENERATION USED/i);
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
