import type { Doc } from "../_generated/dataModel";

type Activity = Doc<"activityLogs">;

function readableStatus(status: string | undefined) {
  return status?.replaceAll("_", " ") ?? "updated";
}

export function describeActivity(activity: Activity, actorName: string) {
  const subject = activity.metadata.taskTitle ?? activity.metadata.projectTitle;

  switch (activity.action) {
    case "team_created":
      return {
        title: `${actorName} created the team`,
        detail: activity.metadata.teamName ?? "The team room is ready.",
      };
    case "member_joined":
      return {
        title: `${actorName} joined the team`,
        detail: "A new teammate can now collaborate in this room.",
      };
    case "shared_note_updated":
      return {
        title: `${actorName} updated the team pulse`,
        detail: "The shared team note changed.",
      };
    case "character_changed":
      return {
        title: `${actorName} changed their character`,
        detail: "Their live team character appearance was updated.",
      };
    case "framework_created":
      return {
        title: `${actorName} created a framework`,
        detail: activity.metadata.frameworkName ?? "A custom framework was added.",
      };
    case "framework_updated":
      return {
        title: `${actorName} updated a framework`,
        detail: activity.metadata.frameworkName ?? "A custom framework changed.",
      };
    case "project_created":
      return {
        title: `${actorName} created a project`,
        detail: activity.metadata.projectTitle ?? "A new project is ready.",
      };
    case "project_status_changed":
      return {
        title: `${actorName} changed project progress`,
        detail: `${activity.metadata.projectTitle ?? "Project"}: ${readableStatus(activity.metadata.previousProjectStatus)} → ${readableStatus(activity.metadata.projectStatus)}.`,
      };
    case "project_archived":
      return {
        title: `${actorName} archived a project`,
        detail: `${activity.metadata.projectTitle ?? "Project"} is read-only until restored.`,
      };
    case "project_restored":
      return {
        title: `${actorName} restored a project`,
        detail: `${activity.metadata.projectTitle ?? "Project"} can be edited again.`,
      };
    case "phase_status_changed":
      return {
        title: `${actorName} changed a phase status`,
        detail: `${activity.metadata.phaseTitle ?? "Phase"}: ${readableStatus(activity.metadata.previousPhaseStatus)} → ${readableStatus(activity.metadata.phaseStatus)}.`,
      };
    case "milestone_created":
      return {
        title: `${actorName} created a milestone`,
        detail: activity.metadata.milestoneTitle ?? "A project checkpoint was added.",
      };
    case "task_created":
      return {
        title: `${actorName} created a task`,
        detail: activity.metadata.taskTitle ?? "A task was added to the plan.",
      };
    case "task_updated":
      return {
        title: `${actorName} updated a task`,
        detail: activity.metadata.taskTitle ?? "Task details changed.",
      };
    case "task_reassigned":
      return {
        title: `${actorName} reassigned a task`,
        detail: activity.metadata.taskTitle ?? "The primary owner changed.",
      };
    case "task_deleted":
      return {
        title: `${actorName} deleted a task`,
        detail: activity.metadata.taskTitle ?? "A task was removed from the plan.",
      };
    case "task_status_changed":
      return {
        title: `${actorName} changed a task status`,
        detail: `${subject ?? "Task"}: ${readableStatus(activity.metadata.previousTaskStatus)} → ${readableStatus(activity.metadata.taskStatus)}.`,
      };
    case "evidence_submitted":
      return {
        title: `${actorName} submitted evidence`,
        detail: `${activity.metadata.taskTitle ?? "Task"}: ${activity.metadata.evidenceType ?? "evidence"}.`,
      };
    case "review_requested":
      return {
        title: `${actorName} requested a review`,
        detail: activity.metadata.taskTitle ?? "A task is ready for review.",
      };
    case "review_approved":
      return {
        title: `${actorName} approved a task`,
        detail: activity.metadata.taskTitle ?? "The review was approved.",
      };
    case "review_changes_requested":
      return {
        title: `${actorName} requested changes`,
        detail: activity.metadata.taskTitle ?? "The task returned for changes.",
      };
    case "task_claimed":
      return { title: `${actorName} claimed a task`, detail: activity.metadata.taskTitle ?? "An open task now has an owner." };
    case "task_declined":
      return { title: `${actorName} declined an assignment`, detail: `${activity.metadata.taskTitle ?? "Task"} is now open for a teammate to claim.` };
    case "task_trade_requested":
      return { title: `${actorName} requested a task trade`, detail: activity.metadata.taskTitle ?? "A teammate has a new trade request." };
    case "task_trade_resolved":
      return { title: `${actorName} resolved a task trade`, detail: activity.metadata.taskTitle ?? "A trade request was updated." };
    case "availability_updated":
      return { title: `${actorName} updated availability`, detail: "The project meeting overlap has been recalculated." };
    case "meeting_plan_saved":
      return { title: `${actorName} saved a meeting plan`, detail: "A shared meeting slot was added to the project." };
    case "task_damage_changed":
      return { title: `${actorName} changed task damage`, detail: `${activity.metadata.taskTitle ?? "Task"}: ${activity.metadata.previousDamage ?? "?"} → ${activity.metadata.damage ?? "?"} damage.` };
    case "project_launched":
      return { title: `${actorName} launched the project`, detail: `${activity.metadata.projectTitle ?? "Project"} entered battle mode.` };
    case "combat_event_created":
      return { title: `${actorName} verified an attack`, detail: `${activity.metadata.taskTitle ?? "Task"} dealt ${activity.metadata.damage ?? 0} boss damage.` };
  }
}
