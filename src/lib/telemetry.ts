import { getErrorMessage } from "./errors";

export type TelemetryEventType =
  | "step_start"
  | "step_complete"
  | "step_abandon"
  | "step_error"
  | "action_click";

export type TelemetryPayload = {
  flowName: string;
  stepIndex: number;
  stepName: string;
  eventType: TelemetryEventType;
  durationSeconds?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
};

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const storageKey = "maylamdi:telemetry-session-id";
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

const stepTimers = new Map<string, number>();

function getStepKey(flowName: string, stepIndex: number): string {
  return `${flowName}_step_${stepIndex}`;
}

export function startStepTimer(flowName: string, stepIndex: number): void {
  const key = getStepKey(flowName, stepIndex);
  stepTimers.set(key, Date.now());
}

export function getStepDurationSeconds(flowName: string, stepIndex: number): number | undefined {
  const key = getStepKey(flowName, stepIndex);
  const startTime = stepTimers.get(key);

  if (!startTime) {
    return undefined;
  }

  const durationMs = Date.now() - startTime;
  return Math.round((durationMs / 1000) * 10) / 10;
}

type LogMutationFunction = (args: {
  sessionId: string;
  flowName: string;
  stepIndex: number;
  stepName: string;
  eventType: TelemetryEventType;
  durationSeconds?: number;
  errorMessage?: string;
  metadata?: string;
}) => Promise<unknown>;

export function createTelemetryTracker(logEventMutation: LogMutationFunction) {
  const sessionId = getOrCreateSessionId();

  async function dispatchEvent(payload: TelemetryPayload) {
    try {
      await logEventMutation({
        sessionId,
        flowName: payload.flowName,
        stepIndex: payload.stepIndex,
        stepName: payload.stepName,
        eventType: payload.eventType,
        durationSeconds: payload.durationSeconds,
        errorMessage: payload.errorMessage,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
      });
    } catch {
      // Ignore network telemetry failures silently
    }
  }

  return {
    sessionId,

    trackStepStart(flowName: string, stepIndex: number, stepName: string) {
      startStepTimer(flowName, stepIndex);
      void dispatchEvent({
        flowName,
        stepIndex,
        stepName,
        eventType: "step_start",
      });
    },

    trackStepComplete(
      flowName: string,
      stepIndex: number,
      stepName: string,
      metadata?: Record<string, unknown>,
    ) {
      const durationSeconds = getStepDurationSeconds(flowName, stepIndex);
      void dispatchEvent({
        flowName,
        stepIndex,
        stepName,
        eventType: "step_complete",
        durationSeconds,
        metadata,
      });
    },

    trackStepAbandon(
      flowName: string,
      stepIndex: number,
      stepName: string,
      reason?: string,
    ) {
      const durationSeconds = getStepDurationSeconds(flowName, stepIndex);
      void dispatchEvent({
        flowName,
        stepIndex,
        stepName,
        eventType: "step_abandon",
        durationSeconds,
        errorMessage: reason,
      });
    },

    trackStepError(
      flowName: string,
      stepIndex: number,
      stepName: string,
      error: unknown,
    ) {
      const durationSeconds = getStepDurationSeconds(flowName, stepIndex);
      const errorMessage = getErrorMessage(error, "An unexpected step error occurred.");
      void dispatchEvent({
        flowName,
        stepIndex,
        stepName,
        eventType: "step_error",
        durationSeconds,
        errorMessage,
      });
    },
  };
}
