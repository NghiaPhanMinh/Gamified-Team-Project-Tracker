/// <reference types="vite/client" />

import { convexTest, type TestConvex } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
type FrameworkTestDatabase = TestConvex<typeof schema>;

async function addProfile(
  testDatabase: FrameworkTestDatabase,
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
      description: "Understand the people and context.",
      isOptional: false,
      suggestedDeliverables: ["Research summary"],
      suggestedSkills: ["Interviewing"],
      canOverlap: true,
      defaultDependencyKeys: [],
      reviewCheckpoint: false,
    },
    {
      key: "make",
      name: "Make",
      description: "Turn the strongest idea into a testable response.",
      isOptional: false,
      suggestedDeliverables: ["Prototype"],
      suggestedSkills: ["Prototyping"],
      canOverlap: false,
      defaultDependencyKeys: ["discover"],
      reviewCheckpoint: true,
    },
  ];
}

async function createTeamWithMember(testDatabase: FrameworkTestDatabase) {
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
  const teamId = await owner.asUser.mutation(api.teams.create, {
    name: "Framework Team",
  });
  const workspace = await owner.asUser.query(api.teams.getWorkspace, {
    teamId,
  });
  await member.asUser.mutation(api.teams.joinByCode, {
    code: workspace.team.joinCode,
  });

  return { owner, member, teamId };
}

describe("custom framework backend", () => {
  it("creates, lists, and versions a team-owned framework", async () => {
    const testDatabase = convexTest(schema, modules);
    const { owner, member, teamId } =
      await createTeamWithMember(testDatabase);
    const customFrameworkId = await member.asUser.mutation(
      api.customFrameworks.create,
      {
        teamId,
        name: "Our Studio Loop",
        description: "A reusable two-phase studio process.",
        phases: samplePhases(),
        sourceBuiltInId: "design-nonlinear",
      },
    );

    const ownerList = await owner.asUser.query(
      api.customFrameworks.listForTeam,
      { teamId },
    );
    expect(ownerList).toHaveLength(1);
    expect(ownerList[0]).toMatchObject({
      _id: customFrameworkId,
      creatorProfileId: member.profileId,
      version: 1,
      sourceBuiltInId: "design-nonlinear",
    });

    await owner.asUser.mutation(api.customFrameworks.update, {
      customFrameworkId,
      name: "Our Updated Studio Loop",
      description: "The team-owner revision.",
      phases: samplePhases(),
      sourceBuiltInId: "design-nonlinear",
    });

    const updated = await member.asUser.query(
      api.customFrameworks.listForTeam,
      { teamId },
    );
    expect(updated[0]).toMatchObject({
      name: "Our Updated Studio Loop",
      version: 2,
    });
  });

  it("rejects non-members and non-owner editors", async () => {
    const testDatabase = convexTest(schema, modules);
    const { member, teamId } = await createTeamWithMember(testDatabase);
    const otherMember = await addProfile(
      testDatabase,
      "Member Three",
      "member-three@example.com",
    );
    const outsider = await addProfile(
      testDatabase,
      "Outsider",
      "outsider@example.com",
    );
    const ownerWorkspace = await member.asUser.query(api.teams.getWorkspace, {
      teamId,
    });
    await otherMember.asUser.mutation(api.teams.joinByCode, {
      code: ownerWorkspace.team.joinCode,
    });
    const customFrameworkId = await member.asUser.mutation(
      api.customFrameworks.create,
      {
        teamId,
        name: "Member Framework",
        description: "",
        phases: samplePhases(),
      },
    );

    await expect(
      outsider.asUser.query(api.customFrameworks.listForTeam, { teamId }),
    ).rejects.toThrow(/do not have access/i);
    await expect(
      otherMember.asUser.mutation(api.customFrameworks.update, {
        customFrameworkId,
        name: "Unauthorised edit",
        description: "",
        phases: samplePhases(),
      }),
    ).rejects.toThrow(/creator or team owner/i);
  });

  it("rejects cyclic dependencies and unknown preset sources", async () => {
    const testDatabase = convexTest(schema, modules);
    const { member, teamId } = await createTeamWithMember(testDatabase);
    const cyclicPhases = samplePhases();
    cyclicPhases[0].defaultDependencyKeys = ["make"];

    await expect(
      member.asUser.mutation(api.customFrameworks.create, {
        teamId,
        name: "Cyclic Framework",
        description: "",
        phases: cyclicPhases,
      }),
    ).rejects.toThrow(/cannot contain a cycle/i);
    await expect(
      member.asUser.mutation(api.customFrameworks.create, {
        teamId,
        name: "Unknown Source",
        description: "",
        phases: samplePhases(),
        sourceBuiltInId: "not-a-real-preset",
      }),
    ).rejects.toThrow(/not recognised/i);
  });
});
