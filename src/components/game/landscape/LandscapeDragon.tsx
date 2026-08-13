import { useEffect, useRef, useState } from "react";

type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
};

export function LandscapeDragon({ bossHpPercent, isDefeated }: LandscapeDragonProps) {
  const [hasPlayedFinalBlow, setHasPlayedFinalBlow] = useState(false);
  const prevDefeatedRef = useRef(isDefeated);

  useEffect(() => {
    if (isDefeated && !prevDefeatedRef.current && !hasPlayedFinalBlow) {
      setHasPlayedFinalBlow(true);
    }
    prevDefeatedRef.current = isDefeated;
  }, [isDefeated, hasPlayedFinalBlow]);

  // Dragon horizontal position mapping:
  // At 100% HP, sits closest to invading village (left ~50%)
  // At 0% HP, repelled to far right (~80%)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const minLeftPercent = 50;
  const maxLeftPercent = 80;
  const calculatedLeftPercent = minLeftPercent + damageClearedFraction * (maxLeftPercent - minLeftPercent);

  const showFinalBlowArc = isDefeated && hasPlayedFinalBlow;

  return (
    <div
      className="landscape-layer layer-8-dragon"
      aria-label={isDefeated ? "Medieval dragon repelled and defeated" : `Medieval dragon raiding village (${bossHpPercent}% HP left)`}
    >
      <div
        className={`dragon-container ${showFinalBlowArc ? "dragon-final-blow" : ""}`}
        style={{
          left: `${calculatedLeftPercent}%`,
          opacity: isDefeated && !showFinalBlowArc ? 0.35 : 1,
        }}
      >
        <div className="dragon-idle-bob">
          <svg viewBox="0 0 320 250" width="100%" height="100%">
            <g transform="translate(10, 10)" className="medieval-dragon">

              {/* --- Layer 1: Background Left Wing (Scary Jagged Membrane & Tip Spur) --- */}
              <g className="dragon-wing-left" transform="translate(0, 0)">
                {/* Main Membrane with Jagged Torn Cutouts */}
                <path
                  d="M 145 95 L 260 0 L 235 45 Q 215 50 195 80 Q 170 85 145 95 Z"
                  fill="#111827"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                {/* Strut Bones */}
                <line x1="145" y1="95" x2="260" y2="0" stroke="var(--scene-boss-slate)" strokeWidth="3" />
                <path d="M 260 0 Q 210 50 195 80" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="2.5" />
                <path d="M 260 0 Q 185 65 145 95" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="2" />
                {/* Sharp Wing-Tip Spur */}
                <polygon points="260,0 272,-8 262,10" fill="var(--scene-ember-danger)" stroke="#0f172a" strokeWidth="1.5" />
              </g>

              {/* --- Layer 2: Seamless Connected Tail --- */}
              <g className="dragon-tail">
                <path
                  d="M 190 150 C 235 155 270 170 260 210 C 250 235 210 230 195 200"
                  fill="none"
                  stroke="var(--scene-boss-slate)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Tail Spine Ridges */}
                <path d="M 235 160 Q 255 170 262 195" fill="none" stroke="var(--scene-ember-danger)" strokeWidth="4" strokeLinecap="round" />
                {/* Barbed Arrowhead Tip */}
                <path d="M 195 200 Q 185 190 178 198 Q 188 208 195 200 Z" fill="var(--scene-ember-danger)" stroke="#0f172a" strokeWidth="2" />
              </g>

              {/* --- Layer 3: Back Spikes along Spine (Following Neck & Spine Curve) --- */}
              <g className="dragon-spine-spikes">
                <path
                  d="M 42 22 Q 52 35 75 75 Q 110 100 165 112 Q 210 135 240 165"
                  fill="none"
                  stroke="var(--scene-ember-danger)"
                  strokeWidth="6"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />
              </g>

              {/* --- Layer 4: Back Hind Leg (Limb 1/4) --- */}
              <g className="dragon-back-leg">
                <path d="M 185 155 Q 215 185 200 215 L 175 220" fill="none" stroke="#111827" strokeWidth="15" strokeLinecap="round" />
                {/* Curved Claws */}
                <path d="M 175 220 Q 165 228 158 232" fill="none" stroke="#d9c3b0" strokeWidth="3" strokeLinecap="round" />
                <path d="M 178 222 Q 170 231 165 236" fill="none" stroke="#d9c3b0" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* --- Layer 5: Back Front Arm (Limb 2/4) --- */}
              <g className="dragon-back-arm">
                <path d="M 115 135 L 90 165 L 75 160" fill="none" stroke="#111827" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 75 160 Q 64 163 58 167" fill="none" stroke="#d9c3b0" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* --- Layer 6: Main Torso Body --- */}
              <path
                d="M 75 125 Q 130 90 200 125 Q 215 175 160 190 Q 95 195 75 125 Z"
                fill="var(--scene-boss-slate)"
                stroke="#0f172a"
                strokeWidth="4.5"
              />

              {/* Chest Armor Scales */}
              <path d="M 85 140 Q 115 170 155 165" fill="none" stroke="var(--scene-ember-danger)" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 95 155 Q 120 180 150 176" fill="none" stroke="var(--scene-ember-gold)" strokeWidth="3.5" strokeLinecap="round" />

              {/* --- Layer 7: Right Wing (Moved Behind Head/Chest) --- */}
              <g className="dragon-wing-right" transform="translate(-10, -5)">
                <path
                  d="M 125 95 L 30 10 L 65 55 Q 85 85 105 105 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <line x1="125" y1="95" x2="30" y2="10" stroke="#0f172a" strokeWidth="2.5" />
                <polygon points="30,10 20,4 28,16" fill="var(--scene-ember-danger)" stroke="#0f172a" strokeWidth="1.5" />
              </g>

              {/* --- Layer 8: Front Hind Leg (Limb 3/4) --- */}
              <g className="dragon-front-leg">
                <path d="M 170 155 Q 205 185 190 220 L 160 225" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="16" strokeLinecap="round" />
                {/* Tapered Curved Claws */}
                <path d="M 160 225 Q 148 234 140 238" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 164 227 Q 155 237 148 242" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* --- Layer 9: Head, Snout, Mouth & Horns --- */}
              <g className="dragon-head-neck">
                {/* Neck */}
                <path
                  d="M 90 140 Q 48 110 40 68 Q 20 45 60 38 Q 92 60 102 120 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#0f172a"
                  strokeWidth="4.5"
                />

                {/* Protruding Outward Snout & Upper Jaw */}
                <path
                  d="M 50 42 L -2 26 L 22 14 L 62 32 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#0f172a"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                {/* Open Lower Jaw */}
                <path
                  d="M 42 54 L -6 40 L 20 62 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />

                {/* Dark Inner Mouth Cavity */}
                <polygon points="36,46 2,34 16,48" fill="#7f1d1d" />
                <path d="M 24 45 Q 6 40 10 46" fill="none" stroke="var(--scene-ember-danger)" strokeWidth="2.5" />

                {/* Curved Tapered Fangs (INSIDE Mouth Jaws) */}
                <path d="M 8 30 Q 6 36 10 35" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 16 32 Q 14 39 18 37" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 24 34 Q 22 41 26 39" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 6 39 Q 4 34 8 41" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 14 42 Q 12 37 16 44" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />

                {/* Dual Curved Head Horns */}
                <path d="M 45 28 C 30 10 12 -8 2 -18 C 16 -8 30 5 42 22 Z" fill="var(--scene-ember-danger)" stroke="#0f172a" strokeWidth="2" />
                <path d="M 54 26 C 44 6 28 -14 16 -24 C 30 -14 44 2 52 20 Z" fill="var(--scene-ember-danger)" stroke="#0f172a" strokeWidth="2" />

                {/* Nostril Ridge */}
                <ellipse cx="6" cy="22" rx="2" ry="1" fill="#0f172a" />

                {/* Expressive Enlarged Dragon Eye */}
                <ellipse cx="38" cy="24" rx="7" ry="5" fill="var(--scene-ember-gold)" stroke="#0f172a" strokeWidth="1.5" />
                <ellipse cx="38" cy="24" rx="2" ry="4" fill="#0f172a" />
                <circle cx="36" cy="22" r="1.5" fill="#fff" />
              </g>

              {/* --- Layer 10: Front Claw Arm (Limb 4/4) --- */}
              <g className="dragon-front-arm">
                <path d="M 105 140 L 72 175 L 50 168" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                {/* Tapered Front Claws */}
                <path d="M 50 168 Q 38 174 34 180" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 53 171 Q 42 179 38 186" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </g>

            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
