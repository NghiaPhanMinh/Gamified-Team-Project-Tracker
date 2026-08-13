import { useEffect, useRef, useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";

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

type BattleSceneProps = { projectId: Id<"projects"> };

export function BattleScene({ projectId }: BattleSceneProps) {
  const state = useQuery(api.battle.getState, { projectId });
  const lockTasksMutation = useMutation(api.projects.lockTasks);

  const initialised = useRef(false);
  const latestSeenEventId = useRef<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    return state.members.map((member: any) => ({
      id: member.profileId,
      memberId: member.profileId,
      memberName: member.displayName,
      goblinState: member.goblinState ?? (member.hasSubmittedToday ? "ghost" : "active"),
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

  async function handleLockTasks() {
    if (!state) return;
    setError(null);
    setIsLocking(true);
    try {
      await lockTasksMutation({ projectId: state.project._id });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Failed to lock tasks."));
    } finally {
      setIsLocking(false);
    }
  }

  if (state === undefined) {
    return <section className="battle-loading" aria-busy="true">Preparing the battle scene…</section>;
  }

  const hpPercent = state.maximumHp === 0 ? 100 : Math.round((state.remainingHp / state.maximumHp) * 100);
  const defeated = state.maximumHp > 0 && state.remainingHp === 0;

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
          <div><dt>Goblins Left</dt><dd>{(state as any).goblinsRemaining ?? 0} / {(state as any).totalGoblinsForProject ?? 0}</dd></div>
          <div><dt>Tasks Left</dt><dd>{state.remainingRequiredTasks}</dd></div>
        </dl>
      </header>

      {error ? <p className="form-error" role="alert" style={{ margin: "0.5rem 1rem" }}>{error}</p> : null}

      {/* Main 10-Layer Geometric SVG Landscape Scene */}
      <div className="landscape-scene-container" aria-label="Interactive project encounter scene">
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

      {/* Section 7: Boss HP & Task Locking Panel */}
      <div className="boss-hp-panel">
        {!(state as any).tasksLocked ? (
          <div className="task-lock-banner">
            <div className="lock-banner-text">
              <strong>Boss Health: Undetermined</strong>
              <span>Lock the task list to freeze project tasks and reveal the Boss Health pool.</span>
            </div>
            <button className="primary-button lock-tasks-button" type="button" disabled={isLocking} onClick={handleLockTasks}>
              {isLocking ? "Locking tasks..." : "Lock tasks to reveal Boss Health"}
            </button>
          </div>
        ) : (
          <>
            <div><strong>Boss HP</strong><span>{state.remainingHp} / {state.maximumHp} ({hpPercent}%)</span></div>
            <div className="boss-hp-track" role="progressbar" aria-valuemin={0} aria-valuemax={state.maximumHp} aria-valuenow={state.remainingHp}>
              <span style={{ width: `${hpPercent}%` }} />
            </div>
          </>
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

      {(state as any).isVillageDestroyed ? (
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

      <section className="combat-log" aria-labelledby="combat-log-title">
        <div><h4 id="combat-log-title">Combat log</h4><span>{state.events.length} verified attacks</span></div>
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
      </section>
    </section>
  );
}
