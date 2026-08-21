import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { BrandLogo } from "../components/brand/BrandLogo";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function LandingPage() {
  return (
    <main className="marketing-shell">
      <header className="marketing-header">
        <a className="nav-brand" href="/" aria-label="MayLamDi home">
          <BrandLogo compact />
          <span>MayLamDi</span>
        </a>
        <div className="marketing-header-actions">
          <ThemeToggle />
        </div>
      </header>

      <section className="marketing-hero" aria-labelledby="marketing-title">
        <div>
          <p className="kicker">Teamwork tracking &amp; task allocation</p>
          <h1 id="marketing-title">Make the work <em>feel shared.</em></h1>
          <p className="marketing-copy">
            Create or join a project room, then move from brief to plan to execution
            together with less guesswork.
          </p>
          <div className="marketing-actions">
            <GoogleSignInButton />
            <a className="quiet-button" href="#how-it-works">See how it works <ArrowRight aria-hidden="true" /></a>
          </div>
          <p className="marketing-signin-note">Sign in once to keep your contribution trail private.</p>
          <div className="marketing-proof" aria-label="MayLamDi principles">
            <span><CheckCircle2 aria-hidden="true" /> Clear project plans</span>
            <span><CheckCircle2 aria-hidden="true" /> Explainable allocation</span>
            <span><CheckCircle2 aria-hidden="true" /> Supportive progress tracking</span>
          </div>
        </div>

        <div className="marketing-preview" aria-label="MayLamDi workspace preview">
          <div className="marketing-preview-top">
            <span className="card-eyebrow">Project at a glance</span>
            <span className="live-badge">Live workspace</span>
          </div>
          <div className="marketing-preview-card">
            <span className="card-eyebrow">Brand campaign · Ideation</span>
            <h2>Build a direction your team can share.</h2>
            <p>Brief → plan → execute, with clear ownership at every step.</p>
            <div className="progress-track" aria-label="Project progress 68%"><span style={{ width: "68%" }} /></div>
          </div>
          <div className="marketing-preview-grid">
            <div className="marketing-mini-card"><span className="card-eyebrow">Team workload</span><strong>Balanced</strong><small>Visible before work drifts</small></div>
            <div className="marketing-mini-card"><span className="card-eyebrow">AI support</span><strong>Reviewable</strong><small>Suggestions stay with your team</small></div>
          </div>
        </div>
      </section>

      <section className="marketing-features" id="how-it-works" aria-label="How MayLamDi works">
        <article className="marketing-feature"><span className="card-eyebrow">01 / Understand</span><h2>Start with the brief.</h2><p>Keep the assignment purpose, requirements, deadline, and constraints visible to everyone.</p></article>
        <article className="marketing-feature"><span className="card-eyebrow">02 / Share</span><h2>Plan work fairly.</h2><p>See who owns what, how much effort it carries, and where workload needs attention.</p></article>
        <article className="marketing-feature"><span className="card-eyebrow">03 / Move</span><h2>Make progress visible.</h2><p>Track contribution and celebrate team moments without turning collaboration into a ranking.</p></article>
      </section>
    </main>
  );
}
