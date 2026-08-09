import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

import { LandscapeScene } from "./LandscapeScene";

type BattleSceneProps = { projectId: Id<"projects"> };

export function BattleScene({ projectId }: BattleSceneProps) {
  const state = useQuery(api.battle.getState, { projectId });
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

  if (state === undefined) return <section className="battle-loading" aria-busy="true">Preparing the battle…</section>;
  const activeEvent = state.events.find((event) => event._id === activeEventId) ?? null;
  const hpPercent = state.maximumHp === 0 ? 100 : Math.round((state.remainingHp / state.maximumHp) * 100);
  const defeated = state.maximumHp > 0 && state.remainingHp === 0;

  return (
    <section className={`battle-page ${activeEvent ? "has-new-attack" : ""} ${defeated ? "is-defeated" : ""}`} aria-labelledby="battle-title">
      <header className="battle-summary">
        <div><p className="card-eyebrow">Realtime boss battle</p><h3 id="battle-title">{state.project.title}</h3></div>
        <dl><div><dt>Deadline</dt><dd>{state.project.deadline}</dd></div><div><dt>Tasks left</dt><dd>{state.remainingRequiredTasks}</dd></div></dl>
      </header>
      <LandscapeScene
        projectTitle={state.project.title}
        remainingHp={state.remainingHp}
        maximumHp={state.maximumHp}
        villageHpPercent={state.villageHpPercent ?? 100}
        members={state.members}
        events={state.events}
        activeEvent={activeEvent}
        isOverdue={state.isOverdue ?? false}
      />

      <div className="boss-hp-panel">
        <div><strong>Boss HP</strong><span>{state.remainingHp} / {state.maximumHp}</span></div>
        <div className="boss-hp-track" role="progressbar" aria-valuemin={0} aria-valuemax={state.maximumHp} aria-valuenow={state.remainingHp}><span style={{ width: `${hpPercent}%` }} /></div>
        <small>Boss HP = total verified task damage required. Damage is a game value, not a perfect measure of effort or fairness.</small>
      </div>
      {defeated ? <section className="victory-panel"><p className="card-eyebrow">Project complete</p><h3>The boss is defeated!</h3><p>Every required task has been verified. Export the report or archive the project from the project tabs.</p></section> : null}
      <section className="combat-log" aria-labelledby="combat-log-title">
        <div><h4 id="combat-log-title">Combat log</h4><span>{state.events.length} verified attacks</span></div>
        {state.events.length === 0 ? <p>No attacks yet. A submitted task deals damage only after its assigned reviewer verifies it.</p> : (
          <ol>{[...state.events].reverse().map((event) => <li key={event._id}><strong>{event.attackerName} dealt {event.damage} damage</strong><span>{event.reviewerName} verified “{event.taskTitle}” · {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(event.createdAt)}</span></li>)}</ol>
        )}
      </section>
    </section>
  );
}
