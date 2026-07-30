import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FrameworkLibrary } from "./FrameworkLibrary";

describe("FrameworkLibrary", () => {
  afterEach(cleanup);

  it("switches between complete framework previews", () => {
    render(<FrameworkLibrary />);

    expect(
      screen.getByRole("heading", { name: "Nonlinear Design Process" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Empathise")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Academic Research/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Research Project Framework" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Research Question")).toBeInTheDocument();
    expect(screen.getByText("Review and Submission")).toBeInTheDocument();
  });
});
