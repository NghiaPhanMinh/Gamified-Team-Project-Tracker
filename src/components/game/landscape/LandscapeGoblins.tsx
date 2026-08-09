type GoblinInfo = {
  id: string;
  memberId: string;
  memberName: string;
  isDefeated?: boolean;
};

type LandscapeGoblinsProps = {
  goblins: GoblinInfo[];
};

export function LandscapeGoblins({ goblins }: LandscapeGoblinsProps) {
  return (
    <div className="landscape-layer layer-6-goblins" aria-label="Daily goblins cluster">
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <g transform="translate(240, 255)">
          {goblins.map((goblin, index) => {
            // Calculate loose cluster positions between village (240px) and center (~450px)
            const offsetX = (index % 4) * 48 + Math.floor(index / 4) * 20;
            const offsetY = Math.sin(index * 1.5) * 12 + (index % 2) * 10;
            const isDefeated = goblin.isDefeated ?? false;

            return (
              <g
                key={goblin.id}
                transform={`translate(${offsetX}, ${offsetY})`}
                className={`goblin-item ${isDefeated ? "goblin-defeated" : ""}`}
                role="img"
                aria-label={`Goblin threatening village (${goblin.memberName})`}
              >
                <use href="#goblin-shape" width="30" height="40" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
