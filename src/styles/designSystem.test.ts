import { describe, expect, it } from "vitest";
import css from "./design-tokens.css?raw";
import appCss from "./index.css?raw";

describe("MayLamDi design-system contract", () => {
  it("uses the supplied light and dark surface tokens", () => {
    expect(css).toContain("--mld-bg: #fffdec");
    expect(css).toContain("--mld-surface-01: #fffef9");
    expect(css).toContain("--mld-bg: #071216");
    expect(css).toContain("--mld-surface-01: #0b181c");
  });

  it("uses Inter and the supplied spacing, radius, and control scales", () => {
    expect(css).toContain("--mld-font-ui: Inter");
    expect(css).toContain("--mld-space-9: 96px");
    expect(css).toContain("--mld-radius-card: 14px");
    expect(css).toContain("min-height: 44px");
  });

  it("includes the specified mobile bottom navigation treatment", () => {
    expect(css).toContain(".mobile-bottom-nav");
    expect(css).toContain("grid-template-columns: repeat(5, 1fr)");
  });

  it("keeps the landing marquee seamless and motion-sensitive", () => {
    expect(css).toContain("@keyframes marketing-marquee");
    expect(css).toContain("padding-inline-end: var(--marquee-gap)");
    expect(css).toContain("transform: translate3d(-25%, 0, 0)");
    expect(css).toContain("animation-play-state: paused");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("overflow-x: auto");
  });

  it("uses the selected local display font without the removed hero preview", () => {
    expect(css).toContain('font-family: "Paytone One"');
    expect(css).toContain('/fonts/PaytoneOne-Regular.ttf');
    expect(css).toContain('font-family: "Anton"');
    expect(css).toContain('/fonts/Anton-Regular.ttf');
    expect(css).not.toContain('font-family: "Chaco"');
    expect(css).not.toContain("Blodestarkly");
    expect(css).not.toContain(".marketing-preview-card");
  });

  it("keeps landing polish responsive and reduced-motion safe", () => {
    expect(css).toContain("margin: 0 0 var(--mld-space-5)");
    expect(css).toContain(".marketing-title-sketch path");
    expect(css).toContain("@keyframes marketing-sketch-draw");
    expect(css).toContain("stroke-width: 3");
    expect(css).toContain("stroke-width: 1.5");
    expect(css).toContain(".marketing-hero-logo-stage");
    expect(css).toContain("padding: 68px 0 76px");
    expect(css).toContain("stroke-dashoffset: 0");
  });

  it("keeps the scoped About scene scroll-led, layered, and mobile-safe", () => {
    expect(css).toContain(".marketing-about-transition-scene > .marketing-hero");
    expect(css).toContain(".marketing-pixel-transition-cell");
    expect(css).toContain("background: #4ca0fe");
    expect(css).toContain(".marketing-purpose");
    expect(css).toContain(".marketing-purpose-scroll-stage");
    expect(css).toContain("min-height: calc(320vh + var(--mld-space-8))");
    expect(css).toContain(".marketing-purpose-sticky");
    expect(css).toContain("position: sticky");
    expect(css).toContain("transform: translateX(-150px)");
    expect(css).toContain(".marketing-purpose-phrase.is-revealed");
    expect(css).toContain(".marketing-purpose-statement--blend");
    expect(css).toContain("mix-blend-mode: screen");
    expect(css).toContain("translateY(calc(var(--wave-lift) * -1)) rotate(var(--wave-rotation))");
    expect(css).toContain(".marketing-purpose-character");
    expect(css).toContain("@keyframes marketing-purpose-marquee-forward");
    expect(css).toContain("@keyframes marketing-purpose-marquee-reverse");
    expect(css).toContain("margin-top: var(--mld-space-8)");
    expect(css).toContain('font-family: "Anton", "Arial Narrow", sans-serif');
    expect(css).toContain("-webkit-text-stroke: 2px #fff73f");
    expect(css).toContain("@media (max-width: 760px)");
    expect(css).toContain("min-height: auto");
    expect(css).toContain("display: none");
    expect(css).toContain("opacity: 1");
    expect(css).not.toContain(".marketing-purpose-workspace-overlap");
  });

  it("keeps project identity, settings accordions, and sticky tabs theme-safe", () => {
    expect(css).toContain(".room-index-card.room-index-card-colored");
    expect(css).toContain("background: var(--group-color)");
    expect(css).toContain(".project-color-marker");
    expect(css).toContain(".profile-secondary-settings[open] > summary");
    expect(css).toContain("background: var(--mld-info)");
    expect(css).toContain("position: sticky");
    expect(css).toContain("background: var(--mld-surface-01)");
    expect(css).toContain("z-index: 40");
  });

  it("keeps framework cards colourful, aligned, and readable", () => {
    expect(css).toContain("background: var(--framework-card-color)");
    expect(css).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
    expect(css).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(css).toContain("grid-template-rows: auto minmax(6rem, auto) minmax(3.75rem, auto)");
    expect(css).toContain(".framework-preview-note");
    expect(css).toContain("background: #fff73f");
    expect(css).toContain("color: #101517");
  });

  it("keeps bright team and task surfaces readable and motion-safe", () => {
    expect(css).toContain(".member-profile-card .member-skill-chip");
    expect(css).toContain("background: var(--mld-chip-color");
    expect(css).toContain("translateY(-2px) scale(1.06)");
    expect(css).toContain(".availability-calendar > strong");
    expect(css).toContain(".battle-task-note.task-in_progress");
    expect(css).toContain(".project-next-action .next-action-cta");
  });

  it("keeps light form inputs dark and phases colour-coded in both themes", () => {
    expect(css).toContain(".task-evidence-panel textarea");
    expect(css).toContain("caret-color: #101517");
    expect(css).toContain(".daily-post-form");
    expect(css).toContain(".daily-image-url-input");
    expect(css).toContain(".empty-feed-notice");
    expect(css).toContain(".phase-chip-editor > div");
    expect(css).toContain("background: var(--mld-phase-color");
    expect(css).toContain(".phase-rename-button");
    expect(css).toContain(".phase-manager .inline-phase-form .secondary-button");
  });

  it("uses the shared spacing scale for task sections and task-board internals", () => {
    expect(css).toContain(".tasks-room-tab");
    expect(css).toContain("gap: var(--mld-space-6)");
    expect(css).toContain(".battle-task-board-heading > div");
    expect(css).toContain("gap: var(--mld-space-5)");
    expect(css).toContain(".battle-task-strip");
  });

  it("keeps framework disciplines and reviewer waiting states readable", () => {
    expect(css).toContain(".framework-preview .discipline-tags span");
    expect(css).toContain("background: #101517");
    expect(css).toContain("color: #fffdec");
    expect(css).toContain(".battle-task-waiting");
    expect(css).toContain("line-height: 1.4");
    expect(css).toContain("padding: var(--mld-space-3) var(--mld-space-4)");
  });

  it("keeps project setup frameworks colourful with a separate selected state", () => {
    expect(css).toContain("background: var(--mld-framework-color");
    expect(css).toContain(".framework-choice.is-selected");
    expect(css).toContain("outline: 3px solid #101517");
    expect(css).toContain("box-shadow: 6px 6px 0 #4ca0fe");
  });

  it("keeps AI plan hierarchy, milestones, and task sequencing readable", () => {
    expect(css).toContain(".ai-draft > header.ai-brief-interpretation h4");
    expect(css).toContain("line-height: 1.03");
    expect(css).toContain(".ai-task-sequence");
    expect(css).toContain("--ai-plan-surface: #fffbd0");
    expect(css).toContain(".ai-milestone-heading");
  });

  it("contains long framework names and groups brief metadata responsively", () => {
    expect(css).toContain("grid-template-rows: auto minmax(6rem, auto) minmax(3.75rem, auto)");
    expect(css).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
    expect(css).toContain("overflow-wrap: normal");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain(".project-brief-details");
    expect(css).toContain(".project-brief-summary-meta");
    expect(css).toContain("grid-template-columns: 1fr");
  });

  it("keeps the required profile setup page vertically scrollable", () => {
    expect(appCss).toContain(".profile-gate-shell");
    expect(appCss).toContain("height: 100dvh");
    expect(appCss).toContain("overflow-y: auto");
  });
});
