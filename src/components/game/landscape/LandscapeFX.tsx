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
      <div className="ambient-combat-exchange" style={{ opacity: 0.65, position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          <defs>
            <radialGradient id="ambient-fire-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* --- Village Arrow Volley (Village x=200 -> Center x=500, y=235) --- */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="200 240; 350 232; 500 225; 500 225"
              keyTimes="0; 0.25; 0.5; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0; 1; 1; 0"
              keyTimes="0; 0.05; 0.5; 0.52"
              dur="3s"
              repeatCount="indefinite"
            />
            {/* Arrow Volley Spanning Out */}
            <line x1="0" y1="0" x2="36" y2="-2" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <polygon points="36,-2 28,-7 28,3" fill="#ef4444" />

            <line x1="-20" y1="-16" x2="16" y2="-18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="16,-18 9,-22 9,-14" fill="#ef4444" />

            <line x1="-15" y1="16" x2="18" y2="14" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="18,14 11,10 11,18" fill="#ef4444" />
          </g>

          {/* --- Dragon Fire Breath Stream (Dragon x=750 -> Center x=500, y=200 -> y=225) --- */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="750 195; 625 210; 500 225; 500 225"
              keyTimes="0; 0.25; 0.5; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0; 1; 1; 0"
              keyTimes="0; 0.05; 0.5; 0.52"
              dur="3s"
              repeatCount="indefinite"
            />
            {/* Fire Stream Spatles */}
            <ellipse cx="0" cy="0" rx="42" ry="20" fill="url(#ambient-fire-grad)" />
            <ellipse cx="45" cy="-8" rx="30" ry="15" fill="url(#ambient-fire-grad)" />
            <ellipse cx="82" cy="-15" rx="20" ry="10" fill="url(#ambient-fire-grad)" />
          </g>

          {/* --- SYNCHRONIZED CLASH EXPLOSION AT EXACT CENTER (x=500, y=225) at t = 0.5 (1.5s mark) --- */}
          <g transform="translate(500, 225)">
            <animate
              attributeName="opacity"
              values="0; 0; 1; 0.8; 0"
              keyTimes="0; 0.48; 0.52; 0.65; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              values="0.2; 0.2; 1.5; 0.8; 0.2"
              keyTimes="0; 0.48; 0.52; 0.65; 1"
              dur="3s"
              repeatCount="indefinite"
              additive="sum"
            />
            <circle cx="0" cy="0" r="22" fill="#fef08a" opacity="0.9" />
            <circle cx="0" cy="0" r="14" fill="#f97316" opacity="0.9" />
            <polygon points="0,-24 8,-8 24,0 8,8 0,24 -8,8 -24,0 -8,-8" fill="#fbbf24" />
            <polygon points="-16,-16 -4,-4 -4,-16" fill="#fff" />
            <polygon points="16,16 4,4 4,16" fill="#fff" />
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
