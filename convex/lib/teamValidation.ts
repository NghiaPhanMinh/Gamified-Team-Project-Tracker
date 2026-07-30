const JOIN_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const JOIN_CODE_LENGTH = 6;

export function normalizeTeamName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");

  if (name.length < 2) {
    throw new Error("Team name must contain at least 2 characters.");
  }

  if (name.length > 60) {
    throw new Error("Team name must contain no more than 60 characters.");
  }

  return name;
}

export function normalizeJoinCode(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "");
}

export function assertValidJoinCode(value: string) {
  const code = normalizeJoinCode(value);

  if (
    code.length !== JOIN_CODE_LENGTH ||
    [...code].some((character) => !JOIN_CODE_ALPHABET.includes(character))
  ) {
    throw new Error("Enter a valid 6-character team code.");
  }

  return code;
}

export function generateJoinCode() {
  let code = "";

  for (let index = 0; index < JOIN_CODE_LENGTH; index += 1) {
    code +=
      JOIN_CODE_ALPHABET[
        Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)
      ];
  }

  return code;
}

export function normalizeSharedNote(value: string) {
  const note = value.trim().replace(/\s+/g, " ");

  if (note.length < 1) {
    throw new Error("Write a short update before sharing it.");
  }

  if (note.length > 280) {
    throw new Error("The shared update must be 280 characters or fewer.");
  }

  return note;
}
