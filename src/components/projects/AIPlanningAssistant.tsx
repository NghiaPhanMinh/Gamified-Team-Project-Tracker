import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, CreditCard, Layers, Rocket, Scale, Search, Sparkles, Zap } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "../../lib/errors";
import { getByokSession } from "../../lib/byokSession";
import { friendlyAiError } from "../../lib/aiErrors";
import { AI_RETRY_DELAYS_MS, isRetryablePlatformAiError } from "../../lib/aiRetry";
import { trackEvent } from "../../lib/analytics";

type Workspace = FunctionReturnType<typeof api.tasks.getWorkspace>;
type AiPlan = FunctionReturnType<typeof api.ai.generateProjectPlan>;
export type AiTaskSuggestion = AiPlan["tasks"][number];

type AIPlanningAssistantProps = {
  workspace: Workspace;
  onUseTask: (task: AiTaskSuggestion) => void;
  autoStart?: boolean;
};

export function AIPlanningAssistant({
  workspace,
  onUseTask,
  autoStart = false,
}: AIPlanningAssistantProps) {
  const generateProjectPlan = useAction(api.ai.generateProjectPlan);
  const generateProjectPlanWithKey = useAction(api.ai.generateProjectPlanWithKey);
  const savePlan = useMutation(api.aiDrafts.savePlan);
  const usage = useQuery(api.aiUsage.getProjectUsage, { projectId: workspace.project._id });
  const [brief, setBrief] = useState(workspace.project.description || workspace.project.title);
  const [draft, setDraft] = useState<AiPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustment, setAdjustment] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [retryNotice, setRetryNotice] = useState<string | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoStartedRef = useRef(false);
  const byokActive = getByokSession() !== null;

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    trackEvent("ai_assistant_opened", {
      project_status: workspace.project.status,
    });
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, [workspace.project.status]);

  useEffect(() => {
    if (isGenerating) {
      setLoadingProgress(8);
      setLoadingSeconds(0);
      const startTime = Date.now();
      loadingIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setLoadingSeconds(Math.floor(elapsed));
        setLoadingProgress(Math.min(94, Math.floor(100 * (1 - Math.exp(-elapsed / 2.0)))));
      }, 100);
    } else {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      setLoadingProgress(100);
    }
  }, [isGenerating]);

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

  async function runGeneration(briefText: string) {
    setError(null);
    setRetryNotice(null);
    setIsGenerating(true);

    trackEvent("brief_submitted", {
      brief_length: briefText.length,
    });
    trackEvent("ai_prompt_submitted", {
      prompt_type: "initial_brief",
      prompt_length: briefText.length,
    });

    try {
      const result = await generateDraft(briefText);
      trackEvent("ai_plan_generated", {
        task_count: result.tasks.length,
        risk_count: result.risks.length,
      });
      setDraft(result);
      setSaveMessage(null);
    } catch (caughtError) {
      setError(friendlyAiError(caughtError));
      setRetryNotice(null);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runGeneration(brief);
  }

  useEffect(() => {
    if (autoStart && !hasAutoStartedRef.current && !draft && !isGenerating) {
      hasAutoStartedRef.current = true;
      const briefToUse = brief.trim() || workspace.project.title;
      if (briefToUse.length >= 3) {
        void runGeneration(briefToUse);
      }
    }
  }, [autoStart, brief, draft, isGenerating, workspace.project.title]);

  async function handleAdjustment() {
    if (!adjustment.trim()) return;
    setError(null);
    setRetryNotice(null);
    setIsGenerating(true);

    trackEvent("ai_prompt_submitted", {
      prompt_type: "adjustment",
      prompt_length: adjustment.trim().length,
    });

    try {
      const adjustedBrief = `${brief}\n\nHuman adjustment request: ${adjustment.trim()}`.slice(0, 8000);
      const result = await generateDraft(adjustedBrief);
      trackEvent("ai_plan_generated", {
        task_count: result.tasks.length,
        risk_count: result.risks.length,
      });
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
      trackEvent("plan_confirmed", {
        task_count: result.taskCount,
      });
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
      <form className="ai-brief-form" onSubmit={handleGenerate}>
        <label>
          <span>Project or assignment brief</span>
          <textarea
            required
            minLength={3}
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
            disabled={isGenerating || workspace.project.status === "archived"}
          >
            {isGenerating ? "Building a draft…" : draft ? "Regenerate Plan" : <><Zap size={15} style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "4px" }} /> Generate AI Plan</>}
          </button>
        </div>
      </form>
      {error ? <p className="form-error ai-error" role="alert">{error}</p> : null}
      {retryNotice ? <p className="ai-retry-notice" role="status">{retryNotice}</p> : null}

      {usage && !usage.platformGenerationAvailable && !byokActive ? (
        <div className="subscription-limit-card" style={{ margin: "1.25rem 0", padding: "1.5rem", borderRadius: "20px", background: "color-mix(in srgb, var(--color-pink) 15%, var(--color-surface))", border: "3px solid #101517", boxShadow: "6px 6px 0 #101517", color: "var(--color-text)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "var(--color-pink)", color: "#101517", padding: "0.25rem 0.65rem", borderRadius: "999px", fontWeight: "900", border: "1.5px solid #101517", fontSize: "0.88rem" }}>
              <CreditCard size={13} /> SUBSCRIPTION LIMIT REACHED ({usage.used}/{usage.limit ?? 2} USED)
            </span>
          </div>
          <h3 style={{ margin: "0.3rem 0 0.5rem", fontSize: "1.35rem", fontWeight: "900" }}>
            Upgrade Your Plan to Generate More AI Drafts
          </h3>
          <p style={{ margin: "0 0 1rem", fontSize: "0.92rem", lineHeight: "1.5", opacity: 0.9 }}>
            You have used your {usage.limit ?? 2} free AI plan generations for this project. Upgrade your plan on the Subscription page to unlock unlimited AI project plan regenerations, workload balancing, and priority AI execution!
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
            <Link to="/subscription" className="primary-button hero-save-plan-button" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", minHeight: "auto", fontSize: "1rem", textDecoration: "none" }}>
              <Sparkles size={16} /> Open Subscription Page <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : null}

      {isGenerating ? (
        <div className="ai-plan-loading-card" role="status" aria-live="polite" style={{ margin: "1.25rem 0", padding: "1.25rem", borderRadius: "16px", background: "color-mix(in srgb, var(--color-yellow) 12%, var(--color-surface))", border: "1.5px solid var(--color-yellow)", color: "var(--color-text)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
              <Zap size={16} className="spinner-icon" style={{ color: "var(--color-yellow)" }} /> Building AI Project Plan...
            </strong>
            <small style={{ fontWeight: 700, opacity: 0.85 }}>
              {loadingSeconds < 4 ? `~${Math.max(1, 4 - loadingSeconds)}s remaining` : "Finalizing..."} ({loadingSeconds}s elapsed)
            </small>
          </div>
          <div className="loading-bar-track" style={{ width: "100%", height: "10px", borderRadius: "999px", background: "rgba(0,0,0,0.15)", overflow: "hidden", marginBottom: "0.75rem" }}>
            <div
              className="loading-bar-fill"
              style={{
                width: `${loadingProgress}%`,
                height: "100%",
                background: "var(--color-yellow)",
                borderRadius: "999px",
                transition: "width 0.15s ease-out",
              }}
            />
          </div>
          <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.9, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {loadingSeconds < 1.5 ? (
              <><Search size={14} /> Analyzing brief requirements &amp; deliverables...</>
            ) : loadingSeconds < 3.0 ? (
              <><Layers size={14} /> Structuring project phases &amp; task allocation...</>
            ) : loadingSeconds < 4.5 ? (
              <><Scale size={14} /> Balancing effort hours, weights &amp; risk factors...</>
            ) : (
              <><Sparkles size={14} /> Finalizing draft plan for your review...</>
            )}
          </p>
        </div>
      ) : null}

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

          {draft.milestones && draft.milestones.length > 0 ? (
            <section className="ai-output-card ai-milestones-output" aria-labelledby="ai-milestones-output-title">
              <div className="ai-draft-section-heading">
                <h4 id="ai-milestones-output-title">Suggested Milestones</h4>
                <span>{draft.milestones.length}</span>
              </div>
              <div className="ai-milestones-grid">
                {draft.milestones.map((milestone) => (
                  <div key={milestone.tempId} className="ai-milestone-card">
                    <div className="ai-milestone-heading">
                      <strong>{milestone.title}</strong>
                      <small>Due: {milestone.dueDate} · Phase: {workspace.phases.find((p) => p._id === milestone.phaseId)?.title ?? "Phase"}</small>
                    </div>
                    <p>{milestone.description}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="ai-output-card ai-plan-output" aria-labelledby="ai-plan-output-title">
          <section className="ai-draft-section" aria-labelledby="ai-plan-output-title">
            <div className="ai-draft-section-heading">
              <h4 id="ai-plan-output-title">Suggested project plan</h4>
              <span>{draft.tasks.length}</span>
            </div>
            <div className="ai-allocation-note"><strong>Suggested Allocation</strong><span>Owners and explanations are editable before the plan is saved.</span></div>
            <div className="ai-task-list">
              {draft.tasks.map((task, index) => (
                <details key={task.tempId}>
                  <summary>
                    <span className="ai-task-sequence" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className="ai-task-summary-copy"><strong>{task.title}</strong><small>{task.estimatedEffortHours}h · difficulty {task.difficulty}/5</small></span>
                    <span className="ai-task-summary-owner">{workspace.members.find((member) => member.profileId === task.primaryOwnerProfileId)?.displayName ?? "Choose owner"}</span>
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
                    <button className="primary-button ai-field-wide" type="button" onClick={() => {
                      trackEvent("ai_recommendation_accepted", {
                        recommendation_type: "task_suggestion",
                      });
                      onUseTask(task);
                    }}>
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

          <div className="ai-save-actions-hero">
            <div className="ai-save-notice">
              <strong style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Sparkles size={18} style={{ color: "var(--color-pink)" }} /> Ready to Launch Your Project?
              </strong>
              <p>Clicking confirm saves all AI generated tasks, assigns team responsibilities, and unlocks the Battle Board, Tasks, and Progress tabs!</p>
            </div>
            <button className="primary-button hero-save-plan-button" type="button" disabled={isGenerating} onClick={() => void handleSavePlan()}>
              {isGenerating ? <><Rocket size={18} style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "6px" }} /> Saving &amp; Launching Project…</> : <><CheckCircle2 size={18} style={{ display: "inline-block", verticalAlign: "-2px", marginRight: "6px" }} /> Confirm &amp; Save Plan</>}
            </button>
          </div>
          {saveMessage ? <p className="form-success" role="status" style={{ marginTop: "1rem", fontSize: "1.05rem", fontWeight: 800 }}>{saveMessage}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
