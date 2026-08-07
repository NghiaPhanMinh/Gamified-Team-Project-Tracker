export const CHARACTER_PALETTE = [
  { name: "Sunbeam", value: "#FFF73F" },
  { name: "Tangerine", value: "#FEAA01" },
  { name: "Bubblegum", value: "#FF8AE7" },
  { name: "Magenta", value: "#FD39E4" },
  { name: "Sprout", value: "#1DD851" },
  { name: "Sky", value: "#4CA0FE" },
  { name: "Cream", value: "#FFFDED" },
  { name: "Navy", value: "#121F25" },
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
