import { describe, expect, it } from "vitest";

import { MAIN_NAV_ITEMS } from "./navigation";

describe("simplified navigation", () => {
  it("exposes top-level navigation destinations", () => {
    expect(MAIN_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Home",
      "Profile",
      "Projects",
      "Analytics",
    ]);
  });

  it("keeps the signed-in dashboard separate from the public landing page", () => {
    expect(MAIN_NAV_ITEMS.find((item) => item.id === "home")?.path).toBe("/home");
  });
});
