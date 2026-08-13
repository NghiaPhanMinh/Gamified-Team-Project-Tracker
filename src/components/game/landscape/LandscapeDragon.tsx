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
        bottom: "8px",
        width: "360px",
        height: "270px",
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
          <svg viewBox="0 0 380 290" width="100%" height="100%">
            <defs>
              {/* Seamless Dark Dragon Body Shading (NO BLACK OUTLINES) */}
              <linearGradient id="dragon-skin-dark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2a3644" />
                <stop offset="60%" stopColor="#1e2733" />
                <stop offset="100%" stopColor="#141c26" />
              </linearGradient>

              <linearGradient id="dragon-chest-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#9a3412" />
              </linearGradient>

              <linearGradient id="goat-horn-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="40%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            <g transform="translate(10, 10)" className="medieval-dragon">

              {/* --- LAYER 1: Background Left Bat-Wing (BEHIND Body & Head, NO Outlines) --- */}
              <g className="dragon-wing-left" transform="translate(30, -5)">
                {/* Sweeping Bat Wing Membrane */}
                <path
                  d="M 140 120 L 300 -35 Q 260 25 220 70 Q 180 90 140 120 Z"
                  fill="#111827"
                  opacity="0.95"
                />
                {/* Wing Bone Struts */}
                <path d="M 140 120 L 300 -35 Q 240 30 200 75" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
                <path d="M 300 -35 Q 190 60 140 120" fill="none" stroke="#374151" strokeWidth="2.5" />
                {/* Wing Claw Tip */}
                <path d="M 300 -35 L 312 -45 L 304 -25 Z" fill="#ef4444" />
              </g>

              {/* --- LAYER 2: Background Right Bat-Wing (BEHIND Head) --- */}
              <g className="dragon-wing-right" transform="translate(-10, -12)">
                <path
                  d="M 150 125 L 20 -30 Q 60 25 120 100 Z"
                  fill="#1f2937"
                  opacity="0.9"
                />
                <path d="M 150 125 L 20 -30 Q 75 30 120 100" fill="none" stroke="#374151" strokeWidth="2.5" />
                <path d="M 20 -30 L 8 -38 L 16 -20 Z" fill="#ef4444" />
              </g>

              {/* --- LAYER 3: Seamless Reattached Barbed Tail --- */}
              <g className="dragon-tail">
                <path
                  d="M 210 170 C 275 175 315 200 300 245 C 285 275 235 265 215 230"
                  fill="none"
                  stroke="url(#dragon-skin-dark)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                {/* Barbed Tail Tip */}
                <path d="M 215 230 Q 200 215 190 226 Q 205 240 215 230 Z" fill="#ef4444" />
              </g>

              {/* --- LAYER 4: Organic Curved Dorsal Spine Scales (No Straight Lines) --- */}
              <g className="dragon-spine-scales">
                <path d="M 58 35 Q 70 50 95 90 Q 135 120 200 135 Q 255 160 280 195" fill="none" stroke="#ea580c" strokeWidth="6" strokeDasharray="8 6" strokeLinecap="round" />
              </g>

              {/* --- LAYER 5: Muscular Back Legs & Claws (Limb 1/4 & 2/4) --- */}
              <g className="dragon-back-limbs">
                {/* Hind Leg */}
                <path d="M 200 175 Q 240 210 220 250 L 195 255" fill="none" stroke="#111827" strokeWidth="20" strokeLinecap="round" />
                {/* Claws */}
                <path d="M 195 255 Q 183 263 175 268 M 198 257 Q 188 267 180 273" fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />

                {/* Back Arm */}
                <path d="M 130 150 L 100 185 L 82 178" fill="none" stroke="#111827" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 82 178 Q 70 182 62 187" fill="none" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* --- LAYER 6: ENLARGED POWERFUL MUSCULAR BODY TORSO (Seamless Fills, NO Black Outlines) --- */}
              <path
                d="M 85 135 Q 150 90 235 135 Q 255 195 190 220 Q 110 225 85 135 Z"
                fill="url(#dragon-skin-dark)"
              />

              {/* Fiery Chest Armor Plates */}
              <path d="M 95 155 Q 130 195 180 188" fill="none" stroke="url(#dragon-chest-glow)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 108 175 Q 138 208 172 202" fill="none" stroke="url(#dragon-chest-glow)" strokeWidth="6" strokeLinecap="round" />

              {/* --- LAYER 7: Muscular Front Leg & Arm (Limb 3/4 & 4/4) --- */}
              <g className="dragon-front-limbs">
                {/* Front Hind Leg */}
                <path d="M 185 175 Q 225 210 205 255 L 175 260" fill="none" stroke="url(#dragon-skin-dark)" strokeWidth="22" strokeLinecap="round" />
                {/* 3 Organic Curved White Claws */}
                <path d="M 175 260 Q 161 270 152 274" fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                <path d="M 178 262 Q 166 274 158 279" fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                <path d="M 182 264 Q 172 277 165 283" fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />

                {/* Front Claw Arm */}
                <path d="M 120 155 L 82 195 L 56 186" fill="none" stroke="url(#dragon-skin-dark)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 56 186 Q 42 192 35 198" fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                <path d="M 59 189 Q 47 198 41 205" fill="none" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
              </g>

              {/* --- LAYER 8: DOG-SHAPED MUZZLE, GOAT-STYLE HORNS & ANGRY PREDATORY EYE --- */}
              <g className="dragon-head-group">
                {/* Muscular Neck */}
                <path
                  d="M 105 150 Q 55 115 46 68 Q 25 42 70 34 Q 108 58 118 130 Z"
                  fill="url(#dragon-skin-dark)"
                />

                {/* Canine / Dog-Shaped Snout & Upper Jaw Structure */}
                <path
                  d="M 58 38 C 42 36 20 28 -12 24 C -16 22 -14 12 5 12 C 28 12 52 22 72 26 Z"
                  fill="url(#dragon-skin-dark)"
                />

                {/* Open Canine Lower Jaw */}
                <path
                  d="M 48 52 C 28 50 -8 44 -14 36 C -8 30 18 36 32 44 Z"
                  fill="url(#dragon-skin-dark)"
                />

                {/* Fiery Inner Mouth Cavity & Flame Tongue */}
                <path d="M 38 44 C 18 38 -4 30 2 35 C 12 40 28 44 38 44 Z" fill="#991b1b" />
                <path d="M 28 42 C 12 36 -2 32 4 40" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />

                {/* ORGANIC CURVED SHARP WHITE TEETH (Inside Gums) */}
                {/* Upper Jaw Teeth */}
                <path d="M 4 21 Q 2 28 6 27" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <path d="M 14 23 Q 12 30 16 29" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <path d="M 24 25 Q 22 32 26 31" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <path d="M 34 27 Q 32 34 36 33" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />

                {/* Lower Jaw Teeth */}
                <path d="M 2 34 Q 0 29 4 33" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <path d="M 12 37 Q 10 32 14 36" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <path d="M 22 40 Q 20 35 24 39" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />

                {/* DUAL GOAT-STYLE HORNS (Sweeping Spiraled Ridged Horns Curving Backwards) */}
                <g className="goat-horns">
                  {/* Primary Horn */}
                  <path
                    d="M 52 24 C 36 6 12 -18 -18 -42 C 8 -22 34 -4 48 16 Z"
                    fill="url(#goat-horn-grad)"
                  />
                  {/* Goat Horn Ridges */}
                  <path d="M 44 18 Q 36 8 28 0" fill="none" stroke="#64748b" strokeWidth="2.5" />
                  <path d="M 32 6 Q 22 -4 14 -12" fill="none" stroke="#64748b" strokeWidth="2" />
                  <path d="M 18 -8 Q 8 -18 0 -26" fill="none" stroke="#64748b" strokeWidth="2" />

                  {/* Secondary Back Horn */}
                  <path
                    d="M 60 22 C 48 4 28 -16 0 -38 C 22 -20 44 -2 56 14 Z"
                    fill="url(#goat-horn-grad)"
                    opacity="0.85"
                  />
                </g>

                {/* Canine Nose Tip */}
                <ellipse cx="-13" cy="18" rx="3" ry="2" fill="#0f172a" />

                {/* ANGRY PREDATORY DRAGON EYE (Angled Brow with Slitted Crimson/Gold Pupil) */}
                <g className="angry-dragon-eye">
                  {/* Aggressive Slanted Brow Shadow */}
                  <path d="M 26 12 L 48 18 L 44 26 L 22 20 Z" fill="#0f172a" />
                  {/* Angled Eye Socket */}
                  <polygon points="28,15 46,20 40,28 26,24" fill="#ef4444" />
                  {/* Glowing Amber Iris */}
                  <polygon points="30,16 44,21 38,27 28,23" fill="#f59e0b" />
                  {/* Vertical Sharp Crimson Slit Pupil */}
                  <polygon points="36,17 38,21 36,26 34,22" fill="#020617" />
                  {/* Eye Highlight */}
                  <circle cx="34" cy="18" r="1.5" fill="#fff" />
                </g>
              </g>

            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
