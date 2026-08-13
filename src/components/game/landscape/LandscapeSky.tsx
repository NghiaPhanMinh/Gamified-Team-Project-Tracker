export function LandscapeSky() {
  return (
    <>
      {/* Layer 0: Energetic Fantasy Sky Gradient */}
      <div className="landscape-layer layer-0-sky" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          <defs>
            <linearGradient id="energetic-sky-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1b355a" />
              <stop offset="60%" stopColor="#2e5482" />
              <stop offset="100%" stopColor="#4375aa" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="1000" height="120" fill="url(#energetic-sky-grad)" />
        </svg>
      </div>

      {/* Layer 1: Distant Parallax Clouds */}
      <div className="landscape-layer layer-1-clouds-far" aria-hidden="true">
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          <g opacity="0.45" fill="#e2e8f0">
            <ellipse cx="140" cy="42" rx="48" ry="18" />
            <ellipse cx="170" cy="38" rx="32" ry="15" />
            <ellipse cx="520" cy="35" rx="65" ry="22" />
            <ellipse cx="860" cy="46" rx="55" ry="19" />
          </g>
        </svg>
      </div>

      {/* Layer 2: Near Parallax Clouds */}
      <div className="landscape-layer layer-2-clouds-near" aria-hidden="true">
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          <g opacity="0.75" fill="#f8fafc">
            <ellipse cx="320" cy="32" rx="70" ry="24" />
            <ellipse cx="360" cy="28" rx="45" ry="20" />
            <ellipse cx="720" cy="36" rx="60" ry="22" />
          </g>
        </svg>
      </div>
    </>
  );
}
