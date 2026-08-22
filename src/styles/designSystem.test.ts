import { describe, expect, it } from "vitest";
import css from "./design-tokens.css?raw";

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

  it("uses the official local display font and blue project preview treatment", () => {
    expect(css).toContain('/fonts/Blodestarkly-Regular.ttf');
    expect(css).toContain(".marketing-preview-card");
    expect(css).toContain("background: var(--mld-info)");
  });

  it("keeps landing polish responsive and reduced-motion safe", () => {
    expect(css).toContain("margin: 0 0 var(--mld-space-5)");
    expect(css).toContain(".marketing-title-sketch path");
    expect(css).toContain("@keyframes marketing-sketch-draw");
    expect(css).toContain("stroke-width: 3");
    expect(css).toContain("stroke-width: 1.5");
    expect(css).toContain(".marketing-hero-logo-stage");
    expect(css).toContain("grid-column: 1 / -1");
    expect(css).toContain('"preview-primary preview-supporting"');
    expect(css).toContain("padding: 68px 0 76px");
    expect(css).toContain("stroke-dashoffset: 0");
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
    expect(css).toContain("grid-template-columns: repeat(7, minmax(150px, 1fr))");
    expect(css).toContain("min-height: 5.25rem");
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
    expect(css).toContain(".phase-chip-editor > div");
    expect(css).toContain("background: var(--mld-phase-color");
    expect(css).toContain(".phase-rename-button");
  });
});
