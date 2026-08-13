export function LandscapeTerrain() {
  return (
    <>
      {/* Layer 3: Smooth Organic Distant Mountain Ridges */}
      <div className="landscape-layer layer-3-hills" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          <polygon
            points="0,120 110,85 220,110 360,70 510,105 640,65 790,95 910,75 1000,88 1000,400 0,400"
            fill="var(--scene-hills)"
            opacity="0.75"
          />
          <polygon
            points="0,130 160,105 310,122 450,92 600,115 760,88 920,112 1000,102 1000,400 0,400"
            fill="var(--scene-hills)"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Layer 4: Seamless Grassland (No Hard Separator Line & No Grid Lines) */}
      <div className="landscape-layer layer-4-ground" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          <defs>
            {/* Soft Gradient Blend between Horizon and Grassland */}
            <linearGradient id="seamless-grass-blend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#41693d" stopOpacity="0.8" />
              <stop offset="20%" stopColor="var(--scene-land)" stopOpacity="1" />
              <stop offset="100%" stopColor="#254228" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Seamless Top-Down Grassland Base (y = 100 to 400) */}
          <rect x="0" y="100" width="1000" height="300" fill="url(#seamless-grass-blend)" />

          {/* Organic Rolling Grass Mounds */}
          <path
            d="M 0 140 Q 250 110 500 135 Q 750 115 1000 130 L 1000 400 L 0 400 Z"
            fill="#3a5f36"
            opacity="0.5"
          />
          <path
            d="M 0 190 Q 300 165 600 185 Q 850 170 1000 180 L 1000 400 L 0 400 Z"
            fill="#32542e"
            opacity="0.4"
          />
          <path
            d="M 0 260 Q 200 235 450 255 Q 700 240 1000 250 L 1000 400 L 0 400 Z"
            fill="#284425"
            opacity="0.3"
          />
        </svg>
      </div>
    </>
  );
}
