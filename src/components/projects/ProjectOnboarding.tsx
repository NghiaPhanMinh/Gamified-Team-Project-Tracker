import { useMemo, useState, type FormEvent } from "react";
import { useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { BUILT_IN_FRAMEWORKS } from "../../data/frameworks";
import { getErrorMessage } from "../../lib/errors";

type ProjectOnboardingProps = {
  mode: "create" | "join";
  currentProfileId: Id<"userProfiles">;
  onCancel: () => void;
  onRoomReady: (teamId: Id<"teams">) => void;
};

type DraftTask = {
  id: string;
  title: string;
  description: string;
  phaseKey: string;
  ownerMode: "creator" | "open" | "unassigned";
  weight: number;
  dueDate: string;
  skills: string;
};

function dateAfter(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function ProjectOnboarding({
  mode,
  currentProfileId,
  onCancel,
  onRoomReady,
}: ProjectOnboardingProps) {
  const createTeam = useMutation(api.teams.create);
  const joinTeam = useMutation(api.teams.joinByCode);
  const createProject = useMutation(api.projects.create);
  const createCustomFramework = useMutation(api.customFrameworks.create);
  const [step, setStep] = useState(1);
  const [frameworkChoice, setFrameworkChoice] = useState(BUILT_IN_FRAMEWORKS[0].id);
  const [showAllFrameworks, setShowAllFrameworks] = useState(false);
  const [customFrameworkName, setCustomFrameworkName] = useState("My framework");
  const [customPhaseNames, setCustomPhaseNames] = useState("Discover, Make, Review, Deliver");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState(dateAfter(14));
  const [targetMemberCount, setTargetMemberCount] = useState("4");
  const [taskCreationMode, setTaskCreationMode] = useState<"ai" | "manual">("manual");
  const [allocationMode, setAllocationMode] = useState<"ai" | "manual" | "self_selection">("self_selection");
  const [draftTasks, setDraftTasks] = useState<DraftTask[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftPhaseKey, setDraftPhaseKey] = useState("");
  const [draftOwnerMode, setDraftOwnerMode] = useState<DraftTask["ownerMode"]>("open");
  const [draftWeight, setDraftWeight] = useState("1");
  const [draftDueDate, setDraftDueDate] = useState(deadline);
  const [draftSkills, setDraftSkills] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFramework = useMemo(() => {
    if (frameworkChoice === "custom") {
      const names = customPhaseNames.split(",").map((name) => name.trim()).filter(Boolean).slice(0, 12);
      return {
        type: "custom" as const,
        id: "custom",
        name: customFrameworkName.trim() || "My framework",
        description: "A custom workflow created for this project.",
        phases: (names.length ? names : ["Project work"]).map((name, index) => ({ key: `custom-${index + 1}`, name, description: `${name} project work.`, canOverlap: true, dependencyKeys: index ? [`custom-${index}`] : [] as string[], reviewCheckpoint: true })),
      };
    }
    if (frameworkChoice === "none") {
      return {
        type: "none" as const,
        id: "none",
        name: "Simple project",
        description: "Start with one flexible phase.",
        phases: [{ key: "project-work", name: "Project work", description: "Flexible project work.", canOverlap: true, dependencyKeys: [] as string[], reviewCheckpoint: true }],
      };
    }
    const framework = BUILT_IN_FRAMEWORKS.find((item) => item.id === frameworkChoice)!;
    return {
      type: "built_in" as const,
      id: framework.id,
      name: framework.name,
      description: framework.description,
      phases: framework.phases.map((phase) => ({
        key: phase.id,
        name: phase.name,
        description: phase.description,
        canOverlap: phase.canOverlap,
        dependencyKeys: phase.defaultDependencies,
        reviewCheckpoint: phase.reviewCheckpoint,
      })),
    };
  }, [customFrameworkName, customPhaseNames, frameworkChoice]);

  const phaseChoices = selectedFramework.phases;
  const effectiveDraftPhaseKey = draftPhaseKey || phaseChoices[0]?.key || "project-work";

  function addDraftTask() {
    if (!draftTitle.trim() || !draftDescription.trim() || !draftDueDate) {
      setError("Add a task title, description, and due date.");
      return;
    }
    if (draftDueDate > deadline) {
      setError("Task due dates must be on or before the project deadline.");
      return;
    }
    setDraftTasks((current) => [...current, {
      id: crypto.randomUUID(),
      title: draftTitle.trim(),
      description: draftDescription.trim(),
      phaseKey: effectiveDraftPhaseKey,
      ownerMode: draftOwnerMode,
      weight: Number(draftWeight),
      dueDate: draftDueDate,
      skills: draftSkills,
    }]);
    setDraftTitle("");
    setDraftDescription("");
    setDraftSkills("");
    setError(null);
  }

  function validateStep() {
    if (step === 2 && (!title.trim() || !brief.trim() || !deadline)) return "Add a project name, deadline, team size, and brief.";
    if (step === 3 && taskCreationMode === "manual" && draftTasks.length === 0) return "Add at least one task, or choose AI Generate Tasks.";
    return null;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const validationError = validateStep();
    if (validationError) { setError(validationError); return; }
    if (step < 5) { setStep((current) => current + 1); return; }

    setIsSaving(true);
    try {
      const teamId = await createTeam({ name: title.trim() });
      const customFrameworkId = selectedFramework.type === "custom"
        ? await createCustomFramework({
            teamId,
            name: selectedFramework.name,
            description: selectedFramework.description,
            phases: selectedFramework.phases.map((phase) => ({
              key: phase.key,
              name: phase.name,
              description: phase.description,
              isOptional: false,
              suggestedDeliverables: [],
              suggestedSkills: [],
              canOverlap: phase.canOverlap,
              defaultDependencyKeys: phase.dependencyKeys,
              reviewCheckpoint: phase.reviewCheckpoint,
            })),
          })
        : undefined;
      const projectId = await createProject({
        teamId,
        title: title.trim(),
        description: brief.trim(),
        deadline,
        targetMemberCount: Number(targetMemberCount),
        frameworkType: selectedFramework.type,
        builtInFrameworkId: selectedFramework.type === "built_in" ? selectedFramework.id : undefined,
        customFrameworkId,
        frameworkName: selectedFramework.name,
        phases: selectedFramework.phases,
        setupMode: taskCreationMode,
        taskCreationMode,
        allocationStrategy: allocationMode,
      });

      if (taskCreationMode === "manual") {
        // Phase IDs exist only after the project mutation. The room resolves these
        // stable framework keys and saves the reviewed task drafts immediately.
        sessionStorage.setItem(`maylamdi:draft-tasks:${projectId}`, JSON.stringify(draftTasks));
        sessionStorage.setItem(`maylamdi:draft-owner:${projectId}`, currentProfileId);
      }
      onRoomReady(teamId);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The room could not be created."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const teamId = await joinTeam({ code: joinCode });
      onRoomReady(teamId);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "That room code is not valid."));
    } finally {
      setIsSaving(false);
    }
  }

  if (mode === "join") {
    return (
      <section className="guided-flow" aria-labelledby="join-flow-title">
        <button className="guided-back-link" type="button" onClick={onCancel}>← Back</button>
        <p className="kicker">Join a project</p><h1 className="display-heading" id="join-flow-title">Enter the room code</h1>
        <form className="guided-card guided-join-card" onSubmit={handleJoin}>
          <label className="guided-code-field"><span>Room code</span><input autoFocus required minLength={6} maxLength={8} value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ABC234" /></label>
          <p>Your saved profile skills and weekly capacity will be shared with this project. You can add project availability after joining.</p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button guided-primary" type="submit" disabled={isSaving}>{isSaving ? "Joining…" : "Join Room"}</button>
        </form>
      </section>
    );
  }

  const stepLabels = ["Framework", "Brief", "Tasks", "Allocation", "Create"];
  return (
    <section className="guided-flow" aria-labelledby="create-flow-title">
      <button className="guided-back-link" type="button" onClick={step === 1 ? onCancel : () => { setStep((current) => current - 1); setError(null); }}>← Back</button>
      <ol className="guided-stepper" aria-label="Create project progress">{stepLabels.map((label, index) => <li key={label} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""}><span>{index + 1}</span><small>{label}</small></li>)}</ol>
      <form className="guided-card" onSubmit={handleCreate}>
        {step === 1 ? <><p className="kicker">Step 1 · Choose Framework</p><h1 className="display-heading" id="create-flow-title">Choose a way to work</h1><div className="framework-choice-grid">{BUILT_IN_FRAMEWORKS.slice(0, showAllFrameworks ? BUILT_IN_FRAMEWORKS.length : 3).map((framework) => <button key={framework.id} className={frameworkChoice === framework.id ? "framework-choice is-selected" : "framework-choice"} type="button" onClick={() => setFrameworkChoice(framework.id)}><strong>{framework.name}</strong><span>{framework.description.split(".")[0]}.</span><small>{framework.phases.length} phases</small></button>)}<button className={frameworkChoice === "custom" ? "framework-choice is-selected" : "framework-choice"} type="button" onClick={() => setFrameworkChoice("custom")}><strong>Custom Framework</strong><span>Name your own phase sequence.</span><small>Saved to the new room</small></button><button className={frameworkChoice === "none" ? "framework-choice is-selected" : "framework-choice"} type="button" onClick={() => setFrameworkChoice("none")}><strong>Simple / skip framework</strong><span>Use one flexible project phase.</span><small>Editable after creation</small></button></div>{frameworkChoice === "custom" ? <div className="guided-field-grid custom-framework-quick-form"><label><span>Framework name</span><input value={customFrameworkName} onChange={(event) => setCustomFrameworkName(event.target.value)} /></label><label className="guided-field-wide"><span>Phase names, separated by commas</span><input value={customPhaseNames} onChange={(event) => setCustomPhaseNames(event.target.value)} /></label></div> : null}<button className="text-link" type="button" onClick={() => setShowAllFrameworks((current) => !current)}>{showAllFrameworks ? "Show recommended" : "View all frameworks"}</button></> : null}

        {step === 2 ? <><p className="kicker">Step 2 · Project Brief</p><h1 className="display-heading" id="create-flow-title">Describe the project</h1><div className="guided-field-grid"><label><span>Project Name</span><input required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label><span>Deadline</span><input required type="date" min={dateAfter(1)} value={deadline} onChange={(event) => { setDeadline(event.target.value); setDraftDueDate(event.target.value); }} /></label><label><span>Team Size</span><select value={targetMemberCount} onChange={(event) => setTargetMemberCount(event.target.value)}>{Array.from({ length: 9 }, (_, index) => index + 2).map((size) => <option key={size} value={size}>{size} people</option>)}</select></label><label><span>Framework</span><select value={frameworkChoice} onChange={(event) => setFrameworkChoice(event.target.value)}><option value="none">Simple project</option><option value="custom">Custom Framework</option>{BUILT_IN_FRAMEWORKS.map((framework) => <option key={framework.id} value={framework.id}>{framework.name}</option>)}</select></label><label className="guided-field-wide"><span>Project Brief</span><textarea required maxLength={8000} value={brief} onChange={(event) => setBrief(event.target.value)} /></label><div className="deadline-shortcuts guided-field-wide"><button className="quiet-button" type="button" onClick={() => setDeadline(dateAfter(7))}>7 days</button><button className="quiet-button" type="button" onClick={() => setDeadline(dateAfter(14))}>14 days</button><span>Or select a custom date.</span></div></div></> : null}

        {step === 3 ? <><p className="kicker">Step 3 · Tasks</p><h1 className="display-heading" id="create-flow-title">How do you want to create the task list?</h1><div className="allocation-mode-grid"><button className={taskCreationMode === "ai" ? "allocation-mode-card ai-mode is-selected" : "allocation-mode-card ai-mode"} type="button" onClick={() => setTaskCreationMode("ai")}><strong>AI Generate Tasks</strong><span>Generate editable phases, tasks, descriptions, skills, weights, and due dates inside the new room.</span></button><button className={taskCreationMode === "manual" ? "allocation-mode-card is-selected" : "allocation-mode-card"} type="button" onClick={() => setTaskCreationMode("manual")}><strong>Manual Task Input</strong><span>Create the initial task list yourself.</span></button></div>{taskCreationMode === "manual" ? <section className="onboarding-task-builder"><div className="project-field-grid"><label className="project-field-wide"><span>Title</span><input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} /></label><label className="project-field-wide"><span>Description</span><textarea value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} /></label><label><span>Phase <small>Groups related tasks into a stage of the project.</small></span><select value={effectiveDraftPhaseKey} onChange={(event) => setDraftPhaseKey(event.target.value)}>{phaseChoices.map((phase) => <option key={phase.key} value={phase.key}>{phase.name}</option>)}</select></label><label><span>Owner</span><select value={draftOwnerMode} onChange={(event) => setDraftOwnerMode(event.target.value as DraftTask["ownerMode"])}><option value="creator">Creator</option><option value="open">Open for claiming</option><option value="unassigned">Unassigned until allocation</option></select></label><label><span>Task Weight <small>How much this task contributes to overall project progress.</small></span><input type="number" min="0.5" max="100" step="0.5" value={draftWeight} onChange={(event) => setDraftWeight(event.target.value)} /></label><label><span>Due Date</span><input type="date" max={deadline} value={draftDueDate} onChange={(event) => setDraftDueDate(event.target.value)} /></label><label className="project-field-wide"><span>Skills</span><input value={draftSkills} onChange={(event) => setDraftSkills(event.target.value)} placeholder="Figma, research" /></label><label><span>Peer Reviewer</span><select disabled><option>Owner chooses later</option></select></label></div><button className="quiet-button" type="button" onClick={addDraftTask}>Add to task list</button><div className="onboarding-draft-list">{draftTasks.map((task) => <article key={task.id}><div><strong>{task.title}</strong><small>{phaseChoices.find((phase) => phase.key === task.phaseKey)?.name} · due {task.dueDate} · weight {task.weight}</small></div><button type="button" className="text-link" onClick={() => setDraftTasks((current) => current.filter((item) => item.id !== task.id))}>Remove</button></article>)}</div></section> : <p className="ai-safety-note">The AI helper remains optional. If free providers are busy, the room opens with manual planning fully available.</p>}</> : null}

        {step === 4 ? <><p className="kicker">Step 4 · Allocation</p><h1 className="display-heading" id="create-flow-title">Choose the allocation method</h1><div className="allocation-mode-grid allocation-mode-grid-three"><button className={allocationMode === "ai" ? "allocation-mode-card ai-mode is-selected" : "allocation-mode-card ai-mode"} type="button" onClick={() => setAllocationMode("ai")}><strong>AI Suggestion</strong><span>Uses joined members’ saved skills and weekly capacity. Project availability is included only after members add it.</span></button><button className={allocationMode === "manual" ? "allocation-mode-card is-selected" : "allocation-mode-card"} type="button" onClick={() => setAllocationMode("manual")}><strong>Manual Allocation</strong><span>Assign only real members after they join.</span></button><button className={allocationMode === "self_selection" ? "allocation-mode-card is-selected" : "allocation-mode-card"} type="button" onClick={() => setAllocationMode("self_selection")}><strong>Self Selection</strong><span>Members claim open tasks first-come-first-served.</span></button></div><p className="allocation-availability-note">Allocation does not yet include project availability.</p></> : null}

        {step === 5 ? <><p className="kicker">Step 5 · Create Room</p><h1 className="display-heading" id="create-flow-title">Review and create the active room</h1><dl className="guided-summary"><div><dt>Project</dt><dd>{title}</dd></div><div><dt>Deadline</dt><dd>{deadline}</dd></div><div><dt>Team size</dt><dd>{targetMemberCount}</dd></div><div><dt>Framework</dt><dd>{selectedFramework.name}</dd></div><div><dt>Phases</dt><dd>{selectedFramework.phases.length}</dd></div><div><dt>Tasks</dt><dd>{taskCreationMode === "ai" ? "AI draft after room creation" : draftTasks.length}</dd></div><div><dt>Task creation</dt><dd>{taskCreationMode === "ai" ? "AI Generate Tasks" : "Manual Task Input"}</dd></div><div><dt>Allocation</dt><dd>{allocationMode.replace("_", " ")}</dd></div></dl><p>Creating the room starts the project immediately and reveals its invite code.</p></> : null}

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button guided-primary" type="submit" disabled={isSaving}>{isSaving ? "Creating room…" : step === 5 ? "CREATE ROOM" : step === 2 ? "Continue to Tasks" : "Continue"}</button>
      </form>
    </section>
  );
}
