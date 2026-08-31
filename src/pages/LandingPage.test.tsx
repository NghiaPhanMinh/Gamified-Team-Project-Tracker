import { cleanup, render, screen, within } from "@testing-library/react";
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

  it("keeps the first viewport brand-led and moves Google authentication to the final chapter", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);
    const hero = container.querySelector<HTMLElement>(".landing-hero");
    const finalCta = container.querySelector<HTMLElement>("#get-started");

    expect(hero).not.toBeNull();
    expect(within(hero!).getByRole("heading", { name: /make the work.*feel shared/i })).toBeInTheDocument();
    expect(within(hero!).queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
    expect(within(hero!).getByRole("link", { name: /scroll to see how/i })).toHaveAttribute("href", "#purpose");
    expect(finalCta).not.toBeNull();
    expect(within(finalCta!).getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /continue with google/i })).toHaveLength(1);
  });

  it("uses the requested six-chapter story in the correct order", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);
    const chapterIds = [...container.querySelectorAll<HTMLElement>("main > section")].map((section) => section.id);

    expect(chapterIds).toEqual(["top", "purpose", "features", "how-it-works", "pricing", "get-started"]);
    expect(screen.getByRole("heading", { name: /group projects shouldn’t need a designated carrier/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /one project.*three ways to stop gánh team/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /from brief to done/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /core teamwork stays free/i })).toBeInTheDocument();
  });

  it("explains tracking, editable AI assistance, and gamified progress as separate scenes", () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /know who’s doing what/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /start with a plan, not a guessing game/i })).toBeInTheDocument();
    expect(screen.getAllByText("AI suggests. You decide.")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: /make progress something the whole team can see/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/how real work becomes game feedback/i)).toHaveTextContent("Real work→Evidence→Progress→Game feedback");
  });

  it("shows the existing plans and routes their actions safely", () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.getByText("0₫")).toBeInTheDocument();
    expect(screen.getByText(/39K₫/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute("href", "#get-started");
    expect(screen.getByRole("link", { name: "Go Plus" })).toHaveAttribute("href", "#get-started");
    expect(screen.queryByRole("link", { name: /explore as guest/i })).not.toBeInTheDocument();
  });

  it("shows authenticated navigation without asking the user to sign in again", () => {
    render(<MemoryRouter><LandingPage isAuthenticated /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /projects/i }).every((link) => link.getAttribute("href") === "/projects")).toBe(true);
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Plus" })).toHaveAttribute("href", "/subscription");
  });

  it("keeps the large brand logo and an unclipped hand-drawn annotation", () => {
    const { container } = render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.getAllByAltText("MayLamDi logo")).toHaveLength(2);
    expect(container.querySelector(".landing-hero-logo")).toBeInTheDocument();
    expect(container.querySelectorAll(".landing-hero-sketch path")).toHaveLength(2);
  });
});
