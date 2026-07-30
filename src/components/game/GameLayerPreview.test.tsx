import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { GameLayerPreview } from "./GameLayerPreview";

describe("GameLayerPreview", () => {
  afterEach(cleanup);

  it("reduces boss health from weighted task completion", () => {
    render(<GameLayerPreview />);

    expect(
      screen.getByRole("progressbar", { name: "Boss health" }),
    ).toHaveAttribute("aria-valuenow", "100");

    fireEvent.click(screen.getByLabelText("Build and test the prototype"));

    expect(
      screen.getByRole("progressbar", { name: "Boss health" }),
    ).toHaveAttribute("aria-valuenow", "60");
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("shows completion and overdue game copy without replacing practical status", () => {
    render(<GameLayerPreview />);

    fireEvent.click(screen.getByLabelText("Preview a passed deadline"));
    expect(screen.getByText("overdue")).toBeInTheDocument();
    expect(screen.getByText(/boss is still standing/i)).toBeInTheDocument();

    for (const taskName of [
      "Map the audience",
      "Choose the creative direction",
      "Build and test the prototype",
      "Prepare the final handoff",
    ]) {
      fireEvent.click(screen.getByLabelText(taskName));
    }

    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText(/Boss defeated!/i)).toBeInTheDocument();
  });
});
