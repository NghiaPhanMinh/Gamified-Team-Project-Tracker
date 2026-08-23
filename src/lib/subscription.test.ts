import { describe, expect, it } from "vitest";

import {
  getSubscriptionNavLabel,
  getSubscriptionPlanLabel,
  normalizeSubscriptionPlan,
} from "./subscription";

describe("subscription plan presentation", () => {
  it("uses Free when no active paid tier is returned", () => {
    expect(normalizeSubscriptionPlan(undefined)).toBe("free");
    expect(normalizeSubscriptionPlan("free")).toBe("free");
    expect(getSubscriptionPlanLabel("free")).toBe("Free");
    expect(getSubscriptionNavLabel("free")).toBe("FREE");
  });

  it("presents legacy pro access through the current MayLamDi+ model", () => {
    expect(normalizeSubscriptionPlan("plus")).toBe("plus");
    expect(normalizeSubscriptionPlan("pro")).toBe("plus");
    expect(getSubscriptionPlanLabel("plus")).toBe("MayLamDi+");
    expect(getSubscriptionNavLabel("plus")).toBe("PLUS");
  });
});
