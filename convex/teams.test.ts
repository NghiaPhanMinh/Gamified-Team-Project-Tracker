/// <reference types="vite/client" />

import { convexTest, type TestConvex } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
type TeamTestDatabase = TestConvex<typeof schema>;

async function addProfile(
  testDatabase: TeamTestDatabase,
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

describe("team backend gate", () => {
  it("creates unique join codes and makes the creator an owner", async () => {
    const testDatabase = convexTest(schema, modules);
    const owner = await addProfile(
      testDatabase,
      "Owner One",
      "owner@example.com",
    );

    const firstTeamId = await owner.asUser.mutation(api.teams.create, {
      name: "First Team",
    });
    const secondTeamId = await owner.asUser.mutation(api.teams.create, {
      name: "Second Team",
    });
    const firstWorkspace = await owner.asUser.query(api.teams.getWorkspace, {
      teamId: firstTeamId,
    });
    const secondWorkspace = await owner.asUser.query(api.teams.getWorkspace, {
      teamId: secondTeamId,
    });

    expect(firstWorkspace.currentRole).toBe("owner");
    expect(firstWorkspace.members).toHaveLength(1);
    expect(firstWorkspace.members[0].profileId).toBe(owner.profileId);
    expect(firstWorkspace.team.joinCode).toHaveLength(6);
    expect(secondWorkspace.team.joinCode).not.toBe(
      firstWorkspace.team.joinCode,
    );
  });

  it("normalises codes, joins once, and blocks duplicate membership", async () => {
    const testDatabase = convexTest(schema, modules);
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
      name: "Shared Team",
    });
    const ownerWorkspace = await owner.asUser.query(api.teams.getWorkspace, {
      teamId,
    });
    const joinCode = ownerWorkspace.team.joinCode;
    const formattedCode = `${joinCode.slice(0, 3)}-${joinCode.slice(3)}`;

    await member.asUser.mutation(api.teams.joinByCode, {
      code: formattedCode.toLowerCase(),
    });

    await expect(
      member.asUser.mutation(api.teams.joinByCode, { code: joinCode }),
    ).rejects.toThrow(/already a member/i);

    const sharedWorkspace = await member.asUser.query(api.teams.getWorkspace, {
      teamId,
    });
    expect(sharedWorkspace.currentRole).toBe("member");
    expect(sharedWorkspace.members).toHaveLength(2);
  });

  it("rejects non-members from team reads and writes", async () => {
    const testDatabase = convexTest(schema, modules);
    const owner = await addProfile(
      testDatabase,
      "Owner One",
      "owner@example.com",
    );
    const outsider = await addProfile(
      testDatabase,
      "Outsider",
      "outsider@example.com",
    );
    const teamId = await owner.asUser.mutation(api.teams.create, {
      name: "Private Team",
    });

    await expect(
      outsider.asUser.query(api.teams.getWorkspace, { teamId }),
    ).rejects.toThrow(/do not have access/i);
    await expect(
      outsider.asUser.mutation(api.teams.updateSharedNote, {
        teamId,
        note: "I should not be able to write this.",
      }),
    ).rejects.toThrow(/do not have access/i);
  });

  it("shares one team note and records team activity", async () => {
    const testDatabase = convexTest(schema, modules);
    const owner = await addProfile(
      testDatabase,
      "Owner One",
      "owner@example.com",
    );
    const teamId = await owner.asUser.mutation(api.teams.create, {
      name: "Realtime Team",
    });

    await owner.asUser.mutation(api.teams.updateSharedNote, {
      teamId,
      note: "  Ready   for the realtime gate.  ",
    });

    const workspace = await owner.asUser.query(api.teams.getWorkspace, {
      teamId,
    });
    const activity = await testDatabase.run(async (ctx) =>
      ctx.db
        .query("activityLogs")
        .withIndex("by_team_and_time", (query) => query.eq("teamId", teamId))
        .collect(),
    );

    expect(workspace.sharedRecord?.note).toBe(
      "Ready for the realtime gate.",
    );
    expect(activity.map((event) => event.action)).toEqual([
      "team_created",
      "shared_note_updated",
    ]);
  });
});
