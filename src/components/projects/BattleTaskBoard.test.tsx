import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BattleTaskBoard,
  type BattleTaskSummary,
} from "./BattleTaskBoard";
import { getBattleTaskAction } from "./battleTaskAction";

const baseTask: BattleTaskSummary = {
  id: "task-1",
  title: "Final illustration",
  phase: "Production",
  owner: "Anh",
  reviewer: "Quinn",
  dueDate: "2026-08-16",
  status: "in_progress",
  weight: 2,
  damage: 20,
  isMine: true,
  isReviewer: false,
  isOpenForClaiming: false,
  acceptanceStatus: "accepted",
};

function renderBoard(tasks: BattleTaskSummary[], canManageProject = false, tasksLocked = false) {
  const actions = {
    onOpenDetails: vi.fn(),
    onClaim: vi.fn(),
    onAccept: vi.fn(),
    onDecline: vi.fn(),
  };
  render(
    <BattleTaskBoard
      tasks={tasks}
      canManageProject={canManageProject}
      tasksLocked={tasksLocked}
      {...actions}
    />,
  );
  return actions;
}

describe("BattleTaskBoard", () => {
  afterEach(cleanup);

  it("gives an active task owner a direct Submit Task action that opens details", () => {
    const actions = renderBoard([baseTask]);

    fireEvent.click(screen.getByRole("button", { name: "Submit Task" }));

    expect(actions.onOpenDetails).toHaveBeenCalledWith("task-1");
    expect(screen.getByText("Production")).toBeInTheDocument();
    expect(screen.getByText("Weight 2 · 20 DMG")).toBeInTheDocument();
  });

  it("does not expose Submit Task to another member", () => {
    renderBoard([{ ...baseTask, isMine: false }]);

    expect(screen.queryByRole("button", { name: "Submit Task" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View details" })).toBeInTheDocument();
  });

  it("shows only the contextual open and proposed task actions", () => {
    const openTask = { ...baseTask, id: "open", title: "Open task", status: "todo" as const, isMine: false, isOpenForClaiming: true };
    const proposedTask = { ...baseTask, id: "proposed", title: "Proposed task", status: "todo" as const, acceptanceStatus: "pending" as const };
    const actions = renderBoard([openTask, proposedTask]);
    const openNote = screen.getByRole("button", { name: "Open details for Open task" }).closest("article");
    const proposedNote = screen.getByRole("button", { name: "Open details for Proposed task" }).closest("article");

    fireEvent.click(within(openNote!).getByRole("button", { name: "Claim Task" }));
    fireEvent.click(within(proposedNote!).getByRole("button", { name: "Accept" }));
    fireEvent.click(within(proposedNote!).getByRole("button", { name: "Decline" }));

    expect(actions.onClaim).toHaveBeenCalledWith("open");
    expect(actions.onAccept).toHaveBeenCalledWith("proposed");
    expect(actions.onDecline).toHaveBeenCalledWith("proposed");
  });

  it("routes submitted work to its reviewer and creator approval to the creator", () => {
    expect(getBattleTaskAction({ ...baseTask, status: "submitted", isMine: false, isReviewer: true }, false)).toBe("review");
    expect(getBattleTaskAction({ ...baseTask, status: "submitted", isMine: false, isReviewer: false }, false)).toBe("waiting_review");
    expect(getBattleTaskAction({ ...baseTask, status: "awaiting_creator", isMine: false }, true)).toBe("approve");
    expect(getBattleTaskAction({ ...baseTask, status: "awaiting_creator", isMine: true }, false)).toBe("waiting_approval");
  });

  it("shows the allocation lock beside the owner only after the project task list is locked", () => {
    const { rerender } = render(
      <BattleTaskBoard
        tasks={[baseTask]}
        canManageProject={false}
        tasksLocked={false}
        onOpenDetails={vi.fn()}
        onClaim={vi.fn()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("Task allocation locked")).not.toBeInTheDocument();

    rerender(
      <BattleTaskBoard
        tasks={[baseTask]}
        canManageProject={false}
        tasksLocked
        onOpenDetails={vi.fn()}
        onClaim={vi.fn()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Task allocation locked")).toBeInTheDocument();
  });
});
