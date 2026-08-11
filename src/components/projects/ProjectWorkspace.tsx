import { useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";
import { ProjectGameProgress } from "../game/ProjectGameProgress";
import { BattleScene } from "../game/BattleScene";
import { AllocationWorkbench } from "./AllocationWorkbench";
import {
  AIPlanningAssistant,
  type AiMilestoneSuggestion,
  type AiTaskSuggestion,
} from "./AIPlanningAssistant";
import { TaskEvidencePanel } from "./TaskEvidencePanel";
import { ProjectTeamMembers } from "./ProjectTeamMembers";

type ProjectWorkspaceProps = {
  projectId: Id<"projects">;
  onClose: () => void;
  initialTab?: ProjectTab;
};

type TaskStatus = "todo" | "in_progress" | "blocked" | "review" | "completed" | "submitted" | "changes_requested" | "verified";
export type ProjectTab = "overview" | "tasks" | "members" | "review" | "battle" | "plan" | "report" | "settings";

const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "submitted", label: "Submitted" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "verified", label: "Verified" },
];
const PROJECT_TABS: { value: ProjectTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "tasks", label: "Team Tasks" },
  { value: "members", label: "Team Members" },
  { value: "review", label: "Peer Review" },
  { value: "battle", label: "Battle" },
];

function durationDays(startDate: string, dueDate: string) {
  if (!startDate || !dueDate) {
    return 0;
  }

  const milliseconds = Date.parse(`${dueDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`);
  return Math.round(milliseconds / 86_400_000);
}

export function ProjectWorkspace({ projectId, onClose, initialTab = "overview" }: ProjectWorkspaceProps) {
  const workspace = useQuery(api.tasks.getWorkspace, { projectId });

  if (workspace === undefined) {
    return (
      <section className="project-workspace project-workspace-loading" aria-busy="true">
        <p>Opening the project plan…</p>
      </section>
    );
  }

  return <ProjectWorkspaceReady workspace={workspace} onClose={onClose} initialTab={initialTab} />;
}

type ReadyWorkspace = FunctionReturnType<typeof api.tasks.getWorkspace>;

function ProjectWorkspaceReady({
  workspace,
  onClose,
  initialTab,
}: {
  workspace: ReadyWorkspace;
  onClose: () => void;
  initialTab: ProjectTab;
}) {
  const createMilestone = useMutation(api.tasks.createMilestone);
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const setProjectArchived = useMutation(api.projects.setArchived);
  const launchProject = useMutation(api.projects.launch);
  const claimTask = useMutation(api.tasks.claimTask);
  const [activeTab, setActiveTab] = useState<ProjectTab>(initialTab);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<Id<"tasks"> | null>(null);
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState<Id<"tasks"> | null>(null);
  const [taskActionsId, setTaskActionsId] = useState<Id<"tasks"> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openEvidenceTaskId, setOpenEvidenceTaskId] = useState<Id<"tasks"> | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");
  const [milestonePhaseId, setMilestonePhaseId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPhaseId, setTaskPhaseId] = useState("");
  const [taskMilestoneId, setTaskMilestoneId] = useState("");
  const [taskOwnerId, setTaskOwnerId] = useState("");
  const [collaboratorIds, setCollaboratorIds] = useState<Set<string>>(new Set());
  const [requiredSkills, setRequiredSkills] = useState("");
  const [estimatedEffort, setEstimatedEffort] = useState("4");
  const [difficulty, setDifficulty] = useState("2");
  const [weight, setWeight] = useState("1");
  const [damage, setDamage] = useState("20");
  const [isOpenForClaiming, setIsOpenForClaiming] = useState(false);
  const [collaboratorCanSubmit, setCollaboratorCanSubmit] = useState(false);
  const [required, setRequired] = useState(true);
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [dependencyIds, setDependencyIds] = useState<Set<string>>(new Set());
  const [requiresReview, setRequiresReview] = useState(false);
  const [reviewerId, setReviewerId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberNameById = useMemo(
    () => new Map(workspace.members.map((member) => [member.profileId, member.displayName])),
    [workspace.members],
  );
  const phaseNameById = useMemo(
    () => new Map(workspace.phases.map((phase) => [phase._id, phase.title])),
    [workspace.phases],
  );
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workspace.tasks.filter((task) => {
      const matchesSearch =
        query.length === 0 ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        (task.requiredSkills ?? []).some((skill) => skill.toLowerCase().includes(query));
      return (
        matchesSearch &&
        (statusFilter === "all" || task.status === statusFilter) &&
        (ownerFilter === "all" || task.primaryOwnerProfileId === ownerFilter) &&
        (phaseFilter === "all" || task.phaseId === phaseFilter)
      );
    });
  }, [ownerFilter, phaseFilter, search, statusFilter, workspace.tasks]);
  const longTask = durationDays(taskStartDate, taskDueDate) > 14;
  const effectivePhaseId = taskPhaseId || workspace.phases[0]?._id || "";
  const effectiveOwnerId =
    taskOwnerId ||
    (workspace.members.some((member) => member.profileId === workspace.currentProfileId)
      ? workspace.currentProfileId
      : workspace.members[0]?.profileId) ||
    "";

  function resetTaskForm() {
    setTaskTitle("");
    setTaskDescription("");
    setTaskPhaseId("");
    setTaskMilestoneId("");
    setTaskOwnerId("");
    setCollaboratorIds(new Set());
    setRequiredSkills("");
    setEstimatedEffort("4");
    setDifficulty("2");
    setWeight("1");
    setDamage("20");
    setIsOpenForClaiming(workspace.project.allocationStrategy === "self_selection");
    setCollaboratorCanSubmit(false);
    setRequired(true);
    setTaskStartDate("");
    setTaskDueDate("");
    setDependencyIds(new Set());
    setRequiresReview(false);
    setReviewerId("");
    setEditingTaskId(null);
  }

  function startEditingTask(task: ReadyWorkspace["tasks"][number]) {
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskPhaseId(task.phaseId);
    setTaskMilestoneId(task.milestoneId ?? "");
    setTaskOwnerId(task.primaryOwnerProfileId);
    setCollaboratorIds(new Set(task.collaboratorProfileIds));
    setRequiredSkills((task.requiredSkills ?? []).join(", "));
    setEstimatedEffort(String(task.estimatedEffortHours ?? 1));
    setDifficulty(String(task.difficulty ?? 1));
    setWeight(String(task.weight));
    setDamage(String(task.damage ?? ((task.difficulty ?? 1) <= 1 ? 10 : task.difficulty === 2 ? 20 : 30)));
    setIsOpenForClaiming(task.isOpenForClaiming ?? false);
    setCollaboratorCanSubmit(task.collaboratorCanSubmit ?? false);
    setRequired(task.required);
    setTaskStartDate(task.startDate);
    setTaskDueDate(task.dueDate);
    setDependencyIds(new Set(task.dependencyTaskIds ?? []));
    setRequiresReview(task.requiresReview);
    setReviewerId(
      task.reviewerProfileId === task.primaryOwnerProfileId
        ? ""
        : (task.reviewerProfileId ?? ""),
    );
    setEditingTaskId(task._id);
    setShowTaskForm(true);
    setDeleteConfirmTaskId(null);
    setError(null);
  }

  function applyAiMilestone(milestone: AiMilestoneSuggestion) {
    setMilestoneTitle(milestone.title);
    setMilestoneDescription(milestone.description);
    setMilestoneDueDate(milestone.dueDate);
    setMilestonePhaseId(milestone.phaseId);
    setShowMilestoneForm(true);
    setError(null);
  }

  function applyAiTask(task: AiTaskSuggestion) {
    resetTaskForm();
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskPhaseId(task.phaseId);
    setTaskOwnerId(task.primaryOwnerProfileId);
    setCollaboratorIds(new Set(task.collaboratorProfileIds));
    setRequiredSkills(task.requiredSkills.join(", "));
    setEstimatedEffort(String(task.estimatedEffortHours));
    setDifficulty(String(task.difficulty));
    setWeight(String(task.weight));
    setDamage(String(task.difficulty <= 1 ? 10 : task.difficulty === 2 ? 20 : 30));
    setRequired(task.required);
    setTaskStartDate(task.startDate);
    setTaskDueDate(task.dueDate);
    setRequiresReview(task.requiresReview);
    setReviewerId(task.reviewerProfileId ?? "");
    setShowTaskForm(true);
    setError(null);
  }

  async function handleMilestoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await createMilestone({
        projectId: workspace.project._id,
        phaseId: milestonePhaseId ? (milestonePhaseId as Id<"phases">) : undefined,
        title: milestoneTitle,
        description: milestoneDescription,
        dueDate: milestoneDueDate,
      });
      setMilestoneTitle("");
      setMilestoneDescription("");
      setMilestoneDueDate("");
      setMilestonePhaseId("");
      setShowMilestoneForm(false);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The milestone could not be created."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!effectivePhaseId || !effectiveOwnerId) {
      setError("This project needs at least one phase and project member.");
      return;
    }

    setIsSaving(true);

    try {
      const taskInput = {
        phaseId: effectivePhaseId as Id<"phases">,
        milestoneId: taskMilestoneId ? (taskMilestoneId as Id<"milestones">) : undefined,
        title: taskTitle,
        description: taskDescription,
        primaryOwnerProfileId: effectiveOwnerId as Id<"userProfiles">,
        collaboratorProfileIds: [...collaboratorIds] as Id<"userProfiles">[],
        requiredSkills: requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        estimatedEffortHours: Number(estimatedEffort),
        difficulty: Number(difficulty),
        weight: Number(weight),
        damage: Number(damage),
        isOpenForClaiming,
        collaboratorCanSubmit,
        required,
        startDate: taskStartDate,
        dueDate: taskDueDate,
        dependencyTaskIds: [...dependencyIds] as Id<"tasks">[],
        requiresReview,
        reviewerProfileId:
          requiresReview && reviewerId
            ? (reviewerId as Id<"userProfiles">)
            : undefined,
      };

      if (editingTaskId) {
        await updateTask({ taskId: editingTaskId, ...taskInput });
      } else {
        await createTask({ projectId: workspace.project._id, ...taskInput });
      }

      resetTaskForm();
      setShowTaskForm(false);
    } catch (caughtError) {
      setError(
        getErrorMessage(
          caughtError,
          editingTaskId
            ? "The task could not be updated."
            : "The task could not be created.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTask(taskId: Id<"tasks">) {
    setError(null);
    setIsSaving(true);

    try {
      await deleteTask({ taskId });
      setDeleteConfirmTaskId(null);

      if (editingTaskId === taskId) {
        resetTaskForm();
        setShowTaskForm(false);
      }
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The task could not be deleted."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(taskId: Id<"tasks">, status: TaskStatus) {
    setError(null);

    try {
      await updateTaskStatus({ taskId, status });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The task status could not be changed."));
    }
  }

  async function handleArchiveChange(archived: boolean) {
    setError(null);
    setIsArchiving(true);

    try {
      await setProjectArchived({ projectId: workspace.project._id, archived });
      setConfirmArchive(false);
    } catch (caughtError) {
      setError(
        getErrorMessage(
          caughtError,
          archived ? "The project could not be archived." : "The project could not be restored.",
        ),
      );
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleLaunch() {
    setError(null);
    setIsSaving(true);
    try {
      await launchProject({ projectId: workspace.project._id });
      setActiveTab("battle");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The project could not be launched."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClaim(taskId: Id<"tasks">) {
    setError(null);
    try {
      await claimTask({ taskId });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The task could not be claimed."));
    }
  }

  function startLongPress(taskId: Id<"tasks">) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => setTaskActionsId(taskId), 550);
  }

  function cancelLongPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }

  return (
    <section className="project-workspace" aria-labelledby="open-project-title">
      <header className="open-project-header">
        <div>
          <p className="kicker">Open project</p>
          <h2 id="open-project-title">{workspace.project.title}</h2>
          <p>
            {workspace.project.startDate} → {workspace.project.deadline} · {workspace.project.frameworkName}
          </p>
        </div>
        <div className="project-header-actions">
          <button className="quiet-button" type="button" onClick={onClose}>
            Close project
          </button>
        </div>
      </header>

      {workspace.project.status === "archived" ? (
        <div className="archived-project-notice" role="status">
          <strong>This project is archived and read-only.</strong>
          <span>Restore it when the team needs to continue editing.</span>
        </div>
      ) : null}

      <nav className="project-tabs" aria-label="Project sections">
        {PROJECT_TABS.map((tab) => (
          <button key={tab.value} className={activeTab === tab.value ? "is-active" : ""} type="button" onClick={() => setActiveTab(tab.value)}>
            {tab.label}
          </button>
        ))}
      </nav>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      {activeTab === "overview" ? <>
        <div className="overview-compact-actions">
          <button className="quiet-button" type="button" onClick={() => setBriefOpen(true)}>View brief</button>
          {workspace.canManageProject ? <button className="quiet-button" type="button" onClick={() => setActiveTab("settings")}>Project settings</button> : null}
        </div>
        {workspace.isLaunched ? (
          <BattleScene projectId={workspace.project._id} />
        ) : (
          <ProjectGameProgress
            projectTitle={workspace.project.title}
            status={workspace.project.status}
            tasks={workspace.tasks}
            milestones={workspace.milestones}
          />
        )}
        {workspace.project.status === "completed" ? (
          <section className="project-completion-card" aria-labelledby="project-complete-title">
            <p className="card-eyebrow">Project complete</p>
            <h3 className="display-heading" id="project-complete-title">Your team defeated the project boss!</h3>
            <p>Every required task is complete. Evidence, reviews, combat history, and the report stay preserved when you close the project.</p>
            <div><button className="primary-button" type="button" onClick={() => setActiveTab("report")}>View report</button>{workspace.canManageProject ? <button className="secondary-button" type="button" disabled={isArchiving} onClick={() => void handleArchiveChange(true)}>Archive / close project</button> : null}<button className="quiet-button" type="button" onClick={onClose}>Start new project</button></div>
          </section>
        ) : null}
        <section className="next-action-card" aria-labelledby="next-action-title">
          <p className="card-eyebrow">Next action</p>
          {!workspace.isLaunched ? (
            <>
              <h3 id="next-action-title">{workspace.project.setupMode === "ai" ? "Build the team’s AI task draft" : "Create the team task plan"}</h3>
              <p>{workspace.members.length} {workspace.members.length === 1 ? "member has" : "members have"} added planning preferences. Nothing becomes active until the plan is confirmed.</p>
              {workspace.canManageProject ? <button className={workspace.project.setupMode === "ai" ? "ai-action-button" : "primary-button"} type="button" onClick={() => setActiveTab("plan")}>{workspace.project.setupMode === "ai" ? "Generate task plan" : "Create tasks"}</button> : <span className="waiting-label">Waiting for the room owner to confirm the plan</span>}
            </>
          ) : workspace.tasks.some((task) => task.primaryOwnerProfileId !== workspace.currentProfileId && ["submitted", "review"].includes(task.status)) ? (
            <><h3 id="next-action-title">A teammate is waiting for your review</h3><p>Review the submitted evidence before any boss damage is applied.</p><button className="primary-button" type="button" onClick={() => setActiveTab("review")}>Open peer review</button></>
          ) : workspace.tasks.some((task) => task.primaryOwnerProfileId === workspace.currentProfileId && task.status !== "verified") ? (
            <><h3 id="next-action-title">Continue your assigned work</h3><p>Open My Tasks from the Projects menu for your focused task view.</p><button className="primary-button" type="button" onClick={() => setActiveTab("tasks")}>View team tasks</button></>
          ) : (
            <><h3 id="next-action-title">Watch the team’s progress</h3><p>Verified tasks deal damage once and appear in the realtime combat log.</p><button className="primary-button" type="button" onClick={() => setActiveTab("battle")}>Open battle</button></>
          )}
        </section>
        {briefOpen ? (
          <div className="brief-drawer-backdrop" role="presentation" onClick={() => setBriefOpen(false)}>
            <aside className="brief-drawer" role="dialog" aria-modal="true" aria-labelledby="project-brief-title" onClick={(event) => event.stopPropagation()}>
              <button className="guided-back-link" type="button" onClick={() => setBriefOpen(false)}>Close</button>
              <p className="kicker">Project brief</p><h3 className="display-heading" id="project-brief-title">{workspace.project.title}</h3>
              <dl><div><dt>Deadline</dt><dd>{workspace.project.deadline}</dd></div><div><dt>Framework</dt><dd>{workspace.project.frameworkName}</dd></div></dl>
              <p>{workspace.project.description || "No brief has been added."}</p>
              <ol className="brief-phase-list">{workspace.phases.map((phase) => <li key={phase._id}><strong>{phase.title}</strong><span>{phase.description}</span></li>)}</ol>
            </aside>
          </div>
        ) : null}
      </> : null}

      {activeTab === "plan" ? (
        <section className="planning-route" aria-labelledby="planning-route-title">
          <button className="guided-back-link" type="button" onClick={() => setActiveTab("overview")}>← Back to overview</button>
          <p className="kicker">{workspace.project.setupMode === "ai" ? "AI-assisted allocation" : "Manual allocation"}</p>
          <h3 className="display-heading" id="planning-route-title">{workspace.project.setupMode === "ai" ? "Review an AI suggested plan" : "Create the project task plan"}</h3>
          {workspace.project.setupMode === "ai" ? (
            <AIPlanningAssistant workspace={workspace} onUseMilestone={applyAiMilestone} onUseTask={(task) => { applyAiTask(task); setActiveTab("tasks"); }} />
          ) : (
            <><p>Create tasks with owners, reviewers, difficulty, damage, and deadline. Advanced task details stay inside each task form.</p><button className="primary-button" type="button" onClick={() => { setShowTaskForm(true); setActiveTab("tasks"); }}>Create tasks</button></>
          )}
          <details className="planning-workload-details"><summary>Review workload balance</summary><AllocationWorkbench workspace={workspace} /></details>
        </section>
      ) : null}

      {activeTab === "tasks" ? <><div className="project-plan-actions">
        <button
          className="secondary-button"
          type="button"
          disabled={!workspace.canWrite}
          onClick={() => setShowMilestoneForm((current) => !current)}
        >
          {showMilestoneForm ? "Close milestone form" : "Add milestone"}
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={!workspace.canWrite}
          onClick={() => {
            if (showTaskForm) {
              resetTaskForm();
              setShowTaskForm(false);
            } else {
              resetTaskForm();
              setShowTaskForm(true);
            }
          }}
        >
          {showTaskForm ? "Close task form" : "Add task"}
        </button>
      </div>

      {showMilestoneForm ? (
        <form className="compact-plan-form" onSubmit={handleMilestoneSubmit}>
          <h3>Create milestone</h3>
          <div className="project-field-grid">
            <label>
              <span>Milestone title</span>
              <input required maxLength={100} value={milestoneTitle} onChange={(event) => setMilestoneTitle(event.target.value)} />
            </label>
            <label>
              <span>Due date</span>
              <input required type="date" min={workspace.project.startDate} max={workspace.project.deadline} value={milestoneDueDate} onChange={(event) => setMilestoneDueDate(event.target.value)} />
            </label>
            <label>
              <span>Phase (optional)</span>
              <select value={milestonePhaseId} onChange={(event) => setMilestonePhaseId(event.target.value)}>
                <option value="">Whole project</option>
                {workspace.phases.map((phase) => <option key={phase._id} value={phase._id}>{phase.title}</option>)}
              </select>
            </label>
            <label className="project-field-wide">
              <span>Description</span>
              <input maxLength={800} value={milestoneDescription} onChange={(event) => setMilestoneDescription(event.target.value)} />
            </label>
          </div>
          <button className="secondary-button" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Create milestone"}</button>
        </form>
      ) : null}

      {showTaskForm ? (
        <form className="compact-plan-form task-create-form" onSubmit={handleTaskSubmit}>
          <div className="task-form-heading">
            <div>
              <p className="card-eyebrow">{editingTaskId ? "Editing saved task" : "New task"}</p>
              <h3>{editingTaskId ? "Update task" : "Create task"}</h3>
            </div>
            {editingTaskId ? (
              <button
                className="quiet-button"
                type="button"
                onClick={() => {
                  resetTaskForm();
                  setShowTaskForm(false);
                }}
              >
                Cancel editing
              </button>
            ) : null}
          </div>
          <div className="project-field-grid">
            <label className="project-field-wide">
              <span>Task title</span>
              <input required maxLength={120} value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
            </label>
            <label className="project-field-wide">
              <span>Description</span>
              <textarea maxLength={1500} value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} />
            </label>
            <label>
              <span>Phase</span>
              <select value={effectivePhaseId} onChange={(event) => setTaskPhaseId(event.target.value)}>
                {workspace.phases.map((phase) => <option key={phase._id} value={phase._id}>{phase.title}</option>)}
              </select>
            </label>
            <label>
              <span>Milestone (optional)</span>
              <select value={taskMilestoneId} onChange={(event) => setTaskMilestoneId(event.target.value)}>
                <option value="">No milestone</option>
                {workspace.milestones.map((milestone) => <option key={milestone._id} value={milestone._id}>{milestone.title}</option>)}
              </select>
            </label>
            <label>
              <span>Primary owner</span>
              <select value={effectiveOwnerId} onChange={(event) => {
                setTaskOwnerId(event.target.value);
                if (reviewerId === event.target.value) setReviewerId("");
              }}>
                {workspace.members.map((member) => <option key={member.profileId} value={member.profileId}>{member.displayName}</option>)}
              </select>
            </label>
            <label className="inline-check-field">
              <input type="checkbox" checked={isOpenForClaiming} onChange={(event) => setIsOpenForClaiming(event.target.checked)} />
              <span>Open for claiming</span>
            </label>
            <label>
              <span>Progress weight</span>
              <input required type="number" min="0.5" max="100" step="0.5" value={weight} onChange={(event) => setWeight(event.target.value)} />
            </label>
            <label>
              <span>Start date</span>
              <input required type="date" min={workspace.project.startDate} max={workspace.project.deadline} value={taskStartDate} onChange={(event) => setTaskStartDate(event.target.value)} />
            </label>
            <label>
              <span>Due date</span>
              <input required type="date" min={taskStartDate || workspace.project.startDate} max={workspace.project.deadline} value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} />
            </label>
          </div>

          {longTask ? (
            <p className="long-task-guidance" role="status">
              This task spans more than 14 days. Consider splitting it into smaller checkpoints, but you can still create it as planned.
            </p>
          ) : null}

          <div className="task-option-grid">
            <fieldset>
              <legend>Collaborators</legend>
              {workspace.members.filter((member) => member.profileId !== effectiveOwnerId).map((member) => (
                <label key={member.profileId}>
                  <input type="checkbox" checked={collaboratorIds.has(member.profileId)} onChange={(event) => setCollaboratorIds((current) => {
                    const next = new Set(current);
                    if (event.target.checked) next.add(member.profileId); else next.delete(member.profileId);
                    return next;
                  })} />
                  {member.displayName}
                </label>
              ))}
            </fieldset>
          </div>

          <div className="task-review-row">
            <label>
              <input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} />
              Required task (counts toward progress)
            </label>
            <label>
              <input type="checkbox" checked={requiresReview} onChange={(event) => {
                setRequiresReview(event.target.checked);
                if (!event.target.checked) setReviewerId("");
              }} />
              Requires peer review
            </label>
            {requiresReview ? (
              <label>
                <span>Preferred reviewer (optional)</span>
                <select value={reviewerId} onChange={(event) => setReviewerId(event.target.value)}>
                  <option value="">Open to any teammate</option>
                  {workspace.members.filter((member) => member.profileId !== effectiveOwnerId).map((member) => <option key={member.profileId} value={member.profileId}>{member.displayName}</option>)}
                </select>
              </label>
            ) : null}
            <label>
              <input type="checkbox" checked={collaboratorCanSubmit} onChange={(event) => setCollaboratorCanSubmit(event.target.checked)} />
              Allow collaborators to add evidence
            </label>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "1rem" }}>
            <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? "Saving task…" : editingTaskId ? "Save task changes" : "Create task"}</button>
            {editingTaskId ? (
              <button
                className="secondary-button danger-button"
                type="button"
                disabled={isSaving}
                onClick={() => void handleDeleteTask(editingTaskId)}
              >
                Delete task
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <section className="milestone-board" aria-labelledby="milestone-title">
        <div className="project-list-heading">
          <div>
            <p className="card-eyebrow">Milestones</p>
            <h3 id="milestone-title">{workspace.milestones.length} {workspace.milestones.length === 1 ? "checkpoint" : "checkpoints"}</h3>
          </div>
        </div>
        {workspace.milestones.length === 0 ? <p>No milestones yet.</p> : (
          <div className="milestone-card-grid">
            {workspace.milestones.map((milestone) => (
              <article key={milestone._id} className={milestone.status === "completed" ? "is-completed" : ""}>
                <span>{milestone.status}</span>
                <h4>{milestone.title}</h4>
                <p>{milestone.dueDate} · {milestone.requiredTaskIds.length} linked tasks</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="task-board" aria-labelledby="task-board-title">
        <div className="project-list-heading">
          <div>
            <p className="card-eyebrow">Tasks / quests</p>
            <h3 id="task-board-title">{workspace.tasks.length} planned tasks</h3>
          </div>
        </div>
        <div className="task-filters">
          <label><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks or skills" /></label>
          <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{TASK_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
          <label><span>Owner</span><select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}><option value="all">All owners</option>{workspace.members.map((member) => <option key={member.profileId} value={member.profileId}>{member.displayName}</option>)}</select></label>
          <label><span>Phase</span><select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}><option value="all">All phases</option>{workspace.phases.map((phase) => <option key={phase._id} value={phase._id}>{phase.title}</option>)}</select></label>
        </div>
        {filteredTasks.length === 0 ? <div className="project-empty"><strong>No matching tasks.</strong><p>Create a task or change the filters.</p></div> : (
          <div className="task-card-grid" aria-live="polite">
            {filteredTasks.map((task) => (
              <article
                key={task._id}
                className={`task-card task-${task.status}`}
                onDoubleClick={() => setTaskActionsId((current) => current === task._id ? null : task._id)}
                onPointerDown={() => startLongPress(task._id)}
                onPointerUp={cancelLongPress}
                onPointerLeave={cancelLongPress}
                onPointerCancel={cancelLongPress}
              >
                <div className="task-card-topline">
                  <span>{phaseNameById.get(task.phaseId)}</span>
                </div>
                <h4>{task.title}</h4>
                <p>{task.description || "No description."}</p>
                <dl>
                  <div><dt>Owner</dt><dd>{task.isOpenForClaiming ? "Open for claiming" : memberNameById.get(task.primaryOwnerProfileId)}</dd></div>
                  <div><dt>Reviewer</dt><dd>{task.reviewerProfileId ? memberNameById.get(task.reviewerProfileId) : "Not required"}</dd></div>
                  <div><dt>Dates</dt><dd>{task.startDate} → {task.dueDate}</dd></div>
                </dl>
                {["submitted", "review", "changes_requested", "verified"].includes(task.status) ? (
                  <div className="task-status-control"><span>Status</span><strong className={`review-state review-${task.status}`}>{TASK_STATUSES.find((status) => status.value === task.status)?.label ?? task.status}</strong></div>
                ) : (
                  <label className="task-status-control">
                    <span>Status</span>
                    <select disabled={!workspace.canWrite || (!workspace.isTeamOwner && task.primaryOwnerProfileId !== workspace.currentProfileId) || task.isOpenForClaiming} value={task.status} onChange={(event) => void handleStatusChange(task._id, event.target.value as TaskStatus)}>
                      <option value="todo">To do</option><option value="in_progress">In progress</option>
                      {task.status === "blocked" ? <option value="blocked">Blocked (legacy)</option> : null}
                      {!task.requiresReview ? <option value="completed">Completed</option> : null}
                    </select>
                  </label>
                )}
                {task.isOpenForClaiming ? <button className="primary-button" type="button" onClick={() => void handleClaim(task._id)}>Claim task</button> : null}
                {workspace.canWrite && (workspace.isTeamOwner || (!workspace.isLaunched && task.createdByProfileId === workspace.currentProfileId)) && taskActionsId === task._id ? (
                  <div className="task-card-actions">
                    <button
                      className="quiet-button"
                      type="button"
                      onClick={() => startEditingTask(task)}
                    >
                      Edit task
                    </button>
                    {deleteConfirmTaskId === task._id ? (
                      <div className="task-delete-confirm" role="group" aria-label={`Confirm deletion of ${task.title}`}>
                        <span>Delete permanently?</span>
                        <button
                          className="danger-button"
                          type="button"
                          disabled={isSaving}
                          onClick={() => void handleDeleteTask(task._id)}
                        >
                          Confirm delete
                        </button>
                        <button
                          className="quiet-button"
                          type="button"
                          onClick={() => setDeleteConfirmTaskId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => setDeleteConfirmTaskId(task._id)}
                      >
                        Delete task
                      </button>
                    )}
                  </div>
                ) : null}
                {workspace.canWrite && (workspace.isTeamOwner || (!workspace.isLaunched && task.createdByProfileId === workspace.currentProfileId)) && taskActionsId !== task._id ? <small className="task-action-hint">Double-click or long-press for task actions</small> : null}
                <button
                  className="evidence-toggle-button"
                  type="button"
                  aria-expanded={openEvidenceTaskId === task._id}
                  onClick={() =>
                    setOpenEvidenceTaskId((current) =>
                      current === task._id ? null : task._id,
                    )
                  }
                >
                  {openEvidenceTaskId === task._id
                    ? "Close evidence & review"
                    : "Evidence & review"}
                </button>
                {openEvidenceTaskId === task._id ? (
                  <TaskEvidencePanel
                    taskId={task._id}
                    taskTitle={task.title}
                    taskStatus={task.status}
                    requiresReview={task.requiresReview}
                    reviewerName={
                      task.reviewerProfileId
                        ? memberNameById.get(task.reviewerProfileId)
                        : undefined
                    }
                  />
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section></> : null}

      {activeTab === "members" ? <ProjectTeamMembers projectId={workspace.project._id} /> : null}

      {activeTab === "review" ? (
        <section className="evidence-workspace peer-review-page" aria-labelledby="peer-review-title">
          <div className="project-list-heading"><div><p className="card-eyebrow">Peer review</p><h3 id="peer-review-title">Waiting for me</h3></div></div>
          {workspace.tasks.filter((task) => task.primaryOwnerProfileId !== workspace.currentProfileId && ["submitted", "review"].includes(task.status)).length === 0 ? <div className="project-empty"><strong>No reviews are waiting.</strong><p>Submitted work from teammates will appear here.</p></div> : workspace.tasks.filter((task) => task.primaryOwnerProfileId !== workspace.currentProfileId && ["submitted", "review"].includes(task.status)).map((task) => (
            <article key={task._id} className="evidence-task-row">
              <TaskEvidencePanel taskId={task._id} taskTitle={task.title} taskStatus={task.status} requiresReview={task.requiresReview} reviewerName={task.reviewerProfileId ? memberNameById.get(task.reviewerProfileId) : undefined} />
            </article>
          ))}
          <div className="project-list-heading"><div><p className="card-eyebrow">History</p><h3>Completed reviews</h3></div></div>
          {workspace.tasks.filter((task) => task.status === "verified").map((task) => <article key={task._id} className="evidence-task-row is-complete"><div><strong>{task.title}</strong><span>Verified · {task.damage ?? 20} boss damage applied</span></div></article>)}
        </section>
      ) : null}

      {activeTab === "battle" ? workspace.isLaunched ? <BattleScene projectId={workspace.project._id} /> : <section className="guarded-route"><p className="kicker">Battle locked</p><h3 className="display-heading">Confirm the task plan first</h3><p>The boss battle starts only after tasks and reviewers are ready.</p>{workspace.canManageProject ? <button className="primary-button" type="button" onClick={() => setActiveTab("plan")}>Finish project setup</button> : <button className="quiet-button" type="button" onClick={() => setActiveTab("overview")}>Back to overview</button>}</section> : null}

      {activeTab === "report" ? <section className="project-info-panel"><button className="guided-back-link" type="button" onClick={() => setActiveTab("settings")}>← Back to settings</button><p className="card-eyebrow">Project report</p><h3>{workspace.project.title} summary</h3><p>{workspace.tasks.filter((task) => task.status === "verified" || task.status === "completed").length} of {workspace.tasks.length} {workspace.tasks.length === 1 ? "task" : "tasks"} verified or completed.</p><button className="secondary-button" type="button" onClick={() => window.print()}>Export / print report</button></section> : null}

      {activeTab === "settings" ? <section className="project-info-panel"><button className="guided-back-link" type="button" onClick={() => setActiveTab("overview")}>← Back to overview</button><p className="card-eyebrow">Project settings</p><h3>Launch, report, and archive</h3>{!workspace.isLaunched && workspace.canManageProject ? <button className="primary-button" type="button" disabled={isSaving} onClick={() => void handleLaunch()}>{isSaving ? "Launching…" : "Start project"}</button> : <p>{workspace.isLaunched ? "This project has launched. Verified work now deals boss damage once." : "Only the project creator or room owner can launch this project."}</p>}<div className="settings-secondary-actions"><button className="quiet-button" type="button" onClick={() => setActiveTab("report")}>Open project report</button>{workspace.canManageProject && workspace.project.status === "archived" ? <button className="secondary-button" type="button" disabled={isArchiving} onClick={() => void handleArchiveChange(false)}>{isArchiving ? "Restoring…" : "Restore project"}</button> : workspace.canManageProject && confirmArchive ? <div className="archive-confirm"><span>Make this project read-only?</span><button className="danger-button" type="button" disabled={isArchiving} onClick={() => void handleArchiveChange(true)}>{isArchiving ? "Archiving…" : "Confirm archive"}</button><button className="quiet-button" type="button" onClick={() => setConfirmArchive(false)}>Cancel</button></div> : workspace.canManageProject ? <button className="quiet-button" type="button" onClick={() => setConfirmArchive(true)}>Archive project</button> : null}</div></section> : null}
    </section>
  );
}
