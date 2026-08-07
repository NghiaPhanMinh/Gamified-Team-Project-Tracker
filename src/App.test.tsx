import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

import { App } from "./App";

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("convex/react", () => ({
  Authenticated: () => null,
  AuthLoading: () => null,
  Unauthenticated: ({ children }: { children: React.ReactNode }) => children,
  useQuery: () => ({
    checkedAt: 1,
    service: "MayLamDi",
    status: "ok",
  }),
}));

describe("MayLamDi signed-out journey", () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "light";
  });

  it("shows one clear Google sign-in action and a short purpose statement", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /make the work.*feel shared/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByAltText("MayLamDi logo")).not.toHaveLength(0);
    expect(screen.getByText(/create or join a project room/i)).toBeInTheDocument();
    expect(screen.queryByText(/how it helps/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("persists a dark theme preference", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /switch to dark mode/i }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("maylamdi-theme")).toBe("dark");
  });
});
