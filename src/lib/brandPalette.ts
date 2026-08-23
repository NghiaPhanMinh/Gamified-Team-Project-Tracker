export const MAYLAMDI_SKILL_COLORS = [
  "#FFF73F",
  "#FEAA01",
  "#FF8AE7",
  "#FD39E4",
  "#1DD851",
  "#17A738",
  "#4CA0FE",
] as const;

export const MAYLAMDI_PHASE_COLORS = [
  "#FFF73F",
  "#FEAA01",
  "#FF8AE7",
  "#4CA0FE",
  "#1DD851",
  "#FD39E4",
  "#17A738",
] as const;

export const MAYLAMDI_FRAMEWORK_COLORS = [
  "#FF8AE7",
  "#FFF73F",
  "#FEAA01",
  "#1DD851",
  "#FD39E4",
  "#4CA0FE",
  "#17A738",
] as const;

export function paletteColorAt(
  palette: readonly string[],
  index: number,
) {
  return palette[index % palette.length];
}
