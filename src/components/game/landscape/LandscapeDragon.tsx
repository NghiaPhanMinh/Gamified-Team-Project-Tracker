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
        width: "350px",
        height: "260px",
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
          <svg viewBox="0 0 350 260" width="100%" height="100%">
            <defs>
              {/* Dragon Gradient Fills (No Harsh Black Outlines) */}
              <linearGradient id="dragon-body-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2c374e" />
                <stop offset="60%" stopColor="#1a2336" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="dragon-wing-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0b0f17" />
              </linearGradient>

              <linearGradient id="dragon-horn-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#991b1b" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
            </defs>

            <g transform="translate(10, 10)" className="medieval-dragon">

              {/* --- BACKGROUND LAYER 1: Left Sweeping Bat Wing (BEHIND Body Z-Layer) --- */}
              <g className="dragon-wing-left" transform="translate(20, -10)">
                <path
                  d="M 130 95 C 190 20 250 -30 280 -35 C 245 15 220 30 195 65 C 165 75 140 90 130 95 Z"
                  fill="url(#dragon-wing-grad)"
                />
                {/* Bone Struts */}
                <path d="M 130 95 L 280 -35 M 280 -35 Q 220 30 195 65" fill="none" stroke="#334155" strokeWidth="2.5" />
                {/* Wing-Tip Spur */}
                <polygon points="280,-35 294,-43 282,-25" fill="#ef4444" />
              </g>

              {/* --- BACKGROUND LAYER 2: Right Sweeping Bat Wing (BEHIND Head Z-Layer) --- */}
              <g className="dragon-wing-right" transform="translate(-15, -15)">
                <path
                  d="M 140 100 C 80 25 20 -20 0 -25 C 40 15 70 45 110 90 Z"
                  fill="url(#dragon-wing-grad)"
                />
                <path d="M 140 100 L 0 -25" fill="none" stroke="#334155" strokeWidth="2.5" />
                <polygon points="0,-25 -10,-32 -2,-17" fill="#ef4444" />
              </g>

              {/* --- LAYER 3: Barbed Tail (Flowing Seamlessly from Torso Base) --- */}
              <g className="dragon-tail">
                <path
                  d="M 210 145 C 265 150 295 170 285 210 C 275 235 235 230 220 200"
                  fill="none"
                  stroke="url(#dragon-body-grad)"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path d="M 250 158 Q 275 175 282 198" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                <path d="M 220 200 Q 210 190 202 198 Q 212 208 220 200 Z" fill="#ef4444" />
              </g>

              {/* --- LAYER 4: Organic Curved Dorsal Spine Plates (No Straight Lines) --- */}
              <g className="dragon-dorsal-plates">
                <path d="M 45 22 Q 50 15 58 24" fill="#ef4444" />
                <path d="M 68 45 Q 75 38 82 48" fill="#ef4444" />
                <path d="M 98 75 Q 106 66 114 78" fill="#ef4444" />
                <path d="M 135 92 Q 145 82 153 95" fill="#ef4444" />
                <path d="M 180 110 Q 192 98 200 114" fill="#ef4444" />
                <path d="M 230 140 Q 242 128 250 144" fill="#ef4444" />
              </g>

              {/* --- LAYER 5: Back Hind Leg & Claws (Limb 1/4) --- */}
              <g className="dragon-back-leg">
                <path d="M 195 150 Q 225 180 210 215 L 185 220" fill="none" stroke="#0f172a" strokeWidth="16" strokeLinecap="round" />
                {/* 3 Curved Talon Claws */}
                <path d="M 185 220 Q 175 226 166 230" fill="none" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 188 222 Q 180 230 172 235" fill="none" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 192 223 Q 186 233 180 238" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* --- LAYER 6: Back Front Arm & Claws (Limb 2/4) --- */}
              <g className="dragon-back-arm">
                <path d="M 125 130 L 95 160 L 78 155" fill="none" stroke="#0f172a" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 78 155 Q 66 158 60 162" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                <path d="M 80 157 Q 70 163 65 168" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* --- LAYER 7: ENLARGED MUSCULAR TORSO BODY --- */}
              <path
                d="M 70 110 Q 140 75 220 115 Q 245 175 170 195 Q 90 200 70 110 Z"
                fill="url(#dragon-body-grad)"
              />

              {/* Layered Underbelly Scales & Fiery Ember Glow */}
              <path d="M 80 130 Q 120 175 175 170" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
              <path d="M 90 148 Q 125 186 168 182" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />

              {/* --- LAYER 8: Front Hind Leg & Claws (Limb 3/4) --- */}
              <g className="dragon-front-leg">
                <path d="M 180 150 Q 215 180 200 220 L 170 225" fill="none" stroke="url(#dragon-body-grad)" strokeWidth="18" strokeLinecap="round" />
                {/* 3 Curved Talon Claws Resting on Ground */}
                <path d="M 170 225 Q 158 232 148 236" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <path d="M 173 227 Q 163 236 155 241" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <path d="M 177 228 Q 170 238 163 244" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* --- LAYER 9: PREDATORY HEAD, DOG/WOLF SNOUT & MAJESTIC GOAT HORNS (FOREMOST Z-LAYER) --- */}
              <g className="dragon-head-neck">
                {/* Thick Muscular Neck */}
                <path
                  d="M 95 135 C 60 100 45 60 62 32 C 85 45 98 85 108 122 Z"
                  fill="url(#dragon-body-grad)"
                />

                {/* Predatory Wolf/Dog-Shaped Muzzle & Upper Jaw */}
                <path
                  d="M 52 38 L -12 20 Q -18 24 16 38 Z"
                  fill="url(#dragon-body-grad)"
                />

                {/* Open Defined Lower Jaw */}
                <path
                  d="M 44 50 L -14 36 L 14 58 Z"
                  fill="url(#dragon-body-grad)"
                />

                {/* Fiery Inner Mouth Cavity */}
                <polygon points="38,44 -4,32 12,46" fill="#7f1d1d" />
                <path d="M 24 43 Q 0 36 4 44" fill="none" stroke="#ef4444" strokeWidth="3" />

                {/* Clean Curved Dragon Fangs INSIDE Mouth */}
                <path d="M 4 26 Q 2 33 6 32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 12 28 Q 10 35 14 34" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 20 30 Q 18 37 22 36" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 2 35 Q 0 30 4 37" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <path d="M 10 38 Q 8 33 12 40" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />

                {/* MAJESTIC GOAT-STYLE RIDGED HORNS (Sweeping Backward & Curling) */}
                <path
                  d="M 48 24 C 28 4 10 -16 -8 -8 C -18 0 4 18 38 28 Z"
                  fill="url(#dragon-horn-grad)"
                />
                <path
                  d="M 56 22 C 42 2 24 -18 6 -10 C -4 -2 18 16 46 26 Z"
                  fill="url(#dragon-horn-grad)"
                />
                {/* Horn Texture Ridges */}
                <path d="M 38 18 Q 28 8 20 12 M 26 12 Q 18 4 10 8 M 14 6 Q 6 -2 -2 2" fill="none" stroke="#ef4444" strokeWidth="1.8" />

                {/* Nostril Muzzle Ridge */}
                <ellipse cx="-4" cy="18" rx="2.5" ry="1.4" fill="#0b0f17" />

                {/* ANGRY AGGRESSIVE SLITTED DRAGON EYE */}
                <g className="angry-dragon-eye">
                  {/* Slanted Angry Eyebrow Ridge */}
                  <path d="M 24 10 L 46 18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                  {/* Angled Fierce Eye Socket */}
                  <polygon points="28,14 44,20 32,24" fill="#f59e0b" />
                  {/* Razor-Thin Slitted Pupil */}
                  <line x1="36" y1="14" x2="36" y2="23" stroke="#0f172a" strokeWidth="2.5" />
                </g>
              </g>

              {/* --- LAYER 10: Front Claw Arm & Claws (Limb 4/4) --- */}
              <g className="dragon-front-arm">
                <path d="M 110 135 L 75 170 L 52 163" fill="none" stroke="url(#dragon-body-grad)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
                {/* 3 Curved Talon Claws */}
                <path d="M 52 163 Q 40 169 34 175" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 55 166 Q 44 174 38 181" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 58 168 Q 48 178 42 185" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </g>

            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
