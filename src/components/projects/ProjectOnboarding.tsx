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

type Preferences = {
  skills: string;
  availability: string;
  workType: string;
  workload: "low" | "medium" | "high";
  weeklyCapacity: string;
  meetingTimes: string;
};

const EMPTY_PREFERENCES: Preferences = {
  skills: "",
  availability: "",
  workType: "",
  workload: "medium",
  weeklyCapacity: "",
  meetingTimes: "",
};

function dateAfter(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function PreferenceFields({
  value,
  onChange,
}: {
  value: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
}) {
  return (
    <div className="guided-field-grid">
      <label>
        <span>Skills</span>
        <input
          required
          value={value.skills}
          onChange={(event) => onChange({ skills: event.target.value })}
          placeholder="Research, writing, illustration"
        />
      </label>
      <label>
        <span>Availability</span>
        <input
          required
          value={value.availability}
          onChange={(event) => onChange({ availability: event.target.value })}
          placeholder="Tuesday evenings, weekends"
        />
      </label>
      <label className="guided-field-wide">
        <span>Preferred type of work</span>
        <input
          required
          value={value.workType}
          onChange={(event) => onChange({ workType: event.target.value })}
          placeholder="Visual design and prototyping"
        />
      </label>
      <details className="guided-advanced guided-field-wide">
        <summary>Advanced preferences</summary>
        <div className="guided-field-grid">
          <label>
            <span>Current workload</span>
            <select
              value={value.workload}
              onChange={(event) =>
                onChange({ workload: event.target.value as Preferences["workload"] })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            <span>Weekly capacity (hours)</span>
            <input
              type="number"
              min="0"
              max="168"
              step="0.5"
              value={value.weeklyCapacity}
              onChange={(event) => onChange({ weeklyCapacity: event.target.value })}
            />
          </label>
          <label className="guided-field-wide">
            <span>Preferred meeting times</span>
            <input
              value={value.meetingTimes}
              onChange={(event) => onChange({ meetingTimes: event.target.value })}
              placeholder="Friday afternoons"
            />
          </label>
        </div>
      </details>
    </div>
  );
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
  const joinProject = useMutation(api.projects.joinLatestWithPreferences);
  const [step, setStep] = useState(1);
  const [frameworkChoice, setFrameworkChoice] = useState("none");
  const [showAllFrameworks, setShowAllFrameworks] = useState(false);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState(dateAfter(14));
  const [allocationMode, setAllocationMode] = useState<"ai" | "manual" | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(EMPTY_PREFERENCES);
  const [joinCode, setJoinCode] = useState("");
  const [joinedTeamId, setJoinedTeamId] = useState<Id<"teams"> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFramework = useMemo(() => {
    if (frameworkChoice === "none") {
      return {
        type: "none" as const,
        id: "none",
        name: "Simple project",
        description: "Skip a formal framework and organise work in one flexible phase.",
        phases: [],
      };
    }

    const framework = BUILT_IN_FRAMEWORKS.find((item) => item.id === frameworkChoice);
    return framework
      ? {
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
        }
      : null;
  }, [frameworkChoice]);

  function updatePreferences(patch: Partial<Preferences>) {
    setPreferences((current) => ({ ...current, ...patch }));
  }

  function validateCreateStep() {
    if (step === 1 && !selectedFramework) return "Choose a framework to continue.";
    if (step === 2 && (!title.trim() || !brief.trim() || !deadline)) {
      return "Add a project name, brief, and deadline to continue.";
    }
    if (step === 3 && allocationMode === null) return "Choose AI Assisted or Manual allocation.";
    if (
      step === 4 &&
      (!preferences.skills.trim() || !preferences.availability.trim() || !preferences.workType.trim())
    ) {
      return "Add your skills, availability, and preferred work type.";
    }
    return null;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const validationError = validateCreateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (step < 5) {
      setStep((current) => current + 1);
      return;
    }

    if (!selectedFramework || allocationMode === null) return;
    setIsSaving(true);
    try {
      const teamId = await createTeam({ name: title.trim() });
      await createProject({
        teamId,
        title: title.trim(),
        description: brief.trim(),
        startDate: new Date().toISOString().slice(0, 10),
        deadline,
        frameworkType: selectedFramework.type,
        builtInFrameworkId:
          selectedFramework.type === "built_in" ? selectedFramework.id : undefined,
        frameworkName: selectedFramework.name,
        phases: selectedFramework.phases,
        setupMode: allocationMode,
        members: [
          {
            profileId: currentProfileId,
            skills: preferences.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
            availability: preferences.availability,
            currentWorkload: preferences.workload,
            preferences: [preferences.workType, preferences.meetingTimes].filter(Boolean).join(" · "),
            weeklyCapacity: preferences.weeklyCapacity
              ? Number(preferences.weeklyCapacity)
              : undefined,
          },
        ],
      });
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
      if (step === 1) {
        const teamId = await joinTeam({ code: joinCode });
        setJoinedTeamId(teamId);
        setStep(2);
      } else if (joinedTeamId) {
        if (!preferences.skills.trim() || !preferences.availability.trim() || !preferences.workType.trim()) {
          setError("Add your skills, availability, and preferred work type.");
          return;
        }
        await joinProject({
          teamId: joinedTeamId,
          skills: preferences.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
          availability: preferences.availability,
          currentWorkload: preferences.workload,
          preferences: [preferences.workType, preferences.meetingTimes].filter(Boolean).join(" · "),
          weeklyCapacity: preferences.weeklyCapacity ? Number(preferences.weeklyCapacity) : undefined,
        });
        onRoomReady(joinedTeamId);
      }
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, step === 1 ? "That room code is not valid." : "Your preferences could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  if (mode === "join") {
    return (
      <section className="guided-flow" aria-labelledby="join-flow-title">
        <button className="guided-back-link" type="button" onClick={step === 1 ? onCancel : () => setStep(1)}>← Back</button>
        <p className="kicker">Join · Step {step} of 2</p>
        <h1 className="display-heading" id="join-flow-title">
          {step === 1 ? "Join a project" : "Tell your team how you work"}
        </h1>
        <form className="guided-card" onSubmit={handleJoin}>
          {step === 1 ? (
            <label className="guided-code-field">
              <span>Team / project code</span>
              <input
                autoFocus
                required
                minLength={6}
                maxLength={8}
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="ABC234"
              />
            </label>
          ) : (
            <PreferenceFields value={preferences} onChange={updatePreferences} />
          )}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button guided-primary" type="submit" disabled={isSaving}>
            {isSaving ? "Please wait…" : step === 1 ? "Join" : "Enter project"}
          </button>
        </form>
      </section>
    );
  }

  const stepLabels = ["Framework", "Project", "Allocation", "Preferences", "Create Room"];
  return (
    <section className="guided-flow" aria-labelledby="create-flow-title">
      <button className="guided-back-link" type="button" onClick={step === 1 ? onCancel : () => { setStep((current) => current - 1); setError(null); }}>← Back</button>
      <ol className="guided-stepper" aria-label="Create project progress">
        {stepLabels.map((label, index) => (
          <li key={label} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""}>
            <span>{index + 1}</span><small>{label}</small>
          </li>
        ))}
      </ol>
      <form className="guided-card" onSubmit={handleCreate}>
        {step === 1 ? (
          <>
            <p className="kicker">Step 1 · Framework</p>
            <h1 className="display-heading" id="create-flow-title">Choose a way to work</h1>
            <div className="framework-choice-grid">
              {BUILT_IN_FRAMEWORKS.slice(0, showAllFrameworks ? BUILT_IN_FRAMEWORKS.length : 3).map((framework) => (
                <button key={framework.id} className={frameworkChoice === framework.id ? "framework-choice is-selected" : "framework-choice"} type="button" onClick={() => setFrameworkChoice(framework.id)}>
                  <strong>{framework.name}</strong>
                  <span>{framework.description.split(".")[0]}.</span>
                  <small>{framework.phases.length} phases · {framework.disciplines.slice(0, 2).join(", ")}</small>
                </button>
              ))}
              <button className={frameworkChoice === "none" ? "framework-choice is-selected" : "framework-choice"} type="button" onClick={() => setFrameworkChoice("none")}>
                <strong>Simple / skip framework</strong>
                <span>Start with one flexible phase and organise tasks yourself.</span>
                <small>1 phase · Any major</small>
              </button>
            </div>
            <button className="text-link" type="button" onClick={() => setShowAllFrameworks((current) => !current)}>{showAllFrameworks ? "Show recommended only" : "View all frameworks"}</button>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="kicker">Step 2 · Project</p>
            <h1 className="display-heading" id="create-flow-title">Describe the assignment</h1>
            <div className="guided-field-grid">
              <label><span>Project name</span><input required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Prototype testing" /></label>
              <label><span>Deadline</span><input required type="date" min={dateAfter(1)} value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
              <label className="guided-field-wide"><span>Project brief</span><textarea required maxLength={8000} value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="What does your team need to make?" /></label>
              <div className="deadline-shortcuts guided-field-wide" role="group" aria-label="Quick deadline options">
                <button className="quiet-button" type="button" onClick={() => setDeadline(dateAfter(7))}>7 days</button>
                <button className="quiet-button" type="button" onClick={() => setDeadline(dateAfter(14))}>14 days</button>
                <span>Or choose a custom date above.</span>
              </div>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p className="kicker">Step 3 · Allocation</p>
            <h1 className="display-heading" id="create-flow-title">How should tasks be planned?</h1>
            <div className="allocation-mode-grid">
              <button className={allocationMode === "ai" ? "allocation-mode-card ai-mode is-selected" : "allocation-mode-card ai-mode"} type="button" onClick={() => setAllocationMode("ai")}>
                <strong>AI Assisted</strong><span>Build an editable task draft after everyone adds their preferences.</span>
              </button>
              <button className={allocationMode === "manual" ? "allocation-mode-card is-selected" : "allocation-mode-card"} type="button" onClick={() => setAllocationMode("manual")}>
                <strong>Manual</strong><span>Create tasks, owners, reviewers, dates, and damage yourself.</span>
              </button>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <p className="kicker">Step 4 · Your preferences</p>
            <h1 className="display-heading" id="create-flow-title">Tell your team how you work</h1>
            <PreferenceFields value={preferences} onChange={updatePreferences} />
          </>
        ) : null}

        {step === 5 ? (
          <>
            <p className="kicker">Step 5 · Create room</p>
            <h1 className="display-heading" id="create-flow-title">Ready to invite your team?</h1>
            <dl className="guided-summary">
              <div><dt>Project</dt><dd>{title}</dd></div>
              <div><dt>Framework</dt><dd>{selectedFramework?.name}</dd></div>
              <div><dt>Deadline</dt><dd>{deadline}</dd></div>
              <div><dt>Allocation mode</dt><dd>{allocationMode === "ai" ? "AI Assisted" : "Manual"}</dd></div>
              <div><dt>Your preferences</dt><dd>{preferences.skills} · {preferences.workType}</dd></div>
            </dl>
          </>
        ) : null}

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button guided-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Creating room…" : step === 5 ? "Create room" : "Continue"}
        </button>
      </form>
    </section>
  );
}
