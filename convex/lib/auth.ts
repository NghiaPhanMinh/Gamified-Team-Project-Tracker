import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";

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
