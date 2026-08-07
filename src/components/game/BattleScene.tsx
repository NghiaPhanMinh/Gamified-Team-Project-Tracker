import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type BattleSceneProps = { projectId: Id<"projects"> };

function TeamCharacter({
  name,
  fill,
  outline,
  spell,
  attacking,
}: {
  name: string;
  fill: string;
  outline: string;
  spell: string;
  attacking: boolean;
}) {
  return (
    <figure className={`battle-character spell-${spell} ${attacking ? "is-attacking" : ""}`}>
      <svg viewBox="0 0 100 150" role="img" aria-label={`${name}'s character`}>
        <circle cx="50" cy="30" r="20" fill={fill} stroke={outline} strokeWidth="6" />
        <path d="M27 62 Q50 48 73 62 L80 116 Q50 136 20 116Z" fill={fill} stroke={outline} strokeWidth="6" />
        <path d="M28 72 L8 100 M72 72 L92 100 M35 118 L30 145 M65 118 L70 145" fill="none" stroke={outline} strokeWidth="8" strokeLinecap="round" />
        <circle cx="43" cy="27" r="3" fill={outline} /><circle cx="57" cy="27" r="3" fill={outline} />
      </svg>
      <figcaption>{name}</figcaption>
    </figure>
  );
}

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
  const activeEvent = state.events.find((event) => event._id === activeEventId);
  const hpPercent = state.maximumHp === 0 ? 100 : Math.round((state.remainingHp / state.maximumHp) * 100);
  const defeated = state.maximumHp > 0 && state.remainingHp === 0;

  return (
    <section className={`battle-page ${activeEvent ? "has-new-attack" : ""} ${defeated ? "is-defeated" : ""}`} aria-labelledby="battle-title">
      <header className="battle-summary">
        <div><p className="card-eyebrow">Realtime boss battle</p><h3 id="battle-title">{state.project.title}</h3></div>
        <dl><div><dt>Deadline</dt><dd>{state.project.deadline}</dd></div><div><dt>Tasks left</dt><dd>{state.remainingRequiredTasks}</dd></div></dl>
      </header>
      <div className="battle-arena">
        <div className="battle-sky" aria-hidden="true"><i /><i /><i /></div>
        <div className="battle-party">
          {state.members.map((member) => (
            <TeamCharacter key={member.profileId} name={member.displayName} fill={member.characterFill} outline={member.characterOutline} spell={member.spellType} attacking={activeEvent?.attackerProfileId === member.profileId} />
          ))}
        </div>
        <div className="dragon-wrap" aria-label={defeated ? "Boss defeated" : "Dragon boss"}>
          <svg className="dragon-boss" viewBox="0 0 260 230" role="img" aria-hidden="true">
            <path d="M55 120 Q5 65 50 42 Q90 20 110 78 Q150 12 202 38 Q250 63 205 122" fill="#fd39e4" stroke="#121f25" strokeWidth="8" />
            <path d="M72 94 Q130 55 190 95 L210 176 Q130 226 52 176Z" fill="#feaa01" stroke="#121f25" strokeWidth="9" />
            <path d="M94 55 L75 12 L120 45 M165 48 L205 13 L188 66" fill="#fff73f" stroke="#121f25" strokeWidth="8" strokeLinejoin="round" />
            <circle cx="108" cy="112" r="8" fill="#121f25" /><circle cx="163" cy="112" r="8" fill="#121f25" />
            <path d="M112 150 Q137 170 164 148" fill="none" stroke="#121f25" strokeWidth="7" strokeLinecap="round" />
          </svg>
          {activeEvent ? <><span className={`spell-projectile spell-${activeEvent.spellType}`} /><strong className="floating-damage">-{activeEvent.damage} HP</strong></> : null}
        </div>
        <div className="battle-ground" aria-hidden="true" />
      </div>
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
