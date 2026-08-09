import { useEffect, useId, useRef, useState } from "react";

export type SceneMember = {
  profileId: string;
  displayName: string;
  characterFill: string;
  characterOutline: string;
  spellType?: string;
  hasSubmittedToday: boolean;
  hasPendingGoblin: boolean;
};

export type CombatEvent = {
  _id: string;
  attackerProfileId: string;
  attackerName: string;
  reviewerName: string;
  damage: number;
  spellType: string;
  taskTitle: string;
  createdAt: number;
};

export type LandscapeSceneProps = {
  projectTitle: string;
  remainingHp: number;
  maximumHp: number;
  villageHpPercent: number;
  members: SceneMember[];
  events: CombatEvent[];
  activeEvent?: CombatEvent | null;
  isOverdue?: boolean;
};

// Seeded pseudo-random numbers for cloud placement (deterministic per project)
function getCloudPositions(seedStr: string) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
    seed |= 0;
  }
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  return {
    farClouds: [
      { x: -100 + random() * 400, y: 40 + random() * 60, scale: 0.85 + random() * 0.3 },
      { x: 350 + random() * 400, y: 30 + random() * 80, scale: 0.9 + random() * 0.2 },
      { x: 800 + random() * 400, y: 50 + random() * 60, scale: 0.8 + random() * 0.4 },
      { x: 150 + random() * 500, y: 90 + random() * 50, scale: 0.7 + random() * 0.3 },
    ],
    nearClouds: [
      { x: -150 + random() * 300, y: 80 + random() * 70, scale: 1.1 + random() * 0.3 },
      { x: 450 + random() * 400, y: 90 + random() * 80, scale: 1.0 + random() * 0.4 },
      { x: 900 + random() * 300, y: 70 + random() * 90, scale: 1.2 + random() * 0.3 },
    ],
  };
}

export function LandscapeScene({
  projectTitle,
  remainingHp,
  maximumHp,
  villageHpPercent,
  members,
  events,
  activeEvent,
  isOverdue = false,
}: LandscapeSceneProps) {
  const skyGradId = useId();
  const cloudSeed = projectTitle || "default-game-seed";
  const { farClouds, nearClouds } = useRef(getCloudPositions(cloudSeed)).current;

  // Track boss defeat sequence
  const isBossDefeated = maximumHp > 0 && remainingHp === 0;
  const [hasPlayedVictory, setHasPlayedVictory] = useState(false);
  const victoryTriggeredRef = useRef(false);

  useEffect(() => {
    if (isBossDefeated && !victoryTriggeredRef.current) {
      victoryTriggeredRef.current = true;
      setHasPlayedVictory(true);
    } else if (!isBossDefeated) {
      victoryTriggeredRef.current = false;
      setHasPlayedVictory(false);
    }
  }, [isBossDefeated]);

  // Dragon horizontal placement based on Boss HP ratio
  // 100% Boss HP -> dragon raid position at x=880 (close to village/center)
  // 0% Boss HP -> repelled back to x=1120 (far right)
  const hpRatio = maximumHp > 0 ? Math.max(0, Math.min(1, remainingHp / maximumHp)) : 0;
  const raidDistance = 260; // Max horizontal movement range
  const dragonX = 1120 - hpRatio * raidDistance;

  // Village HP tier derivation
  // >75%: full color, glow, smoke
  // 50-75%: desaturated, no glow, no smoke
  // 25-50%: 1 damaged house tint
  // <=25%: burning/severe damage state
  const villageTier =
    villageHpPercent > 75
      ? "pristine"
      : villageHpPercent > 50
      ? "weary"
      : villageHpPercent > 25
      ? "damaged"
      : "burning";

  // Pending goblins for members without daily submission
  const goblins = members.filter((m) => m.hasPendingGoblin);

  return (
    <figure
      className="landscape-scene-container"
      aria-label={`Landscape scene for ${projectTitle}. Boss HP: ${remainingHp}/${maximumHp}. Village HP: ${villageHpPercent}%.`}
    >
      <svg
        className="landscape-svg-canvas"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        role="img"
      >
        <defs>
          <linearGradient id={skyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-sky-top)" />
            <stop offset="100%" stopColor="var(--color-sky-bottom)" />
          </linearGradient>

          {/* Cloud Template A */}
          <g id="cloud-shape-a">
            <ellipse cx="60" cy="35" rx="55" ry="25" fill="var(--color-cloud)" />
            <ellipse cx="95" cy="25" rx="35" ry="22" fill="var(--color-cloud)" />
            <ellipse cx="35" cy="28" rx="30" ry="18" fill="var(--color-cloud)" />
          </g>

          {/* Cloud Template B */}
          <g id="cloud-shape-b">
            <ellipse cx="70" cy="40" rx="65" ry="28" fill="var(--color-cloud-near)" />
            <ellipse cx="110" cy="30" rx="40" ry="25" fill="var(--color-cloud-near)" />
            <ellipse cx="40" cy="32" rx="35" ry="22" fill="var(--color-cloud-near)" />
          </g>
        </defs>

        {/* LAYER 0: Sky background */}
        <rect x="0" y="0" width="1200" height="600" fill={`url(#${skyGradId})`} />

        {/* LAYER 1: Far Clouds (Slow Parallax Drift) */}
        <g className="cloud-far" opacity="0.65">
          {farClouds.map((c, i) => (
            <use
              key={`far-cloud-${i}`}
              href="#cloud-shape-a"
              x={c.x}
              y={c.y}
              transform={`scale(${c.scale})`}
            />
          ))}
        </g>

        {/* LAYER 2: Near Clouds (Faster Parallax Drift) */}
        <g className="cloud-near" opacity="0.85">
          {nearClouds.map((c, i) => (
            <use
              key={`near-cloud-${i}`}
              href="#cloud-shape-b"
              x={c.x}
              y={c.y}
              transform={`scale(${c.scale})`}
            />
          ))}
        </g>

        {/* LAYER 3: Horizon / Distant Hills */}
        <path
          d="M 0 450 Q 280 390 600 440 Q 920 380 1200 450 L 1200 600 L 0 600 Z"
          fill="var(--color-land-dark)"
          opacity="0.75"
        />

        {/* LAYER 4: Ground Plane */}
        <rect x="0" y="440" width="1200" height="160" fill="var(--color-land)" />
        <line x1="0" y1="440" x2="1200" y2="440" stroke="var(--color-land-dark)" strokeWidth="4" />

        {/* LAYER 5: Village Structures (Left ~25%) */}
        <g
          className={`village-cluster house-tier-${villageTier}`}
          aria-label={`Village status: ${villageTier}`}
        >
          {/* House 1: Main Hall */}
          <g className="house-structure-g" transform="translate(60, 360)">
            <rect
              x="0"
              y="30"
              width="70"
              height="60"
              fill={villageTier === "burning" ? "var(--color-roof-dark)" : "var(--color-roof)"}
              stroke="var(--color-navy)"
              strokeWidth="3"
            />
            <polygon
              points="-8,30 35,-15 78,30"
              fill={villageTier === "burning" || villageTier === "damaged" ? "var(--color-ember)" : "var(--color-roof)"}
              stroke="var(--color-navy)"
              strokeWidth="3"
            />
            {/* Window with glow in pristine state */}
            <rect
              x="25"
              y="45"
              width="20"
              height="20"
              fill={villageTier === "pristine" ? "var(--color-window-glow)" : "var(--color-land-dark)"}
              stroke="var(--color-navy)"
              strokeWidth="2"
            />
            <line x1="35" y1="45" x2="35" y2="65" stroke="var(--color-navy)" strokeWidth="2" />
            <line x1="25" y1="55" x2="45" y2="55" stroke="var(--color-navy)" strokeWidth="2" />
            {/* Chimney & Smoke */}
            <rect x="52" y="-5" width="12" height="25" fill="var(--color-roof-dark)" stroke="var(--color-navy)" strokeWidth="2" />
            {villageTier === "pristine" && (
              <circle className="chimney-smoke-p" cx="58" cy="-14" r="7" fill="var(--color-cloud)" opacity="0.8" />
            )}
            {villageTier === "burning" && (
              <g className="chimney-smoke-p">
                <circle cx="58" cy="-14" r="8" fill="var(--color-ember)" opacity="0.7" />
                <circle cx="62" cy="-26" r="10" fill="var(--color-roof-dark)" opacity="0.6" />
              </g>
            )}
          </g>

          {/* House 2: Small Cottage */}
          <g className="house-structure-g" transform="translate(145, 385)">
            <rect x="0" y="20" width="50" height="45" fill="var(--color-cloud)" stroke="var(--color-navy)" strokeWidth="3" />
            <polygon points="-6,20 25,-10 56,20" fill="var(--color-roof)" stroke="var(--color-navy)" strokeWidth="3" />
            {/* Door */}
            <rect x="18" y="38" width="14" height="27" fill="var(--color-roof-dark)" stroke="var(--color-navy)" strokeWidth="2" />
            {villageTier === "pristine" && (
              <rect x="6" y="28" width="10" height="10" fill="var(--color-window-glow)" stroke="var(--color-navy)" strokeWidth="2" />
            )}
          </g>

          {/* House 3: Tower / Workshop */}
          <g className="house-structure-g" transform="translate(210, 340)">
            <rect x="0" y="20" width="45" height="90" fill="var(--color-land-dark)" stroke="var(--color-navy)" strokeWidth="3" />
            <polygon
              points="-8,20 22.5,-25 53,20"
              fill={villageTier === "burning" ? "var(--color-ember)" : "var(--color-roof-dark)"}
              stroke="var(--color-navy)"
              strokeWidth="3"
            />
            {villageTier === "pristine" && (
              <circle cx="22.5" cy="45" r="8" fill="var(--color-window-glow)" stroke="var(--color-navy)" strokeWidth="2" />
            )}
          </g>

          {/* House 4: Storage Barn */}
          <g className="house-structure-g" transform="translate(270, 395)">
            <rect x="0" y="15" width="55" height="40" fill="var(--color-roof)" stroke="var(--color-navy)" strokeWidth="3" />
            <polygon points="-5,15 27.5,-8 60,15" fill="var(--color-land-dark)" stroke="var(--color-navy)" strokeWidth="3" />
            {villageTier === "burning" && (
              <polygon points="5,15 27.5,-2 50,15" fill="var(--color-ember)" />
            )}
          </g>
        </g>

        {/* LAYER 6: Daily Goblins Cluster (Center-Left) */}
        <g className="goblins-layer" aria-label={`Active goblins: ${goblins.length}`}>
          {goblins.map((goblin, index) => {
            const gx = 380 + (index % 4) * 45 + (index >= 4 ? 20 : 0);
            const gy = 445 + Math.floor(index / 4) * 20;

            return (
              <g
                key={`goblin-${goblin.profileId}`}
                className="goblin-group goblin-idle-anim"
                transform={`translate(${gx}, ${gy})`}
                aria-label={`Goblin threat for ${goblin.displayName}`}
              >
                {/* Shadow */}
                <ellipse cx="12" cy="24" rx="12" ry="4" fill="var(--color-navy)" opacity="0.3" />
                {/* Body */}
                <polygon points="4,12 20,12 17,24 7,24" fill="var(--color-land-dark)" stroke="var(--color-navy)" strokeWidth="2" />
                {/* Head */}
                <circle cx="12" cy="8" r="7" fill="var(--color-land)" stroke="var(--color-navy)" strokeWidth="2" />
                {/* Pointy ears */}
                <polygon points="5,7 0,4 6,9" fill="var(--color-land)" stroke="var(--color-navy)" strokeWidth="1.5" />
                <polygon points="19,7 24,4 18,9" fill="var(--color-land)" stroke="var(--color-navy)" strokeWidth="1.5" />
                {/* Ember eyes */}
                <circle cx="10" cy="7" r="1.5" fill="var(--color-ember)" />
                <circle cx="14" cy="7" r="1.5" fill="var(--color-ember)" />
              </g>
            );
          })}
        </g>

        {/* LAYER 7: Player Avatars / Party Markers (Near Village) */}
        <g className="party-avatars-layer" aria-label="Team member presence">
          {members.map((member, index) => {
            const ax = 120 + index * 42;
            const ay = 460;

            return (
              <g
                key={`avatar-${member.profileId}`}
                transform={`translate(${ax}, ${ay})`}
                aria-label={`${member.displayName} ${member.hasSubmittedToday ? "(submitted today)" : "(pending update)"}`}
              >
                {/* Active-today glow ring */}
                {member.hasSubmittedToday && (
                  <circle
                    cx="14"
                    cy="14"
                    r="18"
                    fill="none"
                    stroke="var(--color-green)"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                  />
                )}
                {/* Character Silhouette / Figure */}
                <circle
                  cx="14"
                  cy="6"
                  r="7"
                  fill={member.characterFill || "var(--color-cloud)"}
                  stroke={member.characterOutline || "var(--color-navy)"}
                  strokeWidth="2"
                />
                <path
                  d="M6 14 Q14 10 22 14 L20 26 L8 26 Z"
                  fill={member.characterFill || "var(--color-cloud)"}
                  stroke={member.characterOutline || "var(--color-navy)"}
                  strokeWidth="2"
                />
                {/* Mini label initials */}
                <text
                  x="14"
                  y="34"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="var(--color-text)"
                >
                  {member.displayName.slice(0, 2).toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>

        {/* LAYER 8: Dragon / Boss (Right side, raiding horizontally) */}
        <g
          className={`dragon-group-motion ${hasPlayedVictory ? "dragon-victory-flyaway" : "dragon-hover-bob"}`}
          transform={`translate(${dragonX}, 310)`}
          aria-label={isBossDefeated ? "Boss repelled" : `Boss Dragon at HP ${remainingHp}`}
        >
          {/* Dragon Shadow */}
          <ellipse cx="60" cy="150" rx="50" ry="10" fill="var(--color-navy)" opacity="0.25" />

          {/* Dragon Body Group */}
          <g className="dragon-silhouette-flat">
            {/* Wings (Flapping Animation) */}
            <g className="dragon-wing-flap">
              <polygon points="30,40 -40,-40 20,-10" fill="var(--color-dragon-accent)" stroke="var(--color-navy)" strokeWidth="3" />
              <polygon points="30,40 100,-50 50,0" fill="var(--color-dragon)" stroke="var(--color-navy)" strokeWidth="3" />
            </g>

            {/* Tail */}
            <path
              d="M 110 90 Q 150 110 170 80 Q 185 60 190 90"
              fill="none"
              stroke="var(--color-dragon)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <polygon points="185,90 205,85 195,105" fill="var(--color-ember)" />

            {/* Body */}
            <path
              d="M 20 70 Q 60 40 110 70 Q 120 110 60 120 Q 10 110 20 70 Z"
              fill="var(--color-dragon)"
              stroke="var(--color-navy)"
              strokeWidth="4"
            />

            {/* Neck & Head (Facing Left towards Village) */}
            <path
              d="M 30 75 Q 0 40 -20 50 Q -40 55 -55 45 Q -30 75 10 95 Z"
              fill="var(--color-dragon)"
              stroke="var(--color-navy)"
              strokeWidth="4"
            />

            {/* Horns */}
            <polygon points="-20,45 -35,20 -15,40" fill="var(--color-roof-dark)" stroke="var(--color-navy)" strokeWidth="2" />
            <polygon points="-10,48 -20,25 -5,43" fill="var(--color-roof-dark)" stroke="var(--color-navy)" strokeWidth="2" />

            {/* Ember Eye */}
            <circle cx="-32" cy="48" r="4" fill="var(--color-ember)" stroke="var(--color-navy)" strokeWidth="1" />

            {/* Snout flame wisp if high aggression */}
            {hpRatio > 0.5 && !isBossDefeated && (
              <polygon points="-55,48 -75,44 -60,54 -80,52 -55,54" fill="var(--color-ember)" />
            )}
          </g>
        </g>

        {/* LAYER 9: Foreground FX (Floating Damage Toasts & Projectiles) */}
        {activeEvent && (
          <g transform="translate(780, 260)">
            <text x="0" y="0" className="landscape-toast-damage" fontSize="28">
              -{activeEvent.damage} HP
            </text>
            <text x="0" y="24" className="landscape-toast-slain">
              ✦ {activeEvent.attackerName} attacked!
            </text>
          </g>
        )}
      </svg>
    </figure>
  );
}
