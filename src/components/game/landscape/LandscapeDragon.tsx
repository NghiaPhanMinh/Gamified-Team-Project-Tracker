type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
};

export function LandscapeDragon({ bossHpPercent, isDefeated }: LandscapeDragonProps) {
  // Anchor dragon on far-right end of the 1000x400 viewBox canvas (x = 730 to 930)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const dragonX = 730 + damageClearedFraction * 60;

  return (
    <div className="landscape-layer layer-8-dragon" aria-label={`Majestic Medieval Western Red Dragon (${bossHpPercent}% HP left)`}>
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <g
          transform={`translate(${dragonX}, 140)`}
          className={`dragon-group ${isDefeated ? "dragon-defeated" : ""}`}
          style={{ opacity: isDefeated ? 0.35 : 1 }}
        >
          {/* Hovering Flying Animation */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-14; 0,0"
              dur="3.2s"
              repeatCount="indefinite"
            />

            {/* --- MAJESTIC SLENDER MEDIEVAL WESTERN DRAGON (70+ VECTOR SHAPES, NO OUTLINES) --- */}
            <g transform="scale(0.68)">

              {/* =========================================================================
                  1. FAR-LEFT / BACK WING (MAJESTIC SWEEPING BAT WING - BEHIND BODY)
                 ========================================================================= */}
              <g className="dragon-back-wing">
                {/* Main Outer Wing Membrane */}
                <path d="M 120 110 Q 180 -40 320 -70 Q 250 10 210 70 Q 160 50 120 110 Z" fill="#3b0764" />
                {/* Secondary Wing Scallop Folds */}
                <path d="M 320 -70 Q 270 20 230 85 Q 180 80 120 110 Q 200 10 320 -70 Z" fill="#2e1065" />
                <path d="M 230 85 Q 180 40 120 110 Q 170 80 230 85 Z" fill="#1e1b4b" />
                {/* Wing Finger Bone Struts */}
                <path d="M 120 110 Q 220 -20 320 -70" stroke="#581c87" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 120 110 Q 185 10 230 85" stroke="#581c87" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 120 110 Q 155 70 180 100" stroke="#581c87" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Wrist Joint & Sharp Wing Claw */}
                <circle cx="320" cy="-70" r="4" fill="#991b1b" />
                <polygon points="320,-70 334,-84 324,-58" fill="#ef4444" />
              </g>

              {/* =========================================================================
                  2. NEAR / FRONT WING (MAJESTIC SPREADING BAT WING)
                 ========================================================================= */}
              <g className="dragon-front-wing">
                {/* Sprawling Front Membrane */}
                <path d="M 110 115 Q 10 -40 -80 -60 Q 0 15 50 80 Q 80 60 110 115 Z" fill="#4c1d95" />
                <path d="M -80 -60 Q -20 25 20 90 Q 60 80 110 115 Q 0 20 -80 -60 Z" fill="#3b0764" />
                <path d="M 20 90 Q 50 50 110 115 Q 60 90 20 90 Z" fill="#2e1065" />
                {/* Front Bone Struts */}
                <path d="M 110 115 Q 10 0 -80 -60" stroke="#6b21a8" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 110 115 Q 40 20 20 90" stroke="#6b21a8" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Wrist Claw Tip */}
                <polygon points="-80,-60 -94,-74 -84,-48" fill="#dc2626" />
              </g>

              {/* =========================================================================
                  3. LONG SLENDER TAPERED TAIL WITH TRIPLE BARBED SPEAR TIP
                 ========================================================================= */}
              <g className="dragon-tail">
                {/* Main Tail Base */}
                <path d="M 160 150 Q 220 160 255 190 Q 285 225 270 255 Q 240 280 215 255 Q 235 230 220 200 Q 190 170 160 150 Z" fill="#7f1d1d" />
                {/* Underbelly Tail Shading */}
                <path d="M 270 255 Q 240 280 215 255 Q 235 230 270 255 Z" fill="#991b1b" />
                <path d="M 215 255 Q 195 240 185 260 Q 200 270 215 255 Z" fill="#450a0a" />
                {/* Triple Barbed Spearhead Tip */}
                <polygon points="185,260 155,278 175,250" fill="#dc2626" />
                <polygon points="185,260 165,245 178,252" fill="#ef4444" />
                <polygon points="185,260 172,275 180,265" fill="#f59e0b" />
              </g>

              {/* =========================================================================
                  4. DORSAL SPINE CREST PLATES (Along Neck, Back & Tail)
                 ========================================================================= */}
              <g className="dragon-dorsal-spines">
                <polygon points="32,45 20,25 40,38" fill="#dc2626" />
                <polygon points="50,60 42,40 58,54" fill="#dc2626" />
                <polygon points="75,82 68,62 84,76" fill="#dc2626" />
                <polygon points="105,102 98,82 112,96" fill="#dc2626" />
                <polygon points="135,122 130,102 144,116" fill="#dc2626" />
                <polygon points="168,142 165,122 178,136" fill="#dc2626" />
                <polygon points="210,165 212,145 222,160" fill="#dc2626" />
                <polygon points="248,192 255,175 258,190" fill="#dc2626" />
              </g>

              {/* =========================================================================
                  5. BACK HIND LEG & SHARP WHITE TALONS
                 ========================================================================= */}
              <g className="dragon-back-leg">
                <path d="M 150 145 Q 185 175 170 220 L 140 225 Q 125 195 150 145 Z" fill="#450a0a" />
                <polygon points="140,225 122,238 136,220" fill="#ffffff" />
                <polygon points="144,227 128,241 140,222" fill="#ffffff" />
                <polygon points="148,229 134,243 144,224" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  6. SLENDER ATHLETIC TORSO & MULTI-LAYERED CHEST ARMOR
                 ========================================================================= */}
              <g className="dragon-torso">
                {/* Slender Athletic Torso Base */}
                <path d="M 55 115 C 105 75 175 110 165 175 C 135 195 75 185 55 115 Z" fill="#7f1d1d" />
                {/* Flank Shadow */}
                <path d="M 105 75 C 165 110 165 175 125 185 C 150 150 135 100 105 75 Z" fill="#450a0a" />

                {/* Overlapping Chest Armor Plates */}
                <path d="M 62 128 C 90 155 130 150 145 140 Q 125 170 70 155 Z" fill="#b91c1c" />
                <path d="M 68 138 C 92 160 125 155 138 146 Q 118 174 76 162 Z" fill="#dc2626" />
                <path d="M 74 148 C 95 166 120 160 130 152 Q 112 178 82 168 Z" fill="#f59e0b" />
                <path d="M 80 158 C 98 172 115 166 122 158 Q 106 182 88 174 Z" fill="#fef08a" />
              </g>

              {/* =========================================================================
                  7. FRONT HIND LEG & TALONS
                 ========================================================================= */}
              <g className="dragon-front-leg">
                <path d="M 140 145 Q 180 175 160 225 L 132 230 Q 115 200 140 145 Z" fill="#991b1b" />
                <polygon points="132,230 112,243 126,225" fill="#ffffff" />
                <polygon points="136,232 118,246 132,227" fill="#ffffff" />
                <polygon points="140,234 124,248 136,229" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  8. MUSCULAR S-CURVED NECK & INTEGRATED PREDATOR SKULL
                 ========================================================================= */}
              <g className="dragon-head-neck">
                {/* Seamless S-Curved Muscular Neck */}
                <path d="M 70 128 Q 35 95 30 60 Q 15 35 50 22 Q 78 42 84 105 Z" fill="#7f1d1d" />
                {/* Neck Throat Shading */}
                <path d="M 35 95 Q 30 60 15 35 Q 30 40 45 65 Z" fill="#991b1b" />
                {/* Neck Armor Segment Overlay */}
                <path d="M 38 65 Q 55 50 72 65 Q 55 78 38 65 Z" fill="#450a0a" opacity="0.6" />

                {/* Predatory Wedge Skull Base */}
                <path d="M 46 25 L -22 10 L 8 -5 L 60 12 Z" fill="#991b1b" />

                {/* Snout Nose Ridge */}
                <polygon points="-22,10 -8,4 5,-2 -15,5" fill="#7f1d1d" />
                <ellipse cx="-10" cy="6" rx="4" ry="2.2" fill="#260404" />

                {/* Aggressive Lower Jaw (Hinge-Connected to Neck Base) */}
                <path d="M 36 38 L -24 22 L 8 46 Z" fill="#7f1d1d" />

                {/* Fiery Inner Mouth Cavity */}
                <polygon points="28,32 -16,20 6,34" fill="#450a0a" />

                {/* FULL SET OF INTERLOCKING SHARP WHITE FANGS */}
                {/* Upper Jaw Teeth */}
                <polygon points="-16,11 -21,18 -11,13" fill="#ffffff" />
                <polygon points="-10,12 -14,20 -5,14" fill="#ffffff" />
                <polygon points="-4,13 -8,21 1,15" fill="#ffffff" />
                <polygon points="2,14 0,22 7,16" fill="#ffffff" />
                <polygon points="8,15 6,23 13,17" fill="#ffffff" />
                <polygon points="14,16 12,24 19,18" fill="#ffffff" />

                {/* Lower Jaw Teeth */}
                <polygon points="-18,22 -12,14 -13,24" fill="#ffffff" />
                <polygon points="-10,24 -5,16 -5,26" fill="#ffffff" />
                <polygon points="-2,26 3,18 3,28" fill="#ffffff" />
                <polygon points="5,28 10,20 10,30" fill="#ffffff" />

                {/* =========================================================================
                    9. MAJESTIC SLEEK BACKWARD DRAGON HORNS (NO ANTENNAE!)
                   ========================================================================= */}
                <g className="sweeping-horns">
                  {/* Primary Crown Horn Left (Gracefully Curved Backward along Neck) */}
                  <path d="M 40 12 C 25 -10 5 -36 -25 -52 L -15 -56 C 12 -36 30 -6 42 8 Z" fill="#260404" />
                  {/* Primary Crown Horn Right */}
                  <path d="M 48 10 C 35 -12 15 -38 -12 -54 L -2 -58 C 22 -38 38 -8 50 6 Z" fill="#7f1d1d" />

                  {/* Cheek Spine Left */}
                  <polygon points="30,22 12,18 26,30" fill="#991b1b" />
                  {/* Cheek Spine Right */}
                  <polygon points="38,20 22,12 34,26" fill="#450a0a" />
                </g>

                {/* =========================================================================
                    10. FIERCE GLOWING DRAGON EYE WITH DARK BROW RIDGE
                   ========================================================================= */}
                <g className="dragon-eye">
                  <ellipse cx="28" cy="8" rx="8" ry="5" fill="#f59e0b" />
                  <polygon points="28,3 30,8 28,13 26,8" fill="#000000" />
                  <circle cx="25" cy="6" r="1.8" fill="#ffffff" />
                  {/* Dark Brow Shadow Ridge */}
                  <polygon points="18,2 38,4 36,7 20,5" fill="#260404" />
                </g>
              </g>

              {/* =========================================================================
                  11. FRONT CLAW ARM & TALONS
                 ========================================================================= */}
              <g className="dragon-front-arm">
                <path d="M 85 115 L 50 148 L 30 140 Q 60 110 85 115 Z" fill="#991b1b" />
                <polygon points="30,140 15,150 27,136" fill="#ffffff" />
                <polygon points="33,143 19,154 30,139" fill="#ffffff" />
                <polygon points="36,146 23,157 33,142" fill="#ffffff" />
              </g>

            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
