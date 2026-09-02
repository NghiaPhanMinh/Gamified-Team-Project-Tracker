import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
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
const PURPOSE_MARQUEE_COPY = "Less guessing. Less gánh team. More shared responsibility.";
const PURPOSE_REVEAL_THRESHOLDS = [0.05, 0.18, 0.31, 0.44, 0.57, 0.7, 0.83] as const;

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
  { left: "0%", width: "12%", height: "58%", color: "#4CA0FE" },
  { left: "9%", width: "8%", height: "48%", color: "#FFF73F" },
  { left: "15%", width: "14%", height: "72%", color: "#4CA0FE" },
  { left: "27%", width: "9%", height: "54%", color: "#FF8AE7" },
  { left: "34%", width: "15%", height: "64%", color: "#4CA0FE" },
  { left: "47%", width: "8%", height: "48%", color: "#101517" },
  { left: "53%", width: "13%", height: "76%", color: "#4CA0FE" },
  { left: "64%", width: "10%", height: "52%", color: "#FFF73F" },
  { left: "72%", width: "13%", height: "68%", color: "#4CA0FE" },
  { left: "83%", width: "8%", height: "48%", color: "#FF8AE7" },
  { left: "89%", width: "11%", height: "60%", color: "#4CA0FE" },
] as const;

function PurposePhrase({ phrase }: { phrase: string }) {
  const words = phrase.split(" ");
  const center = (words.length - 1) / 2;

  return words.map((word, index) => (
    <span
      className="marketing-purpose-word"
      key={`${word}-${index}`}
      style={{
        "--wave-lift": `${Math.round(2 + (1 - Math.abs(index - center) / Math.max(center, 1)) * 8)}px`,
      } as CSSProperties}
    >
      {word}
    </span>
  ));
}

function PurposeStatement({
  blend = false,
  revealedLines,
}: {
  blend?: boolean;
  revealedLines: readonly boolean[];
}) {
  return (
    <h2
      className={`marketing-purpose-statement${blend ? " marketing-purpose-statement--blend" : ""}`}
      id={blend ? undefined : "why-maylamdi-title"}
      aria-hidden={blend ? "true" : undefined}
      aria-label={blend ? undefined : PURPOSE_PHRASES.join(" ")}
      data-purpose-blend={blend ? "true" : undefined}
    >
      {PURPOSE_PHRASES.map((phrase, index) => (
        <span
          className={`${index === 2 ? "marketing-purpose-phrase marketing-purpose-phrase--new-thought" : "marketing-purpose-phrase"}${revealedLines[index] ? " is-revealed" : ""}`}
          data-purpose-phrase={blend ? undefined : "true"}
          key={phrase}
        >
          <PurposePhrase phrase={phrase} />
        </span>
      ))}
    </h2>
  );
}

function PurposeWorkspaceVisual({ visualRef }: { visualRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className="marketing-purpose-workspace"
      role="img"
      aria-label="Simplified MayLamDi project workspace showing shared tasks and visible ownership"
      data-purpose-visual
      ref={visualRef}
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
  const [revealedPurposeLines, setRevealedPurposeLines] = useState<boolean[]>(() => {
    if (typeof window === "undefined") return PURPOSE_PHRASES.map(() => false);
    const shouldReduceMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return PURPOSE_PHRASES.map(() => shouldReduceMotion);
  });
  const [purposeVisualRevealed, setPurposeVisualRevealed] = useState(() => (
    typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));
  const cleanupTimer = useRef<number | null>(null);
  const purposeSection = useRef<HTMLElement | null>(null);
  const pixelTransition = useRef<HTMLDivElement | null>(null);
  const purposeStatementStack = useRef<HTMLDivElement | null>(null);
  const purposeVisual = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => {
    if (cleanupTimer.current !== null) {
      window.clearTimeout(cleanupTimer.current);
    }
  }, []);

  useEffect(() => {
    const section = purposeSection.current;
    const transition = pixelTransition.current;
    if (!section || !transition) return;

    const reducedMotion = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const blocks = Array.from(transition.querySelectorAll<HTMLElement>(".marketing-pixel-transition-block"));
    const base = transition.querySelector<HTMLElement>(".marketing-pixel-transition-base");
    const blendLayer = purposeStatementStack.current?.querySelector<HTMLElement>("[data-purpose-blend]");
    let animationFrame = 0;

    const setPixelProgress = (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      transition.dataset.progress = clamped.toFixed(2);
      if (base) base.style.transform = `translateY(${(1 - clamped) * 100}%)`;
      blocks.forEach((block, index) => {
        const delay = (index % 4) * 0.055;
        const localProgress = Math.min(1, Math.max(0, (clamped - delay) / (1 - delay)));
        block.style.transform = `translateY(${(1 - localProgress) * 70}%)`;
      });
    };

    const alignBlendLayer = () => {
      const stack = purposeStatementStack.current;
      const visual = purposeVisual.current;
      if (!stack || !visual || !blendLayer) return;

      const stackRect = stack.getBoundingClientRect();
      const visualRect = visual.getBoundingClientRect();
      const overlapLeft = Math.max(stackRect.left, visualRect.left);
      const overlapTop = Math.max(stackRect.top, visualRect.top);
      const overlapRight = Math.min(stackRect.right, visualRect.right);
      const overlapBottom = Math.min(stackRect.bottom, visualRect.bottom);

      if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) {
        blendLayer.style.clipPath = "inset(100% 0 0 0)";
        return;
      }

      blendLayer.style.clipPath = `inset(${overlapTop - stackRect.top}px ${stackRect.right - overlapRight}px ${stackRect.bottom - overlapBottom}px ${overlapLeft - stackRect.left}px)`;
    };

    const updateScene = () => {
      animationFrame = 0;
      if (reducedMotion?.matches) {
        setPixelProgress(1);
        setRevealedPurposeLines(PURPOSE_PHRASES.map(() => true));
        setPurposeVisualRevealed(true);
        alignBlendLayer();
        return;
      }

      const viewportHeight = Math.max(window.innerHeight, 1);
      const transitionRect = transition.getBoundingClientRect();
      setPixelProgress((viewportHeight * 0.96 - transitionRect.top) / (viewportHeight * 0.72));

      const sectionRect = section.getBoundingClientRect();
      if (sectionRect.height <= 0) return;
      const revealStart = viewportHeight * 0.72;
      const revealEnd = -Math.max(sectionRect.height - viewportHeight * 0.35, viewportHeight);
      const progress = Math.min(1, Math.max(0, (revealStart - sectionRect.top) / (revealStart - revealEnd)));

      setRevealedPurposeLines((current) => {
        const next = current.map((isRevealed, index) => (
          isRevealed || progress >= PURPOSE_REVEAL_THRESHOLDS[index]
        ));
        return next.some((value, index) => value !== current[index]) ? next : current;
      });
      if (progress >= 0.22) setPurposeVisualRevealed(true);
      alignBlendLayer();
    };

    const requestUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateScene);
    };

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(requestUpdate);
    if (purposeStatementStack.current) resizeObserver?.observe(purposeStatementStack.current);
    if (purposeVisual.current) resizeObserver?.observe(purposeVisual.current);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateScene();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      resizeObserver?.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
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

      <div className="marketing-about-transition-scene">
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
        className="marketing-pixel-transition"
        aria-hidden="true"
        ref={pixelTransition}
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
            } as CSSProperties}
          />
        ))}
      </div>

      <section
        className={`marketing-purpose${purposeVisualRevealed ? " is-visual-revealed" : ""}`}
        id="why-maylamdi"
        aria-labelledby="why-maylamdi-title"
        ref={purposeSection}
      >
        <div className="marketing-purpose-sticky">
          <div className="marketing-purpose-copy">
            <p className="marketing-purpose-label">About Us</p>
            <div className="marketing-purpose-statement-stack" ref={purposeStatementStack}>
              <PurposeStatement revealedLines={revealedPurposeLines} />
              <PurposeStatement blend revealedLines={revealedPurposeLines} />
            </div>
          </div>
          <PurposeWorkspaceVisual visualRef={purposeVisual} />
        </div>
        <div className="marketing-purpose-marquee" aria-label={PURPOSE_MARQUEE_COPY}>
          {["forward", "reverse"].map((direction) => (
            <div className={`marketing-purpose-marquee-row marketing-purpose-marquee-row--${direction}`} key={direction}>
              <div className="marketing-purpose-marquee-track">
                {Array.from({ length: 2 }, (_, groupIndex) => (
                  <div className="marketing-purpose-marquee-group" aria-hidden={groupIndex > 0 ? "true" : undefined} key={groupIndex}>
                    {Array.from({ length: 3 }, (_, copyIndex) => (
                      <span key={copyIndex}>{PURPOSE_MARQUEE_COPY}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>

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
