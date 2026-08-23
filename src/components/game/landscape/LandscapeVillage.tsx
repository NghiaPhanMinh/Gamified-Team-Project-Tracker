import { useMemo } from "react";

type VillageHpTier = "healthy" | "normal" | "damaged" | "critical";

type LandscapeVillageProps = {
  villageHpPercent: number; // 0 to 100
  villageName?: string;
  villageHpBarPos?: { x: number; y: number };
  villageHpBarWidth?: number;
  villageHpBarHeight?: number;
  villageHpBarScale?: number;
};

export function LandscapeVillage({
  villageHpPercent,
  villageName,
  villageHpBarPos = { x: 0, y: 0 },
  villageHpBarWidth = 140,
  villageHpBarHeight = 12,
  villageHpBarScale = 1,
}: LandscapeVillageProps) {
  const tier: VillageHpTier = useMemo(() => {
    if (villageHpPercent > 75) return "healthy";
    if (villageHpPercent >= 50) return "normal";
    if (villageHpPercent >= 25) return "damaged";
    return "critical";
  }, [villageHpPercent]);

  const isHealthy = tier === "healthy";

  return (
    <div className={`landscape-layer layer-5-village village-tier-${tier}`} aria-label={`Village state: ${villageHpPercent}% HP (${tier})`}>
      {/* Floating Mob-Style Village HP Bar with Name directly ABOVE the bar */}
      <div
        className="village-hp-container"
        style={{
          position: "absolute",
          left: `calc(135px + ${villageHpBarPos.x}px)`,
          top: `calc(165px + ${villageHpBarPos.y}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 35,
          transform: `scale(${villageHpBarScale})`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      >
        {/* Name Text Float ABOVE Health Bar (No Emoji, No Shadow) */}
        <div
          style={{
            fontSize: "0.68rem",
            fontWeight: 800,
            fontFamily: "var(--font-heading), sans-serif",
            color: "#ffffff",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            marginBottom: "3px",
            textAlign: "center",
          }}
        >
          {villageName ?? "Town of Last-Minute Hope"}
        </div>

        {/* Flat Health Bar with HP % INSIDE (No Shadow, No Outline) */}
        <div
          className="village-hp-mob-style"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={villageHpPercent}
          style={{
            width: `${villageHpBarWidth}px`,
            height: `${villageHpBarHeight}px`,
            position: "relative",
            background: "#1e293b",
            borderRadius: "3px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className={`village-hp-mob-fill fill-${tier}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${villageHpPercent}%`,
              height: "100%",
              transition: "width 0.3s ease",
            }}
          />
          <span
            style={{
              position: "relative",
              zIndex: 2,
              fontSize: "0.6rem",
              fontWeight: 800,
              color: "#ffffff",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {villageHpPercent}%
          </span>
        </div>
      </div>

      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <defs>
          {/* Sharpened Palisade Timber Log (No stroke/outline) */}
          <g id="palisade-log">
            <polygon points="0,8 5,0 10,8 10,45 0,45" fill="#78350f" />
            <polygon points="5,0 10,8 10,45 5,45" fill="#5c2406" />
          </g>

          {/* Medieval Stone Watchtower (No outline, clean orange conical roof) */}
          <g id="medieval-watchtower">
            {/* Stone Tower Base */}
            <rect x="0" y="20" width="30" height="65" fill="#475569" />
            {/* Subtle Brick Lines */}
            <line x1="0" y1="35" x2="30" y2="35" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="50" x2="30" y2="50" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="65" x2="30" y2="65" stroke="#334155" strokeWidth="1" />
            <line x1="15" y1="20" x2="15" y2="35" stroke="#334155" strokeWidth="1" />
            <line x1="8" y1="35" x2="8" y2="50" stroke="#334155" strokeWidth="1" />
            <line x1="22" y1="35" x2="22" y2="50" stroke="#334155" strokeWidth="1" />
            <line x1="15" y1="50" x2="15" y2="65" stroke="#334155" strokeWidth="1" />
            {/* Arrow Slit Window */}
            <rect x="13" y="38" width="4" height="10" rx="2" fill="#0f172a" />
            {/* Tower Corbel Trim */}
            <rect x="-4" y="14" width="38" height="7" fill="#64748b" />
            {/* Battlements / Crenellations */}
            <rect x="-4" y="8" width="8" height="7" fill="#475569" />
            <rect x="11" y="8" width="8" height="7" fill="#475569" />
            <rect x="26" y="8" width="8" height="7" fill="#475569" />
            {/* Steep Conical All-Orange Roof */}
            <polygon points="-6,14 15,-18 36,14" fill="#feaa01" />
            <polygon points="15,-18 36,14 15,14" fill="#ea580c" opacity="0.4" />
            {/* Flagpole and Orange Pennant */}
            <line x1="15" y1="-18" x2="15" y2="-32" stroke="#334155" strokeWidth="2" />
            <polygon points="15,-32 28,-26 15,-20" fill="#feaa01" />
          </g>

          {/* Vine Leaf Cluster */}
          <g id="vine-cluster">
            <path d="M 0,0 Q 4,-4 8,-2 Q 12,2 8,6 Q 2,6 0,0 Z" fill="#16a34a" />
            <path d="M 6,-2 Q 10,-8 14,-5 Q 16,0 12,3 Q 8,2 6,-2 Z" fill="#22c55e" />
            <path d="M -2,4 Q -6,8 -3,12 Q 2,14 4,8 Q 2,4 -2,4 Z" fill="#15803d" />
            <circle cx="5" cy="1" r="1.5" fill="#1dd851" />
          </g>
        </defs>

        {/* --- SQUARE MEDIEVAL FORTIFIED VILLAGE (x = 20px to 250px) --- */}
        <g transform="translate(20, 0)">

          {/* --- TOP BACK PALISADE WALL --- */}
          {Array.from({ length: 18 }).map((_, i) => (
            <use key={`back-wall-${i}`} href="#palisade-log" x={30 + i * 10} y="220" />
          ))}

          {/* CORNER WATCHTOWER 1: Top-Left */}
          <use href="#medieval-watchtower" x="5" y="195" />

          {/* CORNER WATCHTOWER 2: Top-Right */}
          <use href="#medieval-watchtower" x="210" y="195" />

          {/* --- MEDIEVAL HOUSES (Cobble + Half-Timber + All Orange Roofs, No Outlines) --- */}

          {/* House 1: Left Medieval Cottage */}
          <g transform="translate(46, 215)">
            {/* Stone Ground Floor */}
            <rect x="0" y="32" width="46" height="36" fill="#64748b" />
            {/* Timber Framing Half-Timbered Upper Gable */}
            <polygon points="-4,34 23,8 50,34" fill="#fef3c7" />
            {/* Timber Diagonal Cross Beams */}
            <line x1="3" y1="34" x2="23" y2="12" stroke="#78350f" strokeWidth="2" />
            <line x1="43" y1="34" x2="23" y2="12" stroke="#78350f" strokeWidth="2" />
            {/* All-Orange Overhanging Roof */}
            <polygon points="-6,34 23,6 52,34" fill="#feaa01" />
            <polygon points="23,6 52,34 23,34" fill="#ea580c" opacity="0.35" />
            {/* Wooden Door */}
            <rect x="17" y="44" width="12" height="24" rx="2" fill="#78350f" />
            <circle cx="26" cy="56" r="1.5" fill="#facc15" />
            {/* Lantern Window */}
            <rect x="6" y="42" width="8" height="8" rx="1" fill="#fde047" />
          </g>

          {/* House 2: Center Medieval Town Hall / Great Hall */}
          <g transform="translate(102, 185)">
            {/* Stone Base */}
            <rect x="0" y="40" width="64" height="52" fill="#475569" />
            {/* Stone Seam Lines */}
            <line x1="0" y1="65" x2="64" y2="65" stroke="#334155" strokeWidth="1" />
            {/* Half Timbered Upper Level */}
            <rect x="2" y="18" width="60" height="24" fill="#fef3c7" />
            <line x1="16" y1="18" x2="16" y2="42" stroke="#78350f" strokeWidth="2" />
            <line x1="32" y1="18" x2="32" y2="42" stroke="#78350f" strokeWidth="2" />
            <line x1="48" y1="18" x2="48" y2="42" stroke="#78350f" strokeWidth="2" />
            <line x1="2" y1="18" x2="32" y2="42" stroke="#78350f" strokeWidth="1.5" />
            <line x1="32" y1="18" x2="62" y2="42" stroke="#78350f" strokeWidth="1.5" />
            {/* All-Orange Steep Medieval Roof */}
            <polygon points="-6,20 32,-8 70,20" fill="#feaa01" />
            <polygon points="32,-8 70,20 32,20" fill="#ea580c" opacity="0.35" />
            {/* Arched Double Timber Door */}
            <path d="M 24 92 V 66 A 8 8 0 0 1 40 66 V 92 Z" fill="#78350f" />
            <line x1="32" y1="60" x2="32" y2="92" stroke="#5c2406" strokeWidth="1" />
            {/* Upper Lead Windows */}
            <rect x="22" y="24" width="8" height="10" rx="1" fill="#fde047" />
            <rect x="34" y="24" width="8" height="10" rx="1" fill="#fde047" />
          </g>

          {/* House 3: Right Medieval Blacksmith & Forge */}
          <g transform="translate(174, 218)">
            {/* Stone Chimney */}
            <rect x="26" y="2" width="11" height="28" fill="#475569" />
            {/* Gentle Smoke from Chimney */}
            {isHealthy ? (
              <g transform="translate(31, -8)">
                <circle cx="0" cy="0" r="3.5" fill="#e2e8f0" opacity="0.8" />
                <circle cx="-3" cy="-7" r="5" fill="#e2e8f0" opacity="0.6" />
                <circle cx="2" cy="-15" r="7" fill="#cbd5e1" opacity="0.3" />
              </g>
            ) : null}
            {/* Forge Body */}
            <rect x="0" y="28" width="44" height="38" fill="#64748b" />
            {/* All-Orange Forge Roof */}
            <polygon points="-4,30 22,8 48,30" fill="#feaa01" />
            <polygon points="22,8 48,30 22,30" fill="#ea580c" opacity="0.35" />
            {/* Open Forge Hearth Glow */}
            <rect x="14" y="44" width="16" height="22" rx="2" fill="#78350f" />
            <circle cx="22" cy="55" r="5" fill="#f97316" />
            <circle cx="22" cy="55" r="3" fill="#fde047" />
          </g>

          {/* --- FRONT PALISADE WALL & GREY BRICK ARCHED GATE WITH VINES --- */}
          
          {/* Front Left Fence */}
          <use href="#palisade-log" x="30" y="252" />
          <use href="#palisade-log" x="40" y="252" />
          <use href="#palisade-log" x="50" y="252" />
          <use href="#palisade-log" x="60" y="252" />
          <use href="#palisade-log" x="70" y="252" />

          {/* Front Right Fence */}
          <use href="#palisade-log" x="160" y="252" />
          <use href="#palisade-log" x="170" y="252" />
          <use href="#palisade-log" x="180" y="252" />
          <use href="#palisade-log" x="190" y="252" />
          <use href="#palisade-log" x="200" y="252" />

          {/* Horizontal Fence Cross Support */}
          <rect x="28" y="268" width="55" height="5" fill="#451a03" />
          <rect x="158" y="268" width="55" height="5" fill="#451a03" />

          {/* --- MEDIEVAL GREY BRICK TEXTURED GATE WITH VINES (x = 80 to 160) --- */}
          <g transform="translate(85, 230)">
            {/* Left Brick Gate Post */}
            <rect x="0" y="0" width="22" height="66" fill="#475569" />
            {/* Left Brick Seams */}
            <line x1="0" y1="12" x2="22" y2="12" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="24" x2="22" y2="24" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="36" x2="22" y2="36" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="48" x2="22" y2="48" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="60" x2="22" y2="60" stroke="#334155" strokeWidth="1" />
            <line x1="11" y1="0" x2="11" y2="12" stroke="#334155" strokeWidth="1" />
            <line x1="11" y1="24" x2="11" y2="36" stroke="#334155" strokeWidth="1" />
            <line x1="11" y1="48" x2="11" y2="60" stroke="#334155" strokeWidth="1" />

            {/* Right Brick Gate Post */}
            <rect x="52" y="0" width="22" height="66" fill="#475569" />
            {/* Right Brick Seams */}
            <line x1="52" y1="12" x2="74" y2="12" stroke="#334155" strokeWidth="1" />
            <line x1="52" y1="24" x2="74" y2="24" stroke="#334155" strokeWidth="1" />
            <line x1="52" y1="36" x2="74" y2="36" stroke="#334155" strokeWidth="1" />
            <line x1="52" y1="48" x2="74" y2="48" stroke="#334155" strokeWidth="1" />
            <line x1="52" y1="60" x2="74" y2="60" stroke="#334155" strokeWidth="1" />
            <line x1="63" y1="0" x2="63" y2="12" stroke="#334155" strokeWidth="1" />
            <line x1="63" y1="24" x2="63" y2="36" stroke="#334155" strokeWidth="1" />
            <line x1="63" y1="48" x2="63" y2="60" stroke="#334155" strokeWidth="1" />

            {/* Arched Stone Header Beam */}
            <path d="M 0 10 Q 37 -10 74 10 L 74 0 Q 37 -18 0 0 Z" fill="#64748b" />

            {/* Timber Portcullis Gate In Center */}
            <rect x="22" y="8" width="30" height="58" fill="#1e293b" />
            <line x1="28" y1="8" x2="28" y2="66" stroke="#78350f" strokeWidth="2" />
            <line x1="37" y1="8" x2="37" y2="66" stroke="#78350f" strokeWidth="2" />
            <line x1="46" y1="8" x2="46" y2="66" stroke="#78350f" strokeWidth="2" />
            <line x1="22" y1="20" x2="52" y2="20" stroke="#78350f" strokeWidth="2" />
            <line x1="22" y1="35" x2="52" y2="35" stroke="#78350f" strokeWidth="2" />
            <line x1="22" y1="50" x2="52" y2="50" stroke="#78350f" strokeWidth="2" />

            {/* Climbing Green Vine Leaves on Brick Gate Posts & Arch */}
            <use href="#vine-cluster" x="-3" y="18" />
            <use href="#vine-cluster" x="2" y="42" transform="scale(0.8)" />
            <use href="#vine-cluster" x="18" y="-6" transform="rotate(25)" />
            <use href="#vine-cluster" x="48" y="-4" transform="rotate(-20)" />
            <use href="#vine-cluster" x="62" y="28" />
            <use href="#vine-cluster" x="55" y="50" transform="scale(0.85)" />
          </g>

          {/* CORNER WATCHTOWER 3: Bottom-Left */}
          <use href="#medieval-watchtower" x="5" y="235" />

          {/* CORNER WATCHTOWER 4: Bottom-Right */}
          <use href="#medieval-watchtower" x="210" y="235" />

        </g>
      </svg>
    </div>
  );
}
