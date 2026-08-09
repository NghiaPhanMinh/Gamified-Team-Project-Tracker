import { useMemo } from "react";
import {
  calculateMilestoneProgress,
  calculateWeightedProgress,
  describeGameState,
  type PracticalProjectStatus,
  type PracticalTaskStatus,
} from "../../lib/gameProgress";

import { SVGDefs } from "./landscape/SVGDefs";
import { LandscapeSky } from "./landscape/LandscapeSky";
import { LandscapeTerrain } from "./landscape/LandscapeTerrain";
import { LandscapeVillage } from "./landscape/LandscapeVillage";
import { LandscapeGoblins } from "./landscape/LandscapeGoblins";
import { LandscapePlayers } from "./landscape/LandscapePlayers";
import { LandscapeDragon } from "./landscape/LandscapeDragon";
import { LandscapeFX } from "./landscape/LandscapeFX";

type GameTask = {
  _id: string;
  title: string;
  weight: number;
  required: boolean;
  status: PracticalTaskStatus;
  dueDate: string;
};

type GameMilestone = {
  _id: string;
  title: string;
  requiredTaskIds: string[];
};

type ProjectGameProgressProps = {
  projectTitle: string;
  status: PracticalProjectStatus;
  tasks: GameTask[];
  milestones: GameMilestone[];
};

export function ProjectGameProgress({
  projectTitle,
  status,
  tasks,
  milestones,
}: ProjectGameProgressProps) {
  const progressTasks = useMemo(
    () =>
      tasks.map((task) => ({
        id: task._id,
        title: task.title,
        weight: task.weight,
        required: task.required,
        status: task.status,
        dueDate: task.dueDate,
      })),
    [tasks],
  );

  const progress = calculateWeightedProgress(progressTasks);
  const milestoneProgress = calculateMilestoneProgress(
    progressTasks,
    milestones.map((milestone) => ({
      id: milestone._id,
      title: milestone.title,
      requiredTaskIds: milestone.requiredTaskIds,
    })),
  );

  const bossDefeated = status === "completed" || progress.bossHealthPercent === 0;
  const hpPercent = progress.bossHealthPercent;

  // Deriving goblins from uncompleted required tasks
  const uncompletedTasks = useMemo(
    () => tasks.filter((t) => t.required && t.status !== "completed" && t.status !== "verified"),
    [tasks],
  );

  const goblins = useMemo(
    () =>
      uncompletedTasks.slice(0, 6).map((task) => ({
        id: task._id,
        memberId: task._id,
        memberName: task.title,
        isDefeated: false,
      })),
    [uncompletedTasks],
  );

  return (
    <section className="live-game-layer-container" aria-labelledby="live-game-title">
      <SVGDefs />

      <header className="live-game-header">
        <div>
          <p className="card-eyebrow">Realtime encounter landscape</p>
          <h3 id="live-game-title">{projectTitle} encounter</h3>
        </div>
        <div className="live-game-badges">
          <span className="status-pill">{status.replace("_", " ")}</span>
          <span className="stat-pill">{progress.progressPercent}% project progress</span>
          <span className="stat-pill">
            {milestoneProgress.completedCount}/{milestoneProgress.totalCount} milestones cleared
          </span>
        </div>
      </header>

      {/* Full 10-Layer Landscape Scene */}
      <div className="landscape-scene-container" aria-label={`${projectTitle} interactive encounter scene`}>
        <LandscapeSky />
        <LandscapeTerrain />
        <LandscapeVillage villageHpPercent={hpPercent} />
        <LandscapeGoblins goblins={goblins} />
        <LandscapePlayers members={[]} />
        <LandscapeDragon bossHpPercent={hpPercent} isDefeated={bossDefeated} />
        <LandscapeFX activeEvent={null} isVictory={bossDefeated} />
      </div>

      <div className="boss-hp-panel" style={{ marginTop: "0.5rem" }}>
        <div>
          <strong>Boss HP</strong>
          <span>{progress.bossHealthPercent}%</span>
        </div>
        <div
          className="boss-hp-track"
          role="progressbar"
          aria-label={`${projectTitle} boss health`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.bossHealthPercent}
        >
          <span style={{ width: `${progress.bossHealthPercent}%` }} />
        </div>
        <small>{describeGameState(status)}</small>
      </div>
    </section>
  );
}
