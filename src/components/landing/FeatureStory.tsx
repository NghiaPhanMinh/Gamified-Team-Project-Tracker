import { Check, CheckCircle2, Sparkles, Swords, Users } from "lucide-react";

const TEAM_ROWS = [
  { initial: "L", name: "Linh", owner: "Interview synthesis", load: "62%", color: "pink" },
  { initial: "H", name: "Huy", owner: "Interactive prototype", load: "78%", color: "blue" },
  { initial: "Q", name: "Quinn", owner: "Usability testing", load: "54%", color: "yellow" },
] as const;

function TrackingDemo() {
  return (
    <div className="landing-product-demo landing-tracking-demo" aria-label="Team tracking example">
      <header><div><span className="landing-demo-label">Team workspace</span><h3>Who owns what</h3></div><Users aria-hidden="true" /></header>
      <div className="landing-tracking-summary"><span>7 tasks moving</span><span>1 needs attention</span></div>
      <ul>
        {TEAM_ROWS.map((member) => (
          <li key={member.name}>
            <span className={`landing-avatar is-${member.color}`}>{member.initial}</span>
            <div><strong>{member.name}</strong><small>{member.owner}</small></div>
            <div className="landing-workload"><span>Workload {member.load}</span><div><i style={{ width: member.load }} /></div></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AiDemo() {
  return (
    <div className="landing-product-demo landing-ai-demo" aria-label="Editable AI planning example">
      <header><div><span className="landing-demo-label">AI planning assistant</span><h3>From brief to a reviewable plan</h3></div><Sparkles aria-hidden="true" /></header>
      <div className="landing-ai-flow">
        <div><span>Brief</span><strong>Prototype an inclusive campus app</strong></div>
        <span aria-hidden="true">↓</span>
        <div className="is-ai"><span>AI interprets</span><strong>4 phases · 8 tasks · 3 owners</strong></div>
      </div>
      <div className="landing-ai-output">
        <div><span>Phase</span><strong>Test</strong></div>
        <div><span>Task</span><strong>Run five usability sessions</strong></div>
        <div className="landing-owner-swap"><span>Owner</span><strong><i>Linh</i><i>Quinn</i></strong><small>Editable suggestion</small></div>
      </div>
      <p><CheckCircle2 aria-hidden="true" /> AI suggests. You decide.</p>
    </div>
  );
}

function GameDemo() {
  return (
    <div className="landing-product-demo landing-game-demo" aria-label="Gamified progress example">
      <header><div><span className="landing-demo-label">Shared objective</span><h3>Project boss</h3></div><Swords aria-hidden="true" /></header>
      <div className="landing-game-stage">
        <div className="landing-game-team" aria-label="Three team members"><span>L</span><span>H</span><span>Q</span></div>
        <div className="landing-boss"><Swords aria-hidden="true" /><strong>Final boss</strong></div>
        <div className="landing-boss-hp"><div><span>Boss HP</span><strong>36%</strong></div><div><i /></div></div>
      </div>
      <div className="landing-quest-complete"><Check aria-hidden="true" /><div><strong>Usability test verified</strong><span>Quest complete · shared progress +8%</span></div></div>
      <div className="landing-game-explainer" aria-label="How real work becomes game feedback"><span>Real work</span><i>→</i><span>Evidence</span><i>→</i><span>Progress</span><i>→</i><span>Game feedback</span></div>
    </div>
  );
}

export function FeatureStory() {
  return (
    <section className="landing-features landing-chapter" id="features" aria-labelledby="landing-features-title">
      <header className="landing-features-intro" data-reveal>
        <p className="landing-section-number">03 / Core features</p>
        <h2 id="landing-features-title">One project. Three ways to stop gánh team.</h2>
      </header>

      <article className="landing-feature-scene landing-feature-tracking">
        <div className="landing-feature-copy" data-reveal><span>01 / Team tracking</span><h3>Know who’s doing what.</h3><p>See responsibilities, workload, deadlines, evidence and contribution without chasing everyone through the group chat.</p></div>
        <div data-reveal><TrackingDemo /></div>
      </article>

      <article className="landing-feature-scene landing-feature-ai">
        <div data-reveal><AiDemo /></div>
        <div className="landing-feature-copy" data-reveal><span>02 / AI assistant</span><h3>Start with a plan, not a guessing game.</h3><p>Give MayLamDi your brief, framework, deadline and team context. AI suggests a structure and allocation — your team stays in control.</p><small>AI suggests. You decide.</small></div>
      </article>

      <article className="landing-feature-scene landing-feature-game">
        <div className="landing-feature-copy" data-reveal><span>03 / Gamification</span><h3>Make progress something the whole team can see.</h3><p>Real work becomes visible progress, turning project completion into a shared team objective.</p></div>
        <div data-reveal><GameDemo /></div>
      </article>
    </section>
  );
}
