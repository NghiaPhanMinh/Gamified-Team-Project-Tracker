import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from "react";
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

type PurposeCharacterHover = {
  lineIndex: number;
  characterIndex: number;
};

const PURPOSE_MARQUEE_COPY = "LESS GUESSING. LESS GÁNH TEAM. MORE SHARED RESPONSIBILITY.";
const PURPOSE_REVEAL_THRESHOLDS = [0.04, 0.15, 0.26, 0.37, 0.48, 0.59, 0.70] as const;
const PIXEL_COLOR_SEQUENCES = [
  ["#FF8AE7", "#FFF73F", "#101517", "#4CA0FE"],
  ["#FFF73F", "#FF8AE7", "#101517", "#4CA0FE"],
  ["#101517", "#FF8AE7", "#FFF73F", "#4CA0FE"],
  ["#FF8AE7", "#101517", "#FFF73F", "#4CA0FE"],
] as const;

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

const PURPOSE_PIXEL_CELLS = Array.from({ length: 16 }, (_, columnIndex) => {
  const rowCount = 9 + ((columnIndex * 5) % 4);
  const weights = Array.from({ length: rowCount }, (_, rowIndex) => (
    0.78 + (((columnIndex * 7) + (rowIndex * 5)) % 6) * 0.09
  ));
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  let top = 0;

  return weights.map((weight, rowIndex) => {
    const height = (weight / totalWeight) * 100;
    const verticalCenter = (top + (height / 2)) / 100;
    const jitter = (((columnIndex * 11) + (rowIndex * 13)) % 9) / 100;
    const threshold = Math.min(0.66, 0.02 + ((1 - verticalCenter) * 0.52) + jitter);
    const cell = {
      id: `${columnIndex}-${rowIndex}`,
      left: `${columnIndex * 6.25}%`,
      top: `${top}%`,
      width: "6.25%",
      height: `${height}%`,
      threshold,
      variant: (columnIndex + rowIndex) % PIXEL_COLOR_SEQUENCES.length,
    };
    top += height;
    return cell;
  });
}).flat();

const FEATURE_TAGS = [
  {
    id: "ai-assistant",
    label: "AI ASSISTANT",
    description: "Turns a project brief into editable task and allocation suggestions.",
  },
  {
    id: "team-tracking",
    label: "TEAM TRACKING",
    description: "See responsibilities, workload, evidence, and progress in one place.",
  },
  {
    id: "fair-task-allocation",
    label: "FAIR TASK ALLOCATION",
    description: "Make ownership visible so the work can be shared before it becomes a problem.",
  },
  {
    id: "gamification",
    label: "GAMIFICATION",
    description: "Turn real project progress into shared quests and team outcomes.",
  },
  {
    id: "real-time-workspace",
    label: "REAL-TIME WORKSPACE",
    description: "Keep project changes and team progress visible as they happen.",
  },
  {
    id: "contribution-evidence",
    label: "CONTRIBUTION EVIDENCE",
    description: "Keep a useful record of who contributed what and when.",
  },
  {
    id: "workload-visibility",
    label: "WORKLOAD VISIBILITY",
    description: "Spot uneven effort early and rebalance the plan together.",
  },
  {
    id: "project-planning",
    label: "PROJECT PLANNING",
    description: "Move from a brief to a clear, shared sequence of project work.",
  },
  {
    id: "peer-review",
    label: "PEER REVIEW",
    description: "Create supportive checkpoints for feedback before the final handoff.",
  },
  {
    id: "human-control",
    label: "HUMAN CONTROL",
    description: "Keep every suggestion editable and every important decision with the team.",
  },
] as const;

type FeatureTagPosition = {
  left: number;
  top: number;
  rotation: number;
  delay: number;
};

const INITIAL_FEATURE_TAG_POSITIONS: Record<string, FeatureTagPosition> = {
  "ai-assistant": { left: 8, top: 20, rotation: -4, delay: 60 },
  "team-tracking": { left: 29, top: 14, rotation: 3, delay: 150 },
  "fair-task-allocation": { left: 56, top: 21, rotation: -2, delay: 240 },
  gamification: { left: 78, top: 13, rotation: 4, delay: 330 },
  "real-time-workspace": { left: 15, top: 42, rotation: 2, delay: 420 },
  "contribution-evidence": { left: 43, top: 38, rotation: -3, delay: 510 },
  "workload-visibility": { left: 72, top: 43, rotation: 3, delay: 600 },
  "project-planning": { left: 4, top: 66, rotation: -2, delay: 690 },
  "peer-review": { left: 31, top: 60, rotation: 4, delay: 780 },
  "human-control": { left: 63, top: 66, rotation: -3, delay: 870 },
};

function PurposePhrase({
  blend,
  hoveredCharacter,
  lineIndex,
  onCharacterHover,
  phrase,
}: {
  blend: boolean;
  hoveredCharacter: PurposeCharacterHover | null;
  lineIndex: number;
  onCharacterHover?: (hover: PurposeCharacterHover | null) => void;
  phrase: string;
}) {
  let characterCursor = 0;

  return phrase.split(" ").map((word, wordIndex) => {
    const wordStart = characterCursor;
    characterCursor += word.length + 1;

    return (
      <span className="marketing-purpose-word" key={`${word}-${wordIndex}`}>
        {Array.from(word).map((character, localIndex) => {
          const characterIndex = wordStart + localIndex;
          const distance = hoveredCharacter?.lineIndex === lineIndex
            ? Math.abs(characterIndex - hoveredCharacter.characterIndex)
            : Number.POSITIVE_INFINITY;
          const lift = Number.isFinite(distance)
            ? 18 * Math.exp(-((distance * distance) / 3.2))
            : 0;
          const rotation = distance <= 3 && hoveredCharacter
            ? Math.max(-1, Math.min(1, (characterIndex - hoveredCharacter.characterIndex) * 0.35))
            : 0;

          return (
            <span
              className="marketing-purpose-character"
              data-character-index={characterIndex}
              key={`${character}-${characterIndex}`}
              onMouseEnter={blend ? undefined : () => onCharacterHover?.({ lineIndex, characterIndex })}
              style={{
                "--wave-lift": `${lift.toFixed(2)}px`,
                "--wave-rotation": `${rotation.toFixed(2)}deg`,
              } as CSSProperties}
            >
              {character}
            </span>
          );
        })}
      </span>
    );
  });
}

function PurposeStatement({
  blend = false,
  hoveredCharacter,
  onCharacterHover,
  revealedLines,
}: {
  blend?: boolean;
  hoveredCharacter: PurposeCharacterHover | null;
  onCharacterHover?: (hover: PurposeCharacterHover | null) => void;
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
          className={`${index === 2 ? "marketing-purpose-phrase marketing-purpose-phrase--new-thought" : "marketing-purpose-phrase"}${revealedLines[index] ? " is-revealed" : ""}${hoveredCharacter?.lineIndex === index ? " is-waved" : ""}`}
          data-purpose-phrase={blend ? undefined : "true"}
          key={phrase}
          onMouseLeave={blend ? undefined : () => onCharacterHover?.(null)}
        >
          <PurposePhrase
            blend={blend}
            hoveredCharacter={hoveredCharacter}
            lineIndex={index}
            onCharacterHover={onCharacterHover}
            phrase={phrase}
          />
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

function FeatureTagComposition({ tagsDropped }: { tagsDropped: boolean }) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [activeTagId, setActiveTagId] = useState<string>(FEATURE_TAGS[0].id);
  const [draggingTagId, setDraggingTagId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, FeatureTagPosition>>(
    () => structuredClone(INITIAL_FEATURE_TAG_POSITIONS),
  );

  const updateTagPosition = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const tagRect = event.currentTarget.getBoundingClientRect();
    const maxLeft = Math.max(0, canvasRect.width - tagRect.width);
    const maxTop = Math.max(0, canvasRect.height - tagRect.height);
    const left = Math.min(maxLeft, Math.max(0, event.clientX - canvasRect.left - drag.offsetX));
    const top = Math.min(maxTop, Math.max(0, event.clientY - canvasRect.top - drag.offsetY));

    setPositions((current) => ({
      ...current,
      [drag.id]: {
        ...current[drag.id],
        left: canvasRect.width > 0 ? (left / canvasRect.width) * 100 : current[drag.id].left,
        top: canvasRect.height > 0 ? (top / canvasRect.height) * 100 : current[drag.id].top,
        rotation: Math.max(-5, Math.min(5, (left / Math.max(maxLeft, 1) - 0.5) * 8)),
      },
    }));
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>, tagId: string) => {
    if (!tagsDropped) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tagRect = event.currentTarget.getBoundingClientRect();
    dragState.current = {
      id: tagId,
      offsetX: event.clientX - tagRect.left,
      offsetY: event.clientY - tagRect.top,
    };
    setActiveTagId(tagId);
    setDraggingTagId(tagId);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragState.current) updateTagPosition(event);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = null;
    setDraggingTagId(null);
  };

  const activeTag = FEATURE_TAGS.find((tag) => tag.id === activeTagId) ?? FEATURE_TAGS[0];

  return (
    <div className="marketing-features-interaction">
      <div className="marketing-features-tag-canvas" ref={canvasRef}>
        {FEATURE_TAGS.map((tag) => {
          const position = positions[tag.id] ?? INITIAL_FEATURE_TAG_POSITIONS[tag.id];
          return (
            <button
              aria-pressed={activeTagId === tag.id}
              className={`marketing-feature-tag${tagsDropped ? " is-dropped" : ""}${draggingTagId === tag.id ? " is-dragging" : ""}`}
              key={tag.id}
              onClick={() => setActiveTagId(tag.id)}
              onPointerCancel={handlePointerUp}
              onPointerDown={(event) => handlePointerDown(event, tag.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                "--tag-delay": `${position.delay}ms`,
                "--tag-left": `${position.left}%`,
                "--tag-rotation": `${position.rotation}deg`,
                "--tag-top": `${position.top}%`,
              } as CSSProperties}
              type="button"
            >
              {tag.label}
            </button>
          );
        })}
        <div className="marketing-features-title-mask">
          <h2 id="features-title">OUR FEATURES</h2>
        </div>
      </div>

      <div className="marketing-features-description" aria-live="polite">
        <span>Selected feature</span>
        <strong>{activeTag.label}</strong>
        <p>{activeTag.description}</p>
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
  const [hoveredPurposeCharacter, setHoveredPurposeCharacter] = useState<PurposeCharacterHover | null>(null);
  const cleanupTimer = useRef<number | null>(null);
  const purposeSection = useRef<HTMLElement | null>(null);
  const pixelTransition = useRef<HTMLDivElement | null>(null);
  const purposeStatementStack = useRef<HTMLDivElement | null>(null);
  const purposeVisual = useRef<HTMLDivElement | null>(null);
  const featuresTransition = useRef<HTMLDivElement | null>(null);
  const featuresSection = useRef<HTMLElement | null>(null);
  const [featureTagsDropped, setFeatureTagsDropped] = useState(false);

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
    const cells = Array.from(transition.querySelectorAll<HTMLElement>(".marketing-pixel-transition-cell"));
    const blendLayer = purposeStatementStack.current?.querySelector<HTMLElement>("[data-purpose-blend]");
    let animationFrame = 0;

    const setPixelProgress = (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      transition.dataset.progress = clamped.toFixed(2);
      transition.dataset.complete = clamped >= 0.999 ? "true" : "false";
      cells.forEach((cell) => {
        const threshold = Number(cell.dataset.threshold ?? 0);
        const variant = Number(cell.dataset.variant ?? 0);
        const localProgress = Math.min(1, Math.max(0, (clamped - threshold) / 0.34));
        const sequence = PIXEL_COLOR_SEQUENCES[variant] ?? PIXEL_COLOR_SEQUENCES[0];
        const colorIndex = Math.min(sequence.length - 1, Math.floor(localProgress * sequence.length));

        cell.style.opacity = localProgress > 0 ? "1" : "0";
        cell.style.backgroundColor = clamped >= 0.999 ? "#4CA0FE" : sequence[colorIndex];
        cell.style.transform = localProgress >= 1
          ? "translateY(0) scale(1)"
          : `translateY(${(1 - localProgress) * 18}%) scale(${0.82 + (localProgress * 0.18)})`;
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
      setPixelProgress((viewportHeight - transitionRect.top) / viewportHeight);

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

  useEffect(() => {
    const transition = featuresTransition.current;
    const section = featuresSection.current;
    if (!transition || !section) return;

    const reducedMotion = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    const updateFeaturesEntrance = () => {
      const viewportHeight = Math.max(window.innerHeight, 1);
      const transitionRect = transition.getBoundingClientRect();
      const progress = reducedMotion?.matches
        ? 1
        : Math.min(1, Math.max(0, (viewportHeight - transitionRect.top) / (viewportHeight + transitionRect.height)));

      transition.style.setProperty("--curtain-progress", progress.toFixed(3));
      const title = section.querySelector<HTMLElement>("#features-title");
      const titleRect = title?.getBoundingClientRect();
      if (reducedMotion?.matches || (titleRect && titleRect.top < viewportHeight * 0.9)) {
        setFeatureTagsDropped(true);
      }
    };

    window.addEventListener("scroll", updateFeaturesEntrance, { passive: true });
    window.addEventListener("resize", updateFeaturesEntrance);
    updateFeaturesEntrance();

    return () => {
      window.removeEventListener("scroll", updateFeaturesEntrance);
      window.removeEventListener("resize", updateFeaturesEntrance);
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
        <div className="marketing-pixel-transition-canvas">
        {PURPOSE_PIXEL_CELLS.map((cell) => (
          <span
            className="marketing-pixel-transition-cell"
            data-threshold={cell.threshold.toFixed(3)}
            data-variant={cell.variant}
            key={cell.id}
            style={{
              "--pixel-left": cell.left,
              "--pixel-top": cell.top,
              "--pixel-width": cell.width,
              "--pixel-height": cell.height,
            } as CSSProperties}
          />
        ))}
        </div>
      </div>

      <section
        className={`marketing-purpose${purposeVisualRevealed ? " is-visual-revealed" : ""}`}
        id="why-maylamdi"
        aria-labelledby="why-maylamdi-title"
        ref={purposeSection}
      >
        <div className="marketing-purpose-scroll-stage">
          <div className="marketing-purpose-sticky">
            <div className="marketing-purpose-copy">
              <p className="marketing-purpose-label">About Us</p>
              <div className="marketing-purpose-statement-stack" ref={purposeStatementStack}>
                <PurposeStatement
                  hoveredCharacter={hoveredPurposeCharacter}
                  onCharacterHover={setHoveredPurposeCharacter}
                  revealedLines={revealedPurposeLines}
                />
                <PurposeStatement blend hoveredCharacter={hoveredPurposeCharacter} revealedLines={revealedPurposeLines} />
              </div>
            </div>
            <PurposeWorkspaceVisual visualRef={purposeVisual} />
          </div>
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

      <div className="marketing-features-transition" ref={featuresTransition} aria-hidden="true">
        <div className="marketing-features-curtain" />
      </div>

      <section
        className="marketing-features"
        id="features"
        aria-labelledby="features-title"
        ref={featuresSection}
      >
        <div className="marketing-features-intro">
          <p>What MayLamDi offers</p>
          <span>Everything your team needs to plan fairly, stay visible, and keep moving.</span>
        </div>
        <FeatureTagComposition tagsDropped={featureTagsDropped} />
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
