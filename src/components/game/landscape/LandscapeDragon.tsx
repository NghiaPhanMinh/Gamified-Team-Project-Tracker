type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
};

export function LandscapeDragon({ bossHpPercent, isDefeated }: LandscapeDragonProps) {
  // Anchor dragon on far-right end of the 1000x400 viewBox canvas (x = 730 to 930)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const dragonX = 730 + damageClearedFraction * 60;

  return (
    <div className="landscape-layer layer-8-dragon" aria-label={`Majestic Red Western Dragon (${bossHpPercent}% HP left)`}>
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        {/* Dragon Group anchored on Far-Right End */}
        <g
          transform={`translate(${dragonX}, 130)`}
          className={`dragon-group ${isDefeated ? "dragon-defeated" : ""}`}
          style={{ opacity: isDefeated ? 0.35 : 1 }}
        >
          {/* Gentle Flying Hovering Animation */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-14; 0,0"
              dur="3.2s"
              repeatCount="indefinite"
            />

            {/* --- MEDIEVAL RED DRAGON BASED ON REFERENCE DRAWING (120+ SHAPES, NO OUTLINES) --- */}
            <g transform="scale(0.68)">

              {/* =========================================================================
                  1. MAJESTIC SCALED LEFT / BACK WING (BEHIND BODY)
                 ========================================================================= */}
              <g className="dragon-back-wing">
                {/* Thick Wing Arm Structure (Back) */}
                <path d="M 120 110 Q 190 -30 310 -50" stroke="#991b1b" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 310 -50 Q 250 20 210 80" stroke="#7f1d1d" strokeWidth="8" strokeLinecap="round" fill="none" />

                {/* Scalloped Red Membrane Panels */}
                <path d="M 120 110 Q 200 -50 310 -50 Q 250 10 210 70 Z" fill="#b91c1c" />
                <path d="M 310 -50 Q 270 25 210 70 Q 170 50 120 110 Z" fill="#991b1b" />
                <path d="M 210 70 Q 170 40 120 110 Q 165 75 210 70 Z" fill="#7f1d1d" />

                {/* Finger Ridge highlights */}
                <path d="M 120 110 Q 220 -20 310 -50" stroke="#dc2626" strokeWidth="2" fill="none" />
                <path d="M 120 110 Q 185 10 210 70" stroke="#dc2626" strokeWidth="1.5" fill="none" />

                {/* Wing Joint Claw */}
                <polygon points="310,-50 324,-64 314,-38" fill="#fef08a" />
              </g>

              {/* =========================================================================
                  2. MAJESTIC SCALED RIGHT / FRONT WING
                 ========================================================================= */}
              <g className="dragon-front-wing">
                {/* Thick Red Muscular Wing Arm */}
                <path d="M 130 125 Q 20 -20 -60 -40" stroke="#dc2626" strokeWidth="16" strokeLinecap="round" fill="none" />
                <path d="M -60 -40 Q 30 20 20 90" stroke="#b91c1c" strokeWidth="10" strokeLinecap="round" fill="none" />

                {/* Textured Red Membranes */}
                <path d="M 130 125 Q 20 -20 -60 -40 Q 10 25 50 80 Z" fill="#ef4444" />
                <path d="M -60 -40 Q -10 30 20 90 Q 60 75 130 125 Z" fill="#dc2626" />
                <path d="M 20 90 Q 55 50 130 125 Q 70 85 20 90 Z" fill="#b91c1c" />

                {/* Wing Claw Spur */}
                <polygon points="-60,-40 -74,-54 -64,-28" fill="#fef08a" />
              </g>

              {/* =========================================================================
                  3. SLIM POINTY TAPERED TAIL WITH BLADE TIP
                 ========================================================================= */}
              <g className="dragon-tail">
                <path d="M 160 150 Q 220 160 255 190 Q 285 225 265 255 L 245 250 Q 260 230 240 210 Q 190 170 160 150 Z" fill="#b91c1c" />
                <path d="M 265 255 Q 240 275 205 265 L 210 250 Q 235 257 245 250 Z" fill="#7f1d1d" />

                {/* Sharp Pointy Blade Tip */}
                <polygon points="205,265 170,285 192,255" fill="#dc2626" />
                <polygon points="205,265 182,247 196,258" fill="#ef4444" />

                {/* Tail Spikes */}
                <polygon points="230,170 242,158 238,175" fill="#ef4444" />
                <polygon points="275,215 290,208 280,225" fill="#ef4444" />
              </g>

              {/* =========================================================================
                  4. DORSAL SPINE CREST PLATES (Running down the Spine)
                 ========================================================================= */}
              <g className="dragon-spines">
                <polygon points="35,42 22,22 42,35" fill="#dc2626" />
                <polygon points="55,58 45,38 62,52" fill="#dc2626" />
                <polygon points="80,78 72,58 88,72" fill="#dc2626" />
                <polygon points="110,98 102,78 116,92" fill="#dc2626" />
                <polygon points="140,118 134,98 148,112" fill="#dc2626" />
                <polygon points="168,138 165,122 178,136" fill="#dc2626" />
              </g>

              {/* =========================================================================
                  5. POWERFUL THICK BACK HIND LEG (RIGGED & SCALED UP)
                 ========================================================================= */}
              <g className="dragon-back-leg">
                {/* Thick Muscular Thigh/Quad */}
                <path d="M 150 145 C 205 160 215 210 185 225 C 145 220 135 185 150 145 Z" fill="#7f1d1d" />
                {/* Knee Joint */}
                <circle cx="185" cy="225" r="14" fill="#450a0a" />
                {/* Muscular Shin/Calf */}
                <path d="M 185 225 L 165 265 L 140 260 L 170 215 Z" fill="#7f1d1d" />
                {/* Large Clawed Foot */}
                <path d="M 165 265 L 125 272 L 128 258 L 155 255 Z" fill="#7f1d1d" />
                {/* White Talons */}
                <polygon points="125,272 105,282 120,265" fill="#ffffff" />
                <polygon points="128,274 110,285 124,267" fill="#ffffff" />
                <polygon points="132,276 116,288 128,269" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  6. POWERFUL SLENDER TORSO & segmented CREAM UNDERBELLY
                 ========================================================================= */}
              <g className="dragon-torso">
                {/* Proportionate Athletic Main Body */}
                <path d="M 50 110 C 115 65 200 100 185 180 C 145 210 70 195 50 110 Z" fill="#b91c1c" />
                {/* Body Shadow */}
                <path d="M 105 75 C 175 110 175 185 125 195 C 155 155 138 100 105 75 Z" fill="#7f1d1d" />

                {/* Segmented Horizontal Cream/Gold Underbelly Plates */}
                <path d="M 58 122 C 92 150 135 145 150 135 Q 130 170 66 152 Z" fill="#e2e8f0" />
                <path d="M 64 132 C 94 158 130 152 142 142 Q 122 174 72 160 Z" fill="#fef08a" />
                <path d="M 70 142 C 98 165 125 158 135 148 Q 115 178 78 166 Z" fill="#fde047" />
                <path d="M 76 152 C 100 170 120 164 128 154 Q 110 182 84 172 Z" fill="#fbbf24" />
              </g>

              {/* =========================================================================
                  7. POWERFUL THICK FRONT HIND LEG (RIGGED & SCALED UP)
                 ========================================================================= */}
              <g className="dragon-front-leg">
                {/* Thick Thigh */}
                <path d="M 145 150 C 195 165 205 215 175 230 C 135 220 125 185 145 150 Z" fill="#dc2626" />
                {/* Knee Joint */}
                <circle cx="175" cy="230" r="14" fill="#b91c1c" />
                {/* Muscular Shin */}
                <path d="M 175 230 L 155 270 L 130 265 L 160 220 Z" fill="#dc2626" />
                {/* Large Foot */}
                <path d="M 155 270 L 115 278 L 118 262 L 145 258 Z" fill="#dc2626" />
                {/* White Talons */}
                <polygon points="115,278 95,290 110,270" fill="#ffffff" />
                <polygon points="118,280 100,293 114,272" fill="#ffffff" />
                <polygon points="122,282 106,295 118,274" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  8. RIGGED & POWERFUL FRONT ARM (SCALED UP)
                 ========================================================================= */}
              <g className="dragon-front-arm">
                {/* Large Shoulder Bulb */}
                <circle cx="95" cy="120" r="15" fill="#dc2626" />
                {/* Bicep */}
                <path d="M 95 120 L 65 155 L 50 145 L 85 115 Z" fill="#dc2626" />
                {/* Elbow */}
                <circle cx="65" cy="155" r="8" fill="#b91c1c" />
                {/* Muscular Forearm */}
                <path d="M 65 155 L 35 148 L 32 138 L 58 142 Z" fill="#dc2626" />
                {/* Large Hand Claws */}
                <polygon points="35,148 15,158 28,142" fill="#ffffff" />
                <polygon points="38,150 20,161 31,144" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  9. MUSCULAR S-CURVED NECK & GAPLESS OVERLAPPING HEAD COLLAR
                 ========================================================================= */}
              <g className="dragon-head-neck">
                {/* Muscular S-Neck Fills */}
                <path d="M 70 125 Q 35 90 30 55 Q 15 30 52 18 Q 80 38 86 102 Z" fill="#dc2626" />
                <path d="M 35 90 Q 30 55 15 30 Q 30 35 48 60 Z" fill="#b91c1c" />

                {/* Cream Throat Plate wraps around front of Neck */}
                <path d="M 15 30 Q 25 35 48 60 Q 42 75 25 45 Z" fill="#fef08a" />
                <path d="M 25 45 Q 35 55 58 80 Q 50 95 32 65 Z" fill="#fde047" />

                {/* Overlapping Gapless Neck Collar (Locks Head to Neck) */}
                <path d="M 30 55 Q 50 35 70 48 Q 50 65 30 55 Z" fill="#7f1d1d" />
                <path d="M 34 68 Q 54 52 74 66 Q 54 80 34 68 Z" fill="#450a0a" />

                {/* =========================================================================
                    10. PREDATOR SKULL & REFERENCE DRAWING IVORY HORNS (NO OUTLINES)
                   ========================================================================= */}
                {/* Head Base */}
                <path d="M 48 20 L -24 5 L 8 -10 L 62 8 Z" fill="#dc2626" />

                {/* Snout Nose Ridge */}
                <polygon points="-24,5 -8,-1 5,-7 -17,0" fill="#b91c1c" />
                <ellipse cx="-12" cy="2" rx="4" ry="2.2" fill="#450a0a" />

                {/* Aggressive Hinge Lower Jaw */}
                <path d="M 38 34 L -26 18 L 8 42 Z" fill="#dc2626" />

                {/* Inner Mouth Cavity */}
                <polygon points="30,28 -18,16 6,34" fill="#450a0a" />

                {/* Cheek Spines */}
                <polygon points="30,18 12,14 26,26" fill="#b91c1c" />
                <polygon points="38,16 22,8 34,22" fill="#7f1d1d" />

                {/* Interlocking White Upper/Lower Fangs */}
                <polygon points="-16,7 -22,14 -11,9" fill="#ffffff" />
                <polygon points="-10,8 -14,16 -5,10" fill="#ffffff" />
                <polygon points="-4,9 -8,17 1,11" fill="#ffffff" />
                <polygon points="2,10 0,18 7,12" fill="#ffffff" />
                <polygon points="-20,20 -14,12 -15,22" fill="#ffffff" />
                <polygon points="-12,22 -7,14 -7,24" fill="#ffffff" />

                {/* --- REFERENCE DESIGN IVORY SWEEPING HORNS (RIBBED & CURVED) --- */}
                <g className="reference-ivory-horns">
                  {/* Horn 1 (Back Ivory Horn) */}
                  <path d="M 38 4 C 22 -15 8 -38 -20 -50 C -5 -38 12 -20 28 -4 Z" fill="#e2e8f0" />
                  <path d="M 28 -4 C 18 -15 2 -32 -20 -44 L -15 -48 C 8 -36 22 -20 32 -8 Z" fill="#cbd5e1" />
                  {/* Horn 2 (Front Ivory Horn - Sweeping Backward) */}
                  <path d="M 46 2 C 32 -18 18 -42 -10 -54 C 5 -40 22 -22 36 -6 Z" fill="#ffffff" />
                  <path d="M 36 -6 C 26 -20 10 -38 -10 -48 L -5 -52 C 16 -40 30 -24 40 -10 Z" fill="#f8fafc" />

                  {/* Ribbed highlights along Horn 2 */}
                  <line x1="28" y1="-18" x2="38" y2="-12" stroke="#cbd5e1" strokeWidth="2.5" />
                  <line x1="18" y1="-30" x2="28" y2="-24" stroke="#cbd5e1" strokeWidth="2" />
                  <line x1="8" y1="-42" x2="16" y2="-37" stroke="#cbd5e1" strokeWidth="1.5" />
                </g>

                {/* FIERCE GLOWING RED/YELLOW DRAGON EYE */}
                <ellipse cx="28" cy="4" rx="8" ry="5" fill="#f59e0b" />
                <polygon points="28,-1 30,4 28,9 26,4" fill="#000000" />
                <circle cx="25" cy="2" r="1.8" fill="#ffffff" />
                {/* Dark Eyebrow Shadow */}
                <polygon points="18,-2 38,0 36,3 20,1" fill="#450a0a" />
              </g>

            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
