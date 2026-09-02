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

const PURPOSE_PIXEL_BLOCKS = [
  { left: "0%", width: "12%", height: "58%", color: "#4CA0FE", delay: "0ms" },
  { left: "9%", width: "8%", height: "48%", color: "#FFF73F", delay: "70ms" },
  { left: "15%", width: "14%", height: "72%", color: "#4CA0FE", delay: "30ms" },
  { left: "27%", width: "9%", height: "54%", color: "#FF8AE7", delay: "120ms" },
  { left: "34%", width: "15%", height: "64%", color: "#4CA0FE", delay: "50ms" },
  { left: "47%", width: "8%", height: "48%", color: "#101517", delay: "160ms" },
  { left: "53%", width: "13%", height: "76%", color: "#4CA0FE", delay: "20ms" },
  { left: "64%", width: "10%", height: "52%", color: "#FFF73F", delay: "105ms" },
  { left: "72%", width: "13%", height: "68%", color: "#4CA0FE", delay: "45ms" },
  { left: "83%", width: "8%", height: "48%", color: "#FF8AE7", delay: "145ms" },
  { left: "89%", width: "11%", height: "60%", color: "#4CA0FE", delay: "65ms" },
] as const;

function PurposePhrase({ phrase }: { phrase: string }) {
  const words = phrase.split(" ");

  return words.map((word, index) => (
    <span className="marketing-purpose-word" key={`${word}-${index}`}>
      {word}
    </span>
  ));
}

function PurposeWorkspaceVisual() {
  return (
    <div
      className="marketing-purpose-workspace"
      role="img"
      aria-label="Simplified MayLamDi project workspace showing shared tasks and visible ownership"
      data-purpose-visual
    >
      <span className="marketing-purpose-workspace-overlap" aria-hidden="true">
        and keep contribution visible
      </span>
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
  const [purposeRevealed, setPurposeRevealed] = useState(() => {
    if (typeof window === "undefined") return false;
    const shouldReduceMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return shouldReduceMotion || typeof window.IntersectionObserver === "undefined";
  });
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

    const reducedMotion = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    if (reducedMotion?.matches || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setPurposeRevealed(true);
        observer.disconnect();
      }
    }, {
      rootMargin: "0px 0px -18% 0px",
      threshold: 0.08,
    });

    observer.observe(section);
    return () => observer.disconnect();
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

      </section>

      <div
        className={`marketing-pixel-transition${purposeRevealed ? " is-revealed" : ""}`}
        aria-hidden="true"
      >
        <span className="marketing-pixel-transition-base" />
        {PURPOSE_PIXEL_BLOCKS.map((block, index) => (
          <span
            className="marketing-pixel-transition-block"
            key={`${block.left}-${index}`}
            style={{
              "--pixel-left": block.left,
              "--pixel-width": block.width,
              "--pixel-height": block.height,
              "--pixel-color": block.color,
              "--pixel-delay": block.delay,
            } as CSSProperties}
          />
        ))}
      </div>

      <section
        className={`marketing-purpose${purposeRevealed ? " is-revealed" : ""}`}
        id="why-maylamdi"
        aria-labelledby="why-maylamdi-title"
        ref={purposeSection}
      >
        <div className="marketing-purpose-sticky">
          <div className="marketing-purpose-copy">
            <p className="marketing-purpose-label">About Us</p>
            <h2
              className="marketing-purpose-statement"
              id="why-maylamdi-title"
              aria-label={PURPOSE_PHRASES.join(" ")}
            >
              {PURPOSE_PHRASES.map((phrase, index) => (
                <span
                  className={index === 2 ? "marketing-purpose-phrase marketing-purpose-phrase--new-thought" : "marketing-purpose-phrase"}
                  data-purpose-phrase
                  key={phrase}
                  style={{ "--purpose-index": index } as CSSProperties}
                >
                  <PurposePhrase phrase={phrase} />
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
