/// <reference types="vite/client" />

import { convexTest, type TestConvex } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
type ProjectTestDatabase = TestConvex<typeof schema>;

async function addProfile(
  testDatabase: ProjectTestDatabase,
  displayName: string,
  email: string,
) {
  const seeded = await testDatabase.run(async (ctx) => {
    const authUserId = await ctx.db.insert("users", {
      name: displayName,
      email,
    });
    const now = Date.now();
    const profileId = await ctx.db.insert("userProfiles", {
      authUserId,
      displayName,
      email,
      skills: ["Communication"],
      softwareSkills: [],
      weeklyCapacity: 8,
      profileCompletedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { authUserId, profileId };
  });

  return {
    ...seeded,
    asUser: testDatabase.withIdentity({
      subject: `${seeded.authUserId}|test-session`,
      name: displayName,
      email,
    }),
  };
}

function samplePhases() {
  return [
    {
      key: "discover",
      name: "Discover",
      description: "Understand the audience and assignment context.",
      canOverlap: true,
      dependencyKeys: [],
      reviewCheckpoint: false,
    },
    {
      key: "deliver",
      name: "Deliver",
      description: "Prepare and submit the final work.",
      canOverlap: false,
      dependencyKeys: ["discover"],
      reviewCheckpoint: true,
    },
  ];
}

async function createTeamWithMember(testDatabase: ProjectTestDatabase) {
  const owner = await addProfile(
    testDatabase,
    "Owner One",
    "owner@example.com",
  );
  const member = await addProfile(
    testDatabase,
    "Member Two",
    "member@example.com",
  );
  const outsider = await addProfile(
    testDatabase,
    "Outsider",
    "outsider@example.com",
  );
  const teamId = await owner.asUser.mutation(api.teams.create, {
    name: "Project Team",
  });
  const workspace = await owner.asUser.query(api.teams.getWorkspace, {
    teamId,
  });
  await member.asUser.mutation(api.teams.joinByCode, {
    code: workspace.team.joinCode,
  });

  return { owner, member, outsider, teamId };
}

describe("project creation foundation", () => {
  it("creates a persistent project, member plans, phases, and activity", async () => {
    const testDatabase = convexTest(schema, modules);
    const { owner, member, teamId } =
      await createTeamWithMember(testDatabase);
    const projectId = await owner.asUser.mutation(api.projects.create, {
      teamId,
      title: "Campaign Studio",
      description: "Plan the semester campaign together.",
      startDate: "2026-08-03",
      deadline: "2026-11-20",
      frameworkType: "built_in",
      builtInFrameworkId: "design-nonlinear",
      frameworkName: "Nonlinear Design Process",
      phases: samplePhases(),
      members: [
        {
          profileId: owner.profileId,
          skills: ["Research", "Planning"],
          availability: "Tuesday and Thursday evenings",
          currentWorkload: "medium",
          preferences: "Discovery and coordination",
          weeklyCapacity: 8,
        },
        {
          profileId: member.profileId,
          skills: ["Visual design"],
          availability: "Weekends",
          currentWorkload: "low",
          preferences: "Prototyping",
          weeklyCapacity: 10,
        },
      ],
    });

    const memberProjects = await member.asUser.query(
      api.projects.listForTeam,
      { teamId },
    );
    const saved = await testDatabase.run(async (ctx) => ({
      projectMembers: await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (query) => query.eq("projectId", projectId))
        .collect(),
      activity: await ctx.db
        .query("activityLogs")
        .withIndex("by_team_and_time", (query) => query.eq("teamId", teamId))
        .collect(),
    }));

    expect(memberProjects).toHaveLength(1);
    expect(memberProjects[0]).toMatchObject({
      _id: projectId,
      status: "active",
      phaseCount: 2,
      memberCount: 2,
      frameworkName: "Nonlinear Design Process",
    });
    expect(memberProjects[0].phases.map((phase) => phase.title)).toEqual([
      "Discover",
      "Deliver",
    ]);
    expect(saved.projectMembers).toHaveLength(2);
    expect(saved.activity.at(-1)?.action).toBe("project_created");
  });

  it("blocks outsiders, invalid dates, and non-team project members", async () => {
    const testDatabase = convexTest(schema, modules);
    const { owner, outsider, teamId } =
      await createTeamWithMember(testDatabase);
    const baseInput = {
      teamId,
      title: "Safe Project",
      description: "A validated project.",
      startDate: "2026-09-01",
      deadline: "2026-08-01",
      frameworkType: "built_in" as const,
      builtInFrameworkId: "design-nonlinear",
      frameworkName: "Nonlinear Design Process",
      phases: samplePhases(),
      members: [
        {
          profileId: owner.profileId,
          skills: [],
          availability: "",
          currentWorkload: "low" as const,
          preferences: "",
        },
      ],
    };

    await expect(
      owner.asUser.mutation(api.projects.create, baseInput),
    ).rejects.toThrow(/deadline cannot be before/i);
    await expect(
      outsider.asUser.mutation(api.projects.create, {
        ...baseInput,
        startDate: "2026-08-01",
        deadline: "2026-09-01",
      }),
    ).rejects.toThrow(/do not have access/i);
    await expect(
      owner.asUser.mutation(api.projects.create, {
        ...baseInput,
        startDate: "2026-08-01",
        deadline: "2026-09-01",
        members: [{ ...baseInput.members[0], profileId: outsider.profileId }],
      }),
    ).rejects.toThrow(/must belong to the team/i);
  });

  it("copies a team-owned custom framework on creation", async () => {
    const testDatabase = convexTest(schema, modules);
    const { owner, teamId } = await createTeamWithMember(testDatabase);
    const customFrameworkId = await owner.asUser.mutation(
      api.customFrameworks.create,
      {
        teamId,
        name: "Studio Loop",
        description: "A custom team process.",
        phases: samplePhases().map((phase) => ({
          key: phase.key,
          name: phase.name,
          description: phase.description,
          isOptional: false,
          suggestedDeliverables: [],
          suggestedSkills: [],
          canOverlap: phase.canOverlap,
          defaultDependencyKeys: phase.dependencyKeys,
          reviewCheckpoint: phase.reviewCheckpoint,
        })),
      },
    );

    await owner.asUser.mutation(api.projects.create, {
      teamId,
      title: "Custom Project",
      description: "Use the team framework.",
      startDate: "2026-08-01",
      deadline: "2026-10-01",
      frameworkType: "custom",
      customFrameworkId,
      frameworkName: "Ignored client name",
      phases: [],
      members: [
        {
          profileId: owner.profileId,
          skills: [],
          availability: "",
          currentWorkload: "low",
          preferences: "",
        },
      ],
    });

    const projects = await owner.asUser.query(api.projects.listForTeam, {
      teamId,
    });
    expect(projects[0]).toMatchObject({
      frameworkType: "custom",
      frameworkName: "Studio Loop",
      phaseCount: 2,
    });
  });

  it("reuses a joining member's saved profile in the latest room project", async () => {
    const testDatabase = convexTest(schema, modules);
    const { owner, member, teamId } = await createTeamWithMember(testDatabase);
    const projectId = await owner.asUser.mutation(api.projects.create, {
      teamId,
      title: "Join Flow Project",
      description: "Members add only their own preferences.",
      startDate: "2026-08-01",
      deadline: "2026-10-01",
      frameworkType: "none",
      frameworkName: "Flexible project",
      phases: [],
      setupMode: "ai",
      members: [{
        profileId: owner.profileId,
        skills: ["Planning"],
        availability: "Weekdays",
        currentWorkload: "medium",
        preferences: "Coordination",
      }],
    });

    expect(await member.asUser.mutation(api.projects.joinLatestWithPreferences, {
      teamId,
      skills: ["Illustration"],
      availability: "Weekends",
      currentWorkload: "low",
      preferences: "Visual work",
      weeklyCapacity: 9,
    })).toBe(projectId);

    const saved = await member.asUser.query(api.tasks.getWorkspace, { projectId });
    expect(saved.members.find((projectMember) => projectMember.profileId === member.profileId)).toMatchObject({
      skills: ["Communication"],
      availability: "",
      preferences: "",
      weeklyCapacity: 8,
    });
  });
});
