import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";

import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "../../lib/errors";
import { getByokSession } from "../../lib/byokSession";
import { friendlyAiError } from "../../lib/aiErrors";
import { AI_RETRY_DELAYS_MS, isRetryablePlatformAiError } from "../../lib/aiRetry";

type Workspace = FunctionReturnType<typeof api.tasks.getWorkspace>;
type AiPlan = FunctionReturnType<typeof api.ai.generateProjectPlan>;
export type AiTaskSuggestion = AiPlan["tasks"][number];

type AIPlanningAssistantProps = {
  workspace: Workspace;
  onUseTask: (task: AiTaskSuggestion) => void;
};

export function AIPlanningAssistant({
  workspace,
  onUseTask,
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
  const [retryNotice, setRetryNotice] = useState<string | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const byokActive = getByokSession() !== null;

  useEffect(() => () => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
  }, []);

  async function generateDraft(nextBrief: string) {
    const byok = getByokSession();
    let retryCount = 0;

    while (true) {
      try {
        const result = byok
          ? await generateProjectPlanWithKey({ projectId: workspace.project._id, brief: nextBrief, apiKey: byok.apiKey, model: byok.model })
          : await generateProjectPlan({ projectId: workspace.project._id, brief: nextBrief });
        setRetryNotice(null);
        return result;
      } catch (caughtError) {
        if (byok || !isRetryablePlatformAiError(caughtError) || retryCount >= AI_RETRY_DELAYS_MS.length) throw caughtError;

        const delay = AI_RETRY_DELAYS_MS[retryCount];
        retryCount += 1;
        setRetryNotice(`Free AI providers are busy. Retrying automatically in ${Math.round(delay / 1000)} seconds (${retryCount}/${AI_RETRY_DELAYS_MS.length})…`);
        await new Promise<void>((resolve) => {
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null;
            resolve();
          }, delay);
        });
      }
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setRetryNotice(null);
    setIsGenerating(true);

    try {
      const result = await generateDraft(brief);
      setDraft(result);
      setSaveMessage(null);
    } catch (caughtError) {
      setError(friendlyAiError(caughtError));
      setRetryNotice(null);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleAdjustment() {
    if (!adjustment.trim()) return;
    setError(null);
    setRetryNotice(null);
    setIsGenerating(true);
    try {
      const adjustedBrief = `${brief}\n\nHuman adjustment request: ${adjustment.trim()}`.slice(0, 8000);
      const result = await generateDraft(adjustedBrief);
      setDraft(result);
      setAdjustment("");
      setSaveMessage("A revised draft is ready. Review it before saving.");
    } catch (caughtError) {
      setError(friendlyAiError(caughtError));
      setRetryNotice(null);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSavePlan() {
    if (!draft) return;
    setError(null);
    setRetryNotice(null);
    setIsGenerating(true);
    try {
      const result = await savePlan({ projectId: workspace.project._id, plan: draft });
      setSaveMessage(`${result.taskCount} tasks were saved. Assigned teammates can now accept or decline.`);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The reviewed AI plan could not be saved."));
    } finally {
      setIsGenerating(false);
    }
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
          <p className="card-eyebrow">AI-assisted project planning</p>
          <h3 className="display-heading" id="ai-planning-title">Build the project plan with AI</h3>
        </div>
        <span>Draft only</span>
      </div>
      <p className="ai-safety-note">
        AI creates a reviewable draft. Nothing is saved or assigned until a person checks the plan and confirms it.
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
            {isGenerating ? "Building a draft…" : draft ? "Generate a fresh draft" : "Generate AI Project Plan"}
          </button>
        </div>
      </form>
      {error ? <p className="form-error ai-error" role="alert">{error}</p> : null}
      {retryNotice ? <p className="ai-retry-notice" role="status">{retryNotice}</p> : null}

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
          <section className="ai-draft-section" aria-labelledby="ai-plan-output-title">
            <div className="ai-draft-section-heading">
              <h4 id="ai-plan-output-title">Suggested project plan</h4>
              <span>{draft.tasks.length}</span>
            </div>
            <div className="ai-allocation-note"><strong>Suggested Allocation</strong><span>Owners and explanations are editable before the plan is saved.</span></div>
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
                      <span>Due date</span>
                      <input type="date" max={workspace.project.deadline} value={task.dueDate} onChange={(event) => updateTask(task.tempId, { dueDate: event.target.value })} />
                    </label>
                    <label className="ai-field-wide">
                      <span>Required skills</span>
                      <input value={task.requiredSkills.join(", ")} onChange={(event) => updateTask(task.tempId, { requiredSkills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) })} />
                    </label>
                    <div className="ai-explanation ai-field-wide">
                      <strong>Why this owner?</strong>
                      <p>{task.allocationExplanation}</p>
                      <small>Dependencies: {task.dependencyTempIds.length ? task.dependencyTempIds.join(", ") : "none"} · Collaborators: {task.collaboratorProfileIds.length}</small>
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

          <details className="ai-output-card ai-risk-output">
            <summary className="ai-draft-section-heading"><h4>Risks & assumptions</h4><span>Check</span></summary>
            <div className="ai-notes-grid">
              <section><h4>Risks to check</h4><ul>{draft.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul></section>
              <section><h4>Assumptions to verify</h4><ul>{draft.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></section>
              <section><h4>Meeting suggestions</h4><p>Open Team in the project workspace to use deterministic calendar overlap. AI never invents availability.</p></section>
            </div>
            <p className="ai-model-note">Generated through a free AI route. This draft is not saved.</p>
          </details>
          <section className="ai-adjust-plan" aria-labelledby="ai-adjust-title">
            <div><h4 id="ai-adjust-title">Adjust Plan</h4><p>Describe one change and generate a fresh, fully validated draft.</p></div>
            <textarea maxLength={1500} value={adjustment} onChange={(event) => setAdjustment(event.target.value)} placeholder="For example: reduce the plan to eight tasks and keep testing in week three." />
            <button className="secondary-button" type="button" disabled={isGenerating || !adjustment.trim()} onClick={() => void handleAdjustment()}>{isGenerating ? "Revising…" : "Generate adjusted draft"}</button>
          </section>
          <div className="ai-save-actions">
            <p>Saving is a human confirmation. Invalid or partial output is rejected by the server.</p>
            <button className="primary-button" type="button" disabled={isGenerating} onClick={() => void handleSavePlan()}>{isGenerating ? "Saving…" : "Save Plan & Allocations"}</button>
          </div>
          {saveMessage ? <p className="form-success" role="status">{saveMessage}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
