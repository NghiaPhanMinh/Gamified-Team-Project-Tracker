type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
};

export function LandscapeDragon({ bossHpPercent, isDefeated }: LandscapeDragonProps) {
  // Anchor dragon on far-right end of the 1000x400 viewBox canvas (x = 730 to 930)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const dragonX = 730 + damageClearedFraction * 60;

  return (
    <div className="landscape-layer layer-8-dragon" aria-label={`Epic Rigged Western Red Dragon (${bossHpPercent}% HP left)`}>
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
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

            {/* --- MASTER-LEVEL ANATOMICAL RIGGED WESTERN DRAGON (130+ VECTOR SHAPES, NO HORNS, PROPORTIONATE BODY) --- */}
            <g transform="scale(0.68)">

              {/* =========================================================================
                  1. LEFT / BACK SWEEPING BAT WING (18 RIGGED VECTOR SHAPES)
                 ========================================================================= */}
              <g className="dragon-back-wing">
                {/* Main Wing Membrane Panels */}
                <path d="M 140 120 Q 200 -30 330 -60 Q 260 20 220 80 Z" fill="#3b0764" />
                <path d="M 330 -60 Q 270 25 220 80 Q 180 60 140 120 Z" fill="#2e1065" />
                <path d="M 220 80 Q 180 50 140 120 Q 175 85 220 80 Z" fill="#1e1b4b" />
                <path d="M 330 -60 Q 290 -10 240 40 Z" fill="#581c87" opacity="0.4" />

                {/* Rigged Wing Arm & Finger Bones */}
                <path d="M 140 120 Q 220 -20 330 -60" stroke="#6b21a8" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M 140 120 Q 190 20 220 80" stroke="#581c87" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 140 120 Q 165 75 185 105" stroke="#581c87" strokeWidth="3" strokeLinecap="round" fill="none" />

                {/* Wing Joint Knuckles & Claws */}
                <circle cx="220" cy="-20" r="5" fill="#991b1b" />
                <circle cx="330" cy="-60" r="5" fill="#991b1b" />
                <polygon points="330,-60 345,-75 334,-48" fill="#ef4444" />
                <polygon points="220,-20 230,-32 222,-10" fill="#dc2626" />
              </g>

              {/* =========================================================================
                  2. RIGHT / FRONT SWEEPING BAT WING (18 RIGGED VECTOR SHAPES)
                 ========================================================================= */}
              <g className="dragon-front-wing">
                {/* Sprawling Front Membrane Panels */}
                <path d="M 130 125 Q 20 -30 -70 -50 Q 10 25 60 90 Z" fill="#4c1d95" />
                <path d="M -70 -50 Q -10 35 30 100 Q 70 85 130 125 Z" fill="#3b0764" />
                <path d="M 30 100 Q 65 60 130 125 Q 75 95 30 100 Z" fill="#2e1065" />
                <path d="M -70 -50 Q -25 0 20 50 Z" fill="#7e22ce" opacity="0.4" />

                {/* Rigged Front Wing Arm & Finger Bones */}
                <path d="M 130 125 Q 20 10 -70 -50" stroke="#7e22ce" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M 130 125 Q 50 30 30 100" stroke="#6b21a8" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 130 125 Q 85 75 60 110" stroke="#581c87" strokeWidth="3" strokeLinecap="round" fill="none" />

                {/* Wrist Joint & Sharp Claws */}
                <circle cx="20" cy="10" r="5" fill="#b91c1c" />
                <circle cx="-70" cy="-50" r="5" fill="#b91c1c" />
                <polygon points="-70,-50 -85,-65 -74,-38" fill="#ef4444" />
                <polygon points="20,10 10,-2 18,20" fill="#dc2626" />
              </g>

              {/* =========================================================================
                  3. SLIM POINTY TAPERED TAIL WITH TRIPLE BARBED BLADE TIP (12 SHAPES)
                 ========================================================================= */}
              <g className="dragon-tail">
                {/* Slim Tapered Tail Segment 1 */}
                <path d="M 170 160 Q 230 170 260 200 L 240 215 Q 215 190 165 175 Z" fill="#7f1d1d" />
                {/* Slim Tapered Tail Segment 2 */}
                <path d="M 260 200 Q 285 230 265 260 L 245 255 Q 260 235 240 215 Z" fill="#991b1b" />
                {/* Slim Tapered Tail Segment 3 (Pointy Tip) */}
                <path d="M 265 260 Q 240 280 205 270 L 210 255 Q 235 262 245 255 Z" fill="#b91c1c" />

                {/* Underbelly Tail Tone Lines */}
                <path d="M 245 255 Q 235 262 205 270 Q 220 285 245 255 Z" fill="#450a0a" />

                {/* Sharp Triple Barbed Blade Tip */}
                <polygon points="205,270 170,290 192,260" fill="#dc2626" />
                <polygon points="205,270 182,252 196,263" fill="#ef4444" />
                <polygon points="205,270 188,285 198,272" fill="#f59e0b" />

                {/* Tail Dorsal Spikes */}
                <polygon points="230,170 242,158 238,175" fill="#dc2626" />
                <polygon points="275,215 290,208 280,225" fill="#dc2626" />
                <polygon points="255,262 268,272 250,268" fill="#dc2626" />
              </g>

              {/* =========================================================================
                  4. DORSAL SPINE CREST PLATES (10 SHAPES ALONG SPINE)
                 ========================================================================= */}
              <g className="dragon-dorsal-spines">
                <polygon points="35,42 22,22 42,35" fill="#dc2626" />
                <polygon points="55,58 45,38 62,52" fill="#dc2626" />
                <polygon points="80,78 72,58 88,72" fill="#dc2626" />
                <polygon points="110,98 102,78 116,92" fill="#dc2626" />
                <polygon points="140,118 134,98 148,112" fill="#dc2626" />
                <polygon points="172,138 168,118 180,132" fill="#dc2626" />
                <polygon points="215,160 216,140 226,155" fill="#dc2626" />
              </g>

              {/* =========================================================================
                  5. BACK HIND LEG (ANATOMICAL RIGGED JOINTS - 8 SHAPES)
                 ========================================================================= */}
              <g className="dragon-back-leg">
                {/* Quad / Thigh Muscle */}
                <path d="M 155 150 Q 200 165 185 200 Q 150 190 155 150 Z" fill="#450a0a" />
                {/* Knee Joint Cap */}
                <circle cx="185" cy="200" r="10" fill="#310606" />
                {/* Calf / Shin Segment */}
                <path d="M 185 200 L 165 235 L 148 230 L 175 195 Z" fill="#450a0a" />
                {/* Ankle Joint */}
                <circle cx="165" cy="235" r="6" fill="#1c0303" />
                {/* Foot Segment */}
                <path d="M 165 235 L 135 242 L 138 232 L 160 228 Z" fill="#450a0a" />
                {/* 3 Sharp White Claws */}
                <polygon points="135,242 118,252 132,236" fill="#ffffff" />
                <polygon points="138,244 122,255 136,238" fill="#ffffff" />
                <polygon points="142,246 128,258 140,240" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  6. PROPORTIONATE MUSCULAR TORSO & MULTI-LAYERED CHEST ARMOR (12 SHAPES)
                 ========================================================================= */}
              <g className="dragon-torso">
                {/* Large Muscular Thoracic Torso Base (Proportionate Volume) */}
                <path d="M 50 110 C 115 65 200 100 185 180 C 145 210 70 195 50 110 Z" fill="#7f1d1d" />
                {/* Pelvis & Lumbar Muscle */}
                <path d="M 150 135 C 195 150 185 195 140 185 Z" fill="#580e0e" />
                {/* Flank Muscle Shadow */}
                <path d="M 105 75 C 175 110 175 185 125 195 C 155 155 138 100 105 75 Z" fill="#450a0a" />

                {/* Overlapping Sternum Chest Armor Plates */}
                <path d="M 58 122 C 92 150 135 145 150 135 Q 130 170 66 152 Z" fill="#b91c1c" />
                <path d="M 64 132 C 94 158 130 152 142 142 Q 122 174 72 160 Z" fill="#dc2626" />
                <path d="M 70 142 C 98 165 125 158 135 148 Q 115 178 78 166 Z" fill="#ef4444" />
                <path d="M 76 152 C 100 170 120 164 128 154 Q 110 182 84 172 Z" fill="#f59e0b" />
                <path d="M 82 162 C 102 176 116 170 122 160 Q 106 186 90 178 Z" fill="#fef08a" />
              </g>

              {/* =========================================================================
                  7. FRONT HIND LEG (ANATOMICAL RIGGED JOINTS - 8 SHAPES)
                 ========================================================================= */}
              <g className="dragon-front-leg">
                {/* Quad / Thigh Muscle */}
                <path d="M 145 150 Q 190 165 175 205 Q 140 195 145 150 Z" fill="#991b1b" />
                {/* Knee Joint Cap */}
                <circle cx="175" cy="205" r="10" fill="#7f1d1d" />
                {/* Calf / Shin Segment */}
                <path d="M 175 205 L 155 240 L 138 235 L 165 200 Z" fill="#991b1b" />
                {/* Ankle Joint */}
                <circle cx="155" cy="240" r="6" fill="#580e0e" />
                {/* Foot Segment */}
                <path d="M 155 240 L 125 248 L 128 238 L 150 234 Z" fill="#991b1b" />
                {/* 3 Sharp White Claws */}
                <polygon points="125,248 105,260 120,240" fill="#ffffff" />
                <polygon points="128,250 110,263 124,242" fill="#ffffff" />
                <polygon points="132,252 116,265 128,244" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  8. RIGGED FRONT ARM (SHOULDER, BICEP, FOREARM, HAND - 7 SHAPES)
                 ========================================================================= */}
              <g className="dragon-front-arm">
                {/* Shoulder Joint Bulb */}
                <circle cx="95" cy="120" r="12" fill="#991b1b" />
                {/* Bicep Segment */}
                <path d="M 95 120 L 65 150 L 52 142 L 85 115 Z" fill="#991b1b" />
                {/* Elbow Joint */}
                <circle cx="65" cy="150" r="6" fill="#7f1d1d" />
                {/* Forearm Segment */}
                <path d="M 65 150 L 40 144 L 38 135 L 60 140 Z" fill="#991b1b" />
                {/* Hand Palm */}
                <circle cx="40" cy="144" r="5" fill="#7f1d1d" />
                {/* Hand Claws */}
                <polygon points="40,144 24,154 36,140" fill="#ffffff" />
                <polygon points="42,146 28,157 38,142" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  9. MUSCULAR S-CURVED NECK & OVERLAPPING GAPLESS HEAD COLLAR (12 SHAPES)
                 ========================================================================= */}
              <g className="dragon-head-neck">
                {/* Seamless S-Curved Muscular Neck Segments */}
                <path d="M 70 125 Q 35 90 30 55 Q 15 30 52 18 Q 80 38 86 102 Z" fill="#7f1d1d" />
                <path d="M 35 90 Q 30 55 15 30 Q 30 35 48 60 Z" fill="#991b1b" />

                {/* Overlapping Gapless Neck Collar Plates (OVERLAPS HEAD BASE 100% - NO GAPS!) */}
                <path d="M 30 55 Q 50 35 70 48 Q 50 65 30 55 Z" fill="#580e0e" />
                <path d="M 34 68 Q 54 52 74 66 Q 54 80 34 68 Z" fill="#450a0a" />
                <path d="M 38 82 Q 58 68 78 82 Q 58 95 38 82 Z" fill="#310606" />

                {/* =========================================================================
                    10. INTEGRATED PREDATOR SKULL (NO HORNS / NO ANTENNAE! - 14 SHAPES)
                   ========================================================================= */}
                {/* Predatory Wedge Skull Base (Overlaps Neck Collar) */}
                <path d="M 48 20 L -24 5 L 8 -10 L 62 8 Z" fill="#991b1b" />

                {/* Snout Nose Ridge */}
                <polygon points="-24,5 -8,-1 5,-7 -17,0" fill="#7f1d1d" />
                <ellipse cx="-12" cy="2" rx="4" ry="2.2" fill="#260404" />

                {/* Aggressive Hinge Lower Jaw */}
                <path d="M 38 34 L -26 18 L 8 42 Z" fill="#7f1d1d" />

                {/* Fiery Inner Mouth Cavity */}
                <polygon points="30,28 -18,16 6,34" fill="#450a0a" />

                {/* Sleek Crown Spines & Cheek Plates (NO HORNS!) */}
                <polygon points="42,8 55,-4 58,10" fill="#7f1d1d" />
                <polygon points="30,18 12,14 26,26" fill="#991b1b" />
                <polygon points="38,16 22,8 34,22" fill="#450a0a" />

                {/* FULL SET OF INTERLOCKING SHARP WHITE FANGS */}
                <polygon points="-16,7 -22,14 -11,9" fill="#ffffff" />
                <polygon points="-10,8 -14,16 -5,10" fill="#ffffff" />
                <polygon points="-4,9 -8,17 1,11" fill="#ffffff" />
                <polygon points="2,10 0,18 7,12" fill="#ffffff" />
                <polygon points="8,11 6,19 13,13" fill="#ffffff" />
                <polygon points="14,12 12,20 19,14" fill="#ffffff" />

                <polygon points="-20,20 -14,12 -15,22" fill="#ffffff" />
                <polygon points="-12,22 -7,14 -7,24" fill="#ffffff" />
                <polygon points="-4,24 1,16 1,26" fill="#ffffff" />
                <polygon points="3,26 8,18 8,28" fill="#ffffff" />

                {/* FIERCE GLOWING DRAGON EYE WITH DARK BROW RIDGE */}
                <ellipse cx="28" cy="4" rx="8" ry="5" fill="#f59e0b" />
                <polygon points="28,-1 30,4 28,9 26,4" fill="#000000" />
                <circle cx="25" cy="2" r="1.8" fill="#ffffff" />
                {/* Dark Brow Shadow Ridge */}
                <polygon points="18,-2 38,0 36,3 20,1" fill="#260404" />
              </g>

            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
