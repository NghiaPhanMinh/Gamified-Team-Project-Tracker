import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";
import { TaskEvidencePanel } from "./TaskEvidencePanel";
import { TaskTradePanel } from "./TaskTradePanel";

export function PersonalTasks({
  onOpenRoom,
}: {
  onOpenRoom: (roomId: Id<"teams">) => void;
}) {
  const groups = useQuery(api.tasks.listMineAcrossRooms);
  const claimTask = useMutation(api.tasks.claimTask);
  const acceptTask = useMutation(api.tasks.acceptTask);
  const declineTask = useMutation(api.tasks.declineTask);
  const updateStatus = useMutation(api.tasks.updateTaskStatus);
  const [openTaskId, setOpenTaskId] = useState<Id<"tasks"> | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<Id<"tasks"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(taskId: Id<"tasks">, action: () => Promise<unknown>) {
    setPendingTaskId(taskId);
    setError(null);
    try {
      await action();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The task could not be updated."));
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <section className="personal-tasks-page" aria-labelledby="personal-tasks-title">
      <header className="focused-page-heading">
        <div>
          <p className="kicker">Across every room</p>
          <h1 className="display-heading" id="personal-tasks-title">My tasks</h1>
          <p>Only work assigned to you and tasks that are open to claim.</p>
        </div>
      </header>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {groups === undefined ? <p aria-busy="true">Loading your tasks…</p> : null}
      {groups?.length === 0 ? (
        <div className="project-empty">
          <strong>You are all clear.</strong>
          <p>Assigned work will appear here as soon as a project plan is confirmed.</p>
        </div>
      ) : null}
      <div className="personal-task-groups">
        {groups?.map((group) => (
          <section key={group.projectId} className="personal-task-group">
            <header>
              <div><small>{group.roomName}</small><h2>{group.projectTitle}</h2></div>
              <button className="quiet-button" type="button" onClick={() => onOpenRoom(group.roomId)}>Open room</button>
            </header>
            <TaskTradePanel projectId={group.projectId} />
            <div className="personal-task-list">
              {group.tasks.map((task) => (
                <article key={task._id} className={`personal-task-card task-${task.status}`}>
                  <div>
                    <span className="project-status">{task.status.replaceAll("_", " ")}</span>
                    <small>{task.phaseName} · due {task.dueDate}</small>
                  </div>
                  <h3>{task.title}</h3>
                  <p>{task.description || "No task description."}</p>
                  <dl>
                    <div><dt>Difficulty</dt><dd>{task.difficulty}/5</dd></div>
                    <div><dt>Damage</dt><dd>{task.damage ?? 20} HP</dd></div>
                  </dl>
                  <div className="personal-task-actions">
                    {task.isMine && task.acceptanceStatus === "pending" ? (
                      <>
                        <button className="primary-button" type="button" disabled={pendingTaskId === task._id} onClick={() => void run(task._id, () => acceptTask({ taskId: task._id }))}>Accept task</button>
                        <button className="quiet-button" type="button" disabled={pendingTaskId === task._id} onClick={() => void run(task._id, () => declineTask({ taskId: task._id }))}>Decline</button>
                      </>
                    ) : null}
                    {task.isOpenForClaiming ? (
                      <button className="primary-button" type="button" disabled={pendingTaskId === task._id} onClick={() => void run(task._id, () => claimTask({ taskId: task._id }))}>Claim task</button>
                    ) : null}
                    {task.isMine && task.status === "todo" && task.acceptanceStatus !== "pending" ? (
                      <button className="primary-button" type="button" disabled={pendingTaskId === task._id} onClick={() => void run(task._id, () => updateStatus({ taskId: task._id, status: "in_progress" }))}>Start task</button>
                    ) : null}
                    {task.isMine && ["in_progress", "changes_requested"].includes(task.status) ? (
                      <button className="primary-button" type="button" onClick={() => setOpenTaskId((current) => current === task._id ? null : task._id)}>{task.status === "changes_requested" ? "Resubmit" : "Submit for review"}</button>
                    ) : null}
                    {["submitted", "review"].includes(task.status) ? <span className="waiting-label">Waiting for review</span> : null}
                  </div>
                  {openTaskId === task._id ? (
                    <TaskEvidencePanel taskId={task._id} taskTitle={task.title} taskStatus={task.status} requiresReview={task.requiresReview} />
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
