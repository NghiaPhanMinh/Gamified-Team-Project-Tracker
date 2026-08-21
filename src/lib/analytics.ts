declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type EventName =
  | "project_created"
  | "brief_submitted"
  | "ai_plan_generated"
  | "plan_confirmed"
  | "project_launched"
  | "ai_assistant_opened"
  | "ai_prompt_submitted"
  | "ai_recommendation_accepted"
  | "task_completed"
  | "evidence_submitted"
  | "review_completed";

export type EventParameters = Record<string, string | number | boolean>;

/**
 * Utility to track product analytics events via Google Analytics 4 (gtag.js).
 * Only non-sensitive numeric counts, statuses, or categories should be passed in parameters.
 */
export function trackEvent(eventName: EventName, parameters?: EventParameters): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
}
