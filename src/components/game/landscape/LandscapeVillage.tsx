import { useMemo } from "react";

type VillageHpTier = "healthy" | "normal" | "damaged" | "critical";

type LandscapeVillageProps = {
  villageHpPercent: number; // 0 to 100
};

export function LandscapeVillage({ villageHpPercent }: LandscapeVillageProps) {
  const tier: VillageHpTier = useMemo(() => {
    if (villageHpPercent > 75) return "healthy";
    if (villageHpPercent >= 50) return "normal";
    if (villageHpPercent >= 25) return "damaged";
    return "critical";
  }, [villageHpPercent]);

  const isHealthy = tier === "healthy";
  const isDamaged = tier === "damaged" || tier === "critical";
  const isCritical = tier === "critical";

  return (
    <div className={`landscape-layer layer-5-village village-tier-${tier}`} aria-label={`Village state: ${villageHpPercent}% HP (${tier})`}>
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        {/* Village Group on Left ~25% */}
        <g transform="translate(40, 210)" className="village-house-cluster">
          {/* Chimney Smoke (Only when >75% HP) */}
          {isHealthy ? (
            <g transform="translate(68, 10)" className="village-smoke-wisp">
              <circle cx="0" cy="0" r="4" fill="var(--scene-cloud)" opacity="0.6" />
              <circle cx="-3" cy="-8" r="6" fill="var(--scene-cloud)" opacity="0.5" />
              <circle cx="2" cy="-18" r="8" fill="var(--scene-cloud)" opacity="0.3" />
            </g>
          ) : null}

          {/* Ember particles rising when <= 25% HP */}
          {isCritical ? (
            <g className="village-smoke-wisp">
              <circle cx="50" cy="20" r="2.5" fill="var(--scene-ember-danger)" opacity="0.8" />
              <circle cx="110" cy="30" r="3" fill="var(--scene-ember-gold)" opacity="0.7" />
              <circle cx="160" cy="25" r="2" fill="var(--scene-ember-danger)" opacity="0.9" />
            </g>
          ) : null}

          {/* House 1: Left Cottage */}
          <g
            transform="translate(10, 20)"
            className="village-house"
            style={{
              filter: tier === "normal" ? "saturate(0.7)" : "none",
            }}
          >
            {/* House body */}
            <rect x="0" y="25" width="55" height="45" fill="var(--scene-house-wall)" stroke="var(--scene-boss-slate)" strokeWidth="3" rx="1" />
            {/* Roof */}
            <polygon
              points="-4,27 27.5,0 59,27"
              fill={isCritical ? "var(--scene-ember-danger)" : "var(--scene-house-roof)"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Door */}
            <rect x="22" y="45" width="13" height="25" fill="var(--scene-boss-slate)" />
            {/* Window Glow */}
            <rect
              x="8"
              y="34"
              width="10"
              height="10"
              rx="1"
              fill={isHealthy ? "var(--scene-ember-gold)" : "#475569"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="1.5"
            />
          </g>

          {/* House 2: Center Main Town Hall (Tall) */}
          <g
            transform="translate(55, 0)"
            className="village-house"
            style={{
              filter: tier === "normal" ? "saturate(0.7)" : "none",
            }}
          >
            {/* Chimney */}
            <rect x="52" y="15" width="8" height="22" fill="var(--scene-boss-slate)" />
            {/* House body */}
            <rect x="10" y="25" width="65" height="65" fill="var(--scene-house-wall)" stroke="var(--scene-boss-slate)" strokeWidth="3" rx="1" />
            {/* Roof */}
            <polygon
              points="4,27 42.5,-5 81,27"
              fill={isDamaged ? "var(--scene-ember-danger)" : "var(--scene-house-roof)"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Main Arch Door */}
            <path d="M34 90 V65 A9 9 0 0 1 52 65 V90 Z" fill="var(--scene-boss-slate)" />
            {/* Window Glows */}
            <rect
              x="20"
              y="38"
              width="14"
              height="14"
              rx="1"
              fill={isHealthy ? "var(--scene-ember-gold)" : "#475569"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="2"
            />
            <rect
              x="52"
              y="38"
              width="14"
              height="14"
              rx="1"
              fill={isHealthy ? "var(--scene-ember-gold)" : "#475569"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="2"
            />
          </g>

          {/* House 3: Right House */}
          <g
            transform="translate(130, 25)"
            className="village-house"
            style={{
              filter: tier === "normal" ? "saturate(0.7)" : "none",
            }}
          >
            <rect x="0" y="20" width="50" height="45" fill="var(--scene-house-wall)" stroke="var(--scene-boss-slate)" strokeWidth="3" rx="1" />
            <polygon
              points="-3,22 25,0 53,22"
              fill={isCritical ? "var(--scene-ember-danger)" : "var(--scene-house-roof)"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="18" y="42" width="12" height="23" fill="var(--scene-boss-slate)" />
            <rect
              x="32"
              y="30"
              width="10"
              height="10"
              rx="1"
              fill={isHealthy ? "var(--scene-ember-gold)" : "#475569"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="1.5"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
