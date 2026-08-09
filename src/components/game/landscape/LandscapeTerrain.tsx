export function LandscapeTerrain() {
  return (
    <>
      {/* Layer 3: Horizon / Distant Hills Silhouette */}
      <div className="landscape-layer layer-3-hills" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          {/* Low-poly background mountain ridges */}
          <polygon
            points="0,300 90,260 190,290 320,240 450,285 580,230 710,275 840,245 950,270 1000,250 1000,400 0,400"
            fill="var(--scene-hills)"
            opacity="0.85"
          />
          {/* Mid-distance hill contour */}
          <polygon
            points="0,310 140,285 280,305 410,270 560,300 720,265 890,295 1000,280 1000,400 0,400"
            fill="var(--scene-hills)"
          />
        </svg>
      </div>

      {/* Layer 4: Ground Plane (Moss green land band along bottom 30%) */}
      <div className="landscape-layer layer-4-ground" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          {/* Flat ground plane line & band */}
          <rect x="0" y="295" width="1000" height="105" fill="var(--scene-land)" />
          {/* Subtle ground trim line separating hills and land */}
          <line x1="0" y1="295" x2="1000" y2="295" stroke="var(--scene-boss-slate)" strokeWidth="3" opacity="0.4" />
        </svg>
      </div>
    </>
  );
}
