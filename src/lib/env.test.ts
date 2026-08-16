import { describe, expect, it } from "vitest";

import { requireConvexUrl } from "./env";

describe("Convex environment validation", () => {
  it("accepts the existing development deployment URL", () => {
    expect(
      requireConvexUrl("https://resilient-mastiff-759.convex.cloud"),
    ).toBe("https://resilient-mastiff-759.convex.cloud");
  });

  it("explains how to fix a missing URL", () => {
    expect(() => requireConvexUrl(undefined)).toThrow(/VITE_CONVEX_URL/);
  });

  it("accepts local development deployment URLs", () => {
    expect(requireConvexUrl("http://127.0.0.1:3210")).toBe(
      "http://127.0.0.1:3210",
    );
  });

  it("rejects non-Convex URLs", () => {
    expect(() => requireConvexUrl("https://example.com")).toThrow(
      /invalid VITE_CONVEX_URL/,
    );
  });
});
