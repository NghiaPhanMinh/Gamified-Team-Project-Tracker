export const CHARACTER_PALETTE = [
  "#FFF73F",
  "#FEAA01",
  "#FF8AE7",
  "#FD39E4",
  "#1DD851",
  "#4CA0FE",
  "#FFFDED",
  "#121F25",
] as const;

export const SPELL_TYPES = ["spark", "shield", "focus", "bloom", "fire", "lightning", "water", "nature", "star"] as const;

export function validateCharacterColours(fill: string, outline: string) {
  const normalizedFill = fill.toUpperCase();
  const normalizedOutline = outline.toUpperCase();

  if (
    !CHARACTER_PALETTE.includes(
      normalizedFill as (typeof CHARACTER_PALETTE)[number],
    ) ||
    !CHARACTER_PALETTE.includes(
      normalizedOutline as (typeof CHARACTER_PALETTE)[number],
    )
  ) {
    throw new Error("Choose character colours from the MayLamDi palette.");
  }

  if (normalizedFill === normalizedOutline) {
    throw new Error("Fill and outline colours must be different.");
  }

  return {
    fill: normalizedFill,
    outline: normalizedOutline,
  };
}
