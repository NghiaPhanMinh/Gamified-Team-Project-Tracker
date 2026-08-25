export function getErrorMessage(error: unknown, fallback: string) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "object" && error !== null) {
    if ("data" in error && typeof (error as any).data === "string" && (error as any).data.trim()) {
      return (error as any).data.trim();
    }
  }

  if (error instanceof Error) {
    const message = error.message
      .replace(/^.*?Uncaught Error:\s*/s, "")
      .replace(/^\[CONVEX M\([^)]+\)\]\s*\[Request ID:[^\]]+\]\s*/i, "")
      .replace(/^Server Error:\s*/i, "")
      .split("\n")[0]
      .trim();

    if (message && !message.startsWith("Server Error")) {
      return message;
    }
  }

  return fallback;
}
