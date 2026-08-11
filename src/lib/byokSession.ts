export type ByokSession = { apiKey: string; model: string };

let activeByokSession: ByokSession | null = null;

export function setByokSession(value: ByokSession | null) {
  activeByokSession = value
    ? { apiKey: value.apiKey.trim(), model: value.model.trim() }
    : null;
}

export function getByokSession() {
  return activeByokSession;
}

export function clearByokSession() {
  activeByokSession = null;
}
