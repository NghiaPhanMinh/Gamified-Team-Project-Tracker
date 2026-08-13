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
      <div className="ambient-combat-exchange" style={{ opacity: 0.7, position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          <defs>
            <radialGradient id="ambient-fire-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* --- Village Arrow Volley (Fast flight to center x=500, then INSTANT FADE) --- */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="200 240; 350 232; 495 225; 495 225"
              keyTimes="0; 0.25; 0.42; 1"
              dur="2.8s"
              repeatCount="indefinite"
            />
            {/* Quick Dissipate Fade: Opacity drops to 0 immediately at t = 0.42 (1.1s) */}
            <animate
              attributeName="opacity"
              values="0; 1; 1; 0; 0"
              keyTimes="0; 0.05; 0.40; 0.43; 1"
              dur="2.8s"
              repeatCount="indefinite"
            />
            {/* Arrow Volley */}
            <line x1="0" y1="0" x2="36" y2="-2" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <polygon points="36,-2 28,-7 28,3" fill="#ef4444" />
            <line x1="-20" y1="-16" x2="16" y2="-18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="16,-18 9,-22 9,-14" fill="#ef4444" />
            <line x1="-15" y1="16" x2="18" y2="14" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="18,14 11,10 11,18" fill="#ef4444" />
          </g>

          {/* --- Dragon Fire Breath Stream (Fast flight to center x=500, then INSTANT FADE) --- */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="750 195; 625 210; 505 225; 505 225"
              keyTimes="0; 0.25; 0.42; 1"
              dur="2.8s"
              repeatCount="indefinite"
            />
            {/* Quick Dissipate Fade: Opacity drops to 0 immediately at t = 0.42 (1.1s) */}
            <animate
              attributeName="opacity"
              values="0; 1; 1; 0; 0"
              keyTimes="0; 0.05; 0.40; 0.43; 1"
              dur="2.8s"
              repeatCount="indefinite"
            />
            {/* Fire Stream */}
            <ellipse cx="0" cy="0" rx="42" ry="20" fill="url(#ambient-fire-grad)" />
            <ellipse cx="45" cy="-8" rx="30" ry="15" fill="url(#ambient-fire-grad)" />
            <ellipse cx="82" cy="-15" rx="20" ry="10" fill="url(#ambient-fire-grad)" />
          </g>

          {/* --- FAST MID-FIELD CLASH EXPLOSION AT CENTER (x=500, y=225) (Fades out quickly) --- */}
          <g transform="translate(500, 225)">
            <animate
              attributeName="opacity"
              values="0; 0; 1; 0.8; 0; 0"
              keyTimes="0; 0.40; 0.43; 0.52; 0.58; 1"
              dur="2.8s"
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              values="0.2; 0.2; 1.4; 0.6; 0"
              keyTimes="0; 0.40; 0.43; 0.52; 0.58; 1"
              dur="2.8s"
              repeatCount="indefinite"
              additive="sum"
            />
            <circle cx="0" cy="0" r="22" fill="#fef08a" opacity="0.95" />
            <circle cx="0" cy="0" r="14" fill="#f97316" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
            <polygon points="0,-24 8,-8 24,0 8,8 0,24 -8,8 -24,0 -8,-8" fill="#fbbf24" />
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
