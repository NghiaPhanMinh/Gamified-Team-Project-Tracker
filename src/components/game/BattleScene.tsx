import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";

import { SVGDefs } from "./landscape/SVGDefs";
import { LandscapeSky } from "./landscape/LandscapeSky";
import { LandscapeTerrain } from "./landscape/LandscapeTerrain";
import { LandscapeVillage } from "./landscape/LandscapeVillage";
import { LandscapeGoblins } from "./landscape/LandscapeGoblins";
import { LandscapePlayers } from "./landscape/LandscapePlayers";
import { LandscapeDragon } from "./landscape/LandscapeDragon";
import { LandscapeFX } from "./landscape/LandscapeFX";

type BattleSceneProps = { projectId: Id<"projects">; currentPhase?: string; tasksLocked?: boolean };

type OptionalBattleMetrics = {
  goblinsRemaining?: number;
  totalGoblinsForProject?: number;
  isVillageDestroyed?: boolean;
};

function uploadFile(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  return new Promise<Id<"_storage">>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", uploadUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error("The evidence file upload failed."));
        return;
      }
      try {
        const response = JSON.parse(request.responseText) as {
          storageId: Id<"_storage">;
        };
        resolve(response.storageId);
      } catch {
        reject(new Error("The upload response could not be read."));
      }
    });
    request.addEventListener("error", () =>
      reject(new Error("The evidence file upload failed.")),
    );
    request.send(file);
  });
}

export function BattleScene({ projectId, currentPhase, tasksLocked = true }: BattleSceneProps) {
  const state = useQuery(api.battle.getState, { projectId });

  // Modal display toggles
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showAttackChoiceModal, setShowAttackChoiceModal] = useState(false);
  const [showGoblinModal, setShowGoblinModal] = useState(false);
  const [showBossModal, setShowBossModal] = useState(false);

  // Leaderboard data query
  const leaderboardData = useQuery(api.battle.getLeaderboard, { projectId });

  // Workspace data query for tasks & user profiles
  const workspace = useQuery(api.tasks.getWorkspace, { projectId });

  // Goblin Flow state & mutations
  const postDailyEvidence = useMutation((api as any).daily.postDailyEvidence);
  const [goblinText, setGoblinText] = useState("");
  const [goblinImageInput, setGoblinImageInput] = useState("");
  const [goblinImageUrls, setGoblinImageUrls] = useState<string[]>([]);
  const [isSlaying, setIsSlaying] = useState(false);
  const [goblinError, setGoblinError] = useState<string | null>(null);

  // Boss Flow state & mutations
  const generateUploadUrl = useMutation(api.evidence.generateUploadUrl);
  const addEvidence = useMutation(api.evidence.add);
  const chooseReviewer = useMutation(api.tasks.chooseReviewer);
  const submitForReview = useMutation(api.evidence.submitForReview);

  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [evidenceType, setEvidenceType] = useState<"note" | "link" | "image" | "pdf">("note");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bossError, setBossError] = useState<string | null>(null);

  // Derive eligible reviewers (teammates who are not the current user)
  const eligibleReviewers = useMemo(() => {
    if (!workspace || !workspace.currentProfileId) return [];
    return workspace.members.filter((m) => m.profileId !== workspace.currentProfileId);
  }, [workspace]);

  // Derive tasks available for the current user to submit evidence for
  const myAssignableTasks = useMemo(() => {
    if (!workspace || !workspace.currentProfileId) return [];
    return workspace.tasks.filter(
      (t) =>
        t.primaryOwnerProfileId === workspace.currentProfileId &&
        ["todo", "in_progress", "changes_requested"].includes(t.status)
    );
  }, [workspace]);

  // Goblin verification counters
  const goblinWordCount = goblinText.trim().length > 0 ? goblinText.trim().split(/\s+/).filter(Boolean).length : 0;
  const goblinImageCount = goblinImageUrls.length;
  const isGoblinValid = goblinWordCount >= 20 || goblinImageCount >= 2;

  function handleAddGoblinImage() {
    const trimmed = goblinImageInput.trim();
    if (!trimmed) return;
    setGoblinImageUrls((current) => [...current, trimmed]);
    setGoblinImageInput("");
  }

  function handleRemoveGoblinImage(index: number) {
    setGoblinImageUrls((current) => current.filter((_, i) => i !== index));
  }

  async function handleGoblinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goblinText && goblinImageUrls.length === 0) return;

    setGoblinError(null);
    setIsSlaying(true);

    try {
      await postDailyEvidence({
        projectId,
        text: goblinText,
        imageUrls: goblinImageUrls,
      });
      setGoblinText("");
      setGoblinImageInput("");
      setGoblinImageUrls([]);
      setShowGoblinModal(false);
    } catch (err) {
      setGoblinError(getErrorMessage(err, "Failed to slay goblin."));
    } finally {
      setIsSlaying(false);
    }
  }

  async function handleBossSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTaskId) return;

    setBossError(null);
    setIsSubmittingTask(true);
    setUploadProgress(0);

    const currentTask = workspace?.tasks.find((t) => t._id === selectedTaskId);
    if (!currentTask) {
      setBossError("Selected task not found.");
      setIsSubmittingTask(false);
      return;
    }

    try {
      // 1. Choose reviewer if not already assigned
      if (!currentTask.reviewerProfileId) {
        if (!selectedReviewerId) {
          throw new Error("You must choose a teammate to review your task.");
        }
        await chooseReviewer({
          taskId: selectedTaskId,
          reviewerProfileId: selectedReviewerId as Id<"userProfiles">,
        });
      }

      // 2. Upload file if applicable
      let storageId: Id<"_storage"> | undefined;
      if (evidenceType === "image" || evidenceType === "pdf") {
        if (!evidenceFile) {
          throw new Error("Select a file to upload.");
        }
        // Validation check
        if (evidenceType === "image") {
          if (!new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]).has(evidenceFile.type)) {
            throw new Error("Choose a JPEG, PNG, WebP, or GIF image.");
          }
          if (evidenceFile.size > 5 * 1024 * 1024) {
            throw new Error("Images must be 5 MB or smaller.");
          }
        }
        if (evidenceType === "pdf") {
          if (evidenceFile.type !== "application/pdf") {
            throw new Error("Choose a PDF file.");
          }
          if (evidenceFile.size > 10 * 1024 * 1024) {
            throw new Error("PDF files must be 10 MB or smaller.");
          }
        }

        const uploadUrl = await generateUploadUrl({ taskId: selectedTaskId });
        storageId = await uploadFile(uploadUrl, evidenceFile, setUploadProgress);
      }

      // 3. Add evidence
      await addEvidence({
        taskId: selectedTaskId,
        type: evidenceType,
        note: evidenceNote,
        url: evidenceType === "link" ? evidenceUrl : undefined,
        storageId,
        fileName: evidenceFile?.name,
        contentType: evidenceFile?.type,
        fileSize: evidenceFile?.size,
      });

      // 4. Submit for review
      await submitForReview({ taskId: selectedTaskId });

      // Reset state and close modal
      setSelectedTaskId(null);
      setEvidenceNote("");
      setEvidenceUrl("");
      setEvidenceFile(null);
      setSelectedReviewerId("");
      setUploadProgress(0);
      setShowBossModal(false);
    } catch (err) {
      setBossError(getErrorMessage(err, "Failed to submit evidence."));
    } finally {
      setIsSubmittingTask(false);
    }
  }

  const initialised = useRef(false);
  const latestSeenEventId = useRef<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!state) return;
    const newest = state.events.at(-1)?._id ?? null;
    if (!initialised.current) {
      initialised.current = true;
      latestSeenEventId.current = newest;
      return;
    }
    if (newest && newest !== latestSeenEventId.current) {
      latestSeenEventId.current = newest;
      setActiveEventId(newest);
      const timer = window.setTimeout(() => setActiveEventId(null), 1800);
      return () => window.clearTimeout(timer);
    }
  }, [state]);

  const activeEvent = useMemo(
    () => state?.events.find((event) => event._id === activeEventId) ?? null,
    [state?.events, activeEventId],
  );

  const goblins = useMemo(() => {
    if (!state) return [];
    return state.members.map((member) => ({
      id: member.profileId,
      memberId: member.profileId,
      memberName: member.displayName,
      goblinState: member.hasSubmittedToday ? "ghost" as const : "active" as const,
      isDefeated: member.hasSubmittedToday,
    }));
  }, [state]);

  const players = useMemo(() => {
    if (!state) return [];
    return state.members.map((member) => ({
      profileId: member.profileId,
      displayName: member.displayName,
      characterFill: member.characterFill,
      characterOutline: member.characterOutline,
      isActiveToday: member.hasSubmittedToday,
      isAttacking: activeEvent?.attackerProfileId === member.profileId,
    }));
  }, [state, activeEvent]);

  if (state === undefined) {
    return <section className="battle-loading" aria-busy="true">Preparing the battle scene…</section>;
  }

  const hpPercent = state.maximumHp === 0 ? 100 : Math.round((state.remainingHp / state.maximumHp) * 100);
  const defeated = state.maximumHp > 0 && state.remainingHp === 0;
  const optionalMetrics = state as typeof state & OptionalBattleMetrics;

  return (
    <section className={`battle-page ${activeEvent ? "has-new-attack" : ""} ${defeated ? "is-defeated" : ""}`} aria-labelledby="battle-title">
      <SVGDefs />

      <header className="battle-summary">
        <div>
          <p className="kicker">Realtime encounter landscape</p>
          <h3 id="battle-title">{state.project.title}</h3>
        </div>
        <dl>
          <div><dt>Deadline</dt><dd>{state.project.deadline}</dd></div>
          {currentPhase ? <div><dt>Current Phase</dt><dd>{currentPhase}</dd></div> : null}
          <div><dt>Goblins Left</dt><dd>{optionalMetrics.goblinsRemaining ?? 0} / {optionalMetrics.totalGoblinsForProject ?? 0}</dd></div>
          <div><dt>Tasks Left</dt><dd>{state.remainingRequiredTasks}</dd></div>
        </dl>
      </header>

      {/* Main 10-Layer Geometric SVG Landscape Scene */}
      <div className="landscape-scene-container" style={{ position: "relative" }} aria-label="Interactive project encounter scene">
        {/* Leaderboard Overlay Button */}
        <button
          className="rpg-btn-leaderboard"
          onClick={() => setShowLeaderboardModal(true)}
          type="button"
        >
          🏆 Leaderboard
        </button>

        {/* Attack Circular Action Button */}
        <button
          className="rpg-btn-attack-circle"
          onClick={() => setShowAttackChoiceModal(true)}
          type="button"
        >
          ⚔️<br />Attack
        </button>

        {/* Layer 0, 1, 2: Sky & Parallax Clouds */}
        <LandscapeSky />

        {/* Layer 3, 4: Section 4 - Top-Down 3/4 Perspective Grassland */}
        <LandscapeTerrain />

        {/* Layer 5: Section 3 & 5 - Grounded Village & Anchored Village HP Bar */}
        <LandscapeVillage villageHpPercent={state.villageHpPercent} />

        {/* Layer 6: Section 8 - Daily Goblins Wave System (1 per active player) */}
        <LandscapeGoblins goblins={goblins} />

        {/* Layer 7: Section 6 - Party Members & Deterministic Game ID Tags */}
        <LandscapePlayers members={players} />

        {/* Layer 8: Section 1 - Medieval Dragon Visuals & Wings */}
        <LandscapeDragon bossHpPercent={hpPercent} isDefeated={defeated} />

        {/* Layer 9: Section 2 - Cosmetic Combat Exchange (50% Opacity Background Burst) */}
        <LandscapeFX
          activeEvent={activeEvent ? {
            id: activeEvent._id,
            attackerName: activeEvent.attackerName,
            damage: activeEvent.damage,
            spellType: activeEvent.spellType,
          } : null}
          isVictory={defeated}
        />
      </div>

      {/* =========================================================================
          LEADERBOARD MODAL
         ========================================================================= */}
      {showLeaderboardModal && (
        <div className="rpg-modal-backdrop" onClick={() => setShowLeaderboardModal(false)}>
          <div className="rpg-wood-board" onClick={(e) => e.stopPropagation()}>
            <div className="rpg-wood-board-bottom-caps" />
            <h3 className="rpg-board-title">📜 Quest Leaderboard</h3>
            <div className="rpg-parchment-sheet">
              {leaderboardData === undefined ? (
                <p style={{ textAlign: "center" }}>Gathering scrolls...</p>
              ) : leaderboardData.length === 0 ? (
                <p style={{ textAlign: "center" }}>No adventurers have stepped forward yet.</p>
              ) : (
                <table className="rpg-leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Adventurer</th>
                      <th style={{ textAlign: "center" }}>Goblins Slayed</th>
                      <th style={{ textAlign: "center" }}>Quests Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((item, idx) => (
                      <tr key={item.profileId}>
                        <td className="rank">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </td>
                        <td style={{ fontWeight: 700 }}>{item.displayName}</td>
                        <td style={{ textAlign: "center", fontWeight: 800, color: "#c2410c" }}>
                          {item.goblinsKilled}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 800, color: "#166534" }}>
                          {item.tasksCompleted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <button className="rpg-btn-close" type="button" onClick={() => setShowLeaderboardModal(false)}>
              Close Board
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ATTACK TARGET SELECTION CHOICE MODAL
         ========================================================================= */}
      {showAttackChoiceModal && (
        <div className="rpg-modal-backdrop" onClick={() => setShowAttackChoiceModal(false)}>
          <div className="rpg-wood-board" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <div className="rpg-wood-board-bottom-caps" />
            <h3 className="rpg-board-title">⚔️ Choose Target</h3>
            <div className="rpg-grid-options">
              <button
                className="rpg-plaque-btn"
                type="button"
                onClick={() => {
                  setShowAttackChoiceModal(false);
                  setShowGoblinModal(true);
                }}
              >
                <span className="emoji">👹</span>
                <span className="label">Daily Goblin</span>
              </button>
              <button
                className="rpg-plaque-btn"
                type="button"
                onClick={() => {
                  setShowAttackChoiceModal(false);
                  setShowBossModal(true);
                }}
              >
                <span className="emoji">🐉</span>
                <span className="label">The Dragon</span>
              </button>
            </div>
            <button className="rpg-btn-close" type="button" onClick={() => setShowAttackChoiceModal(false)}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLAY GOBLIN EVIDENCE FLOW MODAL
         ========================================================================= */}
      {showGoblinModal && (
        <div className="rpg-modal-backdrop" onClick={() => setShowGoblinModal(false)}>
          <div className="rpg-wood-board" onClick={(e) => e.stopPropagation()}>
            <div className="rpg-wood-board-bottom-caps" />
            <h3 className="rpg-board-title">👹 Slay Daily Goblin</h3>

            <form onSubmit={handleGoblinSubmit} className="rpg-goblin-form">
              <div className="rpg-parchment-sheet" style={{ marginBottom: 0 }}>
                {goblinError && <p className="form-error" role="alert" style={{ color: "#b91c1c", fontWeight: 800 }}>{goblinError}</p>}

                <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", lineHeight: "1.4" }}>
                  Provide proof of today's work to defeat your daily goblin threat.
                  Requirement: <strong>at least 20 words of notes OR 2 image links</strong>.
                </p>

                <label className="rpg-field-label">
                  <span>Work Accomplishment Details</span>
                  <textarea
                    className="rpg-input-textarea"
                    rows={4}
                    value={goblinText}
                    onChange={(e) => setGoblinText(e.target.value)}
                    placeholder="Enter details of your work today..."
                    required={goblinImageUrls.length === 0}
                  />
                </label>

                {/* Validation Info */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px", marginBottom: "14px" }}>
                  <span className={`rpg-val-tag ${goblinWordCount >= 20 ? "is-valid" : "is-invalid"}`}>
                    📝 {goblinWordCount}/20 words {goblinWordCount >= 20 ? "✓" : ""}
                  </span>
                  <span className={`rpg-val-tag ${goblinImageCount >= 2 ? "is-valid" : "is-invalid"}`}>
                    🖼️ {goblinImageCount}/2 images {goblinImageCount >= 2 ? "✓" : ""}
                  </span>
                </div>

                <label className="rpg-field-label">
                  <span>Attach Image Url</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="url"
                      className="rpg-input-text"
                      style={{ flex: 1 }}
                      value={goblinImageInput}
                      onChange={(e) => setGoblinImageInput(e.target.value)}
                      placeholder="Paste image link..."
                    />
                    <button
                      className="rpg-btn-submit-action"
                      style={{ width: "auto", padding: "0 16px", background: "#8b5a2b" }}
                      type="button"
                      onClick={handleAddGoblinImage}
                    >
                      Attach
                    </button>
                  </div>
                </label>

                {goblinImageUrls.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                    {goblinImageUrls.map((url, idx) => (
                      <div key={idx} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#eeddbb", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700 }}>
                        <span>Image {idx + 1}</span>
                        <button type="button" style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold" }} onClick={() => handleRemoveGoblinImage(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="rpg-btn-submit-action"
                type="submit"
                disabled={isSlaying || (!goblinText && goblinImageUrls.length === 0)}
              >
                {isSlaying ? "Slaying..." : isGoblinValid ? "⚔️ Slay Goblin!" : "Log Evidence (Requires 20 words or 2 images)"}
              </button>

              <button className="rpg-btn-close" type="button" onClick={() => setShowGoblinModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOSS ATTACK QUEST PINNED BOARD MODAL
         ========================================================================= */}
      {showBossModal && (
        <div className="rpg-modal-backdrop" onClick={() => setShowBossModal(false)}>
          <div className="rpg-wood-board" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <div className="rpg-wood-board-bottom-caps" />
            <h3 className="rpg-board-title">🐉 Attack The Dragon (Submit Quests)</h3>

            {bossError && <p className="form-error" role="alert" style={{ color: "#ef4444", fontWeight: 800, textAlign: "center", marginBottom: "12px" }}>{bossError}</p>}

            <div className="rpg-boss-board">
              {myAssignableTasks.length === 0 ? (
                <div className="rpg-no-tasks-alert">
                  🛡️ You do not have any active quests assigned to you!
                  <p style={{ fontWeight: "normal", fontSize: "0.85rem", marginTop: "6px" }}>Go to the project task board below to claim or assign a quest first.</p>
                </div>
              ) : !selectedTaskId ? (
                <>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", textAlign: "center" }}>Select one of your active quests below to submit evidence and deal combat damage to the dragon.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {myAssignableTasks.map((task) => {
                      const creatorName = workspace?.members.find((m) => m?.profileId === task.createdByProfileId)?.displayName ?? "Creator";
                      return (
                        <div
                          key={task._id}
                          className="rpg-parchment-sheet"
                          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
                          onClick={() => {
                            setSelectedTaskId(task._id);
                            if (task.reviewerProfileId) {
                              setSelectedReviewerId(task.reviewerProfileId);
                            }
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
                        >
                          <h4 className="rpg-note-title">{task.title}</h4>
                          <div className="rpg-note-meta">
                            <span>📅 Due: {task.dueDate}</span>
                            <span>👤 By: {creatorName}</span>
                          </div>
                          <span style={{ fontSize: "0.72rem", background: "#8b5a2b", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                            Select Quest
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <form onSubmit={handleBossSubmit} className="rpg-goblin-form">
                  {(() => {
                    const task = myAssignableTasks.find((t) => t._id === selectedTaskId);
                    if (!task) return null;
                    const creatorName = workspace?.members.find((m) => m?.profileId === task.createdByProfileId)?.displayName ?? "Creator";
                    return (
                      <div className="rpg-parchment-sheet">
                        <button
                          type="button"
                          style={{ position: "absolute", top: "10px", right: "10px", border: "none", background: "transparent", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}
                          onClick={() => setSelectedTaskId(null)}
                        >
                          Change Quest
                        </button>
                        <h4 className="rpg-note-title">{task.title}</h4>
                        <div className="rpg-note-meta" style={{ marginBottom: 0 }}>
                          <span>📅 Due Date: {task.dueDate}</span>
                          <span>👤 Assigned By: {creatorName}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="rpg-parchment-sheet">
                    <label className="rpg-field-label" style={{ marginBottom: "10px" }}>
                      <span>Select Evidence Type</span>
                      <div className="rpg-evidence-tabs">
                        {(["note", "link", "image", "pdf"] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            className={`rpg-evidence-tab ${evidenceType === tab ? "is-active" : ""}`}
                            onClick={() => {
                              setEvidenceType(tab);
                              setEvidenceFile(null);
                            }}
                          >
                            {tab === "note" ? "Short Note" : tab === "link" ? "External Link" : tab === "image" ? "Image File" : "PDF File"}
                          </button>
                        ))}
                      </div>
                    </label>

                    <div className="rpg-evidence-form-container">
                      {evidenceType === "note" && (
                        <label className="rpg-field-label">
                          <span>Progress Note</span>
                          <textarea
                            className="rpg-input-textarea"
                            rows={3}
                            value={evidenceNote}
                            onChange={(e) => setEvidenceNote(e.target.value)}
                            placeholder="Write a short summary of the work..."
                            required
                          />
                        </label>
                      )}

                      {evidenceType === "link" && (
                        <>
                          <label className="rpg-field-label">
                            <span>Link URL</span>
                            <input
                              type="url"
                              className="rpg-input-text"
                              value={evidenceUrl}
                              onChange={(e) => setEvidenceUrl(e.target.value)}
                              placeholder="https://example.com/project-link"
                              required
                            />
                          </label>
                          <label className="rpg-field-label">
                            <span>Optional Progress Note</span>
                            <textarea
                              className="rpg-input-textarea"
                              rows={2}
                              value={evidenceNote}
                              onChange={(e) => setEvidenceNote(e.target.value)}
                              placeholder="Add details about the link..."
                            />
                          </label>
                        </>
                      )}

                      {(evidenceType === "image" || evidenceType === "pdf") && (
                        <>
                          <label className="rpg-field-label">
                            <span>Upload {evidenceType === "image" ? "Image File (Max 5MB)" : "PDF File (Max 10MB)"}</span>
                            <input
                              type="file"
                              accept={evidenceType === "image" ? "image/*" : "application/pdf"}
                              onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                              required
                            />
                          </label>
                          {uploadProgress > 0 && (
                            <div style={{ background: "#eeddbb", height: "14px", borderRadius: "4px", overflow: "hidden", marginTop: "6px" }}>
                              <div style={{ background: "#166534", height: "100%", width: `${uploadProgress}%`, transition: "width 0.2s ease" }} />
                            </div>
                          )}
                          <label className="rpg-field-label" style={{ marginTop: "8px" }}>
                            <span>Optional Progress Note</span>
                            <textarea
                              className="rpg-input-textarea"
                              rows={2}
                              value={evidenceNote}
                              onChange={(e) => setEvidenceNote(e.target.value)}
                              placeholder="Describe the uploaded file..."
                            />
                          </label>
                        </>
                      )}
                    </div>

                    {(() => {
                      const task = myAssignableTasks.find((t) => t._id === selectedTaskId);
                      if (task && !task.reviewerProfileId) {
                        return (
                          <label className="rpg-field-label" style={{ marginTop: "14px" }}>
                            <span>Select Teammate to Review Your Quest</span>
                            <select
                              className="rpg-select"
                              value={selectedReviewerId}
                              onChange={(e) => setSelectedReviewerId(e.target.value)}
                              required
                            >
                              <option value="">-- Select Reviewer --</option>
                              {eligibleReviewers.map((m) => (
                                <option key={m.profileId} value={m.profileId}>
                                  {m.displayName}
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <button
                    className="rpg-btn-submit-action"
                    type="submit"
                    disabled={isSubmittingTask}
                  >
                    {isSubmittingTask ? "Submitting Evidence..." : "⚔️ Submit Quest & Attack!"}
                  </button>

                  <button
                    className="rpg-btn-close"
                    type="button"
                    onClick={() => {
                      setSelectedTaskId(null);
                      setEvidenceNote("");
                      setEvidenceUrl("");
                      setEvidenceFile(null);
                      setSelectedReviewerId("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
            <button className="rpg-btn-close" type="button" onClick={() => setShowBossModal(false)}>
              Close Board
            </button>
          </div>
        </div>
      )}

      {/* Boss HP remains visible in the shared encounter. Task locking is contextual in task details. */}
      <div className="boss-hp-panel">
        {tasksLocked ? (
          <>
            <div><strong>Boss HP</strong><span>{state.remainingHp} / {state.maximumHp} ({hpPercent}%)</span></div>
            <div className="boss-hp-track" role="progressbar" aria-valuemin={0} aria-valuemax={state.maximumHp} aria-valuenow={state.remainingHp}>
              <span style={{ width: `${hpPercent}%` }} />
            </div>
          </>
        ) : (
          <div><strong>Boss HP</strong><span>Undetermined · lock from a task’s allocation details</span></div>
        )}

        {state.members && state.members.length > 0 ? (
          <div className="member-hp-shares" style={{ marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Player Contribution Target</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>Target share: {state.hpSharePerPlayer} HP per player</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
              {state.members.map((member) => {
                const sharePercent = member.targetHpShare > 0 ? Math.min(100, Math.round((member.damageDealt / member.targetHpShare) * 100)) : 0;
                return (
                  <div key={member.profileId} style={{ background: "rgba(255, 255, 255, 0.7)", padding: "0.4rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                      <strong>{member.displayName}</strong>
                      <span style={{ fontWeight: 600, color: member.isShareComplete ? "#15803d" : "#334155" }}>
                        {member.damageDealt}/{member.targetHpShare} HP ({sharePercent}%)
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(0,0,0,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${sharePercent}%`, height: "100%", background: member.isShareComplete ? "#22c55e" : "#2563eb", borderRadius: "3px", transition: "width 0.3s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {optionalMetrics.isVillageDestroyed ? (
        <section className="failure-panel" style={{ background: "#fef2f2", border: "2px solid #ef4444", padding: "1.5rem", borderRadius: "12px", margin: "1rem 0" }}>
          <p className="card-eyebrow" style={{ color: "#dc2626" }}>Project Failed</p>
          <h3 style={{ color: "#991b1b", margin: "0.2rem 0 0.5rem" }}>The Village Has Been Destroyed!</h3>
          <p style={{ color: "#7f1d1d", margin: 0 }}>Village HP dropped below the 50% failure threshold from missed daily goblin defenses and deadline penalties.</p>
        </section>
      ) : null}

      {defeated ? (
        <section className="victory-panel">
          <p className="card-eyebrow">Project complete</p>
          <h3>The dragon has been repelled!</h3>
          <p>Every required task has been verified. The village is safe. Export the report or archive the project from project settings.</p>
        </section>
      ) : null}

      <details className="combat-log">
        <summary><strong id="combat-log-title">Combat log</strong><span>{state.events.length} verified attacks</span></summary>
        {state.events.length === 0 ? (
          <p>No attacks yet. A submitted task deals damage only after its assigned reviewer verifies it.</p>
        ) : (
          <ol>
            {[...state.events].reverse().map((event) => (
              <li key={event._id}>
                <strong>{event.attackerName} dealt {event.damage} damage</strong>
                <span>{event.reviewerName} verified “{event.taskTitle}” · {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(event.createdAt)}</span>
              </li>
            ))}
          </ol>
        )}
      </details>
    </section>
  );
}
