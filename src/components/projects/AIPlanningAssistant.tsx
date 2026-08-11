import { useState, type FormEvent } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "../../lib/errors";
import { getByokSession } from "../../lib/byokSession";
import { friendlyAiError } from "../../lib/aiErrors";

type Workspace = FunctionReturnType<typeof api.tasks.getWorkspace>;
type AiPlan = FunctionReturnType<typeof api.ai.generateProjectPlan>;
export type AiTaskSuggestion = AiPlan["tasks"][number];
export type AiMilestoneSuggestion = AiPlan["milestones"][number];

type AIPlanningAssistantProps = {
  workspace: Workspace;
  onUseTask: (task: AiTaskSuggestion) => void;
  onUseMilestone: (milestone: AiMilestoneSuggestion) => void;
};

export function AIPlanningAssistant({
  workspace,
  onUseTask,
  onUseMilestone,
}: AIPlanningAssistantProps) {
  const generateProjectPlan = useAction(api.ai.generateProjectPlan);
  const generateProjectPlanWithKey = useAction(api.ai.generateProjectPlanWithKey);
  const savePlan = useMutation(api.aiDrafts.savePlan);
  const usage = useQuery(api.aiUsage.getProjectUsage, { projectId: workspace.project._id });
  const [brief, setBrief] = useState(workspace.project.description);
  const [draft, setDraft] = useState<AiPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustment, setAdjustment] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const byokActive = getByokSession() !== null;

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const byok = getByokSession();
      const result = byok
        ? await generateProjectPlanWithKey({ projectId: workspace.project._id, brief, apiKey: byok.apiKey, model: byok.model })
        : await generateProjectPlan({ projectId: workspace.project._id, brief });
      setDraft(result);
      setSaveMessage(null);
    } catch (caughtError) {
      setError(friendlyAiError(caughtError));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAdjustment() {
    if (!adjustment.trim()) return;
    setError(null);
    setIsGenerating(true);
    try {
      const adjustedBrief = `${brief}\n\nHuman adjustment request: ${adjustment.trim()}`.slice(0, 8000);
      const byok = getByokSession();
      const result = byok
        ? await generateProjectPlanWithKey({ projectId: workspace.project._id, brief: adjustedBrief, apiKey: byok.apiKey, model: byok.model })
        : await generateProjectPlan({ projectId: workspace.project._id, brief: adjustedBrief });
      setDraft(result);
      setAdjustment("");
      setSaveMessage("A revised draft is ready. Review it before saving.");
    } catch (caughtError) {
      setError(friendlyAiError(caughtError));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSavePlan() {
    if (!draft) return;
    setError(null);
    setIsGenerating(true);
    try {
      const result = await savePlan({ projectId: workspace.project._id, plan: draft });
      setSaveMessage(`${result.taskCount} tasks and ${result.milestoneCount} milestones were saved. Assigned teammates can now accept or decline.`);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The reviewed AI plan could not be saved."));
    } finally {
      setIsGenerating(false);
    }
  }

  function updateMilestone(tempId: string, patch: Partial<AiMilestoneSuggestion>) {
    setDraft((current) => current
      ? {
          ...current,
          milestones: current.milestones.map((milestone) =>
            milestone.tempId === tempId ? { ...milestone, ...patch } : milestone,
          ),
        }
      : current);
  }

  function updateTask(tempId: string, patch: Partial<AiTaskSuggestion>) {
    setDraft((current) => current
      ? {
          ...current,
          tasks: current.tasks.map((task) =>
            task.tempId === tempId ? { ...task, ...patch } : task,
          ),
        }
      : current);
  }

  return (
    <section className="ai-planning-assistant" aria-labelledby="ai-planning-title">
      <div className="ai-planning-heading">
        <div>
          <p className="card-eyebrow">Optional planning helper</p>
          <h3 className="display-heading" id="ai-planning-title">Ask AI to interpret the brief</h3>
        </div>
        <span>Draft only</span>
      </div>
      <p className="ai-safety-note">
        AI suggestions are temporary and editable. Nothing is saved, assigned, or treated as fair until a person moves it into the manual form and confirms it.
      </p>
      {usage && !usage.platformGenerationAvailable && !byokActive ? <div className="feature-gate-card" role="status"><strong>AI GENERATION USED</strong><p>This Free project has used its platform AI draft. Editing and unlimited manual planning remain available, or activate a session-only key in Profile → AI Settings.</p></div> : null}

      <form className="ai-brief-form" onSubmit={handleGenerate}>
        <label>
          <span>Project or assignment brief</span>
          <textarea
            required
            minLength={20}
            maxLength={8000}
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="Paste the assignment requirements, deliverables, audience, constraints, and assessment criteria…"
          />
        </label>
        <div>
          <span>{brief.length}/8000</span>
          <button
            className="primary-button"
            type="submit"
            disabled={isGenerating || workspace.project.status === "archived" || (usage !== undefined && !usage.platformGenerationAvailable && !byokActive)}
          >
            {isGenerating ? "Building a draft…" : draft ? "Generate a fresh draft" : "Generate AI draft"}
          </button>
        </div>
      </form>
      {error ? <p className="form-error ai-error" role="alert">{error}</p> : null}

      {draft ? (
        <div className="ai-draft" aria-live="polite">
          <header className="ai-output-card ai-brief-interpretation">
            <div>
              <span>Brief interpretation</span>
              <h4>{draft.recommendedFramework}</h4>
              <p>{draft.frameworkReason}</p>
              <dl className="ai-interpretation-summary">
                <div><dt>Likely deliverables</dt><dd>{draft.tasks.slice(0, 4).map((task) => task.title).join(" · ")}</dd></div>
                <div><dt>Constraints to verify</dt><dd>{draft.assumptions.slice(0, 3).join(" · ") || "No extra constraints identified."}</dd></div>
              </dl>
            </div>
            <button className="quiet-button" type="button" onClick={() => setDraft(null)}>
              Discard AI draft
            </button>
          </header>

          <section className="ai-output-card ai-plan-output" aria-labelledby="ai-plan-output-title">
            <div className="ai-draft-section-heading"><h4 id="ai-plan-output-title">Tasks & milestones</h4><span>{draft.tasks.length + draft.milestones.length}</span></div>
          <section className="ai-draft-section" aria-labelledby="ai-milestone-title">
            <div className="ai-draft-section-heading">
              <h4 id="ai-milestone-title">Suggested milestones</h4>
              <span>{draft.milestones.length}</span>
            </div>
            {draft.milestones.length === 0 ? <p>No new milestones suggested.</p> : (
              <div className="ai-milestone-grid">
                {draft.milestones.map((milestone) => (
                  <article key={milestone.tempId}>
                    <label>
                      <span>Title</span>
                      <input value={milestone.title} onChange={(event) => updateMilestone(milestone.tempId, { title: event.target.value })} />
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea value={milestone.description} onChange={(event) => updateMilestone(milestone.tempId, { description: event.target.value })} />
                    </label>
                    <div className="ai-inline-fields">
                      <label>
                        <span>Phase</span>
                        <select value={milestone.phaseId} onChange={(event) => updateMilestone(milestone.tempId, { phaseId: event.target.value })}>
                          {workspace.phases.map((phase) => <option key={phase._id} value={phase._id}>{phase.title}</option>)}
                        </select>
                      </label>
                      <label>
                        <span>Due</span>
                        <input type="date" min={workspace.project.startDate} max={workspace.project.deadline} value={milestone.dueDate} onChange={(event) => updateMilestone(milestone.tempId, { dueDate: event.target.value })} />
                      </label>
                    </div>
                    <button className="secondary-button" type="button" onClick={() => onUseMilestone(milestone)}>
                      Review in milestone form
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="ai-draft-section" aria-labelledby="ai-task-title">
            <div className="ai-draft-section-heading">
              <h4 id="ai-task-title">Suggested tasks</h4>
              <span>{draft.tasks.length}</span>
            </div>
            <div className="ai-task-list">
              {draft.tasks.map((task) => (
                <details key={task.tempId}>
                  <summary>
                    <span><strong>{task.title}</strong><small>{task.estimatedEffortHours}h · difficulty {task.difficulty}/5</small></span>
                    <span>{workspace.members.find((member) => member.profileId === task.primaryOwnerProfileId)?.displayName ?? "Choose owner"}</span>
                  </summary>
                  <div className="ai-task-editor">
                    <label className="ai-field-wide">
                      <span>Title</span>
                      <input value={task.title} onChange={(event) => updateTask(task.tempId, { title: event.target.value })} />
                    </label>
                    <label className="ai-field-wide">
                      <span>Description</span>
                      <textarea value={task.description} onChange={(event) => updateTask(task.tempId, { description: event.target.value })} />
                    </label>
                    <label>
                      <span>Phase</span>
                      <select value={task.phaseId} onChange={(event) => updateTask(task.tempId, { phaseId: event.target.value })}>
                        {workspace.phases.map((phase) => <option key={phase._id} value={phase._id}>{phase.title}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Suggested owner</span>
                      <select value={task.primaryOwnerProfileId} onChange={(event) => updateTask(task.tempId, {
                        primaryOwnerProfileId: event.target.value,
                        collaboratorProfileIds: task.collaboratorProfileIds.filter((profileId) => profileId !== event.target.value),
                        reviewerProfileId: task.reviewerProfileId === event.target.value ? null : task.reviewerProfileId,
                      })}>
                        {workspace.members.map((member) => <option key={member.profileId} value={member.profileId}>{member.displayName}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Effort hours</span>
                      <input type="number" min="0.5" max="2000" step="0.5" value={task.estimatedEffortHours} onChange={(event) => updateTask(task.tempId, { estimatedEffortHours: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Difficulty</span>
                      <input type="number" min="1" max="5" step="1" value={task.difficulty} onChange={(event) => updateTask(task.tempId, { difficulty: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Start date</span>
                      <input type="date" min={workspace.project.startDate} max={workspace.project.deadline} value={task.startDate} onChange={(event) => updateTask(task.tempId, { startDate: event.target.value })} />
                    </label>
                    <label>
                      <span>Due date</span>
                      <input type="date" min={task.startDate} max={workspace.project.deadline} value={task.dueDate} onChange={(event) => updateTask(task.tempId, { dueDate: event.target.value })} />
                    </label>
                    <label className="ai-field-wide">
                      <span>Required skills</span>
                      <input value={task.requiredSkills.join(", ")} onChange={(event) => updateTask(task.tempId, { requiredSkills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) })} />
                    </label>
                    <div className="ai-explanation ai-field-wide">
                      <strong>Why this owner?</strong>
                      <p>{task.allocationExplanation}</p>
                      <small>Dependencies: {task.dependencyTempIds.length ? task.dependencyTempIds.join(", ") : "none"} · Collaborators: {task.collaboratorProfileIds.length}{task.milestoneTempId ? ` · Suggested milestone: ${task.milestoneTempId}` : ""}</small>
                    </div>
                    {task.longTaskBreakdown ? <p className="long-task-guidance ai-field-wide">{task.longTaskBreakdown}</p> : null}
                    <button className="primary-button ai-field-wide" type="button" onClick={() => onUseTask(task)}>
                      Review in manual task form
                    </button>
                  </div>
                </details>
              ))}
            </div>
          </section>
          </section>

          <section className="ai-output-card ai-risk-output" aria-labelledby="ai-risk-output-title">
          <div className="ai-draft-section-heading"><h4 id="ai-risk-output-title">Risks, assumptions & meeting suggestions</h4><span>Check</span></div>
          <div className="ai-notes-grid">
            <section>
              <h4>Risks to check</h4>
              <ul>{draft.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
            </section>
            <section>
              <h4>Assumptions to verify</h4>
              <ul>{draft.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
            </section>
            <section>
              <h4>Meeting suggestions</h4>
              <p>Open Team Members to use the deterministic calendar overlap. AI can explain those saved windows, but never invent availability.</p>
            </section>
          </div>
          <p className="ai-model-note">Generated through a free AI route. This draft is not saved.</p>
          </section>
          <section className="ai-adjust-plan" aria-labelledby="ai-adjust-title">
            <div><h4 id="ai-adjust-title">Adjust Plan</h4><p>Describe one change and generate a fresh, fully validated draft.</p></div>
            <textarea maxLength={1500} value={adjustment} onChange={(event) => setAdjustment(event.target.value)} placeholder="For example: reduce the plan to eight tasks and keep testing in week three." />
            <button className="secondary-button" type="button" disabled={isGenerating || !adjustment.trim()} onClick={() => void handleAdjustment()}>{isGenerating ? "Revising…" : "Generate adjusted draft"}</button>
          </section>
          <div className="ai-save-actions">
            <p>Saving is a human confirmation. Invalid or partial output is rejected by the server.</p>
            <button className="primary-button" type="button" disabled={isGenerating} onClick={() => void handleSavePlan()}>{isGenerating ? "Saving…" : "Save reviewed plan"}</button>
          </div>
          {saveMessage ? <p className="form-success" role="status">{saveMessage}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
