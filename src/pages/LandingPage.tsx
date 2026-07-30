import { BrandLogo } from "../components/brand/BrandLogo";
import { ConvexStatus } from "../components/system/ConvexStatus";
import { ThemeToggle } from "../components/theme/ThemeToggle";

const principles = [
  {
    eyebrow: "Plan together",
    title: "Turn a big brief into a clear path.",
    detail:
      "Shape phases, milestones, dependencies, and practical tasks without forcing every course into the same workflow.",
    accent: "yellow",
  },
  {
    eyebrow: "Share fairly",
    title: "Allocate work with reasons, not guesses.",
    detail:
      "Balance skills, availability, preferences, and workload. Every suggestion stays editable by the team.",
    accent: "pink",
  },
  {
    eyebrow: "Keep the receipts",
    title: "Preserve useful contribution evidence.",
    detail:
      "Capture task history, reviews, notes, links, images, and PDFs for reflection without ranking teammates.",
    accent: "green",
  },
] as const;

export function LandingPage() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <a className="nav-brand" href="/" aria-label="MayLamDi home">
          <BrandLogo compact />
          <span>MayLamDi</span>
        </a>
        <div className="nav-actions">
          <a href="#how-it-helps">How it helps</a>
          <ThemeToggle />
        </div>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker">Group projects, without the guessing game.</p>
          <h1 id="hero-title">
            Make the work
            <span> feel shared.</span>
          </h1>
          <p className="hero-summary">
            MayLamDi helps university teams plan projects, divide work fairly,
            stay ahead of risks, and keep a clear contribution trail.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" disabled>
              Google sign-in arrives after the foundation gate
            </button>
            <a className="text-link" href="#how-it-helps">
              See the plan
            </a>
          </div>
          <div className="foundation-note">
            <ConvexStatus />
            <p>
              Clean-start foundation. No old QuestBoard code has been restored.
            </p>
          </div>
        </div>

        <div className="hero-art" aria-label="MayLamDi brand mark">
          <div className="logo-orbit" aria-hidden="true" />
          <BrandLogo className="hero-logo" />
          <span className="floating-chip chip-one">fairness-first</span>
          <span className="floating-chip chip-two">realtime</span>
          <span className="floating-chip chip-three">human control</span>
        </div>
      </section>

      <section
        className="principles-section"
        id="how-it-helps"
        aria-labelledby="principles-title"
      >
        <div className="section-heading">
          <p className="kicker">Practical first. Playful on top.</p>
          <h2 id="principles-title">A calmer way to carry the project.</h2>
        </div>
        <div className="principles-grid">
          {principles.map((principle, index) => (
            <article
              className={`principle-card accent-${principle.accent}`}
              key={principle.title}
            >
              <span className="card-number" aria-hidden="true">
                0{index + 1}
              </span>
              <p className="card-eyebrow">{principle.eyebrow}</p>
              <h3>{principle.title}</h3>
              <p>{principle.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <BrandLogo compact />
        <p>MayLamDi — shared work, clearly planned.</p>
      </footer>
    </main>
  );
}
