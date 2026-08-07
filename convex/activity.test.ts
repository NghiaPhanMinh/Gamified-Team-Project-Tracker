/// <reference types="vite/client" />

import { convexTest, type TestConvex } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
type ActivityTestDatabase = TestConvex<typeof schema>;

async function addProfile(
  testDatabase: ActivityTestDatabase,
  displayName: string,
  email: string,
) {
  const saved = await testDatabase.run(async (ctx) => {
    const authUserId = await ctx.db.insert("users", { name: displayName, email });
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
    ...saved,
    asUser: testDatabase.withIdentity({
      subject: `${saved.authUserId}|test-session`,
      name: displayName,
      email,
    }),
  };
}

describe("activity history and notification state", () => {
  it("returns a paginated live feed and persists mark-all-read", async () => {
    const testDatabase = convexTest(schema, modules);
    const owner = await addProfile(testDatabase, "Owner", "owner@example.com");
    const member = await addProfile(testDatabase, "Member", "member@example.com");
    const teamId = await owner.asUser.mutation(api.teams.create, {
      name: "Studio Team",
    });
    const workspace = await owner.asUser.query(api.teams.getWorkspace, { teamId });
    await member.asUser.mutation(api.teams.joinByCode, {
      code: workspace.team.joinCode,
    });

    const before = await owner.asUser.query(api.activity.getUnreadSummary, {
      teamId,
    });
    const feed = await owner.asUser.query(api.activity.list, {
      teamId,
      paginationOpts: { numItems: 10, cursor: null },
    });

    expect(before.count).toBe(1);
    expect(feed.page).toHaveLength(2);
    expect(feed.page[0]).toMatchObject({
      action: "member_joined",
      actorName: "Member",
      isUnread: true,
    });

    await owner.asUser.mutation(api.activity.markAllRead, { teamId });
    const after = await owner.asUser.query(api.activity.getUnreadSummary, {
      teamId,
    });

    expect(after.count).toBe(0);
    expect(after.lastReadAt).toBeTypeOf("number");
  });

  it("blocks people outside the team from reading notifications", async () => {
    const testDatabase = convexTest(schema, modules);
    const owner = await addProfile(testDatabase, "Owner", "owner@example.com");
    const outsider = await addProfile(testDatabase, "Outsider", "outsider@example.com");
    const teamId = await owner.asUser.mutation(api.teams.create, {
      name: "Private Team",
    });

    await expect(
      outsider.asUser.query(api.activity.getUnreadSummary, { teamId }),
    ).rejects.toThrow(/do not have access/i);
    await expect(
      outsider.asUser.mutation(api.activity.markAllRead, { teamId }),
    ).rejects.toThrow(/do not have access/i);
  });
});
