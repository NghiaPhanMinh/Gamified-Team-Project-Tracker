import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { LandingPage } from "./LandingPage";

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: vi.fn() }),
}));

describe("MayLamDi landing page", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("keeps authentication actions out of the hero and introduces a quiet scroll cue", () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /go to projects/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see what maylamdi does/i })).toHaveAttribute(
      "href",
      "#why-maylamdi",
    );
  });

  it("keeps the hero free of authentication CTAs for authenticated visitors too", () => {
    render(<MemoryRouter><LandingPage isAuthenticated /></MemoryRouter>);

    expect(screen.queryByRole("link", { name: /go to projects/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
  });

  it("adds the scoped product-purpose section before the existing feature marquee", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    const purpose = container.querySelector<HTMLElement>("#why-maylamdi");
    const features = container.querySelector<HTMLElement>("#how-it-works");

    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /group projects should feel shared.*not carried by one person/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /simplified maylamdi project workspace/i })).toBeInTheDocument();
    expect(purpose?.parentElement?.nextElementSibling).toBe(features);
    expect(purpose?.querySelectorAll("[data-purpose-phrase]")).toHaveLength(7);
  });

  it("reveals About lines from scroll progress and never hides a revealed line", () => {
    let purposeTop = 900;
    let queuedFrame: FrameRequestCallback | undefined;
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      queuedFrame = callback;
      return 1;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function getRect(this: HTMLElement) {
      if (this.classList.contains("marketing-purpose")) {
        return { top: purposeTop, bottom: purposeTop + 2100, left: 0, right: 1200, width: 1200, height: 2100, x: 0, y: purposeTop, toJSON: vi.fn() };
      }
      if (this.classList.contains("marketing-pixel-transition")) {
        return { top: 760, bottom: 960, left: 0, right: 1200, width: 1200, height: 200, x: 0, y: 760, toJSON: vi.fn() };
      }
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: vi.fn() };
    });

    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);
    const purpose = container.querySelector<HTMLElement>(".marketing-purpose");
    const phrases = Array.from(container.querySelectorAll<HTMLElement>("[data-purpose-phrase]"));

    expect(phrases.every((phrase) => !phrase.classList.contains("is-revealed"))).toBe(true);
    purposeTop = -2100;
    act(() => {
      fireEvent.scroll(window);
      queuedFrame?.(0);
    });
    expect(phrases.every((phrase) => phrase.classList.contains("is-revealed"))).toBe(true);
    expect(purpose).toHaveClass("is-visual-revealed");

    purposeTop = 900;
    act(() => {
      fireEvent.scroll(window);
      queuedFrame?.(0);
    });
    expect(phrases.every((phrase) => phrase.classList.contains("is-revealed"))).toBe(true);
  });

  it("shows a static completed scene when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(container.querySelector(".marketing-purpose")).toHaveClass("is-visual-revealed");
    expect(container.querySelectorAll("[data-purpose-phrase].is-revealed")).toHaveLength(7);
    expect(container.querySelector(".marketing-pixel-transition")).toHaveAttribute("data-progress", "1.00");
  });

  it("renders the looping card sequence and replays the branded title burst", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.getAllByAltText("MayLamDi logo")).toHaveLength(2);
    expect(container.querySelectorAll(".marketing-feature-group")).toHaveLength(4);
    expect(screen.getAllByText("Start with the brief.")).toHaveLength(4);
    expect(screen.getAllByText("Plan work fairly.")).toHaveLength(4);
    expect(screen.getAllByText("Make progress visible.")).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: /make teamwork.*feel shared/i }));
    expect(screen.getAllByText("MAYLAMDI")).toHaveLength(42);
  });

  it("marks feel shared with a responsive hand-drawn annotation", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.getByText("feel shared.").parentElement).toHaveClass("marketing-title-hook");
    expect(container.querySelectorAll(".marketing-title-sketch path")).toHaveLength(2);
  });

  it("removes the Project at a Glance preview without replacing it", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.queryByText(/project at a glance/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/live workspace/i)).not.toBeInTheDocument();
    expect(container.querySelector(".marketing-preview")).not.toBeInTheDocument();
    expect(container.querySelector(".marketing-hero-visual")).toBeInTheDocument();
  });

  it("renders the scroll wipe, aligned overlap layer, wave hooks, and two-row About marquee", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(container.querySelectorAll(".marketing-pixel-transition-block")).toHaveLength(11);
    expect(container.querySelectorAll(".marketing-purpose-word").length).toBeGreaterThan(20);
    expect(container.querySelector(".marketing-purpose-workspace-overlap")).not.toBeInTheDocument();
    expect(container.querySelector("[data-purpose-blend]")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".marketing-purpose-marquee-row")).toHaveLength(2);
    expect(container.querySelectorAll(".marketing-purpose-marquee-group")).toHaveLength(4);
  });
});
