import { QueryCtx, MutationCtx } from "./_generated/server";

export async function currentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
    .unique();
}

export async function addActivity(
  ctx: MutationCtx,
  projectId: any,
  actorId: any,
  action: string,
  detail?: string,
) {
  await ctx.db.insert("activityLog", {
    projectId,
    actorId,
    action,
    detail,
    timestamp: Date.now(),
  });
}
