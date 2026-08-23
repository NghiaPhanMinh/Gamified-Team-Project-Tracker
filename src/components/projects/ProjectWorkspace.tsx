import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Check, Clipboard, PencilLine } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";
import { trackEvent } from "../../lib/analytics";
import { MAYLAMDI_PHASE_COLORS, paletteColorAt } from "../../lib/brandPalette";
import { BattleScene } from "../game/BattleScene";
import { AIPlanningAssistant, type AiTaskSuggestion } from "./AIPlanningAssistant";
import { AllocationWorkbench } from "./AllocationWorkbench";
import { BattleTaskBoard, type BattleTaskSummary } from "./BattleTaskBoard";
import { ProjectTeamMembers } from "./ProjectTeamMembers";
import { TaskEvidencePanel } from "./TaskEvidencePanel";
import { TaskTradePanel } from "./TaskTradePanel";
import { REVIEW_WAITING_MESSAGE } from "./reviewCopy";
import { DailyEvidenceFeed } from "./DailyEvidenceFeed";

type ProjectWorkspaceProps = {
  projectId: Id<"projects">;
  onClose: () => void;
  initialTab?: ProjectTab;
};

type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "review"
  | "completed"
  | "submitted"
  | "changes_requested"
  | "verified"
  | "awaiting_creator";

export type ProjectTab = "progress" | "tasks" | "plan" | "team";

const PROJECT_TABS: { value: ProjectTab; label: string }[] = [
  { value: "progress", label: "Progress" },
  { value: "tasks", label: "Tasks" },
  { value: "plan", label: "Project Plan" },
  { value: "team", label: "Team" },
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  review: "Waiting Review",
  submitted: "Waiting Review",
  changes_requested: "Changes Requested",
  awaiting_creator: "Awaiting Creator",
  completed: "Complete",
  verified: "Complete",
};

type Workspace = FunctionReturnType<typeof api.tasks.getWorkspace>;

type StoredDraftTask = {
  title: string;
  description: string;
  phaseKey: string;
  ownerMode: "creator" | "open" | "unassigned";
  weight: number;
  dueDate: string;
  skills: string;
};

function formatProjectDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(date);
}

function daysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(`${value}T00:00:00`);
  return Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
}

function formatDeadline(value: string) {
  const days = daysUntil(value);
  const suffix = days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? "due today" : `${days} day${days === 1 ? "" : "s"} left`;
  return `${formatProjectDate(value)} · ${suffix}`;
}

function projectTaskProgress(tasks: Workspace["tasks"]) {
  const totalWeight = tasks.reduce((total, task) => total + task.weight, 0);
  const completedWeight = tasks
    .filter((task) => ["completed", "verified"].includes(task.status))
    .reduce((total, task) => total + task.weight, 0);
  return totalWeight ? Math.round((completedWeight / totalWeight) * 100) : 0;
}

function ProjectShareButton({ teamId }: { teamId: Id<"teams"> }) {
  const teamWorkspace = useQuery(api.teams.getWorkspace, { teamId });
  const [copied, setCopied] = useState(false);

  if (!teamWorkspace || !teamWorkspace.team) return null;
  const joinCode = teamWorkspace.team.joinCode;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {
      setCopied(true);
    }
  }

  return (
    <button className="quiet-button share-code-btn" type="button" onClick={() => void copyCode()}>
      {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
      {copied ? `Code: ${joinCode} (Copied!)` : "Share code"}
    </button>
  );
}

export function ProjectWorkspace({ projectId, initialTab = "progress" }: ProjectWorkspaceProps) {
  const workspace = useQuery(api.tasks.getWorkspace, { projectId });
  if (workspace === undefined) {
    return <section className="project-workspace project-workspace-loading" aria-busy="true"><p>Opening the project…</p></section>;
  }
  if (workspace === null) {
    return <div className="project-empty" style={{ margin: "2rem auto" }}><strong>Project not found or no longer accessible.</strong></div>;
  }
  return <ProjectWorkspaceReady workspace={workspace} initialTab={initialTab} />;
}

function ProjectWorkspaceReady({ workspace, initialTab }: {
  workspace: Workspace;
  initialTab: ProjectTab;
}) {
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const createPhase = useMutation(api.tasks.createPhase);
  const renamePhase = useMutation(api.tasks.renamePhase);
  const claimTask = useMutation(api.tasks.claimTask);
  const acceptTask = useMutation(api.tasks.acceptTask);
  const declineTask = useMutation(api.tasks.declineTask);
  const decideCompletion = useMutation(api.evidence.decideCompletion);
  const updateBrief = useMutation(api.projects.updateBrief);
  const setProjectArchived = useMutation(api.projects.setArchived);
  const lockTasks = useMutation(api.projects.lockTasks);
  const releaseOverdueTask = useMutation(api.tasks.releaseOverdueTask);
  const battleState = useQuery(api.battle.getState, { projectId: workspace.project._id });

  const [activeTab, setActiveTab] = useState<ProjectTab>(initialTab);

  const overdueTasks = useMemo(() => {
    return workspace.tasks.filter((t) => {
      return t.dueDate &&
        new Date(`${t.dueDate}T23:59:59Z`).getTime() < Date.now() &&
        !["completed", "verified"].includes(t.status);
    });
  }, [workspace.tasks]);

  const inactiveMembers = useMemo(() => {
    if (!battleState?.members) return [];
    return battleState.members.filter((m) => m.isInactive7Days);
  }, [battleState?.members]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<Id<"tasks"> | null>(null);
  const [openBattleTaskId, setOpenBattleTaskId] = useState<Id<"tasks"> | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPhaseId, setTaskPhaseId] = useState("");
  const [taskOwner, setTaskOwner] = useState("__open");
  const [taskReviewerId, setTaskReviewerId] = useState("");
  const [taskWeight, setTaskWeight] = useState("1");
  const [taskEffort, setTaskEffort] = useState("4");
  const [taskDifficulty, setTaskDifficulty] = useState("2");
  const [taskDueDate, setTaskDueDate] = useState(workspace.project.deadline);
  const [taskSkills, setTaskSkills] = useState("");
  const [, setNeedsMyReview] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefTitle, setBriefTitle] = useState(workspace.project.title);
  const [briefDescription, setBriefDescription] = useState(workspace.project.description);
  const [briefDeadline, setBriefDeadline] = useState(workspace.project.deadline);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [renamingPhaseId, setRenamingPhaseId] = useState<Id<"phases"> | null>(null);
  const [renamePhaseName, setRenamePhaseName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const importedDrafts = useRef(false);

  const memberNameById = useMemo(
    () => new Map(workspace.members.map((member) => [member.profileId, member.displayName])),
    [workspace.members],
  );
  const reviewerLoadById = useMemo(
    () => new Map(workspace.reviewerLoads.map((item) => [item.profileId, item.reviewCount])),
    [workspace.reviewerLoads],
  );
  const phaseNameById = useMemo(
    () => new Map(workspace.phases.map((phase) => [phase._id, phase.title])),
    [workspace.phases],
  );

  useEffect(() => {
    if (importedDrafts.current || workspace.tasks.length > 0 || !workspace.canManageProject) return;
    const storageKey = `maylamdi:draft-tasks:${workspace.project._id}`;
    const serialized = sessionStorage.getItem(storageKey);
    if (!serialized) return;
    importedDrafts.current = true;
    let drafts: StoredDraftTask[] = [];
    try {
      drafts = JSON.parse(serialized) as StoredDraftTask[];
    } catch {
      sessionStorage.removeItem(storageKey);
      return;
    }
    const phaseByKey = new Map(workspace.phases.map((phase) => [phase.frameworkPhaseKey, phase._id]));
    void (async () => {
      setIsSaving(true);
      try {
        for (const draft of drafts) {
          const phaseId = phaseByKey.get(draft.phaseKey) ?? workspace.phases[0]?._id;
          if (!phaseId) continue;
          await createTask({
            projectId: workspace.project._id,
            phaseId,
            title: draft.title,
            description: draft.description,
            primaryOwnerProfileId: workspace.currentProfileId,
            collaboratorProfileIds: [],
            requiredSkills: draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
            estimatedEffortHours: 4,
            difficulty: 2,
            weight: draft.weight,
            required: true,
            startDate: workspace.project.startDate,
            dueDate: draft.dueDate,
            dependencyTaskIds: [],
            requiresReview: true,
            damage: 20,
            isOpenForClaiming: draft.ownerMode === "open",
            collaboratorCanSubmit: false,
            assignmentState: draft.ownerMode === "unassigned" ? "unassigned" : undefined,
          });
        }
        sessionStorage.removeItem(storageKey);
        sessionStorage.removeItem(`maylamdi:draft-owner:${workspace.project._id}`);
      } catch (caughtError) {
        importedDrafts.current = false;
        setError(getErrorMessage(caughtError, "The initial task list could not be saved."));
      } finally {
        setIsSaving(false);
      }
    })();
  }, [createTask, workspace]);


  const completionRequests = workspace.tasks.filter((task) => task.status === "awaiting_creator");
  const requestTasks = workspace.tasks.filter((task) =>
    task.primaryOwnerProfileId === workspace.currentProfileId && task.acceptanceStatus === "pending",
  );
  const needsMyReviewCount = workspace.tasks.filter((task) =>
    task.reviewerProfileId === workspace.currentProfileId && ["submitted", "review"].includes(task.status),
  ).length;
  const currentPhase = workspace.phases.find((phase) =>
    workspace.tasks.some((task) => task.phaseId === phase._id && !["completed", "verified"].includes(task.status)),
  )?.title ?? workspace.phases.at(-1)?.title;
  const progressPercent = projectTaskProgress(workspace.tasks);
  const completedTaskCount = workspace.tasks.filter((task) => ["completed", "verified"].includes(task.status)).length;
  const nextAction = workspace.tasks
    .map((task) => {
      if (task.primaryOwnerProfileId === workspace.currentProfileId && task.acceptanceStatus === "pending") {
        return { task, label: "Accept task", actionType: "Task request pending your acceptance", kind: "accept" as const, priority: 1 };
      }
      if (task.reviewerProfileId === workspace.currentProfileId && ["submitted", "review"].includes(task.status)) {
        return { task, label: "MayReviewDi", actionType: "Sẵn sàng review · Nộp minh chứng thành công", kind: "review" as const, priority: 2 };
      }
      if (workspace.canManageProject && task.status === "awaiting_creator") {
        return { task, label: "Approve completion", actionType: "Task waiting for creator approval", kind: "approve" as const, priority: 3 };
      }
      if (task.isOpenForClaiming) {
        return { task, label: "Claim Task", actionType: "Open task available to claim", kind: "claim" as const, priority: 4 };
      }
      if (task.primaryOwnerProfileId === workspace.currentProfileId && !["completed", "verified"].includes(task.status)) {
        return { task, label: "MayLamDi", actionType: task.status === "todo" ? "Assigned to you · Not started yet" : "Assigned to you · In progress", kind: "open" as const, priority: 5 };
      }
      if (task.reviewerProfileId === workspace.currentProfileId && !["completed", "verified"].includes(task.status)) {
        return { task, label: "MayReviewDi", actionType: REVIEW_WAITING_MESSAGE, kind: "review_waiting" as const, priority: 6 };
      }
      if (!["completed", "verified"].includes(task.status)) {
        const ownerName = memberNameById.get(task.primaryOwnerProfileId) ?? "Teammate";
        const statusLabel = STATUS_LABELS[task.status as TaskStatus] ?? "In Progress";
        return {
          task,
          label: `🔔 Remind ${ownerName}`,
          actionType: `${ownerName} · ${statusLabel}`,
          kind: "remind" as const,
          priority: 7,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((first, second) => first.priority - second.priority || first.task.dueDate.localeCompare(second.task.dueDate))[0];
  const openBattleTask = workspace.tasks.find((task) => task._id === openBattleTaskId);
  const battleTasks: BattleTaskSummary[] = workspace.tasks.map((task) => {
    const ownerMember = workspace.members.find((m) => m?.profileId === task.primaryOwnerProfileId);
    return {
      id: task._id,
      title: task.title,
      phase: phaseNameById.get(task.phaseId) ?? "Project work",
      owner: task.assignmentState === "unassigned"
        ? "Unassigned"
        : task.isOpenForClaiming
          ? "Open for claiming"
          : memberNameById.get(task.primaryOwnerProfileId) ?? "Team member",
      ownerFill: ownerMember?.characterFill,
      ownerOutline: ownerMember?.characterOutline,
      ownerSpellType: ownerMember?.spellType,
      reviewer: task.reviewerProfileId ? memberNameById.get(task.reviewerProfileId) ?? "Reviewer" : "Choose later",
      dueDate: task.dueDate,
      status: task.status as TaskStatus,
      weight: task.weight,
      damage: task.damage ?? ((task.difficulty ?? 1) <= 1 ? 10 : task.difficulty === 2 ? 20 : 30),
      isMine: task.primaryOwnerProfileId === workspace.currentProfileId,
      isReviewer: task.reviewerProfileId === workspace.currentProfileId,
      isOpenForClaiming: Boolean(task.isOpenForClaiming),
      acceptanceStatus: task.acceptanceStatus,
    };
  });

  function resetTaskForm() {
    setTaskTitle("");
    setTaskDescription("");
    setTaskPhaseId("");
    setTaskOwner("__open");
    setTaskReviewerId("");
    setTaskWeight("1");
    setTaskEffort("4");
    setTaskDifficulty("2");
    setTaskDueDate(workspace.project.deadline);
    setTaskSkills("");
    setEditingTaskId(null);
  }

  function editTask(task: Workspace["tasks"][number]) {
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskPhaseId(task.phaseId);
    setTaskOwner(task.assignmentState === "unassigned" ? "__unassigned" : task.isOpenForClaiming ? "__open" : task.primaryOwnerProfileId);
    setTaskReviewerId(task.reviewerProfileId ?? "");
    setTaskWeight(String(task.weight));
    setTaskEffort(String(task.estimatedEffortHours ?? 4));
    setTaskDifficulty(String(task.difficulty ?? 2));
    setTaskDueDate(task.dueDate);
    setTaskSkills((task.requiredSkills ?? []).join(", "));
    setEditingTaskId(task._id);
    setShowTaskForm(true);
  }

  function useAiTask(task: AiTaskSuggestion) {
    resetTaskForm();
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskPhaseId(task.phaseId);
    setTaskOwner(task.primaryOwnerProfileId || "__open");
    setTaskReviewerId(task.reviewerProfileId ?? "");
    setTaskWeight(String(task.weight));
    setTaskEffort(String(task.estimatedEffortHours));
    setTaskDifficulty(String(task.difficulty));
    setTaskDueDate(task.dueDate);
    setTaskSkills(task.requiredSkills.join(", "));
    setShowTaskForm(true);
  }

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phaseId = (taskPhaseId || workspace.phases[0]?._id) as Id<"phases"> | undefined;
    if (!phaseId) { setError("Create a phase before adding tasks."); return; }
    const isOpen = taskOwner === "__open";
    const isUnassigned = taskOwner === "__unassigned";
    const ownerId = (isOpen || isUnassigned ? workspace.currentProfileId : taskOwner) as Id<"userProfiles">;
    if (taskReviewerId === ownerId) { setError("A task owner cannot review their own work."); return; }
    setIsSaving(true);
    setError(null);
    try {
      const input = {
        phaseId,
        title: taskTitle,
        description: taskDescription,
        primaryOwnerProfileId: ownerId,
        collaboratorProfileIds: [] as Id<"userProfiles">[],
        requiredSkills: taskSkills.split(",").map((skill) => skill.trim()).filter(Boolean),
        estimatedEffortHours: Number(taskEffort),
        difficulty: Number(taskDifficulty),
        weight: Number(taskWeight),
        required: true,
        startDate: workspace.project.startDate,
        dueDate: taskDueDate,
        dependencyTaskIds: [] as Id<"tasks">[],
        requiresReview: true,
        reviewerProfileId: taskReviewerId ? taskReviewerId as Id<"userProfiles"> : undefined,
        damage: Number(taskDifficulty) <= 1 ? 10 : Number(taskDifficulty) === 2 ? 20 : 30,
        isOpenForClaiming: isOpen,
        collaboratorCanSubmit: false,
        assignmentState: isUnassigned ? "unassigned" as const : undefined,
      };
      if (editingTaskId) await updateTask({ taskId: editingTaskId, ...input });
      else await createTask({ projectId: workspace.project._id, ...input });
      resetTaskForm();
      setShowTaskForm(false);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The task could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  async function runAction(action: () => Promise<unknown>, fallback: string) {
    setError(null);
    setIsSaving(true);
    try { await action(); } catch (caughtError) { setError(getErrorMessage(caughtError, fallback)); } finally { setIsSaving(false); }
  }

  async function saveBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(async () => {
      await updateBrief({ projectId: workspace.project._id, title: briefTitle, description: briefDescription, deadline: briefDeadline });
      setBriefOpen(false);
    }, "The project brief could not be updated.");
  }

  async function addPhase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(async () => {
      await createPhase({ projectId: workspace.project._id, title: newPhaseName });
      setNewPhaseName("");
    }, "The phase could not be created.");
  }

  function handleNextAction() {
    if (!nextAction) return;
    const taskId = nextAction.task._id;

    if (nextAction.kind === "remind") {
      setOpenBattleTaskId(taskId);
      return;
    }

    if (nextAction.kind === "claim") {
      void runAction(async () => {
        await claimTask({ taskId });
        setOpenBattleTaskId(taskId);
      }, "The task could not be claimed.");
      return;
    }

    if (nextAction.kind === "accept") {
      void runAction(async () => {
        await acceptTask({ taskId });
        setOpenBattleTaskId(taskId);
      }, "The request could not be accepted.");
      return;
    }

    if (nextAction.kind === "open" && nextAction.task.status === "todo") {
      void runAction(async () => {
        await updateTaskStatus({ taskId, status: "in_progress" });
        setOpenBattleTaskId(taskId);
      }, "The task could not be started.");
      return;
    }

    setOpenBattleTaskId(taskId);
  }

  return (
    <section className="project-workspace" aria-labelledby="open-project-title">
      <header className="open-project-header compact-project-header">
        <div>
          <p className="kicker">Project</p>
          <div className="project-title-row">
            <h2 id="open-project-title" className="project-title-large">{workspace.project.title}</h2>
            <ProjectShareButton teamId={workspace.project.teamId} />
          </div>
          <p className="project-deadline-line">
            {formatDeadline(workspace.project.deadline)} · {workspace.project.frameworkName}
            {workspace.project.description ? ` · ${workspace.project.description}` : ""}
          </p>
        </div>
        <dl className="compact-project-priority">
          <div><dt>Progress</dt><dd>{progressPercent}%</dd></div>
          <div><dt>Current phase</dt><dd>{currentPhase ?? "Project work"}</dd></div>
        </dl>
        <div className="open-project-header-actions">
          <button className="primary-button" type="button" onClick={() => setActiveTab("plan")}>
            <PencilLine aria-hidden="true" /> View / Edit Plan
          </button>
        </div>
      </header>

      <nav className="project-tabs" aria-label="Project sections">
        {PROJECT_TABS.map((tab) => <button key={tab.value} type="button" className={activeTab === tab.value ? "is-active" : ""} onClick={() => setActiveTab(tab.value)}>{tab.label}</button>)}
      </nav>

      {overdueTasks.length > 0 || inactiveMembers.length > 0 ? (
        <aside className="room-risk-banner" style={{ margin: "0.5rem 0 0.75rem", padding: "0.65rem 1rem", borderRadius: "12px", background: "color-mix(in srgb, #ef4444 12%, var(--color-surface))", border: "1.5px solid #ef4444", color: "var(--color-text)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.1rem" }}>🚨</span>
            <div>
              <strong style={{ fontSize: "0.9rem", display: "block" }}>
                Attention Required: {overdueTasks.length ? `${overdueTasks.length} overdue task(s)` : ""} {overdueTasks.length && inactiveMembers.length ? " · " : ""} {inactiveMembers.length ? `${inactiveMembers.length} member(s) inactive (7+ days)` : ""}
              </strong>
              <small style={{ opacity: 0.85, fontSize: "0.8rem" }}>Overdue tasks reduce Village Defense HP by 25% each.</small>
            </div>
          </div>
          {workspace.canManageProject && overdueTasks.length > 0 ? (
            <button
              className="quiet-button"
              type="button"
              style={{ fontWeight: 800, textDecoration: "underline", fontSize: "0.85rem" }}
              onClick={() => setActiveTab("tasks")}
            >
              Manage Overdue Tasks
            </button>
          ) : null}
        </aside>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {isSaving ? <p className="workspace-saving" role="status">Saving changes…</p> : null}

      {activeTab === "plan" ? (
        <div className="project-overview-flow project-plan-view">
          {workspace.canManageProject ? (
            <AIPlanningAssistant workspace={workspace} onUseTask={useAiTask} />
          ) : null}

          <section className="project-plan-breakdown" aria-labelledby="project-plan-title">
            <div className="project-section-heading">
              <div>
                <p className="card-eyebrow">Project Framework &amp; Responsibilities</p>
                <h2 id="project-plan-title">Task Responsibilities</h2>
                <p>Consolidated outline of project brief, deadline, phases, and task allocations.</p>
              </div>
              <div className="project-plan-actions">
                {workspace.canManageProject ? (
                  <button className="quiet-button" type="button" onClick={() => setBriefOpen(true)}>
                    Edit Brief &amp; Deadline
                  </button>
                ) : null}
                <button className="primary-button" type="button" onClick={() => setActiveTab("tasks")}>
                  Open Task Board
                </button>
              </div>
            </div>

            <section className="project-brief-card" aria-labelledby="project-brief-visible-title">
              <div className="project-section-heading">
                <div>
                  <p className="card-eyebrow">Brief Details</p>
                  <h3 id="project-brief-visible-title">{workspace.project.title}</h3>
                </div>
              </div>
              <p>{workspace.project.description || "No project brief has been added yet."}</p>
              <div className="project-brief-meta project-brief-summary-meta">
                <strong>Deadline</strong>
                <span>{formatProjectDate(workspace.project.deadline)}</span>
                <span>{workspace.members.length} team members</span>
                <span>{workspace.project.frameworkName}</span>
              </div>
            </section>

            <section className="phase-timeline-card" aria-labelledby="phase-timeline-title">
              <div className="project-section-heading">
                <div>
                  <p className="card-eyebrow">Framework breakdown</p>
                  <h3 id="phase-timeline-title">Project phases</h3>
                </div>
              </div>
              <ol className="phase-timeline">
                {workspace.phases.map((phase) => {
                  const phaseTasks = workspace.tasks.filter((task) => task.phaseId === phase._id);
                  const complete = phaseTasks.length > 0 && phaseTasks.every((task) => ["completed", "verified"].includes(task.status));
                  const isCurrent = !complete && phase.title === currentPhase;
                  return (
                    <li key={phase._id} className={complete ? "is-complete" : isCurrent ? "is-current" : "is-upcoming"}>
                      <span className="phase-timeline-marker">{complete ? "✓" : isCurrent ? "●" : "○"}</span>
                      <div>
                        <strong>{phase.title}</strong>
                        <small>{complete ? "Completed" : isCurrent ? "Current phase" : "Upcoming"} · {phaseTasks.length} task{phaseTasks.length === 1 ? "" : "s"}</small>
                        {phase.description ? <p className="phase-timeline-description">{phase.description}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="task-outline-card" aria-labelledby="task-outline-title">
              <div className="project-section-heading">
                <div>
                  <p className="card-eyebrow">Task Outline</p>
                  <h3 id="task-outline-title">Tasks &amp; Responsibilities</h3>
                  <p>Who is responsible for what?</p>
                </div>
              </div>
              {workspace.tasks.length === 0 ? (
                <p className="project-empty-inline">No tasks have been added yet.</p>
              ) : (
                <div className="task-outline-list">
                  {workspace.phases.map((phase) => {
                    const phaseTasks = workspace.tasks.filter((task) => task.phaseId === phase._id);
                    if (phaseTasks.length === 0) return null;
                    return (
                      <section key={phase._id} className="task-outline-phase">
                        <h4>{phase.title}</h4>
                        <ul>
                          {phaseTasks.map((task) => {
                            const owner = task.assignmentState === "unassigned" ? "Unassigned" : task.isOpenForClaiming ? "Open for Claiming" : memberNameById.get(task.primaryOwnerProfileId) ?? "Team member";
                            return (
                              <li key={task._id}>
                                <div>
                                  <strong>{task.title}</strong>
                                  <span>{owner}</span>
                                </div>
                                <div>
                                  <span>Due {formatProjectDate(task.dueDate)}</span>
                                  <span className={`task-outline-status task-outline-status-${task.status}`}>{STATUS_LABELS[task.status as TaskStatus]}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              )}
            </section>
          </section>
        </div>
      ) : null}

      {activeTab === "progress" ? (
        <div className="project-overview-flow battle-workspace-overview project-progress-view">
          <section className="shared-battle-stage" aria-label="Shared project Battle scene">
            <BattleScene projectId={workspace.project._id} currentPhase={currentPhase} tasksLocked={Boolean(workspace.project.tasksLocked)} />
          </section>

          <section
            className="next-action-card project-next-action"
            aria-labelledby="next-action-title"
            style={{ cursor: nextAction ? "pointer" : "default" }}
            onClick={() => {
              if (nextAction) handleNextAction();
            }}
          >
            <div>
              <p className="card-eyebrow">Your next action</p>
              <h2 id="next-action-title">{nextAction ? nextAction.task.title : "You are up to date"}</h2>
              <p>{nextAction ? `${nextAction.actionType} · Due ${nextAction.task.dueDate}` : "No action is waiting for you right now. Check the project progress or help with an open task."}</p>
            </div>
            {nextAction ? (
              <button
                className="primary-button next-action-cta"
                type="button"
                disabled={isSaving}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextAction();
                }}
              >
                {nextAction.label}
              </button>
            ) : (
              <button className="secondary-button" type="button" onClick={() => setActiveTab("tasks")}>
                View Task Board
              </button>
            )}
          </section>

          <details className="battle-more-tools">
            <summary><span>More Tools</span><span className="battle-tools-alerts">{needsMyReviewCount > 0 ? `${needsMyReviewCount} to review` : null}{requestTasks.length > 0 ? `${requestTasks.length} task request${requestTasks.length === 1 ? "" : "s"}` : null}{workspace.canManageProject && completionRequests.length > 0 ? `${completionRequests.length} approval${completionRequests.length === 1 ? "" : "s"}` : null}</span></summary>
            <div className="battle-tool-links">
              <button className="quiet-button" type="button" onClick={() => { const task = workspace.tasks.find((item) => item.reviewerProfileId === workspace.currentProfileId && ["submitted", "review"].includes(item.status)); if (task) setOpenBattleTaskId(task._id); else { setActiveTab("tasks"); setNeedsMyReview(true); } }}>Review Queue{needsMyReviewCount > 0 ? ` (${needsMyReviewCount})` : ""}</button>
              <button className="quiet-button" type="button" onClick={() => { if (requestTasks[0]) setOpenBattleTaskId(requestTasks[0]._id); else setActiveTab("tasks"); }}>Task Requests{requestTasks.length > 0 ? ` (${requestTasks.length})` : ""}</button>
              {workspace.canManageProject && completionRequests.length > 0 ? <button className="quiet-button" type="button" onClick={() => setOpenBattleTaskId(completionRequests[0]._id)}>Completion Requests ({completionRequests.length})</button> : null}
              <button className="quiet-button" type="button" onClick={() => setActiveTab("team")}>Team</button>
              {workspace.canManageProject ? <button className="quiet-button" type="button" onClick={() => { setActiveTab("tasks"); setShowTaskForm(true); }}>Adjust Plan</button> : null}
              <button className="quiet-button" type="button" onClick={() => setBriefOpen(true)}>Project Brief</button>
              <button className="quiet-button" type="button" onClick={() => window.print()}>Project Report</button>
            </div>
            <TaskTradePanel projectId={workspace.project._id} />
            <details className="planning-workload-details"><summary>Workload</summary><AllocationWorkbench workspace={workspace} /></details>
          </details>

          <details className="project-context-settings"><summary>Project settings and report</summary><p>{completedTaskCount} of {workspace.tasks.length} tasks complete.</p><button className="quiet-button" type="button" onClick={() => window.print()}>Export / print report</button>{workspace.canManageProject ? <button className="quiet-button" type="button" onClick={() => void runAction(() => setProjectArchived({ projectId: workspace.project._id, archived: workspace.project.status !== "archived" }), "The project status could not be changed.")}>{workspace.project.status === "archived" ? "Restore project" : "Archive project"}</button> : null}</details>
        </div>
      ) : null}

      {activeTab === "tasks" ? (
        <section className="tasks-room-tab" aria-labelledby="team-tasks-title">
          <header className="project-list-heading"><div><h3 id="team-tasks-title">Tasks</h3></div>{workspace.canManageProject ? <button className="primary-button" type="button" onClick={() => { if (showTaskForm) resetTaskForm(); setShowTaskForm((current) => !current); }}>{showTaskForm ? "Close task form" : "Add Task"}</button> : null}</header>

          <BattleTaskBoard
            tasks={battleTasks}
            canManageProject={workspace.canManageProject}
            tasksLocked={Boolean(workspace.project.tasksLocked)}
            disabled={isSaving}
            onOpenDetails={(taskId) => setOpenBattleTaskId(taskId as Id<"tasks">)}
            onClaim={(taskId) => void runAction(async () => {
              await claimTask({ taskId: taskId as Id<"tasks"> });
              setOpenBattleTaskId(taskId as Id<"tasks">);
            }, "The task could not be claimed.")}
            onAccept={(taskId) => void runAction(() => acceptTask({ taskId: taskId as Id<"tasks"> }), "The request could not be accepted.")}
            onDecline={(taskId) => void runAction(() => declineTask({ taskId: taskId as Id<"tasks"> }), "The request could not be declined.")}
            onReleaseOverdue={(taskId) => void runAction(() => releaseOverdueTask({ taskId: taskId as Id<"tasks"> }), "The task could not be released.")}
          />

          <section className="progress-feed-section">
            <DailyEvidenceFeed projectId={workspace.project._id} />
          </section>

          {requestTasks.length > 0 ? <section className="task-request-panel"><p className="card-eyebrow">Task requests</p>{requestTasks.map((task) => <article key={task._id}><div><strong>{task.title}</strong><span>Requested by the room creator · weight {task.weight}</span></div><div><button className="primary-button" type="button" onClick={() => void runAction(() => acceptTask({ taskId: task._id }), "The task request could not be accepted.")}>Accept</button><button className="quiet-button" type="button" onClick={() => void runAction(() => declineTask({ taskId: task._id }), "The task request could not be declined.")}>Decline</button></div></article>)}</section> : null}

          {workspace.canManageProject ? <details className="phase-manager"><summary>Manage phases</summary><div className="phase-chip-editor">{workspace.phases.map((phase, index) => <div key={phase._id} style={{ "--mld-phase-color": paletteColorAt(MAYLAMDI_PHASE_COLORS, index) } as CSSProperties}>{renamingPhaseId === phase._id ? <form onSubmit={(event) => { event.preventDefault(); void runAction(async () => { await renamePhase({ phaseId: phase._id, title: renamePhaseName }); setRenamingPhaseId(null); }, "The phase could not be renamed."); }}><input value={renamePhaseName} onChange={(event) => setRenamePhaseName(event.target.value)} /><button type="submit" className="quiet-button">Save</button></form> : <><span>{phase.title}</span><button className="text-link phase-rename-button" type="button" onClick={() => { setRenamingPhaseId(phase._id); setRenamePhaseName(phase.title); }}>Rename</button></>}</div>)}</div><form className="inline-phase-form" onSubmit={addPhase}><input required maxLength={100} value={newPhaseName} onChange={(event) => setNewPhaseName(event.target.value)} placeholder="New phase name" /><button className="secondary-button" type="submit">Add phase</button></form></details> : null}

          {battleTasks.length === 0 ? <div className="project-empty"><strong>No tasks in this project yet.</strong><p>Click Add Task to create the first task.</p></div> : null}
        </section>
      ) : null}

      {activeTab === "team" ? (
        <section className="team-tab">
          <ProjectTeamMembers projectId={workspace.project._id} />
        </section>
      ) : null}

      {briefOpen ? <div className="brief-drawer-backdrop" role="presentation" onClick={() => setBriefOpen(false)}><aside className="brief-drawer" role="dialog" aria-modal="true" aria-labelledby="project-brief-title" onClick={(event) => event.stopPropagation()}><button className="guided-back-link" type="button" onClick={() => setBriefOpen(false)}>Close</button><p className="kicker">Project brief</p>{workspace.canManageProject ? <form onSubmit={saveBrief}><label><span>Project name</span><input required maxLength={100} value={briefTitle} onChange={(event) => setBriefTitle(event.target.value)} /></label><label><span>Deadline</span><input required type="date" value={briefDeadline} onChange={(event) => setBriefDeadline(event.target.value)} /></label><label><span>Brief</span><textarea required maxLength={8000} value={briefDescription} onChange={(event) => setBriefDescription(event.target.value)} /></label><button className="primary-button" type="submit" disabled={isSaving}>Save brief</button></form> : <><h3 className="display-heading" id="project-brief-title">{workspace.project.title}</h3><p>{workspace.project.description}</p><strong>Deadline {workspace.project.deadline}</strong></>}<ol className="brief-phase-list">{workspace.phases.map((phase) => <li key={phase._id}><strong>{phase.title}</strong><span>{phase.description}</span></li>)}</ol></aside></div> : null}

      {openBattleTask ? <div className="battle-task-drawer-backdrop" role="presentation" onClick={() => setOpenBattleTaskId(null)}><aside className="battle-task-drawer" role="dialog" aria-modal="true" aria-labelledby="battle-task-detail-title" onClick={(event) => event.stopPropagation()}>
        <header className="battle-task-drawer-heading"><div><p className="card-eyebrow">Task details</p><h3 id="battle-task-detail-title">{openBattleTask.title}</h3></div><button className="quiet-button" type="button" onClick={() => setOpenBattleTaskId(null)}>Close</button></header>
        <p>{openBattleTask.description}</p>
        <dl className="battle-task-detail-meta">
          <div><dt>Owner</dt><dd>{openBattleTask.isOpenForClaiming ? "Open for claiming" : memberNameById.get(openBattleTask.primaryOwnerProfileId) ?? "Team member"}{workspace.project.tasksLocked && !openBattleTask.isOpenForClaiming ? " 🔒" : ""}</dd></div>
          <div><dt>Phase</dt><dd>{phaseNameById.get(openBattleTask.phaseId) ?? "Project work"}</dd></div>
          <div><dt>Due</dt><dd>{openBattleTask.dueDate}</dd></div>
          <div><dt>Impact</dt><dd>Weight {openBattleTask.weight} · {openBattleTask.damage ?? 20} DMG</dd></div>
          <div><dt>Reviewer</dt><dd>{openBattleTask.reviewerProfileId ? memberNameById.get(openBattleTask.reviewerProfileId) ?? "Reviewer" : "Choose later"}</dd></div>
          <div><dt>Status</dt><dd>{STATUS_LABELS[openBattleTask.status as TaskStatus]}</dd></div>
        </dl>

        {openBattleTask.isOpenForClaiming ? <button className="primary-button" type="button" disabled={isSaving} onClick={() => void runAction(() => claimTask({ taskId: openBattleTask._id }), "The task could not be claimed.")}>Claim Task</button> : null}
        {openBattleTask.primaryOwnerProfileId === workspace.currentProfileId && openBattleTask.acceptanceStatus === "pending" ? <div className="battle-drawer-action-row"><button className="primary-button" type="button" disabled={isSaving} onClick={() => void runAction(() => acceptTask({ taskId: openBattleTask._id }), "The request could not be accepted.")}>Accept</button><button className="quiet-button" type="button" disabled={isSaving} onClick={() => void runAction(() => declineTask({ taskId: openBattleTask._id }), "The request could not be declined.")}>Decline</button></div> : null}

        {(workspace.canManageProject || workspace.isTeamOwner) && !workspace.project.tasksLocked ? <section className="task-allocation-lock"><div><strong>Allocation</strong><span>Freeze the required task count and reveal the shared Boss HP baseline.</span></div><button className="secondary-button" type="button" disabled={isSaving} onClick={() => void runAction(() => lockTasks({ projectId: workspace.project._id }), "The task list could not be locked.")}>Lock project task list</button></section> : null}
        {workspace.project.tasksLocked ? <p className="task-lock-state">🔒 Task allocation baseline is locked for this Battle.</p> : null}

        {workspace.canManageProject && openBattleTask.status === "awaiting_creator" ? <section className="battle-completion-actions"><strong>Reviewer recommends completion</strong><div><button className="primary-button" type="button" disabled={isSaving} onClick={() => void runAction(async () => {
          await decideCompletion({ taskId: openBattleTask._id, decision: "approve" });
          trackEvent("task_completed", {
            weight: openBattleTask.weight,
            damage: openBattleTask.damage ?? 20,
          });
        }, "The task could not be completed.")}>Approve Complete</button><button className="secondary-button" type="button" disabled={isSaving} onClick={() => void runAction(() => decideCompletion({ taskId: openBattleTask._id, decision: "reject" }), "The task could not be returned.")}>Return to In Progress</button></div></section> : null}

        <TaskEvidencePanel taskId={openBattleTask._id} taskTitle={openBattleTask.title} taskStatus={openBattleTask.status as TaskStatus} requiresReview={openBattleTask.requiresReview} reviewerName={openBattleTask.reviewerProfileId ? memberNameById.get(openBattleTask.reviewerProfileId) : undefined} />
        <TaskTradePanel key={openBattleTask._id} projectId={workspace.project._id} initialTaskId={openBattleTask.primaryOwnerProfileId === workspace.currentProfileId ? openBattleTask._id : undefined} />
        {workspace.canManageProject ? <button className="quiet-button" type="button" onClick={() => { editTask(openBattleTask); setOpenBattleTaskId(null); setActiveTab("tasks"); }}>Edit task in plan</button> : null}
      </aside></div> : null}

      {showTaskForm && workspace.canManageProject ? (
        <div className="task-create-drawer-backdrop" role="presentation" onClick={() => { resetTaskForm(); setShowTaskForm(false); }}>
          <aside className="task-create-drawer" role="dialog" aria-modal="true" aria-labelledby="task-create-drawer-title" onClick={(event) => event.stopPropagation()}>
            <header className="task-drawer-header">
              <div>
                <p className="card-eyebrow">{editingTaskId ? "Edit task" : "New task"}</p>
                <h3 id="task-create-drawer-title">{editingTaskId ? "Update required task" : "Create required task"}</h3>
              </div>
              <button className="quiet-button" type="button" onClick={() => { resetTaskForm(); setShowTaskForm(false); }}>
                Close
              </button>
            </header>

            <form className="compact-plan-form task-create-form" onSubmit={submitTask}>
              <fieldset className="task-form-section">
                <legend>1. Basic Information</legend>
                <div className="project-field-grid">
                  <label className="project-field-wide"><span>Task Title</span><input required maxLength={120} value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="e.g. Design 3D character asset" /></label>
                  <label className="project-field-wide"><span>Description</span><textarea required maxLength={1500} value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} placeholder="Describe expected output, deliverables, and guidelines..." /></label>
                  <label className="project-field-wide"><span>Phase</span><select value={taskPhaseId || workspace.phases[0]?._id || ""} onChange={(event) => setTaskPhaseId(event.target.value)}>{workspace.phases.map((phase) => <option key={phase._id} value={phase._id}>{phase.title}</option>)}</select></label>
                </div>
              </fieldset>

              <fieldset className="task-form-section">
                <legend>2. Time &amp; Scope Impact</legend>
                <div className="project-field-grid">
                  <label><span>Due Date</span><input required type="date" max={workspace.project.deadline} value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} /></label>
                  <label className="project-field-wide">
                    <span>Task Scope &amp; Contribution Level <small>Replaces complex weight &amp; difficulty calculations.</small></span>
                    <select value={taskWeight} onChange={(event) => { setTaskWeight(event.target.value); setTaskDifficulty(event.target.value); }}>
                      <option value="1">1 — Small / Light (15m–1h work · 10 Dragon DMG)</option>
                      <option value="3">3 — Medium / Standard (Half day to 1 day work · 30 Dragon DMG)</option>
                      <option value="5">5 — Large / Major (Multi-day core work · 50 Dragon DMG)</option>
                    </select>
                  </label>
                </div>
              </fieldset>

              <fieldset className="task-form-section">
                <legend>3. Assignment &amp; Peer Verification</legend>
                <div className="project-field-grid">
                  <label><span>Task Owner</span><select value={taskOwner} onChange={(event) => { setTaskOwner(event.target.value); if (taskReviewerId === event.target.value) setTaskReviewerId(""); }}><option value="__open">Open for claiming</option><option value="__unassigned">Unassigned until allocation</option>{workspace.members.map((member) => <option key={member.profileId} value={member.profileId}>{member.displayName}</option>)}</select></label>
                  <label><span>Peer Reviewer <small>Member who checks evidence before task completion.</small></span><select value={taskReviewerId} onChange={(event) => setTaskReviewerId(event.target.value)}><option value="">Owner chooses reviewer later</option>{workspace.members.filter((member) => member.profileId !== taskOwner).map((member) => { const load = reviewerLoadById.get(member.profileId) ?? 0; return <option key={member.profileId} value={member.profileId}>{member.displayName} · {load}/{workspace.fairReviewCapacity} reviews</option>; })}</select></label>
                  <label className="project-field-wide"><span>Required Skills <small>Auto-suggested from team profile skills.</small></span><input value={taskSkills} onChange={(event) => setTaskSkills(event.target.value)} placeholder="e.g. 3D Modeling, Blender, Animation" /></label>
                </div>
              </fieldset>

              <div className="task-form-actions"><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : editingTaskId ? "Update Task" : "Create Task"}</button><button className="quiet-button" type="button" onClick={() => { resetTaskForm(); setShowTaskForm(false); }}>Cancel</button></div>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
