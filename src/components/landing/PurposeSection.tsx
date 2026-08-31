import { CheckCircle2 } from "lucide-react";

const PRINCIPLES = [
  ["Plan fairly", "Skills, capacity and availability shape the plan."],
  ["Share responsibility", "Everyone sees who owns what."],
  ["Move together", "Progress and contribution stay visible."],
] as const;

function ProjectGlancePreview() {
  return (
    <div className="landing-glance" aria-label="Project at a Glance example">
      <header>
        <div>
          <p className="landing-demo-label">Project at a glance</p>
          <h3>Prototype testing</h3>
        </div>
        <span className="landing-live-pill"><span aria-hidden="true" /> Live</span>
      </header>
      <div className="landing-glance-progress">
        <div><span>Overall progress</span><strong>68%</strong></div>
        <div className="landing-demo-progress"><span style={{ width: "68%" }} /></div>
      </div>
      <div className="landing-glance-grid">
        <div><span>Next milestone</span><strong>Usability review</strong><small>Due Friday</small></div>
        <div><span>Workload</span><strong>Balanced</strong><small>1 task needs an owner</small></div>
      </div>
      <ul className="landing-glance-team" aria-label="Project team">
        <li><span className="landing-avatar is-pink">L</span><div><strong>Linh</strong><small>Research · 2 tasks</small></div><span>On track</span></li>
        <li><span className="landing-avatar is-blue">H</span><div><strong>Huy</strong><small>Prototype · 3 tasks</small></div><span>Making</span></li>
        <li><span className="landing-avatar is-yellow">Q</span><div><strong>Quinn</strong><small>Testing · 2 tasks</small></div><span>Reviewing</span></li>
      </ul>
    </div>
  );
}

export function PurposeSection() {
  return (
    <section className="landing-purpose landing-chapter" id="purpose" aria-labelledby="landing-purpose-title">
      <div className="landing-drift-words" aria-hidden="true"><span>FAIR</span><span>SHARED</span><span>VISIBLE</span></div>
      <div className="landing-purpose-copy" data-reveal>
        <p className="landing-section-number">02 / What MayLamDi is for</p>
        <h2 id="landing-purpose-title">Group projects shouldn’t need a designated carrier.</h2>
        <p className="landing-section-lede">MayLamDi helps university teams plan work fairly, see who owns what, and keep contribution visible before one person ends up carrying the project.</p>
        <ol className="landing-principles">
          {PRINCIPLES.map(([title, description]) => (
            <li key={title}>
              <CheckCircle2 aria-hidden="true" />
              <div><strong>{title}</strong><span>{description}</span></div>
            </li>
          ))}
        </ol>
      </div>
      <div className="landing-purpose-visual" data-reveal><ProjectGlancePreview /></div>
    </section>
  );
}
