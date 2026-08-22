import { describe, expect, it } from "vitest";

import { REVIEW_WAITING_MESSAGE } from "./reviewCopy";

describe("review copy", () => {
  it("uses the agreed task-owner wording", () => {
    expect(REVIEW_WAITING_MESSAGE).toBe(
      "Wait for the task owner to complete the task before reviewing.",
    );
  });
});
