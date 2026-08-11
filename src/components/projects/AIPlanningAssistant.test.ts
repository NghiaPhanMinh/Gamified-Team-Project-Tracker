import { describe, expect, it } from "vitest";

import { friendlyAiError } from "../../lib/aiErrors";

describe("friendlyAiError", () => {
  it("shows the safe server message carried by a Convex error", () => {
    expect(friendlyAiError({
      data: "Free AI providers are currently busy. Please try again later or continue with manual planning.",
    })).toBe(
      "Free AI providers are currently busy. Please try again later or continue with manual planning.",
    );
  });

  it("does not show a raw production server wrapper when no safe message is available", () => {
    expect(friendlyAiError(
      new Error("[CONVEX A(ai:generateProjectPlan)] [Request ID: example] Server Error"),
    )).toBe("The AI draft could not be generated. Manual planning remains available.");
  });
});
