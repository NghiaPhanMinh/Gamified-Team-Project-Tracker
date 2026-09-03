export type PendingProjectTask = {
  id: string;
  title: string;
  description: string;
  phaseKey: string;
  ownerMode: "creator" | "open" | "unassigned";
  weight: number;
  dueDate: string;
  skills: string;
};

export type PendingProjectDraft = {
  version: 1;
  frameworkChoice: string;
  customFrameworkName: string;
  customPhaseNames: string;
  title: string;
  brief: string;
  deadline: string;
  targetMemberCount: string;
  taskCreationMode: "ai" | "manual";
  allocationMode: "ai" | "manual" | "self_selection";
  draftTasks: PendingProjectTask[];
};

export const PENDING_PROJECT_DRAFT_KEY = "maylamdi:pending-project-draft";

export function savePendingProjectDraft(draft: PendingProjectDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_PROJECT_DRAFT_KEY, JSON.stringify(draft));
}

export function loadPendingProjectDraft(): PendingProjectDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(PENDING_PROJECT_DRAFT_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<PendingProjectDraft>;
    if (
      parsed.version !== 1
      || typeof parsed.title !== "string"
      || typeof parsed.brief !== "string"
      || typeof parsed.deadline !== "string"
      || typeof parsed.frameworkChoice !== "string"
      || !Array.isArray(parsed.draftTasks)
    ) {
      return null;
    }
    return parsed as PendingProjectDraft;
  } catch {
    return null;
  }
}

export function clearPendingProjectDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_PROJECT_DRAFT_KEY);
}
