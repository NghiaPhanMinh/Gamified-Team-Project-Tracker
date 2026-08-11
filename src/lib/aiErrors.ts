import { getErrorMessage } from "./errors";

export function friendlyAiError(error: unknown) {
  const fallback = "The AI draft could not be generated. Manual planning remains available.";
  if (
    typeof error === "object"
    && error !== null
    && "data" in error
    && typeof error.data === "string"
  ) {
    return error.data;
  }
  const message = getErrorMessage(error, fallback);
  return /^\[CONVEX A\(ai:generateProjectPlan(?:WithKey)?\)\].*Server Error$/i.test(message)
    ? fallback
    : message;
}
