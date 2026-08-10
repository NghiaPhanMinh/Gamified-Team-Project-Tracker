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
              {/* --- 1. Tail with Barbed Arrowhead --- */}
              <path
                d="M 230 150 Q 285 175 270 215 Q 240 235 205 195"
                fill="none"
                stroke="var(--scene-boss-slate)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Tail Spine Ridges */}
              <polygon points="275,200 288,208 270,218" fill="var(--scene-ember-danger)" />
              <polygon points="255,225 262,238 245,232" fill="var(--scene-ember-danger)" />
              {/* Barbed Arrowhead Tip */}
              <polygon points="195,190 210,185 205,210" fill="var(--scene-ember-danger)" stroke="var(--scene-boss-slate)" strokeWidth="2" />

              {/* --- 2. Back Hind Leg (Limb 1/4) --- */}
              <g className="dragon-back-leg">
                <path d="M 190 150 Q 220 180 205 210 L 180 215" fill="none" stroke="#1b232a" strokeWidth="16" strokeLinecap="round" />
                {/* Claws */}
                <polygon points="175,215 168,222 178,212" fill="#d9c3b0" />
                <polygon points="182,216 177,225 186,213" fill="#d9c3b0" />
              </g>

              {/* --- 3. Back Front Arm (Limb 2/4) --- */}
              <g className="dragon-back-arm">
                <path d="M 115 135 L 90 165 L 75 160" fill="none" stroke="#1b232a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <polygon points="72,158 64,163 74,162" fill="#d9c3b0" />
                <polygon points="73,162 67,169 77,165" fill="#d9c3b0" />
              </g>

              {/* --- 4. Back Wing --- */}
              <g className="dragon-wing-left">
                <path
                  d="M 155 90 L 250 10 L 205 100 L 140 105 Z"
                  fill="#172026"
                  stroke="var(--scene-boss-slate)"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path d="M 250 10 Q 200 45 205 100" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="2" />
                <polygon points="250,10 258,4 252,14" fill="var(--scene-ember-danger)" />
              </g>

              {/* --- 5. Main Body Torso --- */}
              <path
                d="M 75 125 Q 130 90 210 125 Q 220 175 160 190 Q 95 195 75 125 Z"
                fill="var(--scene-boss-slate)"
                stroke="#0f172a"
                strokeWidth="5"
              />

              {/* Chest Scales / Armor Plates */}
              <path
                d="M 85 140 Q 115 170 155 165"
                fill="none"
                stroke="var(--scene-ember-danger)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 95 155 Q 120 180 150 176"
                fill="none"
                stroke="var(--scene-ember-gold)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Spine Plates along Neck and Back */}
              <polygon points="110,85 116,68 124,84" fill="var(--scene-ember-danger)" />
              <polygon points="135,88 143,70 150,89" fill="var(--scene-ember-danger)" />
              <polygon points="160,96 170,78 176,99" fill="var(--scene-ember-danger)" />
              <polygon points="185,108 196,92 200,112" fill="var(--scene-ember-danger)" />

              {/* --- 6. Front Hind Leg (Limb 3/4) --- */}
              <g className="dragon-front-leg">
                <path d="M 175 155 Q 210 185 195 220 L 165 225" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="18" strokeLinecap="round" />
                {/* Claws */}
                <polygon points="160,225 148,232 162,221" fill="#fff" stroke="var(--scene-boss-slate)" strokeWidth="1" />
                <polygon points="166,227 158,236 171,223" fill="#fff" stroke="var(--scene-boss-slate)" strokeWidth="1" />
                <polygon points="172,228 168,238 178,225" fill="#fff" stroke="var(--scene-boss-slate)" strokeWidth="1" />
              </g>

              {/* --- 7. Neck & Medieval Dragon Head with Snout & Open Mouth --- */}
              <g className="dragon-head-neck">
                {/* Neck */}
                <path
                  d="M 90 140 Q 48 110 40 68 Q 20 45 60 38 Q 92 60 102 120 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#0f172a"
                  strokeWidth="5"
                />

                {/* Upper Head & Snout */}
                <polygon points="45,45 5,30 25,18 60,35" fill="var(--scene-boss-slate)" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />

                {/* Open Lower Jaw */}
                <polygon points="40,54 -2,42 22,62" fill="var(--scene-boss-slate)" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />

                {/* Inside Mouth & Tongue */}
                <polygon points="35,47 6,36 18,48" fill="#800f1c" />
                <path d="M 25 46 Q 8 42 12 47" fill="none" stroke="var(--scene-ember-danger)" strokeWidth="2.5" />

                {/* Sharp Teeth (Upper & Lower) */}
                <polygon points="8,31 5,37 12,33" fill="#fff" />
                <polygon points="16,33 13,40 20,35" fill="#fff" />
                <polygon points="24,35 22,42 28,37" fill="#fff" />
                <polygon points="4,41 2,36 8,43" fill="#fff" />
                <polygon points="12,44 10,39 16,46" fill="#fff" />

                {/* Dual Curved Head Horns */}
                <path d="M 45 32 C 30 15 15 -5 5 -12 C 18 -5 32 10 42 26 Z" fill="var(--scene-ember-danger)" stroke="var(--scene-boss-slate)" strokeWidth="2" />
                <path d="M 55 30 C 45 10 32 -10 20 -20 C 35 -10 48 5 54 22 Z" fill="var(--scene-ember-danger)" stroke="var(--scene-boss-slate)" strokeWidth="2" />

                {/* Nostril Dot */}
                <circle cx="10" cy="27" r="1.5" fill="#0f172a" />

                {/* Fiery Dragon Eye */}
                <polygon points="34,26 44,24 38,32" fill="var(--scene-ember-gold)" stroke="var(--scene-boss-slate)" strokeWidth="1" />
                <line x1="39" y1="24" x2="38" y2="32" stroke="#0f172a" strokeWidth="2" />
              </g>

              {/* --- 8. Front Claw Arm (Limb 4/4) --- */}
              <g className="dragon-front-arm">
                <path d="M 105 140 L 72 175 L 50 168" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                {/* 3 Sharp Front Claws */}
                <polygon points="48,165 38,170 49,170" fill="#fff" stroke="var(--scene-boss-slate)" strokeWidth="1" />
                <polygon points="49,170 41,178 52,174" fill="#fff" stroke="var(--scene-boss-slate)" strokeWidth="1" />
                <polygon points="53,173 47,183 56,175" fill="#fff" stroke="var(--scene-boss-slate)" strokeWidth="1" />
              </g>

              {/* --- 9. Front Wing --- */}
              <g className="dragon-wing-right">
                <path
                  d="M 120 100 L 15 15 L 75 115 L 125 125 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#0f172a"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
                {/* Wing Membrane Finger Struts */}
                <path d="M 15 15 Q 65 60 75 115" fill="none" stroke="#0f172a" strokeWidth="3" />
                <path d="M 15 15 Q 90 75 125 125" fill="none" stroke="#0f172a" strokeWidth="2.5" />
                {/* Wing Thumb Claw */}
                <polygon points="15,15 8,7 18,10" fill="var(--scene-ember-danger)" stroke="#0f172a" strokeWidth="1.5" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
