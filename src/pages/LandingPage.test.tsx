import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

    expect(screen.getByText("Why MayLamDi")).toBeInTheDocument();
    expect(screen.getByText("Group projects should feel shared,")).toBeInTheDocument();
    expect(screen.getByText("not carried by one person.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /simplified maylamdi project workspace/i })).toBeInTheDocument();
    expect(purpose?.nextElementSibling).toBe(features);
    expect(purpose?.querySelectorAll("[data-purpose-phrase]")).toHaveLength(7);
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

  it("places the existing project preview across the full hero grid", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    const hero = container.querySelector<HTMLElement>(".marketing-hero");
    const visual = container.querySelector<HTMLElement>(".marketing-hero-visual");
    const preview = container.querySelector<HTMLElement>(".marketing-preview");

    expect(preview?.parentElement).toBe(hero);
    expect(visual).not.toContainElement(preview);
  });
});
