export type SubscriptionPlan = "free" | "plus";

export const FREE_SUBSCRIPTION_FEATURES = [
  "2 active projects",
  "Core teamwork tools",
  "1 AI Project Plan generation per project",
  "1 AI Task Allocation per project",
  "1 AI workload suggestion per project",
  "Manual plan and task editing",
  "Framework library",
  "1 custom framework",
  "Progress and evidence tracking",
  "Basic contribution insights",
  "Basic gamification",
] as const;

export const PLUS_SUBSCRIPTION_FEATURES = [
  "Unlimited active projects",
  "30 AI Actions per month",
  "Regenerate project plans and task allocations",
  "AI workload balancing",
  "AI task reassignment suggestions",
  "AI task breakdown",
  "AI deadline adjustment suggestions",
  "Unlimited custom frameworks",
  "Detailed contribution insights",
  "Full gamification",
  "Contribution report export",
  "Full project history",
] as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    heading: "Get the team moving.",
    price: "0₫",
    cadence: "",
    description: "For teams getting started with shared project work.",
    features: FREE_SUBSCRIPTION_FEATURES,
  },
  plus: {
    name: "MayLamDi+",
    heading: "More AI when plans change.",
    price: "39K₫",
    cadence: "/ month",
    semesterPrice: "or 99K₫ / semester",
    description: "For group projects that need more room to adapt.",
    features: PLUS_SUBSCRIPTION_FEATURES,
  },
} as const;

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
