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

  // Dragon anchored at far right end:
  // At 100% HP, right offset is 15px
  // At 0% HP, repelled to 5px
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const rightPx = Math.max(5, Math.round(15 - damageClearedFraction * 10));

  const showFinalBlowArc = isDefeated && hasPlayedFinalBlow;

  return (
    <div
      className="landscape-layer layer-8-dragon"
      style={{
        position: "absolute",
        right: `${rightPx}px`,
        bottom: "10px",
        width: "320px",
        height: "240px",
        pointerEvents: "none",
        zIndex: 18,
      }}
      aria-label={isDefeated ? "Medieval dragon repelled and defeated" : `Medieval dragon raiding village (${bossHpPercent}% HP left)`}
    >
      <div
        className={`dragon-container ${showFinalBlowArc ? "dragon-final-blow" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          opacity: isDefeated && !showFinalBlowArc ? 0.35 : 1,
        }}
      >
        <div className="dragon-idle-bob" style={{ width: "100%", height: "100%" }}>
          <svg viewBox="0 0 340 260" width="100%" height="100%">
            <g transform="translate(10, 10)" className="medieval-dragon">

              {/* --- BACKGROUND LAYER 1: Left Sweeping Bat Wing (BEHIND Head, Neck & Torso Z-Layer) --- */}
              <g className="dragon-wing-left" transform="translate(15, -12)">
                {/* Large Sweeping Bat Membrane */}
                <path
                  d="M 130 100 L 270 -28 L 240 22 Q 215 32 190 68 Q 160 78 130 100 Z"
                  fill="#0b0f17"
                  stroke="#020617"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                {/* Wing Bone Struts */}
                <line x1="130" y1="100" x2="270" y2="-28" stroke="#334155" strokeWidth="3" />
                <path d="M 270 -28 Q 215 32 190 68" fill="none" stroke="#334155" strokeWidth="2.5" />
                <path d="M 270 -28 Q 175 52 130 100" fill="none" stroke="#334155" strokeWidth="2" />
                {/* Sharp Wing-Tip Claw Spur */}
                <polygon points="270,-28 284,-38 272,-18" fill="#ef4444" stroke="#020617" strokeWidth="1.5" />
              </g>

              {/* --- BACKGROUND LAYER 2: Right Sweeping Bat Wing (BEHIND Head & Chest Z-Layer) --- */}
              <g className="dragon-wing-right" transform="translate(-20, -18)">
                <path
                  d="M 140 105 L 10 -25 L 50 25 Q 80 60 110 92 Z"
                  fill="#1e293b"
                  stroke="#020617"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <line x1="140" y1="105" x2="10" y2="-25" stroke="#020617" strokeWidth="3" />
                <path d="M 10 -25 Q 70 30 110 92" fill="none" stroke="#020617" strokeWidth="2" />
                <polygon points="10,-25 0,-33 8,-17" fill="#ef4444" stroke="#020617" strokeWidth="1.5" />
              </g>

              {/* --- LAYER 3: Seamless Reattached Barbed Tail --- */}
              <g className="dragon-tail">
                <path
                  d="M 190 150 C 240 155 275 175 265 215 C 255 240 215 235 200 205"
                  fill="none"
                  stroke="var(--scene-boss-slate)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path d="M 235 160 Q 260 175 268 200" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                <path d="M 200 205 Q 190 195 182 203 Q 192 213 200 205 Z" fill="#ef4444" stroke="#020617" strokeWidth="2" />
              </g>

              {/* --- LAYER 4: Back Spine Spikes (Directly Along Spinal Curve) --- */}
              <g className="dragon-spine-spikes">
                <path
                  d="M 42 22 Q 52 35 75 75 Q 110 100 165 112 Q 210 135 240 165"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="7"
                  strokeDasharray="7 5"
                  strokeLinecap="round"
                />
              </g>

              {/* --- LAYER 5: Back Hind Leg (Limb 1/4) --- */}
              <g className="dragon-back-leg">
                <path d="M 185 155 Q 215 185 200 215 L 175 220" fill="none" stroke="#0f172a" strokeWidth="15" strokeLinecap="round" />
                {/* Organic Curved Claws */}
                <path d="M 175 220 Q 165 228 158 232" fill="none" stroke="#d9c3b0" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 178 222 Q 170 231 165 236" fill="none" stroke="#d9c3b0" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* --- LAYER 6: Back Front Arm (Limb 2/4) --- */}
              <g className="dragon-back-arm">
                <path d="M 115 135 L 90 165 L 75 160" fill="none" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 75 160 Q 64 163 58 167" fill="none" stroke="#d9c3b0" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* --- LAYER 7: Main Torso Body --- */}
              <path
                d="M 75 125 Q 130 90 200 125 Q 215 175 160 190 Q 95 195 75 125 Z"
                fill="var(--scene-boss-slate)"
                stroke="#020617"
                strokeWidth="4.5"
              />

              {/* Chest Armor Scales & Fiery Glow */}
              <path d="M 85 140 Q 115 170 155 165" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
              <path d="M 95 155 Q 120 180 150 176" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

              {/* --- LAYER 8: Front Hind Leg (Limb 3/4) --- */}
              <g className="dragon-front-leg">
                <path d="M 170 155 Q 205 185 190 220 L 160 225" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="16" strokeLinecap="round" />
                {/* Organic Curved Claws */}
                <path d="M 160 225 Q 148 234 140 238" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 164 227 Q 155 237 148 242" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* --- LAYER 9: Menacing Dragon Head, Snout, Mouth & Horns (100% VISIBLE FOREGROUND) --- */}
              <g className="dragon-head-neck">
                {/* Thick Muscular Neck */}
                <path
                  d="M 90 140 Q 48 110 40 68 Q 20 45 60 38 Q 92 60 102 120 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#020617"
                  strokeWidth="4.5"
                />

                {/* Protruding Predator Snout & Upper Jaw */}
                <path
                  d="M 50 42 L -8 24 L 18 10 L 64 28 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#020617"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                {/* Open Ferocious Lower Jaw */}
                <path
                  d="M 42 54 L -12 38 L 16 62 Z"
                  fill="var(--scene-boss-slate)"
                  stroke="#020617"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />

                {/* Fiery Inner Mouth Cavity & Flame Tongue */}
                <polygon points="36,46 -2,32 14,48" fill="#7f1d1d" />
                <path d="M 24 45 Q 2 38 6 46" fill="none" stroke="#ef4444" strokeWidth="3" />

                {/* Sharp Curved Fangs (INSIDE Mouth Jaws) */}
                <path d="M 6 28 Q 4 35 8 34" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 14 30 Q 12 38 16 36" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 22 32 Q 20 40 24 38" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 4 37 Q 2 32 6 39" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 12 40 Q 10 35 14 42" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />

                {/* Dual Menacing Sweeping Head Horns */}
                <path d="M 45 28 C 30 10 10 -10 -4 -24 C 14 -10 28 3 42 20 Z" fill="#ef4444" stroke="#020617" strokeWidth="2.5" />
                <path d="M 54 26 C 44 6 26 -16 10 -30 C 28 -16 42 0 52 18 Z" fill="#ef4444" stroke="#020617" strokeWidth="2.5" />

                {/* Nostril Ridge */}
                <ellipse cx="2" cy="18" rx="2.2" ry="1.2" fill="#020617" />

                {/* Ferocious Glowing Crimson/Gold Eye with Slitted Pupil */}
                <ellipse cx="36" cy="20" rx="8.5" ry="6.5" fill="#f59e0b" stroke="#020617" strokeWidth="2" />
                <ellipse cx="36" cy="20" rx="2.2" ry="5.5" fill="#020617" />
                <circle cx="34" cy="18" r="1.8" fill="#fff" />
              </g>

              {/* --- LAYER 10: Front Claw Arm (Limb 4/4) --- */}
              <g className="dragon-front-arm">
                <path d="M 105 140 L 72 175 L 50 168" fill="none" stroke="var(--scene-boss-slate)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                {/* Organic Curved Claws */}
                <path d="M 50 168 Q 38 174 34 180" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 53 171 Q 42 179 38 186" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              </g>

            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
