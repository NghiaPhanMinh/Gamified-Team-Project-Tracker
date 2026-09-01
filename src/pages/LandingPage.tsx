import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, CheckCircle2 } from "lucide-react";

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

const MARQUEE_GROUP_COUNT = 4;

const BURST_COLORS = ["#fff73f", "#ff8ae7", "#4ca0fe", "#1dd851", "#feaa01"];

const PURPOSE_PHRASES = [
  "Group projects should feel shared,",
  "not carried by one person.",
  "MayLamDi helps university teams",
  "plan work fairly,",
  "see who owns what,",
  "and keep contribution visible",
  "from start to finish.",
] as const;

function PurposeWorkspaceVisual() {
  return (
    <div
      className="marketing-purpose-workspace"
      role="img"
      aria-label="Simplified MayLamDi project workspace showing shared tasks and visible ownership"
      data-purpose-visual
    >
      <div className="marketing-purpose-workspace-bar">
        <div aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>Project room</strong>
        <span className="live-badge">Live</span>
      </div>
      <div className="marketing-purpose-workspace-body">
        <div className="marketing-purpose-workspace-nav">
          <span className="is-active">Project</span>
          <span>Tasks</span>
          <span>Team</span>
        </div>
        <div className="marketing-purpose-workspace-content">
          <span className="card-eyebrow">Launch week · Shared plan</span>
          <div className="marketing-purpose-progress-heading">
            <strong>72% visible progress</strong>
            <span>3 teammates</span>
          </div>
          <div className="progress-track"><span style={{ width: "72%" }} /></div>
          <div className="marketing-purpose-task-list">
            <div><span>Research findings</span><strong>Team</strong></div>
            <div><span>Prototype review</span><strong>You</strong></div>
            <div><span>Final handoff</span><strong>Shared</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const purposeSection = useRef<HTMLElement | null>(null);

  useEffect(() => () => {
    if (cleanupTimer.current !== null) {
      window.clearTimeout(cleanupTimer.current);
    }
  }, []);

  useEffect(() => {
    const section = purposeSection.current;
    if (!section) return;

    const phrases = Array.from(
      section.querySelectorAll<HTMLElement>("[data-purpose-phrase]"),
    );
    const visual = section.querySelector<HTMLElement>("[data-purpose-visual]");
    const reducedMotion = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const mobileLayout = typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 760px)")
      : null;
    const requestFrame = typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 16);
    const cancelFrame = typeof window.cancelAnimationFrame === "function"
      ? window.cancelAnimationFrame.bind(window)
      : window.clearTimeout.bind(window);
    let animationFrame: number | null = null;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const updatePurposeReveal = () => {
      animationFrame = null;
      const rect = section.getBoundingClientRect();
      const shouldReduceMotion = reducedMotion?.matches ?? false;
      const isMobileLayout = mobileLayout?.matches ?? window.innerWidth <= 760;
      let progress = 1;

      if (!shouldReduceMotion) {
        if (isMobileLayout) {
          progress = clamp(
            (window.innerHeight * 0.82 - rect.top) / Math.max(rect.height * 0.78, 1),
          );
        } else {
          progress = clamp(
            -rect.top / Math.max(section.offsetHeight - window.innerHeight, 1),
          );
        }
      }

      phrases.forEach((phrase, index) => {
        const start = phrases.length > 1 ? (index / (phrases.length - 1)) * 0.72 : 0;
        const reveal = shouldReduceMotion
          ? 1
          : clamp((progress - start) / 0.28);
        const easedReveal = 1 - Math.pow(1 - reveal, 3);

        phrase.style.setProperty("--purpose-phrase-opacity", String(0.2 + easedReveal * 0.8));
        phrase.style.setProperty("--purpose-phrase-shift", `${(1 - easedReveal) * 12}px`);
      });

      if (visual) {
        const motionProgress = shouldReduceMotion ? 1 : progress;
        visual.style.setProperty("--purpose-visual-y", `${(1 - motionProgress) * 80}px`);
        visual.style.setProperty("--purpose-visual-rotate", `${(1 - motionProgress) * 3}deg`);
        visual.style.setProperty("--purpose-visual-scale", String(0.95 + motionProgress * 0.05));
      }
    };

    const schedulePurposeReveal = () => {
      if (animationFrame === null) {
        animationFrame = requestFrame(updatePurposeReveal);
      }
    };

    updatePurposeReveal();
    window.addEventListener("scroll", schedulePurposeReveal, { passive: true });
    window.addEventListener("resize", schedulePurposeReveal);
    reducedMotion?.addEventListener("change", schedulePurposeReveal);
    mobileLayout?.addEventListener("change", schedulePurposeReveal);

    return () => {
      window.removeEventListener("scroll", schedulePurposeReveal);
      window.removeEventListener("resize", schedulePurposeReveal);
      reducedMotion?.removeEventListener("change", schedulePurposeReveal);
      mobileLayout?.removeEventListener("change", schedulePurposeReveal);
      if (animationFrame !== null) cancelFrame(animationFrame);
    };
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
    <main
      className="marketing-shell"
      data-authenticated={isAuthenticated ? "true" : "false"}
    >
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
                  viewBox="0 0 340 126"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M22 64C13 31 57 9 154 7C255 3 326 25 329 59C332 93 277 105 174 106C82 107 29 94 22 64" />
                  <path d="M13 60C18 24 77 4 171 10C267 15 334 35 321 73C311 101 247 109 152 101C67 94 9 84 13 60" />
                </svg>
              </span>
            </button>
          </h1>
          <p className="marketing-copy">
            Create or join a project room, then move from brief to plan to execution
            together with less guesswork.
          </p>
          <a className="marketing-scroll-cue" href="#why-maylamdi">
            See what MayLamDi does <ArrowDown aria-hidden="true" />
          </a>
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

      <section
        className="marketing-purpose"
        id="why-maylamdi"
        aria-labelledby="why-maylamdi-title"
        ref={purposeSection}
      >
        <div className="marketing-purpose-sticky">
          <div className="marketing-purpose-copy">
            <p className="marketing-purpose-label">Why MayLamDi</p>
            <h2 className="marketing-purpose-statement" id="why-maylamdi-title">
              {PURPOSE_PHRASES.map((phrase, index) => (
                <span
                  className={index === 2 ? "marketing-purpose-phrase marketing-purpose-phrase--new-thought" : "marketing-purpose-phrase"}
                  data-purpose-phrase
                  key={phrase}
                >
                  {phrase}
                </span>
              ))}
            </h2>
          </div>
          <PurposeWorkspaceVisual />
          <p className="marketing-purpose-support">
            Less guessing. Less gánh team. More shared responsibility.
          </p>
        </div>
      </section>

      <section className="marketing-features" id="how-it-works" aria-labelledby="how-it-works-title">
        <h2 className="sr-only" id="how-it-works-title">See how it works</h2>
        <div className="marketing-marquee">
          <div className="marketing-marquee-track">
            {Array.from({ length: MARQUEE_GROUP_COUNT }, (_, groupIndex) => (
              <div
                className="marketing-feature-group"
                key={groupIndex}
                aria-hidden={groupIndex > 0 ? "true" : undefined}
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
