export function SVGDefs() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
      <defs>
        {/* Reusable Cloud Cluster 1 */}
        <g id="cloud-cluster-1">
          <ellipse cx="40" cy="35" rx="30" ry="22" fill="var(--scene-cloud)" />
          <ellipse cx="75" cy="28" rx="36" ry="26" fill="var(--scene-cloud)" />
          <ellipse cx="110" cy="36" rx="28" ry="20" fill="var(--scene-cloud)" />
          <rect x="25" y="32" width="100" height="22" rx="10" fill="var(--scene-cloud)" />
        </g>

        {/* Reusable Cloud Cluster 2 */}
        <g id="cloud-cluster-2">
          <ellipse cx="30" cy="25" rx="22" ry="16" fill="var(--scene-cloud-near)" />
          <ellipse cx="58" cy="20" rx="28" ry="20" fill="var(--scene-cloud-near)" />
          <ellipse cx="86" cy="26" rx="20" ry="15" fill="var(--scene-cloud-near)" />
          <rect x="18" y="24" width="80" height="16" rx="8" fill="var(--scene-cloud-near)" />
        </g>

        {/* Flat Geometric House 1 (Main Gable) */}
        <g id="house-1">
          {/* Main wall */}
          <rect x="10" y="40" width="60" height="50" fill="var(--scene-house-wall)" stroke="var(--scene-boss-slate)" strokeWidth="3" />
          {/* Triangular Roof */}
          <polygon points="5,42 40,10 75,42" fill="var(--scene-house-roof)" stroke="var(--scene-boss-slate)" strokeWidth="3" strokeLinejoin="round" />
          {/* Door */}
          <rect x="32" y="65" width="16" height="25" rx="2" fill="var(--scene-boss-slate)" />
          {/* Window */}
          <rect className="window-light" x="18" y="52" width="12" height="12" rx="1" fill="#f4d06f" stroke="var(--scene-boss-slate)" strokeWidth="2" />
        </g>

        {/* Flat Geometric House 2 (Tall Barn) */}
        <g id="house-2">
          <rect x="10" y="30" width="45" height="60" fill="var(--scene-house-wall)" stroke="var(--scene-boss-slate)" strokeWidth="3" />
          <polygon points="5,32 32.5,5 60,32" fill="var(--scene-house-roof)" stroke="var(--scene-boss-slate)" strokeWidth="3" strokeLinejoin="round" />
          <rect x="22" y="68" width="14" height="22" fill="var(--scene-boss-slate)" />
          <rect className="window-light" x="20" y="42" width="18" height="12" rx="1" fill="#f4d06f" stroke="var(--scene-boss-slate)" strokeWidth="2" />
        </g>

        {/* Flat Geometric House 3 (Small Cottage) */}
        <g id="house-3">
          <rect x="8" y="45" width="50" height="40" fill="var(--scene-house-wall)" stroke="var(--scene-boss-slate)" strokeWidth="3" />
          <polygon points="4,47 33,20 62,47" fill="var(--scene-house-roof)" stroke="var(--scene-boss-slate)" strokeWidth="3" strokeLinejoin="round" />
          <rect x="26" y="62" width="12" height="23" fill="var(--scene-boss-slate)" />
        </g>

        {/* Flat Geometric Goblin Shape */}
        <g id="goblin-shape">
          {/* Body polygon */}
          <polygon points="12,35 6,18 24,18 L18,35" fill="#588157" stroke="var(--scene-boss-slate)" strokeWidth="2" />
          {/* Head circle */}
          <circle cx="15" cy="12" r="7" fill="#3a5a40" stroke="var(--scene-boss-slate)" strokeWidth="2" />
          {/* Pointy Ear left */}
          <polygon points="9,10 2,6 9,14" fill="#3a5a40" />
          {/* Pointy Ear right */}
          <polygon points="21,10 28,6 21,14" fill="#3a5a40" />
          {/* Eyes (ember orange dots) */}
          <circle cx="13" cy="11" r="1" fill="var(--scene-ember-gold)" />
          <circle cx="17" cy="11" r="1" fill="var(--scene-ember-gold)" />
          {/* Spear / Weapon line */}
          <line x1="22" y1="36" x2="26" y2="4" stroke="var(--scene-boss-slate)" strokeWidth="2" strokeLinecap="round" />
          <polygon points="26,4 23,-2 29,4" fill="var(--scene-ember-danger)" />
        </g>
      </defs>
    </svg>
  );
}
