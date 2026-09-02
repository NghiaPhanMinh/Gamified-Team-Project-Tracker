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
    expect(purpose?.nextElementSibling).toBe(features);
    expect(purpose?.querySelectorAll("[data-purpose-phrase]")).toHaveLength(7);
  });

  it("reveals the About scene once and keeps it revealed", () => {
    let reveal!: IntersectionObserverCallback;
    const disconnect = vi.fn();
    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        reveal = callback;
      }

      observe = vi.fn();
      disconnect = disconnect;
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);
    const purpose = container.querySelector<HTMLElement>(".marketing-purpose");
    const transition = container.querySelector<HTMLElement>(".marketing-pixel-transition");

    expect(purpose).not.toHaveClass("is-revealed");
    act(() => reveal([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(purpose).toHaveClass("is-revealed");
    expect(transition).toHaveClass("is-revealed");
    expect(disconnect).toHaveBeenCalled();

    act(() => reveal([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(purpose).toHaveClass("is-revealed");
  });

  it("shows a static completed scene when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(container.querySelector(".marketing-purpose")).toHaveClass("is-revealed");
    expect(container.querySelector(".marketing-pixel-transition")).toHaveClass("is-revealed");
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

  it("renders the MayLamDi block transition and word-level wave hooks", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(container.querySelectorAll(".marketing-pixel-transition-block")).toHaveLength(11);
    expect(container.querySelectorAll(".marketing-purpose-word").length).toBeGreaterThan(20);
    expect(container.querySelector(".marketing-purpose-workspace-overlap")).toHaveAttribute("aria-hidden", "true");
  });
});
