export function LandscapeTerrain() {
  return (
    <>
      {/* Layer 3: Top 1/4 Sky Horizon & Distant Mountain Ridges */}
      <div className="landscape-layer layer-3-hills" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          <polygon
            points="0,115 90,85 190,105 320,70 450,100 580,65 710,95 840,75 950,90 1000,80 1000,400 0,400"
            fill="var(--scene-hills)"
            opacity="0.8"
          />
          <polygon
            points="0,120 140,105 280,118 410,90 560,110 720,85 890,108 1000,100 1000,400 0,400"
            fill="var(--scene-hills)"
          />
        </svg>
      </div>

      {/* Layer 4: Pure Flat Solid Green Grassland (Bottom 3/4, y = 100 to 400) */}
      <div className="landscape-layer layer-4-ground" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          {/* Pure Solid Flat Green Field - Zero grid lines, zero separator strokes */}
          <rect x="0" y="100" width="1000" height="300" fill="#355e3b" />
        </svg>
      </div>
    </>
  );
}
