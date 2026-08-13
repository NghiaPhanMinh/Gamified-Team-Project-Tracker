import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";
import { BattleScene } from "../game/BattleScene";
import { ProjectGameProgress } from "../game/ProjectGameProgress";
import { AIPlanningAssistant, type AiTaskSuggestion } from "./AIPlanningAssistant";
import { AllocationWorkbench } from "./AllocationWorkbench";
import { ProjectTeamMembers } from "./ProjectTeamMembers";
import { TaskEvidencePanel } from "./TaskEvidencePanel";
import { TaskTradePanel } from "./TaskTradePanel";
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

export type ProjectTab = "overview" | "tasks" | "daily" | "members" | "battle";

const PROJECT_TABS: { value: ProjectTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "tasks", label: "Tasks" },
  { value: "daily", label: "Daily Feed" },
  { value: "members", label: "Team Members" },
  { value: "battle", label: "Battle Scene" },
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

export function ProjectWorkspace({ projectId, onClose, initialTab = "overview" }: ProjectWorkspaceProps) {
  const workspace = useQuery(api.tasks.getWorkspace, { projectId });
  if (workspace === undefined) {
    return <section className="project-workspace project-workspace-loading" aria-busy="true"><p>Opening the project…</p></section>;
  }
  return <ProjectWorkspaceReady workspace={workspace} onClose={onClose} initialTab={initialTab} />;
}

function ProjectWorkspaceReady({ workspace, onClose, initialTab }: {
  workspace: Workspace;
  onClose: () => void;
  initialTab: ProjectTab;
}) {
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const createPhase = useMutation(api.tasks.createPhase);
  const renamePhase = useMutation(api.tasks.renamePhase);
  const claimTask = useMutation(api.tasks.claimTask);
  const acceptTask = useMutation(api.tasks.acceptTask);
  const declineTask = useMutation(api.tasks.declineTask);
  const decideCompletion = useMutation(api.evidence.decideCompletion);
  const updateBrief = useMutation(api.projects.updateBrief);
  const setProjectArchived = useMutation(api.projects.setArchived);

  const [activeTab, setActiveTab] = useState<ProjectTab>(initialTab);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<Id<"tasks"> | null>(null);
  const [openEvidenceTaskId, setOpenEvidenceTaskId] = useState<Id<"tasks"> | null>(null);
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewerFilter, setReviewerFilter] = useState("all");
  const [needsMyReview, setNeedsMyReview] = useState(false);
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

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workspace.tasks.filter((task) => {
      const matchesText = !query || `${task.title} ${task.description} ${(task.requiredSkills ?? []).join(" ")}`.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesReviewer = reviewerFilter === "all" || (reviewerFilter === "later" ? !task.reviewerProfileId : task.reviewerProfileId === reviewerFilter);
      const matchesMine = !needsMyReview || (task.reviewerProfileId === workspace.currentProfileId && ["submitted", "review"].includes(task.status));
      return matchesText && matchesStatus && matchesReviewer && matchesMine;
    });
  }, [needsMyReview, reviewerFilter, search, statusFilter, workspace.currentProfileId, workspace.tasks]);

  const completionRequests = workspace.tasks.filter((task) => task.status === "awaiting_creator");
  const requestTasks = workspace.tasks.filter((task) =>
    task.primaryOwnerProfileId === workspace.currentProfileId && task.acceptanceStatus === "pending",
  );

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

  return (
    <section className="project-workspace" aria-labelledby="open-project-title">
      <header className="open-project-header">
        <div><p className="kicker">Active project</p><h2 id="open-project-title">{workspace.project.title}</h2><p>Deadline {workspace.project.deadline} · {workspace.project.frameworkName}</p></div>
        <button className="quiet-button" type="button" onClick={onClose}>Close project</button>
      </header>

      <nav className="project-tabs" aria-label="Project sections">
        {PROJECT_TABS.map((tab) => <button key={tab.value} type="button" className={activeTab === tab.value ? "is-active" : ""} onClick={() => setActiveTab(tab.value)}>{tab.label}</button>)}
      </nav>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {isSaving ? <p className="workspace-saving" role="status">Saving changes…</p> : null}

      {activeTab === "overview" ? (
        <div className="project-overview-flow">
          <div className="overview-compact-actions">
            <button className="quiet-button" type="button" onClick={() => setBriefOpen(true)}>Project Brief</button>
            <button className="quiet-button" type="button" onClick={() => window.print()}>Project Report</button>
          </div>

          {workspace.canManageProject && completionRequests.length > 0 ? (
            <section className="completion-request-panel" aria-labelledby="completion-request-title">
              <p className="card-eyebrow">Creator action needed</p><h3 id="completion-request-title">Completion requests</h3>
              {completionRequests.map((task) => (
                <article key={task._id}>
                  <div><strong>{task.title}</strong><span>Recommended complete by {task.reviewerProfileId ? memberNameById.get(task.reviewerProfileId) : "reviewer"}</span></div>
                  <div><button className="primary-button" type="button" disabled={isSaving} onClick={() => void runAction(() => decideCompletion({ taskId: task._id, decision: "approve" }), "The task could not be completed.")}>Approve Complete</button><button className="secondary-button" type="button" disabled={isSaving} onClick={() => void runAction(() => decideCompletion({ taskId: task._id, decision: "reject" }), "The task could not be returned.")}>Return to In Progress</button></div>
                </article>
              ))}
            </section>
          ) : null}

          <ProjectGameProgress projectTitle={workspace.project.title} status={workspace.project.status} tasks={workspace.tasks.map((task) => ({ ...task, status: (task.status === "awaiting_creator" ? "review" : task.status) as Exclude<TaskStatus, "awaiting_creator"> }))} milestones={[]} />

          <details className="overview-game-section" open>
            <summary>Battle</summary>
            <p>Completed, creator-approved tasks trigger the existing combat system exactly once.</p>
            <BattleScene projectId={workspace.project._id} />
          </details>

          <details className="project-context-settings">
            <summary>Project settings and report</summary>
            <p>{workspace.tasks.filter((task) => ["completed", "verified"].includes(task.status)).length} of {workspace.tasks.length} tasks complete.</p>
            <button className="quiet-button" type="button" onClick={() => window.print()}>Export / print report</button>
            {workspace.canManageProject ? <button className="quiet-button" type="button" onClick={() => void runAction(() => setProjectArchived({ projectId: workspace.project._id, archived: workspace.project.status !== "archived" }), "The project status could not be changed.")}>{workspace.project.status === "archived" ? "Restore project" : "Archive project"}</button> : null}
          </details>
        </div>
      ) : null}

      {activeTab === "tasks" ? (
        <section className="tasks-room-tab" aria-labelledby="team-tasks-title">
          <header className="project-list-heading"><div><p className="card-eyebrow">Required project work</p><h3 id="team-tasks-title">Tasks</h3><p>Task owners attach evidence, assigned reviewers recommend completion, and the creator makes the final call.</p></div>{workspace.canManageProject ? <button className="primary-button" type="button" onClick={() => { if (showTaskForm) resetTaskForm(); setShowTaskForm((current) => !current); }}>{showTaskForm ? "Close task form" : "Add Task"}</button> : null}</header>

          {requestTasks.length > 0 ? <section className="task-request-panel"><p className="card-eyebrow">Task requests</p>{requestTasks.map((task) => <article key={task._id}><div><strong>{task.title}</strong><span>Requested by the room creator · weight {task.weight}</span></div><div><button className="primary-button" type="button" onClick={() => void runAction(() => acceptTask({ taskId: task._id }), "The task request could not be accepted.")}>Accept</button><button className="quiet-button" type="button" onClick={() => void runAction(() => declineTask({ taskId: task._id }), "The task request could not be declined.")}>Decline</button></div></article>)}</section> : null}

          {workspace.canManageProject ? <details className="phase-manager"><summary>Manage phases</summary><div className="phase-chip-editor">{workspace.phases.map((phase) => <div key={phase._id}>{renamingPhaseId === phase._id ? <form onSubmit={(event) => { event.preventDefault(); void runAction(async () => { await renamePhase({ phaseId: phase._id, title: renamePhaseName }); setRenamingPhaseId(null); }, "The phase could not be renamed."); }}><input value={renamePhaseName} onChange={(event) => setRenamePhaseName(event.target.value)} /><button type="submit" className="quiet-button">Save</button></form> : <><span>{phase.title}</span><button className="text-link" type="button" onClick={() => { setRenamingPhaseId(phase._id); setRenamePhaseName(phase.title); }}>Rename</button></>}</div>)}</div><form className="inline-phase-form" onSubmit={addPhase}><input required maxLength={100} value={newPhaseName} onChange={(event) => setNewPhaseName(event.target.value)} placeholder="New phase name" /><button className="secondary-button" type="submit">Add phase</button></form></details> : null}

          {workspace.canManageProject && workspace.project.setupMode === "ai" && workspace.tasks.length === 0 ? <AIPlanningAssistant workspace={workspace} onUseTask={useAiTask} /> : null}

          {showTaskForm && workspace.canManageProject ? (
            <form className="compact-plan-form task-create-form" onSubmit={submitTask}>
              <div className="task-form-heading"><div><p className="card-eyebrow">{editingTaskId ? "Edit task" : "New task"}</p><h3>{editingTaskId ? "Update required task" : "Create required task"}</h3></div></div>
              <div className="project-field-grid">
                <label className="project-field-wide"><span>Task Title</span><input required maxLength={120} value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} /></label>
                <label className="project-field-wide"><span>Description</span><textarea required maxLength={1500} value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} /></label>
                <label><span>Phase <small>Groups related tasks into a project stage.</small></span><select value={taskPhaseId || workspace.phases[0]?._id || ""} onChange={(event) => setTaskPhaseId(event.target.value)}>{workspace.phases.map((phase) => <option key={phase._id} value={phase._id}>{phase.title}</option>)}</select></label>
                <label><span>Owner</span><select value={taskOwner} onChange={(event) => { setTaskOwner(event.target.value); if (taskReviewerId === event.target.value) setTaskReviewerId(""); }}><option value="__open">Open for claiming</option><option value="__unassigned">Unassigned until allocation</option>{workspace.members.map((member) => <option key={member.profileId} value={member.profileId}>{member.displayName}</option>)}</select></label>
                <label><span>Task Weight <small>How much this task contributes to overall progress.</small></span><input required type="number" min="0.5" max="100" step="0.5" value={taskWeight} onChange={(event) => setTaskWeight(event.target.value)} /></label>
                <label><span>Due Date</span><input required type="date" max={workspace.project.deadline} value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} /></label>
                <label><span>Estimated effort (hours)</span><input required type="number" min="0.5" max="2000" step="0.5" value={taskEffort} onChange={(event) => setTaskEffort(event.target.value)} /></label>
                <label><span>Difficulty</span><select value={taskDifficulty} onChange={(event) => setTaskDifficulty(event.target.value)}>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}/5</option>)}</select></label>
                <label className="project-field-wide"><span>Required Skills</span><input value={taskSkills} onChange={(event) => setTaskSkills(event.target.value)} placeholder="Research, Figma, writing" /></label>
                <label><span>Peer Reviewer</span><select value={taskReviewerId} onChange={(event) => setTaskReviewerId(event.target.value)}><option value="">Owner chooses later</option>{workspace.members.filter((member) => member.profileId !== taskOwner).map((member) => { const load = reviewerLoadById.get(member.profileId) ?? 0; return <option key={member.profileId} value={member.profileId}>{member.displayName} · {load}/{workspace.fairReviewCapacity} reviews</option>; })}</select></label>
              </div>
              <p className="ai-safety-note">Every project task is required and follows peer review. Review capacity updates as assignments change.</p>
              <div className="task-form-actions"><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? "Saving…" : editingTaskId ? "Update Task" : "Create Task"}</button><button className="quiet-button" type="button" onClick={() => { resetTaskForm(); setShowTaskForm(false); }}>Cancel</button></div>
            </form>
          ) : null}

          <div className="task-filter-bar">
            <label><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Task or skill" /></label>
            <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>Reviewer</span><select value={reviewerFilter} onChange={(event) => setReviewerFilter(event.target.value)}><option value="all">All reviewers</option><option value="later">Owner chooses later</option>{workspace.members.map((member) => <option key={member.profileId} value={member.profileId}>{member.displayName}</option>)}</select></label>
            <label className="inline-check-field"><input type="checkbox" checked={needsMyReview} onChange={(event) => setNeedsMyReview(event.target.checked)} /><span>Needs My Review</span></label>
          </div>

          <TaskTradePanel projectId={workspace.project._id} />
          <details className="planning-workload-details"><summary>Review workload balance</summary><AllocationWorkbench workspace={workspace} /></details>

          {filteredTasks.length === 0 ? <div className="project-empty"><strong>No tasks match.</strong><p>Change the filters or ask the creator to add the first task.</p></div> : <div className="task-card-list">{filteredTasks.map((task) => {
            const ownerLabel = task.assignmentState === "unassigned" ? "Unassigned" : task.isOpenForClaiming ? "Open for claiming" : memberNameById.get(task.primaryOwnerProfileId) ?? "Team member";
            const reviewerLabel = task.reviewerProfileId ? memberNameById.get(task.reviewerProfileId) ?? "Reviewer" : "Owner chooses later";
            return <article key={task._id} className={`project-task-card task-${task.status}`}>
              <div className="task-card-top"><div><span className="project-status">{STATUS_LABELS[task.status as TaskStatus]}</span><small>{phaseNameById.get(task.phaseId)} · due {task.dueDate}</small></div><span className="task-weight-badge">Weight {task.weight}</span></div>
              <h4>{task.title}</h4><p>{task.description}</p>
              <dl><div><dt>Owner</dt><dd>{ownerLabel}</dd></div><div><dt>Reviewer</dt><dd>{reviewerLabel}</dd></div><div><dt>Skills</dt><dd>{(task.requiredSkills ?? []).join(", ") || "No skills specified"}</dd></div></dl>
              <div className="task-card-actions">
                {task.isOpenForClaiming ? <button className="primary-button" type="button" onClick={() => void runAction(() => claimTask({ taskId: task._id }), "The task could not be claimed.")}>Claim Task</button> : null}
                {task.primaryOwnerProfileId === workspace.currentProfileId && task.acceptanceStatus === "pending" ? <><button className="primary-button" type="button" onClick={() => void runAction(() => acceptTask({ taskId: task._id }), "The request could not be accepted.")}>Accept</button><button className="quiet-button" type="button" onClick={() => void runAction(() => declineTask({ taskId: task._id }), "The request could not be declined.")}>Decline</button></> : null}
                {task.primaryOwnerProfileId === workspace.currentProfileId && task.acceptanceStatus !== "pending" && task.status === "todo" && task.assignmentState !== "unassigned" ? <button className="secondary-button" type="button" onClick={() => void runAction(() => updateTaskStatus({ taskId: task._id, status: "in_progress" }), "The task could not be started.")}>Start Task</button> : null}
                <button className="quiet-button" type="button" onClick={() => setOpenEvidenceTaskId((current) => current === task._id ? null : task._id)}>{openEvidenceTaskId === task._id ? "Close evidence" : "Evidence & Review"}</button>
                {workspace.canManageProject ? <><button className="quiet-button" type="button" onClick={() => editTask(task)}>Edit</button><button className="danger-button" type="button" onClick={() => void runAction(() => deleteTask({ taskId: task._id }), "The task could not be deleted.")}>Delete</button></> : null}
              </div>
              {openEvidenceTaskId === task._id ? <TaskEvidencePanel taskId={task._id} taskTitle={task.title} taskStatus={task.status as TaskStatus} requiresReview reviewerName={task.reviewerProfileId ? memberNameById.get(task.reviewerProfileId) : undefined} /> : null}
            </article>;
          })}</div>}
        </section>
      ) : null}

      {activeTab === "daily" ? <DailyEvidenceFeed projectId={workspace.project._id} /> : null}

      {activeTab === "members" ? <ProjectTeamMembers projectId={workspace.project._id} /> : null}

      {activeTab === "battle" ? <BattleScene projectId={workspace.project._id} /> : null}

      {briefOpen ? <div className="brief-drawer-backdrop" role="presentation" onClick={() => setBriefOpen(false)}><aside className="brief-drawer" role="dialog" aria-modal="true" aria-labelledby="project-brief-title" onClick={(event) => event.stopPropagation()}><button className="guided-back-link" type="button" onClick={() => setBriefOpen(false)}>Close</button><p className="kicker">Project brief</p>{workspace.canManageProject ? <form onSubmit={saveBrief}><label><span>Project name</span><input required maxLength={100} value={briefTitle} onChange={(event) => setBriefTitle(event.target.value)} /></label><label><span>Deadline</span><input required type="date" value={briefDeadline} onChange={(event) => setBriefDeadline(event.target.value)} /></label><label><span>Brief</span><textarea required maxLength={8000} value={briefDescription} onChange={(event) => setBriefDescription(event.target.value)} /></label><button className="primary-button" type="submit" disabled={isSaving}>Save brief</button></form> : <><h3 className="display-heading" id="project-brief-title">{workspace.project.title}</h3><p>{workspace.project.description}</p><strong>Deadline {workspace.project.deadline}</strong></>}<ol className="brief-phase-list">{workspace.phases.map((phase) => <li key={phase._id}><strong>{phase.title}</strong><span>{phase.description}</span></li>)}</ol></aside></div> : null}
    </section>
  );
}
