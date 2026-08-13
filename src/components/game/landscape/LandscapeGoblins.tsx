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
        {/* Grounded in right-center zone of middle field (x = 480px to 620px, grounded at y = 245px) facing player avatars directly */}
        <g transform="translate(480, 245)">
          {goblins.map((goblin, index) => {
            const offsetX = index * 48;
            const offsetY = (index % 2) * 12;
            const isGhost = goblin.goblinState === "ghost" || (goblin.isDefeated ?? false);

            return (
              <g
                key={goblin.id}
                transform={`translate(${offsetX}, ${offsetY})`}
                className={`goblin-item ${isGhost ? "goblin-ghost-defeated" : "goblin-active-fence-attack"}`}
                style={{
                  opacity: isGhost ? 0.35 : 1,
                  filter: isGhost ? "drop-shadow(0 0 6px #60a5fa)" : "none",
                }}
                role="img"
                aria-label={`Goblin wave defense for ${goblin.memberName} (${isGhost ? "Defeated ghost" : "Attacking fence"})`}
              >
                <use href="#goblin-shape" width="32" height="42" />
                {isGhost ? (
                  <text x="16" y="-8" textAnchor="middle" fill="#93c5fd" fontSize="10.5" fontWeight="bold">
                    👻 Slayed
                  </text>
                ) : (
                  <g className="goblin-attack-swing">
                    <line x1="28" y1="20" x2="38" y2="8" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="38,8 35,2 42,6" fill="#ef4444" />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
