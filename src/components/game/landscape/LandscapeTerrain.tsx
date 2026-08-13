export function LandscapeTerrain() {
  return (
    <>
      {/* Layer 3: Top 25% Sky & Distant Mountain Silhouette */}
      <div className="landscape-layer layer-3-hills" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          <polygon
            points="0,110 120,80 230,105 370,68 520,102 650,62 800,92 920,72 1000,85 1000,400 0,400"
            fill="var(--scene-hills)"
            opacity="0.8"
          />
          <polygon
            points="0,120 160,100 310,118 460,88 610,112 770,82 930,108 1000,98 1000,400 0,400"
            fill="var(--scene-hills)"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* Layer 4: Pure Flat Clean Grassland (Bottom 75%, Muted Natural Field Tone) */}
      <div className="landscape-layer layer-4-ground" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          {/* Flat Solid Muted Green Grassland (y = 100 to 400) */}
          <rect x="0" y="100" width="1000" height="300" fill="#3f523d" />
        </svg>
      </div>
    </>
  );
}
