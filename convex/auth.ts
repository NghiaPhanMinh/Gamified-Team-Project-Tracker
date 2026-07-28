import { query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return { subject: identity.subject, email: identity.email ?? null, name: identity.name ?? identity.email ?? "Quest member" };
  },
});
