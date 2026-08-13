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
  // Left-center middle field zone (x = 320px to 450px), grounded at baseline y = 270px
  const count = Math.max(1, members.length);
  const startX = 320;
  const availableWidth = 130;
  const spacing = Math.min(45, availableWidth / count);

  return (
    <div className="landscape-layer layer-7-players" aria-label="Party members roster">
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <g>
          {members.map((member, index) => {
            const offsetX = startX + index * spacing;
            const offsetY = 270 + (index % 2) * 12;
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
                    x="-24"
                    y="-12"
                    width="48"
                    height="15"
                    rx="7.5"
                    fill="var(--scene-boss-slate)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-1.5"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {member.displayName.slice(0, 7)}
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
