type GoblinInfo = {
  id: string;
  memberId: string;
  memberName: string;
  goblinState?: "ghost" | "active";
  isDefeated?: boolean;
};

type LandscapeGoblinsProps = {
  goblins: GoblinInfo[];
};

export function LandscapeGoblins({ goblins }: LandscapeGoblinsProps) {
  return (
    <div className="landscape-layer layer-6-goblins" aria-label="Daily goblins wave defense">
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        {/* Right-center middle field face-off zone (x = 490px to 620px) grounded at baseline y = 270px */}
        <g transform="translate(490, 270)">
          {goblins.map((goblin, index) => {
            const offsetX = index * 45;
            const offsetY = (index % 2) * 12;
            const isGhost = goblin.goblinState === "ghost" || (goblin.isDefeated ?? false);

            return (
              <g
                key={goblin.id}
                transform={`translate(${offsetX}, ${offsetY})`}
                className={`goblin-item ${isGhost ? "goblin-ghost-defeated" : "goblin-active-attacking"}`}
                style={{
                  opacity: isGhost ? 0.35 : 1,
                  filter: isGhost ? "drop-shadow(0 0 6px #60a5fa)" : "none",
                }}
                role="img"
                aria-label={`Goblin wave defense for ${goblin.memberName} (${isGhost ? "Defeated ghost" : "Attacking fence"})`}
              >
                <use href="#goblin-shape" width="30" height="40" />
                {isGhost ? (
                  <text x="15" y="-6" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">
                    👻 Slayed
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
