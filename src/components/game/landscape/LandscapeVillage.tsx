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

  return (
    <div className={`landscape-layer layer-5-village village-tier-${tier}`} aria-label={`Village state: ${villageHpPercent}% HP (${tier})`}>
      {/* Floating Mob-Style Village HP Bar (No decorative header, just outline border-track and label) */}
      <div className="village-hp-mob-style">
        <span className="village-hp-percent-label">VILLAGE {villageHpPercent}% HP</span>
        <div className="village-hp-mob-track">
          <div
            className={`village-hp-mob-fill fill-${tier}`}
            style={{ width: `${villageHpPercent}%` }}
          />
        </div>
      </div>

      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <defs>
          {/* Sharpened Palisade Log (Pure Vector, No Outline) */}
          <g id="palisade-log">
            <polygon points="0,8 5,0 10,8 10,45 0,45" fill="#5c4033" />
          </g>

          {/* Corner Watchtower Component (Pure Vector, No Outline) */}
          <g id="corner-watchtower">
            <rect x="0" y="25" width="28" height="60" fill="#475569" />
            <rect x="-3" y="18" width="34" height="8" fill="#78350f" />
            <polygon points="-4,20 14,-10 32,20" fill="#991b1b" />
            {/* Flagpole as a solid thin rectangle (no outline) */}
            <rect x="13" y="-24" width="2" height="14" fill="#0f172a" />
            <polygon points="14,-24 28,-19 14,-14" fill="#ef4444" />
            <rect x="10" y="35" width="8" height="12" rx="3" fill="#fef08a" />
          </g>
        </defs>

        {/* --- SQUARE FENCE BOX WITH 4 CORNER WATCHTOWERS (x = 20px to 250px) --- */}
        <g transform="translate(20, 0)">

          {/* --- TOP FENCE WALL (Back Wall of Square Perimeter) --- */}
          <use href="#palisade-log" x="30" y="220" />
          <use href="#palisade-log" x="40" y="220" />
          <use href="#palisade-log" x="50" y="220" />
          <use href="#palisade-log" x="60" y="220" />
          <use href="#palisade-log" x="70" y="220" />
          <use href="#palisade-log" x="80" y="220" />
          <use href="#palisade-log" x="90" y="220" />
          <use href="#palisade-log" x="100" y="220" />
          <use href="#palisade-log" x="110" y="220" />
          <use href="#palisade-log" x="120" y="220" />
          <use href="#palisade-log" x="130" y="220" />
          <use href="#palisade-log" x="140" y="220" />
          <use href="#palisade-log" x="150" y="220" />
          <use href="#palisade-log" x="160" y="220" />
          <use href="#palisade-log" x="170" y="220" />
          <use href="#palisade-log" x="180" y="220" />
          <use href="#palisade-log" x="190" y="220" />
          <use href="#palisade-log" x="200" y="220" />

          {/* CORNER WATCHTOWER 1: Top-Left Corner */}
          <use href="#corner-watchtower" x="5" y="200" />

          {/* CORNER WATCHTOWER 2: Top-Right Corner */}
          <use href="#corner-watchtower" x="210" y="200" />

          {/* --- HOUSES SPREAD OUT INSIDE SQUARE FENCE ENCLOSURE (Pure Vector, No Outlines) --- */}

          {/* House 1: Left Timber Cottage */}
          <g transform="translate(48, 220)">
            <rect x="0" y="30" width="44" height="35" fill="#f8fafc" />
            {/* Flat diagonal beam patterns instead of line strokes */}
            <polygon points="0,30 4,30 44,61 44,65 40,65 0,34" fill="#78350f" />
            <polygon points="44,30 40,30 0,61 0,65 4,65 44,34" fill="#78350f" />
            <polygon points="-4,32 22,10 48,32" fill="#b91c1c" />
            <rect x="16" y="44" width="12" height="21" rx="2" fill="#78350f" />
            <rect x="6" y="38" width="8" height="8" fill="#fef08a" />
          </g>

          {/* House 2: Center Town Hall */}
          <g transform="translate(104, 195)">
            <rect x="0" y="30" width="60" height="60" fill="#cbd5e1" />
            <polygon points="-5,32 30,2 65,32" fill="#7f1d1d" />
            <path d="M 22 90 V 64 A 8 8 0 0 1 38 64 V 90 Z" fill="#451a03" />
            <rect x="9" y="40" width="10" height="12" fill="#fef08a" />
            <rect x="41" y="40" width="10" height="12" fill="#fef08a" />
          </g>

          {/* House 3: Blacksmith Forge */}
          <g transform="translate(175, 225)">
            <rect x="28" y="5" width="9" height="22" fill="#334155" />
            {isHealthy ? (
              <g transform="translate(32, -5)">
                <circle cx="0" cy="0" r="3.5" fill="#ffffff" opacity="0.8" />
                <circle cx="-3" cy="-7" r="5" fill="#ffffff" opacity="0.6" />
                <circle cx="2" cy="-15" r="7" fill="#ffffff" opacity="0.3" />
              </g>
            ) : null}
            <rect x="0" y="25" width="40" height="35" fill="#64748b" />
            <polygon points="-3,27 20,10 43,27" fill="#9a3412" />
            <rect x="14" y="42" width="12" height="18" fill="#451a03" />
          </g>

          {/* --- BOTTOM FENCE WALL (Front Wall of Square Perimeter) --- */}
          <use href="#palisade-log" x="30" y="250" />
          <use href="#palisade-log" x="40" y="250" />
          <use href="#palisade-log" x="50" y="250" />
          <use href="#palisade-log" x="60" y="250" />
          <use href="#palisade-log" x="170" y="250" />
          <use href="#palisade-log" x="180" y="250" />
          <use href="#palisade-log" x="190" y="250" />
          <use href="#palisade-log" x="200" y="250" />

          {/* Horizontal Fence Cross Beam (no outline) */}
          <rect x="25" y="265" width="190" height="5" fill="#3d2a20" />

          {/* CORNER WATCHTOWER 3: Bottom-Left Corner */}
          <use href="#corner-watchtower" x="5" y="235" />

          {/* CORNER WATCHTOWER 4: Bottom-Right Corner */}
          <use href="#corner-watchtower" x="210" y="235" />

        </g>
      </svg>
    </div>
  );
}
