import {
  getBattleTaskAction,
  type BattleTaskStatus,
  type BattleTaskSummary,
} from "./battleTaskAction";
import { CharacterAvatar } from "../common/CharacterAvatar";

export type { BattleTaskSummary } from "./battleTaskAction";

type BattleTaskBoardProps = {
  tasks: BattleTaskSummary[];
  canManageProject: boolean;
  tasksLocked: boolean;
  disabled?: boolean;
  onOpenDetails: (taskId: string) => void;
  onClaim: (taskId: string) => void;
  onAccept: (taskId: string) => void;
  onDecline: (taskId: string) => void;
};

const STATUS_LABELS: Record<BattleTaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  review: "Waiting Review",
  submitted: "Submitted for Review",
  changes_requested: "Changes Requested",
  awaiting_creator: "Awaiting Creator",
  completed: "Complete",
  verified: "Complete",
};

function BattleTaskNote({
  task,
  canManageProject,
  tasksLocked,
  disabled,
  onOpenDetails,
  onClaim,
  onAccept,
  onDecline,
}: {
  task: BattleTaskSummary;
  canManageProject: boolean;
  tasksLocked: boolean;
  disabled?: boolean;
  onOpenDetails: (taskId: string) => void;
  onClaim: (taskId: string) => void;
  onAccept: (taskId: string) => void;
  onDecline: (taskId: string) => void;
}) {
  const action = getBattleTaskAction(task, canManageProject);

  return (
    <article className={`battle-task-note task-${task.status} ${task.isMine ? "is-mine" : ""}`}>
      <button
        className="battle-task-note-main"
        type="button"
        aria-label={`Open details for ${task.title}`}
        onClick={() => onOpenDetails(task.id)}
      >
        <span className="battle-task-phase">{task.phase}</span>
        <strong>{task.title}</strong>
        <span className="battle-task-owner" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {!task.isOpenForClaiming && task.owner !== "Unassigned" ? (
            <CharacterAvatar
              fill={task.ownerFill}
              outline={task.ownerOutline}
              spellType={task.ownerSpellType as any}
              name={task.owner}
              size="xs"
            />
          ) : null}
          {task.owner}{tasksLocked && !task.isOpenForClaiming ? <span aria-label="Task allocation locked"> 🔒</span> : null}
        </span>
        <span className="battle-task-date">Due {task.dueDate}</span>
        <span className="battle-task-reviewer">Reviewer: {task.reviewer}</span>
        <span className="battle-task-impact">Weight {task.weight} · {task.damage} DMG</span>
        <span className="battle-task-status">{STATUS_LABELS[task.status]}</span>
      </button>

      <div className="battle-task-actions">
        {action === "claim" ? (
          <button className="primary-button" type="button" disabled={disabled} onClick={() => onClaim(task.id)}>MayLamDi</button>
        ) : null}
        {action === "accept_or_decline" ? (
          <>
            <button className="primary-button" type="button" disabled={disabled} onClick={() => onAccept(task.id)}>Accept</button>
            <button className="quiet-button" type="button" disabled={disabled} onClick={() => onDecline(task.id)}>Decline</button>
          </>
        ) : null}
        {action === "submit" ? (
          <button className="primary-button" type="button" disabled={disabled} onClick={() => onOpenDetails(task.id)}>
            {task.status === "changes_requested" ? "Resubmit Task" : "Submit Task"}
          </button>
        ) : null}
        {action === "review" ? (
          <button className="primary-button" type="button" onClick={() => onOpenDetails(task.id)}>Review</button>
        ) : null}
        {action === "approve" ? (
          <button className="primary-button" type="button" onClick={() => onOpenDetails(task.id)}>Approve Completion</button>
        ) : null}
        {action === "waiting_review" ? <span className="battle-task-waiting">Waiting for Review</span> : null}
        {action === "waiting_approval" ? <span className="battle-task-waiting">Waiting for Approval</span> : null}
        {action === "complete" ? <span className="battle-task-complete">Completed ✓</span> : null}
        {action === "details" ? (
          <button className="text-link" type="button" onClick={() => onOpenDetails(task.id)}>View details</button>
        ) : null}
      </div>
    </article>
  );
}

export function BattleTaskBoard({
  tasks,
  canManageProject,
  tasksLocked,
  disabled,
  onOpenDetails,
  onClaim,
  onAccept,
  onDecline,
}: BattleTaskBoardProps) {
  const myTasks = tasks.filter((task) =>
    task.isMine &&
    !task.isOpenForClaiming &&
    task.acceptanceStatus !== "declined" &&
    !["completed", "verified"].includes(task.status),
  );
  const teamTasks = tasks.filter((task) => !myTasks.some((mine) => mine.id === task.id));

  const renderTask = (task: BattleTaskSummary) => (
    <BattleTaskNote
      key={task.id}
      task={task}
      canManageProject={canManageProject}
      tasksLocked={tasksLocked}
      disabled={disabled}
      onOpenDetails={onOpenDetails}
      onClaim={onClaim}
      onAccept={onAccept}
      onDecline={onDecline}
    />
  );

  return (
    <section className="battle-task-board" aria-labelledby="battle-task-board-title">
      <header className="battle-task-board-heading">
        <div>
          <p className="card-eyebrow">Live task strip</p>
          <h3 id="battle-task-board-title">Your next move</h3>
        </div>
        <span>{tasks.filter((task) => !["completed", "verified"].includes(task.status)).length} active</span>
      </header>

      <section className="battle-task-group" aria-labelledby="my-battle-tasks-title">
        <div className="battle-task-group-heading">
          <h4 id="my-battle-tasks-title">My active tasks</h4>
          <span>{myTasks.length}</span>
        </div>
        {myTasks.length > 0 ? (
          <div className="battle-task-strip battle-my-task-strip">{myTasks.map(renderTask)}</div>
        ) : (
          <p className="battle-task-empty">No active task is assigned to you. You can still claim an open team task.</p>
        )}
      </section>

      <section className="battle-task-group" aria-labelledby="team-battle-tasks-title">
        <div className="battle-task-group-heading">
          <h4 id="team-battle-tasks-title">Team tasks</h4>
          <span>{teamTasks.length}</span>
        </div>
        {teamTasks.length > 0 ? (
          <div className="battle-task-strip">{teamTasks.map(renderTask)}</div>
        ) : (
          <p className="battle-task-empty">All team tasks are already shown in your active strip.</p>
        )}
      </section>
    </section>
  );
}
