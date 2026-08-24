import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Id } from "../../../convex/_generated/dataModel";
import { ProjectDeleteDialog } from "./TeamSystem";

describe("project deletion dialog", () => {
  afterEach(cleanup);

  it("requires the exact project name before confirming permanent deletion", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ProjectDeleteDialog
        target={{ projectId: "project-1" as Id<"projects">, projectTitle: "Studio Prototype" }}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: "Delete project" });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Project name confirmation"), { target: { value: "Studio" } });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Project name confirmation"), { target: { value: "Studio Prototype" } });
    expect(deleteButton).toBeEnabled();
    fireEvent.click(deleteButton);

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("Studio Prototype"));
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it("keeps cancellation separate from the destructive action", () => {
    const onCancel = vi.fn();
    render(
      <ProjectDeleteDialog
        target={{ projectId: "project-2" as Id<"projects">, projectTitle: "Research Sprint" }}
        onCancel={onCancel}
        onConfirm={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
