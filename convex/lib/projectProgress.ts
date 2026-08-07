import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export function deriveProjectStatus(
  project: Doc<"projects">,
  tasks: Doc<"tasks">[],
): Doc<"projects">["status"] {
  if (project.status === "archived") return "archived";
  if (project.status === "planning" && project.launchedAt === undefined) return "planning";

  const requiredTasks = tasks.filter((task) => task.required && task.weight > 0);
  const today = new Date().toISOString().slice(0, 10);

  if (requiredTasks.length === 0) return "planning";
  if (requiredTasks.every((task) => task.status === "completed" || task.status === "verified")) {
    return "completed";
  }
  if (project.deadline < today) return "overdue";
  if (
    requiredTasks.some(
      (task) =>
        task.status === "blocked" ||
        (task.status !== "completed" && task.status !== "verified" && task.dueDate < today),
    )
  ) {
    return "at_risk";
  }

  return "active";
}

export async function refreshProjectProgress(
  ctx: MutationCtx,
  project: Doc<"projects">,
  actorProfileId: Id<"userProfiles">,
) {
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_project", (indexQuery) =>
      indexQuery.eq("projectId", project._id),
    )
    .collect();
  const status = deriveProjectStatus(project, tasks);
  const now = Date.now();

  await ctx.db.patch(project._id, {
    status,
    updatedAt: now,
    completedAt: status === "completed" ? now : undefined,
  });

  if (status !== project.status) {
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId,
      action: "project_status_changed",
      metadata: {
        projectId: project._id,
        projectTitle: project.title,
        previousProjectStatus: project.status,
        projectStatus: status,
      },
      createdAt: now,
    });
  }

  const milestones = await ctx.db
    .query("milestones")
    .withIndex("by_project", (indexQuery) =>
      indexQuery.eq("projectId", project._id),
    )
    .collect();
  const tasksById = new Map(tasks.map((task) => [task._id, task]));

  for (const milestone of milestones) {
    const isCompleted =
      milestone.requiredTaskIds.length > 0 &&
      milestone.requiredTaskIds.every(
        (taskId) => {
          const status = tasksById.get(taskId)?.status;
          return status === "completed" || status === "verified";
        },
      );

    await ctx.db.patch(milestone._id, {
      status: isCompleted ? "completed" : "planned",
      updatedAt: now,
      completedAt: isCompleted ? now : undefined,
    });
  }
}
