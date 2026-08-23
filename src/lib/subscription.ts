export type SubscriptionPlan = "free" | "plus";

export function normalizeSubscriptionPlan(
  tier: "free" | "plus" | "pro" | undefined,
): SubscriptionPlan {
  return tier === "plus" || tier === "pro" ? "plus" : "free";
}

export function getSubscriptionPlanLabel(plan: SubscriptionPlan) {
  return plan === "plus" ? "MayLamDi+" : "Free";
}

export function getSubscriptionNavLabel(plan: SubscriptionPlan) {
  return plan === "plus" ? "PLUS" : "FREE";
}
