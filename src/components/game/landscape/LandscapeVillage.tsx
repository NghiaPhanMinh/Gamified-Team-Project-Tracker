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
        {/* Village Group on Left ~28% (Grounded directly on ground plane y = 295) */}
        <g transform="translate(30, 0)">
          {/* Layer 5a: Mid-Background Split-Rail Fences */}
          <use href="#background-fence-shape" x="50" y="260" />
          <use href="#background-fence-shape" x="90" y="260" />
          <use href="#background-fence-shape" x="130" y="260" />
          <use href="#background-fence-shape" x="170" y="260" />
          <use href="#background-fence-shape" x="210" y="260" />

          {/* Layer 5b: Watchtower on Left Edge (Planted at y = 295) */}
          <use href="#watchtower-shape" x="10" y="175" />

          {/* Layer 5c: Chimney Smoke Wisp (Only when healthy >75%) */}
          {isHealthy ? (
            <g transform="translate(135, 175)" className="village-smoke-wisp">
              <circle cx="0" cy="0" r="4.5" fill="var(--scene-cloud)" opacity="0.65" />
              <circle cx="-3" cy="-10" r="6.5" fill="var(--scene-cloud)" opacity="0.5" />
              <circle cx="2" cy="-22" r="8.5" fill="var(--scene-cloud)" opacity="0.3" />
            </g>
          ) : null}

          {/* Ember particles rising when <= 25% HP */}
          {isCritical ? (
            <g transform="translate(120, 190)" className="village-smoke-wisp">
              <circle cx="20" cy="10" r="3" fill="var(--scene-ember-danger)" opacity="0.9" />
              <circle cx="60" cy="20" r="3.5" fill="var(--scene-ember-gold)" opacity="0.8" />
              <circle cx="110" cy="15" r="2.5" fill="var(--scene-ember-danger)" opacity="0.95" />
            </g>
          ) : null}

          {/* House 1: Left Timber Cottage (Grounded at y = 295) */}
          <g
            transform="translate(48, 230)"
            className="village-house"
            style={{ filter: tier === "normal" ? "saturate(0.7)" : "none" }}
          >
            {/* House Wall */}
            <rect x="0" y="20" width="48" height="45" fill="var(--scene-house-wall)" stroke="var(--scene-boss-slate)" strokeWidth="3" rx="1" />
            {/* Timber Crossbeams */}
            <line x1="0" y1="20" x2="48" y2="65" stroke="var(--scene-boss-slate)" strokeWidth="1.5" opacity="0.4" />
            <line x1="48" y1="20" x2="0" y2="65" stroke="var(--scene-boss-slate)" strokeWidth="1.5" opacity="0.4" />
            {/* Roof */}
            <polygon
              points="-4,22 24,0 52,22"
              fill={isCritical ? "var(--scene-ember-danger)" : "var(--scene-house-roof)"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Door */}
            <rect x="18" y="42" width="12" height="23" fill="var(--scene-boss-slate)" />
            {/* Window Glow */}
            <rect
              x="6"
              y="30"
              width="10"
              height="10"
              rx="1"
              fill={isHealthy ? "var(--scene-ember-gold)" : "#475569"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="1.5"
            />
          </g>

          {/* House 2: Center Town Hall (Tall, Chimney, Grounded at y = 295) */}
          <g
            transform="translate(102, 205)"
            className="village-house"
            style={{ filter: tier === "normal" ? "saturate(0.7)" : "none" }}
          >
            {/* Chimney */}
            <rect x="54" y="10" width="9" height="25" fill="var(--scene-boss-slate)" />
            {/* Stone Wall Foundation */}
            <rect x="0" y="65" width="68" height="25" fill="#38434f" stroke="var(--scene-boss-slate)" strokeWidth="3" />
            {/* Upper House Wall */}
            <rect x="0" y="25" width="68" height="42" fill="var(--scene-house-wall)" stroke="var(--scene-boss-slate)" strokeWidth="3" />
            {/* Roof */}
            <polygon
              points="-5,27 34,-5 73,27"
              fill={isDamaged ? "var(--scene-ember-danger)" : "var(--scene-house-roof)"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Arched Double Door */}
            <path d="M 26 90 V 64 A 8 8 0 0 1 42 64 V 90 Z" fill="var(--scene-boss-slate)" />
            {/* Window Glows */}
            <rect
              x="12"
              y="36"
              width="13"
              height="13"
              rx="1"
              fill={isHealthy ? "var(--scene-ember-gold)" : "#475569"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="2"
            />
            <rect
              x="43"
              y="36"
              width="13"
              height="13"
              rx="1"
              fill={isHealthy ? "var(--scene-ember-gold)" : "#475569"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="2"
            />
          </g>

          {/* House 3: Stone Forge (Grounded at y = 295) */}
          <g
            transform="translate(176, 235)"
            className="village-house"
            style={{ filter: tier === "normal" ? "saturate(0.7)" : "none" }}
          >
            <rect x="0" y="15" width="44" height="45" fill="#424f5d" stroke="var(--scene-boss-slate)" strokeWidth="3" rx="1" />
            <polygon
              points="-3,17 22,0 47,17"
              fill={isCritical ? "var(--scene-ember-danger)" : "var(--scene-house-roof)"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect x="15" y="38" width="14" height="22" fill="var(--scene-boss-slate)" />
            <rect
              x="26"
              y="22"
              width="10"
              height="10"
              rx="1"
              fill={isHealthy ? "var(--scene-ember-gold)" : "#475569"}
              stroke="var(--scene-boss-slate)"
              strokeWidth="1.5"
            />
          </g>

          {/* Layer 5d: Protective Front Palisade Log Walls (Planted at y = 295) */}
          <use href="#palisade-wall-shape" x="0" y="235" />
          <use href="#palisade-wall-shape" x="24" y="235" />
          <use href="#palisade-wall-shape" x="220" y="235" />
          <use href="#palisade-wall-shape" x="244" y="235" />
        </g>
      </svg>
    </div>
  );
}
