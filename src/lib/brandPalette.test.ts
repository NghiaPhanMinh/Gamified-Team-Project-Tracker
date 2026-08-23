import { describe, expect, it } from "vitest";

import {
  MAYLAMDI_FRAMEWORK_COLORS,
  MAYLAMDI_PHASE_COLORS,
  MAYLAMDI_SKILL_COLORS,
  paletteColorAt,
} from "./brandPalette";

describe("MayLamDi reusable brand palettes", () => {
  it("keeps skill colours deterministic and adjacent entries distinct", () => {
    expect(MAYLAMDI_SKILL_COLORS).toEqual([
      "#FFF73F",
      "#FEAA01",
      "#FF8AE7",
      "#FD39E4",
      "#1DD851",
      "#17A738",
      "#4CA0FE",
    ]);
    expect(paletteColorAt(MAYLAMDI_SKILL_COLORS, 8)).toBe("#FEAA01");
    MAYLAMDI_SKILL_COLORS.forEach((color, index) => {
      expect(color).not.toBe(MAYLAMDI_SKILL_COLORS[(index + 1) % MAYLAMDI_SKILL_COLORS.length]);
    });
  });

  it("gives project phases a deterministic colour identity", () => {
    expect(MAYLAMDI_PHASE_COLORS).toHaveLength(7);
    expect(paletteColorAt(MAYLAMDI_PHASE_COLORS, 0)).toBe("#FFF73F");
    expect(paletteColorAt(MAYLAMDI_PHASE_COLORS, 7)).toBe("#FFF73F");
  });

  it("gives framework choices the approved persistent palette", () => {
    expect(MAYLAMDI_FRAMEWORK_COLORS).toEqual([
      "#FF8AE7",
      "#FFF73F",
      "#FEAA01",
      "#1DD851",
      "#FD39E4",
      "#4CA0FE",
      "#17A738",
    ]);
  });
});
