import { mutation, query } from "./_generated/server";
import { requireAuthUser } from "./lib/auth";

export const getOrNull = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await requireAuthUser(ctx);

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user_id", (indexQuery) =>
        indexQuery.eq("authUserId", authUser._id),
      )
      .unique();
  },
});

export const ensureCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await requireAuthUser(ctx);
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user_id", (indexQuery) =>
        indexQuery.eq("authUserId", authUser._id),
      )
      .unique();

    const now = Date.now();
    const displayName = authUser.name?.trim();
    const email = authUser.email?.trim().toLowerCase();

    if (!displayName || !email) {
      throw new Error(
        "Google did not provide the required name and email profile fields.",
      );
    }

    if (existing !== null) {
      const nextImage = authUser.image ?? undefined;
      const needsUpdate =
        existing.displayName !== displayName ||
        existing.email !== email ||
        existing.imageUrl !== nextImage;

      if (needsUpdate) {
        await ctx.db.patch(existing._id, {
          displayName,
          email,
          imageUrl: nextImage,
          updatedAt: now,
        });
      }

      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      authUserId: authUser._id,
      displayName,
      email,
      imageUrl: authUser.image ?? undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});
