export function getErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message
    .replace(/^.*?Uncaught Error:\s*/s, "")
    .split("\n")[0]
    .trim();

  return message || fallback;
}
