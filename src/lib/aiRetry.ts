import { getErrorMessage } from "./errors";

export const AI_RETRY_DELAYS_MS = [5_000, 15_000, 30_000] as const;

function errorText(error: unknown) {
  if (typeof error === "object" && error !== null && "data" in error && typeof error.data === "string") {
    return error.data;
  }
  return getErrorMessage(error, "");
}

export function isRetryablePlatformAiError(error: unknown) {
  const message = errorText(error).toLowerCase();
  if (!message || message.includes("generation used") || message.includes("key was rejected") || message.includes("not connected")) {
    return false;
  }
  return message.includes("free ai providers are currently busy")
    || message.includes("server error")
    || message.includes("rate limit")
    || message.includes("429")
    || message.includes("capacity")
    || message.includes("timeout")
    || message.includes("temporarily unavailable");
}
