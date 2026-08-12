import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Id } from "../../../convex/_generated/dataModel";
import { ProjectOnboarding } from "./ProjectOnboarding";

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}));

describe("ProjectOnboarding", () => {
  afterEach(cleanup);

  it("keeps task creation separate from allocation and retains earlier input", () => {
    render(
      <ProjectOnboarding
        mode="create"
        currentProfileId={"profile-1" as Id<"userProfiles">}
        onCancel={vi.fn()}
        onRoomReady={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /choose a way to work/i })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "1Framework",
      "2Brief",
      "3Tasks",
      "4Allocation",
      "5Create",
    ]);

    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));
    const projectName = screen.getByLabelText(/project name/i);
    fireEvent.change(projectName, { target: { value: "Studio launch" } });
    fireEvent.change(screen.getByLabelText(/project brief/i), { target: { value: "Create and test a campaign prototype." } });
    fireEvent.click(screen.getByRole("button", { name: /continue to tasks/i }));
    fireEvent.click(screen.getByRole("button", { name: /^ai generate tasks/i }));
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByLabelText(/project name/i)).toHaveValue("Studio launch");
  });

  it("keeps the member flow to one code screen and reuses the saved profile", () => {
    render(
      <ProjectOnboarding
        mode="join"
        currentProfileId={"profile-1" as Id<"userProfiles">}
        onCancel={vi.fn()}
        onRoomReady={vi.fn()}
      />,
    );
    expect(screen.getByRole("heading", { name: /enter the room code/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^room code$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join room/i })).toBeInTheDocument();
  });
});
