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
          {/* Sharpened Medieval Palisade Log Definition */}
          <g id="palisade-log">
            <polygon points="0,10 6,0 12,10 12,50 0,50" fill="#5c4033" stroke="#2b1d14" strokeWidth="1.5" />
            <line x1="6" y1="10" x2="6" y2="48" stroke="#3d2a20" strokeWidth="1" />
          </g>
        </defs>

        {/* --- MEDIEVAL FANTASY VILLAGE BOX (x = 25px to 255px, grounded on y = 295px) --- */}
        <g transform="translate(25, 0)">

          {/* BACK PALISADE LOG FENCE (Top of Fence Box) */}
          <use href="#palisade-log" x="20" y="235" />
          <use href="#palisade-log" x="30" y="235" />
          <use href="#palisade-log" x="40" y="235" />
          <use href="#palisade-log" x="50" y="235" />
          <use href="#palisade-log" x="60" y="235" />
          <use href="#palisade-log" x="70" y="235" />
          <use href="#palisade-log" x="80" y="235" />
          <use href="#palisade-log" x="90" y="235" />
          <use href="#palisade-log" x="100" y="235" />
          <use href="#palisade-log" x="110" y="235" />
          <use href="#palisade-log" x="120" y="235" />
          <use href="#palisade-log" x="130" y="235" />
          <use href="#palisade-log" x="140" y="235" />
          <use href="#palisade-log" x="150" y="235" />
          <use href="#palisade-log" x="160" y="235" />
          <use href="#palisade-log" x="170" y="235" />
          <use href="#palisade-log" x="180" y="235" />
          <use href="#palisade-log" x="190" y="235" />
          <use href="#palisade-log" x="200" y="235" />
          <use href="#palisade-log" x="210" y="235" />

          {/* Horizontal Fence Cross Beam (Back) */}
          <rect x="18" y="250" width="202" height="6" fill="#3d2a20" stroke="#1d130c" strokeWidth="1" />

          {/* --- MEDIEVAL WATCHTOWER (Left Corner) --- */}
          <g transform="translate(10, 160)">
            {/* Stone Tower Base */}
            <rect x="0" y="30" width="34" height="95" fill="#4a5568" stroke="#1a202c" strokeWidth="2.5" />
            <line x1="0" y1="55" x2="34" y2="55" stroke="#2d3748" strokeWidth="1.5" />
            <line x1="0" y1="80" x2="34" y2="80" stroke="#2d3748" strokeWidth="1.5" />
            {/* Wooden Guard Platform */}
            <rect x="-4" y="22" width="42" height="10" fill="#713f12" stroke="#1a202c" strokeWidth="2" />
            {/* Conical Spire Roof */}
            <polygon points="-6,24 17,-15 40,24" fill="#991b1b" stroke="#1a202c" strokeWidth="2" />
            {/* Banner Flag */}
            <line x1="17" y1="-15" x2="17" y2="-32" stroke="#1a202c" strokeWidth="2" />
            <polygon points="17,-32 35,-26 17,-20" fill="#ef4444" />
            {/* Window Arrow Slit */}
            <rect x="13" y="42" width="8" height="16" rx="4" fill="#fef08a" stroke="#1a202c" strokeWidth="1.5" />
          </g>

          {/* --- HOUSE 1: Timber-Framed Cottage --- */}
          <g transform="translate(58, 220)">
            {/* Stone Base */}
            <rect x="0" y="35" width="48" height="35" fill="#e2e8f0" stroke="#1a202c" strokeWidth="2.5" />
            {/* Timber Beams */}
            <line x1="0" y1="35" x2="48" y2="70" stroke="#713f12" strokeWidth="2" />
            <line x1="48" y1="35" x2="0" y2="70" stroke="#713f12" strokeWidth="2" />
            <line x1="24" y1="35" x2="24" y2="70" stroke="#713f12" strokeWidth="2" />
            {/* Clay Tile Roof */}
            <polygon points="-4,37 24,10 52,37" fill="#b91c1c" stroke="#1a202c" strokeWidth="2.5" />
            {/* Door */}
            <rect x="18" y="48" width="12" height="22" rx="2" fill="#713f12" stroke="#1a202c" strokeWidth="1.5" />
            {/* Glowing Window */}
            <rect x="6" y="42" width="9" height="9" fill="#fef08a" stroke="#1a202c" strokeWidth="1.5" />
          </g>

          {/* --- HOUSE 2: Grand Medieval Town Hall --- */}
          <g transform="translate(118, 195)">
            {/* Stone Tower Base */}
            <rect x="0" y="30" width="66" height="60" fill="#cbd5e1" stroke="#1a202c" strokeWidth="2.5" />
            {/* Timber Gables */}
            <polygon points="-5,32 33,0 71,32" fill="#7f1d1d" stroke="#1a202c" strokeWidth="2.5" />
            {/* Archway Door */}
            <path d="M 24 90 V 62 A 9 9 0 0 1 42 62 V 90 Z" fill="#451a03" stroke="#1a202c" strokeWidth="2" />
            {/* Twin Glowing Windows */}
            <rect x="10" y="42" width="11" height="13" fill="#fef08a" stroke="#1a202c" strokeWidth="1.5" />
            <rect x="45" y="42" width="11" height="13" fill="#fef08a" stroke="#1a202c" strokeWidth="1.5" />
          </g>

          {/* --- HOUSE 3: Stone Blacksmith Forge --- */}
          <g transform="translate(192, 225)">
            {/* Chimney */}
            <rect x="30" y="5" width="10" height="25" fill="#334155" stroke="#1a202c" strokeWidth="2" />
            {/* Chimney Smoke */}
            {isHealthy ? (
              <g transform="translate(35, -5)">
                <circle cx="0" cy="0" r="4" fill="#f1f5f9" opacity="0.7" />
                <circle cx="-3" cy="-8" r="6" fill="#f1f5f9" opacity="0.5" />
                <circle cx="2" cy="-18" r="8" fill="#f1f5f9" opacity="0.3" />
              </g>
            ) : null}
            {/* Stone Wall */}
            <rect x="0" y="25" width="46" height="40" fill="#64748b" stroke="#1a202c" strokeWidth="2.5" />
            <polygon points="-3,27 23,8 49,27" fill="#9a3412" stroke="#1a202c" strokeWidth="2.5" />
            <rect x="16" y="45" width="14" height="20" fill="#451a03" stroke="#1a202c" strokeWidth="1.5" />
          </g>

          {/* FRONT PALISADE LOG FENCE (Bottom/Front of Fence Box) */}
          <use href="#palisade-log" x="18" y="250" />
          <use href="#palisade-log" x="28" y="250" />
          <use href="#palisade-log" x="38" y="250" />
          <use href="#palisade-log" x="48" y="250" />
          <use href="#palisade-log" x="200" y="250" />
          <use href="#palisade-log" x="210" y="250" />
          <use href="#palisade-log" x="220" y="250" />
          <use href="#palisade-log" x="230" y="250" />

          {/* Horizontal Fence Cross Beam (Front) */}
          <rect x="16" y="265" width="220" height="6" fill="#3d2a20" stroke="#1d130c" strokeWidth="1" />

        </g>
      </svg>
    </div>
  );
}
