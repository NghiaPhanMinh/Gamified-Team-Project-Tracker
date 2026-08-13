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
      {/* Anchored Village HP Bar Badge Overlay */}
      <div className="village-hp-anchored-badge">
        <div className="village-hp-badge-header">
          <span className="village-hp-icon">🏰</span>
          <span className="village-hp-title">Village HP</span>
          <strong className="village-hp-val">{villageHpPercent}%</strong>
        </div>
        <div className="village-hp-bar-track" role="progressbar" aria-valuenow={villageHpPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`village-hp-bar-fill fill-${tier}`}
            style={{ width: `${villageHpPercent}%` }}
          />
        </div>
      </div>

      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <defs>
          {/* Sharpened Palisade Log */}
          <g id="palisade-log">
            <polygon points="0,8 5,0 10,8 10,45 0,45" fill="#5c4033" stroke="#2b1d14" strokeWidth="1.5" />
          </g>

          {/* Corner Watchtower Component */}
          <g id="corner-watchtower">
            <rect x="0" y="25" width="28" height="60" fill="#475569" stroke="#0f172a" strokeWidth="2" />
            <rect x="-3" y="18" width="34" height="8" fill="#78350f" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="-4,20 14,-10 32,20" fill="#991b1b" stroke="#0f172a" strokeWidth="2" />
            <line x1="14" y1="-10" x2="14" y2="-24" stroke="#0f172a" strokeWidth="2" />
            <polygon points="14,-24 28,-19 14,-14" fill="#ef4444" />
            <rect x="10" y="35" width="8" height="12" rx="3" fill="#fef08a" stroke="#0f172a" strokeWidth="1" />
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

          {/* --- HOUSES SPREAD OUT INSIDE SQUARE FENCE ENCLOSURE --- */}

          {/* House 1: Left Timber Cottage */}
          <g transform="translate(48, 220)">
            <rect x="0" y="30" width="44" height="35" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
            <line x1="0" y1="30" x2="44" y2="65" stroke="#78350f" strokeWidth="1.5" />
            <line x1="44" y1="30" x2="0" y2="65" stroke="#78350f" strokeWidth="1.5" />
            <polygon points="-4,32 22,10 48,32" fill="#b91c1c" stroke="#0f172a" strokeWidth="2" />
            <rect x="16" y="44" width="12" height="21" rx="2" fill="#78350f" stroke="#0f172a" strokeWidth="1" />
            <rect x="6" y="38" width="8" height="8" fill="#fef08a" stroke="#0f172a" strokeWidth="1" />
          </g>

          {/* House 2: Center Town Hall */}
          <g transform="translate(104, 195)">
            <rect x="0" y="30" width="60" height="60" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
            <polygon points="-5,32 30,2 65,32" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2" />
            <path d="M 22 90 V 64 A 8 8 0 0 1 38 64 V 90 Z" fill="#451a03" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="9" y="40" width="10" height="12" fill="#fef08a" stroke="#0f172a" strokeWidth="1" />
            <rect x="41" y="40" width="10" height="12" fill="#fef08a" stroke="#0f172a" strokeWidth="1" />
          </g>

          {/* House 3: Blacksmith Forge */}
          <g transform="translate(175, 225)">
            <rect x="28" y="5" width="9" height="22" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
            {isHealthy ? (
              <g transform="translate(32, -5)">
                <circle cx="0" cy="0" r="3.5" fill="#ffffff" opacity="0.8" />
                <circle cx="-3" cy="-7" r="5" fill="#ffffff" opacity="0.6" />
                <circle cx="2" cy="-15" r="7" fill="#ffffff" opacity="0.3" />
              </g>
            ) : null}
            <rect x="0" y="25" width="40" height="35" fill="#64748b" stroke="#0f172a" strokeWidth="2" />
            <polygon points="-3,27 20,10 43,27" fill="#9a3412" stroke="#0f172a" strokeWidth="2" />
            <rect x="14" y="42" width="12" height="18" fill="#451a03" stroke="#0f172a" strokeWidth="1" />
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

          {/* Horizontal Fence Cross Beam */}
          <rect x="25" y="265" width="190" height="5" fill="#3d2a20" stroke="#1d130c" strokeWidth="1" />

          {/* CORNER WATCHTOWER 3: Bottom-Left Corner */}
          <use href="#corner-watchtower" x="5" y="235" />

          {/* CORNER WATCHTOWER 4: Bottom-Right Corner */}
          <use href="#corner-watchtower" x="210" y="235" />

        </g>
      </svg>
    </div>
  );
}
