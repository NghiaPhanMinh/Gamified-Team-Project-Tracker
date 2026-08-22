import { describe, expect, it } from "vitest";

import { GROUP_COLORS, getGroupColor } from "./groupColors";

describe("project group colours", () => {
  it("uses the approved palette in order", () => {
    expect(GROUP_COLORS).toEqual([
      "#FFF73F",
      "#FEAA01",
      "#FF8AE7",
      "#FD39E4",
      "#1DD851",
      "#17A738",
      "#4CA0FE",
    ]);
  });

  it("cycles deterministically without equal adjacent colours", () => {
    const sequence = Array.from({ length: 16 }, (_, index) => getGroupColor(index));

    expect(sequence[7]).toBe(GROUP_COLORS[0]);
    expect(sequence.every((color, index) => index === 0 || color !== sequence[index - 1])).toBe(true);
  });
});
