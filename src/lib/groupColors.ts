export const GROUP_COLORS = [
  "#FFF73F",
  "#FEAA01",
  "#FF8AE7",
  "#FD39E4",
  "#1DD851",
  "#17A738",
  "#4CA0FE",
] as const;

export function getGroupColor(index: number) {
  const safeIndex = Math.max(0, Math.trunc(index));
  return GROUP_COLORS[safeIndex % GROUP_COLORS.length];
}
