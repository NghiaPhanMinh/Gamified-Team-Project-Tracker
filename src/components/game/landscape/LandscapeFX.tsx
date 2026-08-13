type ActiveCombatEvent = {
  id: string;
  attackerName: string;
  damage: number;
  spellType?: string;
};

type LandscapeFXProps = {
  activeEvent: ActiveCombatEvent | null;
  isVictory: boolean;
};

export function LandscapeFX({ activeEvent, isVictory }: LandscapeFXProps) {
  return (
    <div className="landscape-layer layer-9-fx" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* --- Section 2: Continuous Native SVG Background Combat Exchange (55% opacity) --- */}
      <svg viewBox="0 0 1000 400" width="100%" height="100%" style={{ opacity: 0.55 }}>
        {/* Flying Arrow Group (Village -> Dragon, Left to Right) */}
        <g>
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="200 245"
              to="500 220"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <line x1="0" y1="0" x2="32" y2="-3" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="32,-3 25,-7 25,1" fill="#ef4444" />
            <line x1="-18" y1="12" x2="14" y2="9" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <polygon points="14,9 8,5 8,13" fill="#ef4444" />
          </g>
        </g>

        {/* Dragon Fire Spit Burst (Dragon -> Village, Right to Left) */}
        <g>
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="740 180"
              to="460 220"
              dur="3.2s"
              repeatCount="indefinite"
            />
            <ellipse cx="0" cy="0" rx="38" ry="20" fill="url(#ambient-fire-grad)" />
            <ellipse cx="40" cy="-10" rx="28" ry="15" fill="url(#ambient-fire-grad)" />
            <ellipse cx="75" cy="-18" rx="18" ry="10" fill="url(#ambient-fire-grad)" />
          </g>
        </g>

        {/* Mid-Screen Clash / Collision Spark Explosion at Center (x=490, y=220) */}
        <g transform="translate(490, 220)">
          <animate
            attributeName="opacity"
            values="0; 0; 1; 0.2; 0"
            keyTimes="0; 0.44; 0.5; 0.58; 1"
            dur="3.2s"
            repeatCount="indefinite"
          />
          <circle cx="0" cy="0" r="18" fill="#fbbf24" opacity="0.85" />
          <polygon points="0,-16 6,-6 16,0 6,6 0,16 -6,6 -16,0 -6,-6" fill="#ef4444" />
          <polygon points="-12,-12 -4,-4 -4,-12" fill="#fff" />
          <polygon points="12,12 4,4 4,12" fill="#fff" />
        </g>

        <defs>
          <radialGradient id="ambient-fire-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Floating Damage Text */}
      {activeEvent ? (
        <div key={activeEvent.id} className="floating-damage">
          -{activeEvent.damage} HP
        </div>
      ) : null}

      {/* Victory Particle Burst on Final Blow */}
      {isVictory ? (
        <svg viewBox="0 0 1000 400" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(800, 80)">
            <circle cx="0" cy="0" r="8" fill="var(--scene-ember-gold)" opacity="0.8" />
            <polygon points="0,-15 5,-5 15,0 5,5 0,15 -5,5 -15,0 -5,-5" fill="var(--scene-ember-gold)" />
            <polygon points="-30,-30 -20,-25 -25,-15" fill="var(--scene-ember-danger)" />
            <polygon points="30,-40 25,-25 40,-30" fill="var(--scene-cloud)" />
          </g>
        </svg>
      ) : null}
    </div>
  );
}
