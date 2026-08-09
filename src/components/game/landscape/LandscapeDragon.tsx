import { useEffect, useRef, useState } from "react";

type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
};

export function LandscapeDragon({ bossHpPercent, isDefeated }: LandscapeDragonProps) {
  const [hasPlayedFinalBlow, setHasPlayedFinalBlow] = useState(false);
  const prevDefeatedRef = useRef(isDefeated);

  useEffect(() => {
    // Fire final blow animation once when transition to defeated occurs
    if (isDefeated && !prevDefeatedRef.current && !hasPlayedFinalBlow) {
      setHasPlayedFinalBlow(true);
    }
    prevDefeatedRef.current = isDefeated;
  }, [isDefeated, hasPlayedFinalBlow]);

  // Calculate dragon horizontal position:
  // At 100% HP (0% damage cleared), dragon sits closest to village (left ~52%)
  // At 0% HP (100% damage cleared), dragon is repelled to far right (~82%)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const minLeftPercent = 52; // Closest invading position
  const maxLeftPercent = 82; // Repelled position
  const calculatedLeftPercent = minLeftPercent + damageClearedFraction * (maxLeftPercent - minLeftPercent);

  const showFinalBlowArc = isDefeated && hasPlayedFinalBlow;

  return (
    <div
      className={`landscape-layer layer-8-dragon`}
      aria-label={isDefeated ? "Dragon repelled and defeated" : `Dragon raiding village (${bossHpPercent}% HP left)`}
    >
      <div
        className={`dragon-container ${showFinalBlowArc ? "dragon-final-blow" : ""}`}
        style={{
          left: showFinalBlowArc ? `${calculatedLeftPercent}%` : `${calculatedLeftPercent}%`,
          opacity: isDefeated && !showFinalBlowArc ? 0.35 : 1,
        }}
      >
        <div className="dragon-idle-bob">
          <svg viewBox="0 0 260 220" width="100%" height="100%">
            {/* Dragon Body Group */}
            <g transform="translate(10, 10)">
              {/* Tail */}
              <path
                d="M 210 130 Q 250 150 240 180 Q 225 195 200 170"
                fill="none"
                stroke="var(--scene-boss-slate)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <polygon points="245,180 255,190 240,195" fill="var(--scene-ember-danger)" />

              {/* Left Wing (Back Wing) */}
              <g className="dragon-wing-left">
                <polygon
                  points="140,80 210,15 170,90 125,95"
                  fill="#1e293b"
                  stroke="var(--scene-boss-slate)"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </g>

              {/* Body */}
              <path
                d="M 60 110 Q 110 80 175 110 Q 195 155 140 175 Q 85 180 60 110 Z"
                fill="var(--scene-boss-slate)"
                stroke="#0f172a"
                strokeWidth="5"
              />

              {/* Neck & Head */}
              <path
                d="M 75 125 Q 40 100 35 60 Q 20 40 50 35 Q 75 55 85 110 Z"
                fill="var(--scene-boss-slate)"
                stroke="#0f172a"
                strokeWidth="5"
              />

              {/* Horns */}
              <polygon points="40,40 22,10 48,30" fill="var(--scene-ember-danger)" />
              <polygon points="52,38 42,8 58,28" fill="var(--scene-ember-danger)" />

              {/* Glowing Ember Eye */}
              <circle cx="38" cy="48" r="4.5" fill="var(--scene-ember-gold)" />

              {/* Right Wing (Front Wing) */}
              <g className="dragon-wing-right">
                <polygon
                  points="110,95 30,20 80,105 115,115"
                  fill="var(--scene-boss-slate)"
                  stroke="#0f172a"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </g>

              {/* Chest Accent (Spikes / Scales) */}
              <path
                d="M 72 130 Q 95 155 125 150"
                fill="none"
                stroke="var(--scene-ember-danger)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
