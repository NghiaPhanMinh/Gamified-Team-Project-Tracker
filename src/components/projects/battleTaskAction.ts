export type BattleTaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "review"
  | "completed"
  | "submitted"
  | "changes_requested"
  | "verified"
  | "awaiting_creator";

export type BattleTaskSummary = {
  id: string;
  title: string;
  phase: string;
  owner: string;
  reviewer: string;
  dueDate: string;
  status: BattleTaskStatus;
  weight: number;
  damage: number;
  isMine: boolean;
  isReviewer: boolean;
  isOpenForClaiming: boolean;
  acceptanceStatus?: "pending" | "accepted" | "declined";
};

export type BattleTaskAction =
  | "claim"
  | "accept_or_decline"
  | "submit"
  | "review"
  | "approve"
  | "waiting_review"
  | "waiting_approval"
  | "complete"
  | "details";

export function getBattleTaskAction(
  task: BattleTaskSummary,
  canManageProject: boolean,
): BattleTaskAction {
  if (task.status === "completed" || task.status === "verified") return "complete";
  if (task.isOpenForClaiming && task.status === "todo") return "claim";
  if (task.isMine && task.acceptanceStatus === "pending") return "accept_or_decline";
  if (task.status === "submitted" || task.status === "review") {
    return task.isReviewer ? "review" : "waiting_review";
  }
  if (task.status === "awaiting_creator") {
    return canManageProject ? "approve" : "waiting_approval";
  }
  if (
    task.isMine &&
    task.acceptanceStatus !== "pending" &&
    ["todo", "in_progress", "changes_requested"].includes(task.status)
  ) {
    return "submit";
  }
  return "details";
}
