import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { BrandLogo } from "../components/brand/BrandLogo";
import { ThemeToggle } from "../components/theme/ThemeToggle";

export function LandingPage() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <a className="nav-brand" href="/" aria-label="MayLamDi home">
          <BrandLogo compact />
          <span>MayLamDi</span>
        </a>
        <div className="nav-actions">
          <ThemeToggle />
        </div>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker">Group projects, without the guessing game.</p>
          <h1 className="display-heading" id="hero-title">
            Make the work
            <span> feel shared.</span>
          </h1>
          <p className="hero-summary">
            MayLamDi helps university teams plan projects, divide work fairly,
            stay ahead of risks, and keep a clear contribution trail.
          </p>
          <div className="hero-actions">
            <GoogleSignInButton />
          </div>
          <p className="landing-flow-note">Create or join a project room, plan tasks together, submit evidence, review teammates, and defeat the project boss.</p>
        </div>

        <div className="hero-art" aria-label="MayLamDi brand mark">
          <div className="logo-orbit" aria-hidden="true" />
          <BrandLogo className="hero-logo" />
          <span className="floating-chip chip-one">fairness-first</span>
          <span className="floating-chip chip-two">realtime</span>
          <span className="floating-chip chip-three">human control</span>
        </div>
      </section>

      <footer>
        <BrandLogo compact />
        <p>MayLamDi — shared work, clearly planned.</p>
      </footer>
    </main>
  );
}
