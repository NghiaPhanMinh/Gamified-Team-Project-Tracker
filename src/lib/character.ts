export const CHARACTER_PALETTE = [
  { name: "Yellow", value: "#FFF73F" },
  { name: "Orange", value: "#FEAA01" },
  { name: "Pink", value: "#FF8AE7" },
  { name: "Purple", value: "#FD39E4" },
  { name: "Green", value: "#1DD851" },
  { name: "Blue", value: "#4CA0FE" },
  { name: "White", value: "#FFFDED" },
  { name: "Black", value: "#121F25" },
] as const;

export const SPELL_OPTIONS = [
  { name: "No spell", value: "none", glyph: "·" },
  { name: "Spark", value: "spark", glyph: "✦" },
  { name: "Shield", value: "shield", glyph: "◇" },
  { name: "Focus", value: "focus", glyph: "◎" },
  { name: "Bloom", value: "bloom", glyph: "✿" },
  { name: "Fire", value: "fire", glyph: "🔥" },
  { name: "Lightning", value: "lightning", glyph: "⚡" },
  { name: "Water", value: "water", glyph: "💧" },
  { name: "Nature", value: "nature", glyph: "❧" },
  { name: "Star magic", value: "star", glyph: "★" },
] as const;

export type SpellType = Exclude<
  (typeof SPELL_OPTIONS)[number]["value"],
  "none"
>;

export function getSpellGlyph(spellType?: SpellType) {
  return (
    SPELL_OPTIONS.find((option) => option.value === spellType)?.glyph ?? "·"
  );
}
