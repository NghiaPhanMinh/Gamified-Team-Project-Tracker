type LandscapeVillageProps = {
  villageHpPercent: number; // 0 to 100
};

export function LandscapeVillage({ villageHpPercent }: LandscapeVillageProps) {
  // Village HP status color
  const hpColor =
    villageHpPercent > 70
      ? "#22c55e"
      : villageHpPercent > 40
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="landscape-layer layer-5-village" aria-label="Grounded fortified village">
      {/* Grounded Palisade Fence & Spread-Out Village SVG Structure */}
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <g transform="translate(20, 150)">
          {/* Palisade & Split-Rail Outer Fence Box */}
          <g className="village-fence-box">
            {/* Back Fence Line */}
            <path
              d="M 5 80 L 235 80"
              stroke="#5c3a21"
              strokeWidth="4"
              strokeDasharray="6 4"
            />
            {/* Left Palisade Wall */}
            <path
              d="M 10 140 L 10 70 M 20 140 L 20 65 M 30 140 L 30 70 M 40 140 L 40 65 M 50 140 L 50 70"
              stroke="#3d2314"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Right Palisade Wall */}
            <path
              d="M 190 140 L 190 65 M 200 140 L 200 70 M 210 140 L 210 65 M 220 140 L 220 70 M 230 140 L 230 65"
              stroke="#3d2314"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>

          {/* Spread-Out Village Buildings (Grounded on grass baseline) */}
          <g className="village-buildings">
            {/* Watchtower (Left) */}
            <g transform="translate(25, 30)">
              <rect x="0" y="20" width="34" height="85" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />
              <polygon points="-4,20 17,0 38,20" fill="#dc2626" stroke="#0f172a" strokeWidth="2" />
              <rect x="10" y="35" width="14" height="18" rx="2" fill="#fef08a" />
              <line x1="17" y1="0" x2="17" y2="-12" stroke="#0f172a" strokeWidth="2" />
              <polygon points="17,-12 32,-8 17,-4" fill="#dc2626" />
            </g>

            {/* Cottage 1 (Center-Left) */}
            <g transform="translate(68, 65)">
              <rect x="0" y="15" width="42" height="55" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
              <polygon points="-6,15 21,0 48,15" fill="#ea580c" stroke="#0f172a" strokeWidth="2" />
              <rect x="14" y="35" width="14" height="35" fill="#475569" />
              <rect x="8" y="24" width="10" height="10" rx="1" fill="#fef08a" />
            </g>

            {/* Town Hall (Center) */}
            <g transform="translate(115, 45)">
              <rect x="0" y="25" width="58" height="65" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
              <polygon points="-8,25 29,0 66,25" fill="#c2410c" stroke="#0f172a" strokeWidth="2" />
              <rect x="20" y="42" width="18" height="48" rx="9" fill="#1e293b" />
              <circle cx="29" cy="18" r="7" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
            </g>

            {/* Stone Forge (Right) */}
            <g transform="translate(180, 75)">
              <rect x="0" y="12" width="38" height="48" fill="#475569" stroke="#0f172a" strokeWidth="2.5" />
              <polygon points="-5,12 19,-2 43,12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
              <rect x="12" y="30" width="14" height="30" fill="#0f172a" />
            </g>
          </g>

          {/* Front Palisade Wall Gate */}
          <g className="village-front-gate" transform="translate(0, 115)">
            <path
              d="M 5 20 L 235 20"
              stroke="#5c3a21"
              strokeWidth="5"
            />
            <path
              d="M 15 20 L 15 0 M 35 20 L 35 -5 M 55 20 L 55 0 M 185 20 L 185 0 M 205 20 L 205 -5 M 225 20 L 225 0"
              stroke="#3d2314"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>

      {/* Anchored Village HP Badge Overlay (Under/Over village structure on bottom-left) */}
      <div
        className="village-hp-anchored-badge"
        style={{
          position: "absolute",
          left: "20px",
          bottom: "15px",
          zIndex: 25,
          background: "rgba(15, 23, 42, 0.9)",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "10px",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          🏰 Village HP
        </span>
        <span style={{ fontSize: "14px", fontWeight: 900, color: hpColor }}>
          {villageHpPercent}%
        </span>
        <div style={{ width: "60px", height: "8px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ width: `${villageHpPercent}%`, height: "100%", background: hpColor, transition: "width 0.3s ease" }} />
        </div>
      </div>
    </div>
  );
}
