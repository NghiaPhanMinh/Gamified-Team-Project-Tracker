import { describe, expect, it } from "vitest";

import battleSource from "./BattleScene.tsx?raw";
import styles from "../../styles/index.css?raw";

describe("approved partial game theme", () => {
  it("applies the MayLamDi palette only through scoped game controls and leaderboard classes", () => {
    expect(battleSource).toContain('className="rpg-btn-leaderboard rpg-btn-layout-admin"');
    expect(battleSource).toContain('className="rpg-modal-backdrop rpg-leaderboard-backdrop"');
    expect(battleSource).toContain('className="rpg-wood-board rpg-leaderboard-board"');
    expect(battleSource).toContain('className="rpg-btn-close rpg-leaderboard-close"');

    expect(styles).toContain(".rpg-btn-layout-admin");
    expect(styles).toContain("background: #4ca0fe");
    expect(styles).toContain("background: #fff73f");
    expect(styles).toContain("background: #feaa01");
    expect(styles).toContain(".rpg-leaderboard-board");
    expect(styles).toContain("border: 7px solid #4ca0fe");
  });

  it("uses the approved boss HP treatment and keeps it accessible", () => {
    expect(battleSource).toContain('aria-label="Boss health"');
    expect(styles).toContain(".boss-hp-mob-fill");
    expect(styles).toContain("linear-gradient(90deg, #fd39e4, #feaa01)");
    expect(styles).toContain("border: 3px solid #fffdec");
  });
});
