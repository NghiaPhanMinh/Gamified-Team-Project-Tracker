import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { BrandLogo } from "../components/brand/BrandLogo";
import { ThemeToggle } from "../components/theme/ThemeToggle";

type LandingPageProps = {
  isAuthenticated?: boolean;
};

type BurstWord = {
  id: string;
  style: CSSProperties;
};

const FEATURES = [
  {
    step: "01 / Understand",
    title: "Start with the brief.",
    description:
      "Keep the assignment purpose, requirements, deadline, and constraints visible to everyone.",
    accent: "yellow",
  },
  {
    step: "02 / Share",
    title: "Plan work fairly.",
    description:
      "See who owns what, how much effort it carries, and where workload needs attention.",
    accent: "pink",
  },
  {
    step: "03 / Move",
    title: "Make progress visible.",
    description:
      "Track contribution and celebrate team moments without turning collaboration into a ranking.",
    accent: "blue",
  },
] as const;

const BURST_COLORS = ["#fff73f", "#ff8ae7", "#4ca0fe", "#1dd851", "#feaa01"];

function buildBurstWords(): BurstWord[] {
  return Array.from({ length: 42 }, (_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 38 + Math.random() * 68;
    const style = {
      "--burst-x": `${6 + Math.random() * 88}vw`,
      "--burst-y": `${8 + Math.random() * 84}vh`,
      "--burst-size": `${20 + Math.random() * 42}px`,
      "--burst-rotation": `${-18 + Math.random() * 36}deg`,
      "--burst-end-rotation": `${-36 + Math.random() * 72}deg`,
      "--burst-dx": `${Math.cos(angle) * distance}vw`,
      "--burst-dy": `${Math.sin(angle) * distance}vh`,
      "--burst-delay": `${Math.random() * 140}ms`,
      "--burst-color": BURST_COLORS[index % BURST_COLORS.length],
    } as CSSProperties;

    return { id: `${Date.now()}-${index}`, style };
  });
}

export function LandingPage({ isAuthenticated = false }: LandingPageProps) {
  const [burstWords, setBurstWords] = useState<BurstWord[]>([]);
  const cleanupTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (cleanupTimer.current !== null) {
      window.clearTimeout(cleanupTimer.current);
    }
  }, []);

  function triggerTextBurst() {
    if (cleanupTimer.current !== null) {
      window.clearTimeout(cleanupTimer.current);
    }

    setBurstWords(buildBurstWords());
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cleanupTimer.current = window.setTimeout(
      () => setBurstWords([]),
      reducedMotion ? 400 : 1800,
    );
  }

  return (
    <main className="marketing-shell">
      <header className="marketing-header">
        <Link className="nav-brand" to="/" aria-label="MayLamDi landing page">
          <BrandLogo compact />
          <span>MayLamDi</span>
        </Link>
        <div className="marketing-header-actions">
          <ThemeToggle />
        </div>
      </header>

      <section className="marketing-hero" aria-labelledby="marketing-title">
        <div>
          <p className="kicker">Teamwork tracking &amp; task allocation</p>
          <h1 id="marketing-title" className="marketing-title">
            <button
              className="marketing-title-trigger"
              type="button"
              onClick={triggerTextBurst}
            >
              <span>Make teamwork </span>
              <span className="marketing-title-hook">
                <em>feel shared.</em>
                <svg
                  className="marketing-title-sketch"
                  viewBox="0 0 330 120"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M21 67C17 31 65 9 160 8C258 7 316 28 313 65C309 101 251 113 160 111C72 109 26 98 21 67Z" />
                  <path d="M13 62C18 23 75 4 166 10C262 15 324 35 317 73C311 106 244 117 151 108C66 101 9 91 13 62Z" />
                </svg>
              </span>
            </button>
          </h1>
          <p className="marketing-copy">
            Create or join a project room, then move from brief to plan to execution
            together with less guesswork.
          </p>
          <div className="marketing-actions">
            {isAuthenticated ? (
              <Link className="primary-button" to="/projects">Go to Projects</Link>
            ) : (
              <GoogleSignInButton />
            )}
            <a className="quiet-button" href="#how-it-works">See how it works <ArrowRight aria-hidden="true" /></a>
          </div>
          <p className="marketing-signin-note">
            {isAuthenticated
              ? "Your private workspace is ready when you are."
              : "Sign in once to keep your contribution trail private."}
          </p>
          <div className="marketing-proof" aria-label="MayLamDi principles">
            <span><CheckCircle2 aria-hidden="true" /> Clear project plans</span>
            <span><CheckCircle2 aria-hidden="true" /> Explainable allocation</span>
            <span><CheckCircle2 aria-hidden="true" /> Supportive progress tracking</span>
          </div>
        </div>

        <div className="marketing-hero-visual">
          <div className="marketing-hero-logo-stage">
            <span className="marketing-logo-orbit marketing-logo-orbit--outer" aria-hidden="true" />
            <span className="marketing-logo-orbit marketing-logo-orbit--inner" aria-hidden="true" />
            <BrandLogo className="marketing-hero-logo" />
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
        </div>
      </section>

      <section className="marketing-features" id="how-it-works" aria-labelledby="how-it-works-title">
        <h2 className="sr-only" id="how-it-works-title">See how it works</h2>
        <div className="marketing-marquee">
          <div className="marketing-marquee-track">
            {[0, 1].map((groupIndex) => (
              <div
                className="marketing-feature-group"
                key={groupIndex}
                aria-hidden={groupIndex === 1 ? "true" : undefined}
              >
                {FEATURES.map((feature) => (
                  <article
                    className={`marketing-feature marketing-feature--${feature.accent}`}
                    key={`${groupIndex}-${feature.step}`}
                  >
                    <span className="card-eyebrow">{feature.step}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {burstWords.length > 0 ? (
        <div className="maylamdi-burst" aria-hidden="true">
          {burstWords.map((word) => (
            <span className="maylamdi-burst-word" key={word.id} style={word.style}>MAYLAMDI</span>
          ))}
        </div>
      ) : null}
    </main>
  );
}
