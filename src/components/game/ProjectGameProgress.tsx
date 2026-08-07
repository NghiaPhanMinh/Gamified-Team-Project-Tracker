import {
  calculateMilestoneProgress,
  calculateWeightedProgress,
  describeGameState,
  type PracticalProjectStatus,
  type PracticalTaskStatus,
} from "../../lib/gameProgress";

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
  const progressTasks = tasks.map((task) => ({
    id: task._id,
    title: task.title,
    weight: task.weight,
    required: task.required,
    status: task.status,
    dueDate: task.dueDate,
  }));
  const progress = calculateWeightedProgress(progressTasks);
  const milestoneProgress = calculateMilestoneProgress(
    progressTasks,
    milestones.map((milestone) => ({
      id: milestone._id,
      title: milestone.title,
      requiredTaskIds: milestone.requiredTaskIds,
    })),
  );
  const bossDefeated = status === "completed";

  return (
    <section className="live-game-layer" aria-labelledby="live-game-title">
      <div className="live-game-copy">
        <p className="card-eyebrow">Live game layer</p>
        <h3 id="live-game-title">{projectTitle} encounter</h3>
        <p>
          Battle damage comes only from required tasks verified by their assigned reviewer.
          Uploading evidence alone never changes boss health.
        </p>
      </div>
      <article
        className={`boss-stage ${bossDefeated ? "boss-defeated" : ""} milestone-power-${milestoneProgress.completedCount}`}
      >
        <div className="boss-status-row">
          <span>Practical status</span>
          <strong>{status.replace("_", " ")}</strong>
        </div>
        <div className="boss-scene" aria-hidden="true">
          <span className="boss-horn boss-horn-left" />
          <span className="boss-horn boss-horn-right" />
          <div
            className="boss-creature"
            style={{
              transform: `scale(${0.72 + progress.bossHealthPercent / 360})`,
            }}
          >
            <span className="boss-eye boss-eye-left" />
            <span className="boss-eye boss-eye-right" />
            <span className="boss-mouth" />
          </div>
          <span className="victory-burst">✦</span>
        </div>
        <div className="boss-health">
          <div>
            <span>Boss health</span>
            <strong>{progress.bossHealthPercent}%</strong>
          </div>
          <div
            className="boss-health-track"
            role="progressbar"
            aria-label={`${projectTitle} boss health`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.bossHealthPercent}
          >
            <span style={{ width: `${progress.bossHealthPercent}%` }} />
          </div>
        </div>
        <p className="boss-message" role="status">
          {describeGameState(status)}
        </p>
        <div className="live-game-stats">
          <span>{progress.progressPercent}% project progress</span>
          <span>
            {milestoneProgress.completedCount}/{milestoneProgress.totalCount} milestones cleared
          </span>
        </div>
      </article>
    </section>
  );
}
