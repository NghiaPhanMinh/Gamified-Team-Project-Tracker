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
});
