import { query } from "./_generated/server";

export const check = query({
  args: {},
  handler: async () => {
    return {
      service: "MayLamDi",
      status: "ok" as const,
      checkedAt: Date.now(),
    };
  },
});
