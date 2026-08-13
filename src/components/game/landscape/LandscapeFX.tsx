import { useEffect, useState } from "react";

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
  // Section 2: Cosmetic Combat Exchange (~5s exchange every 15s)
  const [isExchanging, setIsExchanging] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExchanging(true);
      const timer = setTimeout(() => {
        setIsExchanging(false);
      }, 5000); // 5s active exchange
      return () => clearTimeout(timer);
    }, 15000); // 15s total cycle (5s exchange + 10s cooldown)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landscape-layer layer-9-fx" aria-hidden="true">
      {/* --- Section 2: Ambient Background Cosmetic Exchange (50% opacity, 5s loop) --- */}
      {isExchanging ? (
        <div className="ambient-combat-exchange" style={{ opacity: 0.5, position: "absolute", inset: 0, pointerEvents: "none" }}>
          <svg viewBox="0 0 1000 400" width="100%" height="100%">
            {/* Village Arrow Projectile Flying Left-to-Right */}
            <g className="ambient-arrow">
              <line x1="200" y1="220" x2="230" y2="218" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="230,218 224,214 224,222" fill="#ef4444" />
              <line x1="195" y1="230" x2="225" y2="228" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <polygon points="225,228 219,224 219,232" fill="#ef4444" />
            </g>

            {/* Dragon Fire Stream Burst Flying Right-to-Left */}
            <g className="ambient-fire-spit">
              <ellipse cx="650" cy="180" rx="35" ry="18" fill="url(#ambient-fire-grad)" />
              <ellipse cx="580" cy="195" rx="45" ry="22" fill="url(#ambient-fire-grad)" />
              <ellipse cx="500" cy="210" rx="55" ry="26" fill="url(#ambient-fire-grad)" />
            </g>

            {/* Mid-Screen Clash / Collision Moment */}
            <g className="ambient-clash-sparks" transform="translate(480, 215)">
              <circle cx="0" cy="0" r="14" fill="#fbbf24" opacity="0.7" />
              <polygon points="0,-12 4,-4 12,0 4,4 0,12 -4,4 -12,0 -4,-4" fill="#ef4444" />
              <polygon points="-8,-8 -2,-2 -2,-8" fill="#fff" />
              <polygon points="8,8 2,2 2,8" fill="#fff" />
            </g>

            <defs>
              <radialGradient id="ambient-fire-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      ) : null}

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
