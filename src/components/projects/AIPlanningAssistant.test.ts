import { describe, expect, it } from "vitest";

import { friendlyAiError } from "../../lib/aiErrors";
import { isRetryablePlatformAiError } from "../../lib/aiRetry";

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

describe("isRetryablePlatformAiError", () => {
  it("recognizes temporary provider failures", () => {
    expect(isRetryablePlatformAiError({ data: "Free AI providers are currently busy. Please try again later or continue with manual planning." })).toBe(true);
    expect(isRetryablePlatformAiError(new Error("[CONVEX A(ai:generateProjectPlan)] Server Error"))).toBe(true);
  });

  it("does not retry permanent setup, key, or quota failures", () => {
    expect(isRetryablePlatformAiError({ data: "AI planning is not connected on this deployment." })).toBe(false);
    expect(isRetryablePlatformAiError({ data: "The OpenRouter key was rejected." })).toBe(false);
    expect(isRetryablePlatformAiError({ data: "AI GENERATION USED." })).toBe(false);
  });
});
