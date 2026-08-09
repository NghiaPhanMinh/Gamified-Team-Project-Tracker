import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LandscapeScene } from "./LandscapeScene";

describe("LandscapeScene", () => {
  afterEach(cleanup);

  const mockMembers = [
    {
      profileId: "user-1",
      displayName: "Alice",
      characterFill: "#ff8ae7",
      characterOutline: "#121f25",
      hasSubmittedToday: true,
      hasPendingGoblin: false,
    },
    {
      profileId: "user-2",
      displayName: "Bob",
      characterFill: "#4ca0fe",
      characterOutline: "#121f25",
      hasSubmittedToday: false,
      hasPendingGoblin: true,
    },
  ];

  it("renders pristine village and active goblins per member status", () => {
    render(
      <LandscapeScene
        projectTitle="Test Campaign"
        remainingHp={80}
        maximumHp={100}
        villageHpPercent={100}
        members={mockMembers}
        events={[]}
      />
    );

    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
    expect(screen.getByLabelText(/Village status: pristine/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active goblins: 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bob \(pending update\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alice \(submitted today\)/i)).toBeInTheDocument();
  });

  it("renders damaged village tier when village HP drops below 50%", () => {
    render(
      <LandscapeScene
        projectTitle="Test Campaign"
        remainingHp={40}
        maximumHp={100}
        villageHpPercent={40}
        members={mockMembers}
        events={[]}
      />
    );

    expect(screen.getByLabelText(/Village status: damaged/i)).toBeInTheDocument();
  });

  it("renders burning village tier when village HP drops below 25%", () => {
    render(
      <LandscapeScene
        projectTitle="Test Campaign"
        remainingHp={10}
        maximumHp={100}
        villageHpPercent={20}
        members={mockMembers}
        events={[]}
        isOverdue={true}
      />
    );

    expect(screen.getByLabelText(/Village status: burning/i)).toBeInTheDocument();
  });

  it("renders repelled boss state when boss HP is 0", () => {
    render(
      <LandscapeScene
        projectTitle="Test Campaign"
        remainingHp={0}
        maximumHp={100}
        villageHpPercent={100}
        members={mockMembers}
        events={[]}
      />
    );

    expect(screen.getByLabelText(/Boss repelled/i)).toBeInTheDocument();
  });
});
