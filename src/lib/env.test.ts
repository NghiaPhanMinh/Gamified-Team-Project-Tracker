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

  it("rejects non-Convex and non-HTTPS URLs", () => {
    expect(() => requireConvexUrl("http://localhost:3000")).toThrow(
      /invalid VITE_CONVEX_URL/,
    );
  });
});
