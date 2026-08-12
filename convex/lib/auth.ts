import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import type { GenericId } from "convex/values";

import type { DataModel, Doc } from "../_generated/dataModel";

type DatabaseContext =
  | GenericQueryCtx<DataModel>
  | GenericMutationCtx<DataModel>;

export async function requireAuthUser(
  ctx: DatabaseContext,
): Promise<Doc<"users">> {
  const authUserId = await getAuthUserId(ctx);

  if (authUserId === null) {
    throw new Error("Authentication required.");
  }

  const authUser = await ctx.db.get(authUserId);

  if (authUser === null) {
    throw new Error("Authenticated user record is missing.");
  }

  return authUser;
}

export async function requireUserProfile(
  ctx: DatabaseContext,
): Promise<Doc<"userProfiles">> {
  const authUser = await requireAuthUser(ctx);
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_auth_user_id", (query) =>
      query.eq("authUserId", authUser._id),
    )
    .unique();

  if (profile === null) {
    throw new Error("MayLamDi profile setup is required.");
  }

  return profile;
}

export async function requireCompleteUserProfile(
  ctx: DatabaseContext,
): Promise<Doc<"userProfiles">> {
  const profile = await requireUserProfile(ctx);

  if (
    profile.profileCompletedAt === undefined ||
    profile.weeklyCapacity === undefined ||
    (profile.skills?.length ?? 0) + (profile.softwareSkills?.length ?? 0) === 0
  ) {
    throw new Error("Complete and save your MayLamDi profile before creating or joining a project.");
  }

  return profile;
}

export async function requireTeamMember(
  ctx: DatabaseContext,
  teamId: GenericId<"teams">,
): Promise<{
  membership: Doc<"teamMembers">;
  profile: Doc<"userProfiles">;
}> {
  const profile = await requireUserProfile(ctx);
  const membership = await ctx.db
    .query("teamMembers")
    .withIndex("by_team_and_user", (query) =>
      query.eq("teamId", teamId).eq("profileId", profile._id),
    )
    .unique();

  if (membership === null) {
    throw new Error("You do not have access to this team.");
  }

  return { membership, profile };
}
