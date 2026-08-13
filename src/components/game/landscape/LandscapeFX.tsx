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
    <div className="landscape-layer layer-9-fx" aria-hidden="true">
      {/* --- Section 2: Native SVG SMIL Background Combat Exchange (55% opacity) --- */}
      <div className="ambient-combat-exchange" style={{ opacity: 0.55, position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          <defs>
            <radialGradient id="ambient-fire-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Flying Arrow Group (Village -> Dragon, Left to Right: x=200 to x=500, y=240) */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="200 240"
              to="500 230"
              dur="3s"
              repeatCount="indefinite"
            />
            <line x1="0" y1="0" x2="32" y2="-2" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="32,-2 25,-6 25,2" fill="#ef4444" />
            <line x1="-15" y1="14" x2="16" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <polygon points="16,12 10,8 10,16" fill="#ef4444" />
          </g>

          {/* Dragon Fire Spit Burst (Dragon -> Village, Right to Left: x=740 to x=460, y=190 to y=220) */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="740 190"
              to="460 220"
              dur="3s"
              repeatCount="indefinite"
            />
            <ellipse cx="0" cy="0" rx="36" ry="18" fill="url(#ambient-fire-grad)" />
            <ellipse cx="40" cy="-8" rx="26" ry="14" fill="url(#ambient-fire-grad)" />
            <ellipse cx="75" cy="-14" rx="16" ry="9" fill="url(#ambient-fire-grad)" />
          </g>

          {/* Mid-Screen Clash / Collision Spark Explosion at Center (x=490, y=225) */}
          <g transform="translate(490, 225)">
            <animate
              attributeName="opacity"
              values="0; 0; 1; 0; 0"
              keyTimes="0; 0.45; 0.5; 0.65; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            <circle cx="0" cy="0" r="18" fill="#fbbf24" opacity="0.85" />
            <polygon points="0,-16 6,-6 16,0 6,6 0,16 -6,6 -16,0 -6,-6" fill="#ef4444" />
            <polygon points="-12,-12 -3,-3 -3,-12" fill="#fff" />
            <polygon points="12,12 3,3 3,12" fill="#fff" />
          </g>
        </svg>
      </div>

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
