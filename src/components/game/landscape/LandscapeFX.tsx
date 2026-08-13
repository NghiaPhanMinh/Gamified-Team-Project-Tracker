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
      {/* --- Section 2: Continuous CSS Keyframe Background Combat Exchange (50% opacity) --- */}
      <div className="ambient-combat-exchange" style={{ opacity: 0.5, position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          {/* Flying Arrow Group (Village -> Dragon, Left to Right) */}
          <g className="fx-flying-arrows">
            <line x1="0" y1="0" x2="30" y2="-2" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="30,-2 24,-6 24,2" fill="#ef4444" />
            <line x1="-15" y1="12" x2="15" y2="10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <polygon points="15,10 9,6 9,14" fill="#ef4444" />
          </g>

          {/* Dragon Fire Spit Burst (Dragon -> Village, Right to Left) */}
          <g className="fx-fire-burst">
            <ellipse cx="0" cy="0" rx="38" ry="20" fill="url(#ambient-fire-grad)" />
            <ellipse cx="-45" cy="12" rx="28" ry="15" fill="url(#ambient-fire-grad)" />
            <ellipse cx="-85" cy="22" rx="18" ry="10" fill="url(#ambient-fire-grad)" />
          </g>

          {/* Mid-Screen Clash / Collision Spark Explosion at Center (x=500, y=215) */}
          <g className="fx-clash-sparks" transform="translate(500, 215)">
            <circle cx="0" cy="0" r="16" fill="#fbbf24" opacity="0.8" />
            <polygon points="0,-14 5,-5 14,0 5,5 0,14 -5,5 -14,0 -5,-5" fill="#ef4444" />
            <polygon points="-10,-10 -3,-3 -3,-10" fill="#fff" />
            <polygon points="10,10 3,3 3,10" fill="#fff" />
          </g>

          <defs>
            <radialGradient id="ambient-fire-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
          </defs>
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
