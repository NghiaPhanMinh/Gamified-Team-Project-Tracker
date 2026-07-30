import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

import { App } from "./App";

vi.mock("convex/react", () => ({
  useQuery: () => ({
    checkedAt: 1,
    service: "MayLamDi",
    status: "ok",
  }),
}));

describe("MayLamDi clean scaffold", () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "light";
  });

  it("renders the supplied brand and clean-start message", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /make the work.*feel shared/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByAltText("MayLamDi logo")).not.toHaveLength(0);
    expect(screen.getByText(/no old questboard code/i)).toBeInTheDocument();
    expect(screen.getByText(/live workspace connected/i)).toBeInTheDocument();
  });

  it("persists a dark theme preference", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /switch to dark mode/i }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("maylamdi-theme")).toBe("dark");
  });
});
