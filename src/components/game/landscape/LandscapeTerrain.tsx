export function LandscapeTerrain() {
  return (
    <>
      {/* Layer 3: Top 1/4 Sky Horizon & Slate Blue Mountain Ridges */}
      <div className="landscape-layer layer-3-hills" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          <polygon
            points="0,115 90,82 190,105 320,68 450,100 580,62 710,95 840,72 950,90 1000,78 1000,400 0,400"
            fill="#334155"
            opacity="0.85"
          />
          <polygon
            points="0,120 140,102 280,118 410,88 560,110 720,82 890,108 1000,98 1000,400 0,400"
            fill="#1e293b"
          />
        </svg>
      </div>

      {/* Layer 4: Pure 12 PM Bright Morning Grassland (Bottom 3/4, y = 100 to 400) */}
      <div className="landscape-layer layer-4-ground" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          {/* Lush 12 PM Green Meadow - Zero grid lines, zero separator strokes */}
          <rect x="0" y="100" width="1000" height="300" fill="#15803d" />
        </svg>
      </div>
    </>
  );
}
