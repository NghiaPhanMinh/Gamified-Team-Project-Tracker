export function LandscapeTerrain() {
  return (
    <>
      {/* Layer 3: Top 1/4 Sky Horizon & Distant Mountain Ridges */}
      <div className="landscape-layer layer-3-hills" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          {/* Distant mountain ridges at y = 100 (top 25% boundary) */}
          <polygon
            points="0,115 90,85 190,105 320,70 450,100 580,65 710,95 840,75 950,90 1000,80 1000,400 0,400"
            fill="var(--scene-hills)"
            opacity="0.85"
          />
          <polygon
            points="0,120 140,105 280,118 410,90 560,110 720,85 890,108 1000,100 1000,400 0,400"
            fill="var(--scene-hills)"
          />
        </svg>
      </div>

      {/* Layer 4: Section 4 — Top-Down (Bird's-Eye) Grassland Occupying Bottom 3/4 (y = 100 to 400) */}
      <div className="landscape-layer layer-4-ground" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          {/* Top-down 3/4 grassland field rectangle */}
          <rect x="0" y="100" width="1000" height="300" fill="var(--scene-land)" />

          {/* Top-down perspective grass texture grid lines & depth contours */}
          <path d="M 0 160 L 1000 160 M 0 220 L 1000 220 M 0 280 L 1000 280 M 0 340 L 1000 340" stroke="#3a5a40" strokeWidth="1" opacity="0.3" />
          <path d="M 150 100 L 50 400 M 350 100 L 250 400 M 550 100 L 500 400 M 750 100 L 750 400 M 900 100 L 950 400" stroke="#3a5a40" strokeWidth="1" opacity="0.2" />

          {/* Border horizon trim line at y = 100 */}
          <line x1="0" y1="100" x2="1000" y2="100" stroke="var(--scene-boss-slate)" strokeWidth="3" opacity="0.5" />
        </svg>
      </div>
    </>
  );
}
