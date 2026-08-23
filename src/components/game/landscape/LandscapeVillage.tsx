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
          top: `calc(95px + ${villageHpBarPos.y}px)`,
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

        {/* --- 3D ISOMETRIC WALLED MEDIEVAL VILLAGE (Compact Grounded Medieval Houses) --- */}
        <g transform="translate(15, 0)">

          {/* 1. COURTYARD GRASS FLOOR (Seamless Natural Grass) */}
          <polygon points="18,185 236,185 244,256 10,256" fill="#17a738" />

          {/* 2. TOP BACK PALISADE WALL (y = 185) */}
          {Array.from({ length: 20 }).map((_, i) => (
            <use key={`back-wall-${i}`} href="#palisade-log" x={24 + i * 10} y="185" />
          ))}

          {/* CORNER WATCHTOWER 1: Top-Left */}
          <use href="#medieval-watchtower" x="0" y="160" />

          {/* CORNER WATCHTOWER 2: Top-Right */}
          <use href="#medieval-watchtower" x="220" y="160" />

          {/* 3. LEFT PALISADE SIDE WALL (y = 195 to 240) */}
          {Array.from({ length: 5 }).map((_, i) => (
            <use key={`left-wall-${i}`} href="#palisade-log" x={15 - i * 1.2} y={195 + i * 9} />
          ))}

          {/* 4. RIGHT PALISADE SIDE WALL (y = 195 to 240) */}
          {Array.from({ length: 5 }).map((_, i) => (
            <use key={`right-wall-${i}`} href="#palisade-log" x={233 + i * 1.2} y={195 + i * 9} />
          ))}

          {/* 5. MEDIEVAL HALF-TIMBERED HOUSES (Firmly Grounded on Grass at y = 248) */}

          {/* Building 1: Left Medieval Half-Timbered Cottage */}
          <g transform="translate(36, 178)">
            {/* Medieval Cream/Plaster Lower Ground Floor */}
            <rect x="0" y="28" width="46" height="42" fill="#fef3c7" />
            {/* Dark Brown Timber Corner Beams */}
            <rect x="0" y="28" width="4" height="42" fill="#78350f" />
            <rect x="42" y="28" width="4" height="42" fill="#78350f" />
            <line x1="0" y1="48" x2="46" y2="48" stroke="#78350f" strokeWidth="2" />
            {/* Timber Diagonal Cross Beams */}
            <line x1="2" y1="28" x2="23" y2="48" stroke="#78350f" strokeWidth="1.8" />
            <line x1="44" y1="28" x2="23" y2="48" stroke="#78350f" strokeWidth="1.8" />
            <line x1="2" y1="68" x2="23" y2="48" stroke="#78350f" strokeWidth="1.8" />
            <line x1="44" y1="68" x2="23" y2="48" stroke="#78350f" strokeWidth="1.8" />
            {/* All-Orange Medieval Overhanging Roof */}
            <polygon points="-6,28 23,2 52,28" fill="#feaa01" />
            <polygon points="23,2 52,28 23,28" fill="#ea580c" opacity="0.35" />
            {/* Timber Plank Door */}
            <rect x="17" y="48" width="12" height="22" rx="2" fill="#5c2406" />
            <circle cx="26" cy="58" r="1.5" fill="#facc15" />
            {/* Glowing Medieval Leaded Window */}
            <rect x="6" y="34" width="8" height="8" rx="1" fill="#fde047" stroke="#78350f" strokeWidth="1" />
          </g>

          {/* Building 2: Center Medieval Great Hall / Town Hall (Grounded at y = 248) */}
          <g transform="translate(94, 142)">
            {/* Half-Timbered Plaster Base */}
            <rect x="0" y="38" width="68" height="68" fill="#fef3c7" />
            {/* Timber Framing Vertical & Horizontal Grid */}
            <rect x="0" y="38" width="4" height="68" fill="#78350f" />
            <rect x="64" y="38" width="4" height="68" fill="#78350f" />
            <line x1="0" y1="68" x2="68" y2="68" stroke="#78350f" strokeWidth="2.5" />
            <line x1="18" y1="38" x2="18" y2="106" stroke="#78350f" strokeWidth="2" />
            <line x1="34" y1="38" x2="34" y2="106" stroke="#78350f" strokeWidth="2" />
            <line x1="50" y1="38" x2="50" y2="106" stroke="#78350f" strokeWidth="2" />
            {/* Timber Cross Braces */}
            <line x1="2" y1="38" x2="34" y2="68" stroke="#78350f" strokeWidth="1.5" />
            <line x1="34" y1="38" x2="66" y2="68" stroke="#78350f" strokeWidth="1.5" />
            <line x1="2" y1="104" x2="18" y2="68" stroke="#78350f" strokeWidth="1.5" />
            <line x1="50" y1="68" x2="66" y2="104" stroke="#78350f" strokeWidth="1.5" />
            {/* All-Orange Steep Medieval Roof */}
            <polygon points="-6,40 34,10 74,40" fill="#feaa01" />
            <polygon points="34,10 74,40 34,40" fill="#ea580c" opacity="0.35" />
            {/* Arched Double Timber Door */}
            <path d="M 26 106 V 78 A 8 8 0 0 1 42 78 V 106 Z" fill="#5c2406" />
            <line x1="34" y1="72" x2="34" y2="106" stroke="#3b1402" strokeWidth="1.2" />
            {/* Upper Windows */}
            <rect x="23" y="46" width="8" height="10" rx="1" fill="#fde047" stroke="#78350f" strokeWidth="1" />
            <rect x="37" y="46" width="8" height="10" rx="1" fill="#fde047" stroke="#78350f" strokeWidth="1" />
          </g>

          {/* Building 3: Right Medieval Half-Timbered Forge / House */}
          <g transform="translate(166, 178)">
            {/* Stone Chimney */}
            <rect x="26" y="2" width="11" height="26" fill="#475569" />
            {/* Gentle Smoke from Chimney */}
            {isHealthy ? (
              <g transform="translate(31, -8)">
                <circle cx="0" cy="0" r="3.5" fill="#e2e8f0" opacity="0.8" />
                <circle cx="-3" cy="-7" r="5" fill="#e2e8f0" opacity="0.6" />
                <circle cx="2" cy="-15" r="7" fill="#cbd5e1" opacity="0.3" />
              </g>
            ) : null}
            {/* Half-Timbered Plaster Lower Body */}
            <rect x="0" y="28" width="46" height="42" fill="#fef3c7" />
            {/* Timber Frame Beams */}
            <rect x="0" y="28" width="4" height="42" fill="#78350f" />
            <rect x="42" y="28" width="4" height="42" fill="#78350f" />
            <line x1="0" y1="48" x2="46" y2="48" stroke="#78350f" strokeWidth="2" />
            <line x1="2" y1="28" x2="23" y2="48" stroke="#78350f" strokeWidth="1.8" />
            <line x1="44" y1="28" x2="23" y2="48" stroke="#78350f" strokeWidth="1.8" />
            {/* All-Orange Forge Roof */}
            <polygon points="-4,28 23,2 50,28" fill="#feaa01" />
            <polygon points="23,2 50,28 23,28" fill="#ea580c" opacity="0.35" />
            {/* Open Hearth Glow */}
            <rect x="14" y="48" width="18" height="22" rx="2" fill="#5c2406" />
            <circle cx="23" cy="59" r="5" fill="#f97316" />
            <circle cx="23" cy="59" r="3" fill="#fde047" />
          </g>

          {/* 6. FRONT PALISADE WALL & LOWER FRONT GATE (Grounded at y = 248 to 280) */}
          
          {/* Front Left Fence */}
          <use href="#palisade-log" x="20" y="248" />
          <use href="#palisade-log" x="30" y="248" />
          <use href="#palisade-log" x="40" y="248" />
          <use href="#palisade-log" x="50" y="248" />
          <use href="#palisade-log" x="60" y="248" />
          <use href="#palisade-log" x="70" y="248" />

          {/* Front Right Fence */}
          <use href="#palisade-log" x="160" y="248" />
          <use href="#palisade-log" x="170" y="248" />
          <use href="#palisade-log" x="180" y="248" />
          <use href="#palisade-log" x="190" y="248" />
          <use href="#palisade-log" x="200" y="248" />
          <use href="#palisade-log" x="210" y="248" />
          <use href="#palisade-log" x="220" y="248" />

          {/* Horizontal Fence Cross Support */}
          <rect x="18" y="260" width="65" height="4" fill="#451a03" />
          <rect x="158" y="260" width="65" height="4" fill="#451a03" />

          {/* --- MEDIEVAL GREY BRICK TEXTURED GATE (y = 230 to 280) --- */}
          <g transform="translate(85, 230)">
            {/* Left Brick Gate Post */}
            <rect x="0" y="0" width="22" height="52" fill="#475569" />
            {/* Left Brick Seams */}
            <line x1="0" y1="10" x2="22" y2="10" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="20" x2="22" y2="20" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="30" x2="22" y2="30" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="40" x2="22" y2="40" stroke="#334155" strokeWidth="1" />
            <line x1="11" y1="0" x2="11" y2="10" stroke="#334155" strokeWidth="1" />
            <line x1="11" y1="20" x2="11" y2="30" stroke="#334155" strokeWidth="1" />
            <line x1="11" y1="40" x2="11" y2="50" stroke="#334155" strokeWidth="1" />

            {/* Right Brick Gate Post */}
            <rect x="52" y="0" width="22" height="52" fill="#475569" />
            {/* Right Brick Seams */}
            <line x1="52" y1="10" x2="74" y2="10" stroke="#334155" strokeWidth="1" />
            <line x1="52" y1="20" x2="74" y2="20" stroke="#334155" strokeWidth="1" />
            <line x1="52" y1="30" x2="74" y2="30" stroke="#334155" strokeWidth="1" />
            <line x1="52" y1="40" x2="74" y2="40" stroke="#334155" strokeWidth="1" />
            <line x1="63" y1="0" x2="63" y2="10" stroke="#334155" strokeWidth="1" />
            <line x1="63" y1="20" x2="63" y2="30" stroke="#334155" strokeWidth="1" />
            <line x1="63" y1="40" x2="63" y2="50" stroke="#334155" strokeWidth="1" />

            {/* Arched Stone Header Beam */}
            <path d="M 0 8 Q 37 -8 74 8 L 74 0 Q 37 -14 0 0 Z" fill="#64748b" />

            {/* Timber Portcullis Gate In Center */}
            <rect x="22" y="6" width="30" height="46" fill="#1e293b" />
            <line x1="28" y1="6" x2="28" y2="52" stroke="#78350f" strokeWidth="2" />
            <line x1="37" y1="6" x2="37" y2="52" stroke="#78350f" strokeWidth="2" />
            <line x1="46" y1="6" x2="46" y2="52" stroke="#78350f" strokeWidth="2" />
            <line x1="22" y1="16" x2="52" y2="16" stroke="#78350f" strokeWidth="2" />
            <line x1="22" y1="28" x2="52" y2="28" stroke="#78350f" strokeWidth="2" />
            <line x1="22" y1="40" x2="52" y2="40" stroke="#78350f" strokeWidth="2" />

            {/* Climbing Green Vine Leaves on Brick Posts & Arch */}
            <use href="#vine-cluster" x="-1" y="10" />
            <use href="#vine-cluster" x="2" y="30" transform="scale(0.8)" />
            <use href="#vine-cluster" x="8" y="2" transform="scale(0.85)" />
            <use href="#vine-cluster" x="50" y="2" transform="scale(0.85)" />
            <use href="#vine-cluster" x="53" y="12" />
            <use href="#vine-cluster" x="55" y="32" transform="scale(0.85)" />
          </g>

          {/* CORNER WATCHTOWER 3: Bottom-Left (Foreground) */}
          <use href="#medieval-watchtower" x="-6" y="225" />

          {/* CORNER WATCHTOWER 4: Bottom-Right (Foreground) */}
          <use href="#medieval-watchtower" x="226" y="225" />

        </g>
      </svg>
    </div>
  );
}
