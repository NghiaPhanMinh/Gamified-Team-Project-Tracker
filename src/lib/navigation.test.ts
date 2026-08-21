import { describe, expect, it } from "vitest";

import { MAIN_NAV_ITEMS } from "./navigation";

describe("simplified navigation", () => {
  it("exposes only the three top-level destinations", () => {
    expect(MAIN_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Home",
      "Profile",
      "Projects",
    ]);
  });
});
