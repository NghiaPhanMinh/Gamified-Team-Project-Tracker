type PlayerMember = {
  profileId: string;
  displayName: string;
  characterFill: string;
  characterOutline: string;
  isActiveToday: boolean;
  isAttacking?: boolean;
};

type LandscapePlayersProps = {
  members: PlayerMember[];
};

export function LandscapePlayers({ members }: LandscapePlayersProps) {
  // Grounded in left-center zone of middle field (x = 300px to 440px, grounded at y = 250px)
  const count = Math.max(1, members.length);
  const startX = 300;
  const availableWidth = 140;
  const spacing = Math.min(45, availableWidth / count);

  return (
    <div className="landscape-layer layer-7-players" aria-label="Party members roster">
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <g>
          {members.map((member, index) => {
            const offsetX = startX + index * spacing;
            const offsetY = 245 + (index % 2) * 12;
            const fill = member.characterFill || "#4ca0fe";
            const outline = member.characterOutline || "var(--scene-boss-slate)";
            const active = member.isActiveToday;

            return (
              <g
                key={member.profileId}
                transform={`translate(${offsetX}, ${offsetY})`}
                className={`player-character ${member.isAttacking ? "is-attacking" : ""}`}
                role="img"
                aria-label={`${member.displayName} (${active ? "Active today" : "Idle"})`}
              >
                {/* Game ID Tag Pill rendered directly above avatar */}
                <g transform="translate(15, -14)">
                  <rect
                    x="-26"
                    y="-12"
                    width="52"
                    height="16"
                    rx="8"
                    fill="var(--scene-boss-slate)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="-0.5"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {member.displayName.slice(0, 8)}
                  </text>
                </g>

                {/* Active glow ring */}
                {active ? (
                  <circle
                    cx="15"
                    cy="48"
                    r="12"
                    fill="none"
                    stroke="var(--scene-ember-gold)"
                    strokeWidth="2.5"
                    opacity="0.85"
                  />
                ) : null}

                {/* Head */}
                <circle cx="15" cy="18" r="9" fill={fill} stroke={outline} strokeWidth="2.5" />
                {/* Body polygon */}
                <path
                  d="M7 45 Q15 32 23 45 Z"
                  fill={fill}
                  stroke={outline}
                  strokeWidth="2.5"
                />
                {/* Eyes */}
                <circle cx="12" cy="17" r="1.2" fill={outline} />
                <circle cx="18" cy="17" r="1.2" fill={outline} />

                {/* Active Indicator Crown / Star */}
                {active ? (
                  <polygon
                    points="15,4 17,8 21,8 18,11 19,15 15,13 11,15 12,11 9,8 13,8"
                    fill="var(--scene-ember-gold)"
                    stroke="var(--scene-boss-slate)"
                    strokeWidth="1"
                  />
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
