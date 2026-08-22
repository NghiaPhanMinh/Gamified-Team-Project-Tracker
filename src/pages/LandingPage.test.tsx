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

  it("shows the existing sign-in action to signed-out visitors", () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /go to projects/i })).not.toBeInTheDocument();
  });

  it("uses an authenticated workspace CTA without asking the user to sign in again", () => {
    render(<MemoryRouter><LandingPage isAuthenticated /></MemoryRouter>);

    expect(screen.getByRole("link", { name: /go to projects/i })).toHaveAttribute("href", "/projects");
    expect(screen.queryByRole("button", { name: /continue with google/i })).not.toBeInTheDocument();
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
});
