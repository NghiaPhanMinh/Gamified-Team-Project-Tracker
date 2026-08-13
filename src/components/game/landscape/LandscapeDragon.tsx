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

            {/* --- SLENDER & MUSCULAR DRAGON WITH CLEAN ALIGNMENT, 100+ VECTOR SHAPES --- */}
            <g transform="scale(0.68)">

              {/* =========================================================================
                  1. LEFT / BACK SWEEPING FLAPPING BAT WING (Same Red Color as Body)
                 ========================================================================= */}
              <g className="dragon-back-wing" transform-origin="120 110">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0; -15; 0"
                  dur="1.8s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                {/* Wing Membrane Panels */}
                <path d="M 120 110 Q 180 -40 320 -70 Q 250 10 210 70 Q 160 50 120 110 Z" fill="#7f1d1d" />
                <path d="M 320 -70 Q 270 20 230 85 Q 180 80 120 110 Q 200 10 320 -70 Z" fill="#991b1b" />
                <path d="M 230 85 Q 180 40 120 110 Q 170 80 230 85 Z" fill="#450a0a" />

                {/* Wing Finger Bone Struts */}
                <path d="M 120 110 Q 220 -20 320 -70" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M 120 110 Q 185 10 230 85" stroke="#b91c1c" strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Wing Joint & Claw */}
                <circle cx="320" cy="-70" r="5" fill="#f97316" />
                <polygon points="320,-70 334,-84 324,-58" fill="#ea580c" />
              </g>

              {/* =========================================================================
                  2. RIGHT / FRONT SWEEPING FLAPPING BAT WING (Same Red Color as Body)
                 ========================================================================= */}
              <g className="dragon-front-wing" transform-origin="110 115">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0; 15; 0"
                  dur="1.8s"
                  repeatCount="indefinite"
                  additive="sum"
                />
                {/* Front Membrane Panels */}
                <path d="M 110 115 Q 10 -40 -80 -60 Q 0 15 50 80 Q 80 60 110 115 Z" fill="#991b1b" />
                <path d="M -80 -60 Q -10 35 30 100 Q 70 85 130 125 Z" fill="#7f1d1d" />
                <path d="M 30 100 Q 65 60 130 125 Q 75 95 30 100 Z" fill="#450a0a" />

                {/* Front Bone Struts */}
                <path d="M 110 115 Q 20 10 -80 -60" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round" fill="none" />
                <path d="M 110 115 Q 50 30 30 100" stroke="#991b1b" strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Wrist Joint & Claw */}
                <circle cx="-70" cy="-50" r="5" fill="#f97316" />
                <polygon points="-70,-50 -85,-65 -74,-38" fill="#ea580c" />
              </g>

              {/* =========================================================================
                  3. SLIM POINTY TAPERED TAIL WITH TRIPLE BARBED BLADE TIP (Clean Alignment)
                 ========================================================================= */}
              <g className="dragon-tail">
                {/* Slim Segment 1 */}
                <path d="M 160 150 Q 220 160 255 190 L 240 215 Q 215 190 165 175 Z" fill="#7f1d1d" />
                {/* Slim Segment 2 */}
                <path d="M 255 190 Q 285 225 265 260 L 245 255 Q 260 235 240 215 Z" fill="#991b1b" />
                {/* Slim Segment 3 */}
                <path d="M 265 260 Q 240 280 205 270 L 210 255 Q 235 262 245 255 Z" fill="#b91c1c" />

                {/* Underbelly tail shadow */}
                <path d="M 245 255 Q 235 262 205 270 Q 220 285 245 255 Z" fill="#450a0a" />

                {/* Barbed tip */}
                <polygon points="205,270 170,290 192,260" fill="#dc2626" />
                <polygon points="205,270 182,252 196,263" fill="#ea580c" />
                <polygon points="205,270 188,285 198,272" fill="#f97316" />

                {/* Spines */}
                <polygon points="230,170 242,158 238,175" fill="#dc2626" />
                <polygon points="275,215 290,208 280,225" fill="#dc2626" />
                <polygon points="255,262 268,272 250,268" fill="#dc2626" />
              </g>

              {/* =========================================================================
                  4. DORSAL SPINE CREST PLATES (Along Spine)
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
                  5. BACK HIND LEG (RIGGED JOINTS - BIGGER & THICKER)
                 ========================================================================= */}
              <g className="dragon-back-leg">
                {/* Bigger Thigh/Quad */}
                <path d="M 150 145 C 205 160 210 205 185 215 C 145 205 140 180 150 145 Z" fill="#450a0a" />
                {/* Large Knee Cap */}
                <circle cx="185" cy="215" r="14" fill="#310606" />
                {/* Thicker Calf/Shin */}
                <path d="M 185 215 L 165 255 L 140 248 L 170 208 Z" fill="#450a0a" />
                {/* Large Ankle */}
                <circle cx="165" cy="255" r="9" fill="#1c0303" />
                {/* Foot */}
                <path d="M 165 255 L 125 264 L 128 252 L 158 246 Z" fill="#450a0a" />
                {/* 3 Larger White Claws */}
                <polygon points="125,264 102,276 120,256" fill="#ffffff" />
                <polygon points="128,266 108,280 125,258" fill="#ffffff" />
                <polygon points="132,268 114,284 130,260" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  6. PROPORTIONATE MUSCULAR TORSO & MULTI-LAYERED CHEST ARMOR
                 ========================================================================= */}
              <g className="dragon-torso">
                <path d="M 50 110 C 115 65 200 100 185 180 C 145 210 70 195 50 110 Z" fill="#7f1d1d" />
                <path d="M 150 135 C 195 150 185 195 140 185 Z" fill="#580e0e" />
                <path d="M 105 75 C 175 110 175 185 125 195 C 155 155 138 100 105 75 Z" fill="#450a0a" />

                {/* Chest Plates */}
                <path d="M 58 122 C 92 150 135 145 150 135 Q 130 170 66 152 Z" fill="#b91c1c" />
                <path d="M 64 132 C 94 158 130 152 142 142 Q 122 174 72 160 Z" fill="#dc2626" />
                <path d="M 70 142 C 98 165 125 158 135 148 Q 115 178 78 166 Z" fill="#ea580c" />
                <path d="M 76 152 C 100 170 120 164 128 154 Q 110 182 84 172 Z" fill="#f97316" />
                <path d="M 82 162 C 102 176 116 170 122 160 Q 106 186 90 178 Z" fill="#fef08a" />
              </g>

              {/* =========================================================================
                  7. FRONT HIND LEG (ANATOMICAL RIGGED JOINTS - BIGGER & THICKER)
                 ========================================================================= */}
              <g className="dragon-front-leg">
                {/* Bigger Thigh/Quad */}
                <path d="M 145 150 C 195 165 198 210 175 220 C 135 210 132 185 145 150 Z" fill="#991b1b" />
                {/* Large Knee */}
                <circle cx="175" cy="220" r="14" fill="#7f1d1d" />
                {/* Thicker Calf */}
                <path d="M 175 220 L 155 260 L 130 252 L 160 212 Z" fill="#991b1b" />
                {/* Large Ankle */}
                <circle cx="155" cy="260" r="9" fill="#580e0e" />
                {/* Foot */}
                <path d="M 155 260 L 115 270 L 118 258 L 148 252 Z" fill="#991b1b" />
                {/* 3 Larger Claws */}
                <polygon points="115,270 92,284 110,262" fill="#ffffff" />
                <polygon points="118,272 98,288 114,264" fill="#ffffff" />
                <polygon points="122,274 104,292 118,266" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  8. RIGGED FRONT ARM (SHOULDER, BICEP, FOREARM, HAND - BIGGER)
                 ========================================================================= */}
              <g className="dragon-front-arm">
                {/* Larger Shoulder */}
                <circle cx="95" cy="120" r="15" fill="#991b1b" />
                {/* Thicker Bicep */}
                <path d="M 95 120 L 60 155 L 45 145 L 82 112 Z" fill="#991b1b" />
                {/* Large Elbow */}
                <circle cx="60" cy="155" r="9" fill="#7f1d1d" />
                {/* Thicker Forearm */}
                <path d="M 60 155 L 30 148 L 28 135 L 52 142 Z" fill="#991b1b" />
                {/* Hand */}
                <circle cx="30" cy="148" r="7" fill="#7f1d1d" />
                {/* Claws */}
                <polygon points="30,148 10,160 24,142" fill="#ffffff" />
                <polygon points="32,150 14,164 26,144" fill="#ffffff" />
              </g>

              {/* =========================================================================
                  9. MUSCULAR S-CURVED NECK & GAPLESS THROAT COLLAR (Clean Alignment)
                 ========================================================================= */}
              <g className="dragon-head-neck">
                <path d="M 70 125 Q 35 90 30 55 Q 15 30 52 18 Q 80 38 86 102 Z" fill="#7f1d1d" />
                <path d="M 35 90 Q 30 55 15 30 Q 30 35 48 60 Z" fill="#991b1b" />

                {/* Throat plates */}
                <path d="M 30 55 Q 50 35 70 48 Q 50 65 30 55 Z" fill="#580e0e" />
                <path d="M 34 68 Q 54 52 74 66 Q 54 80 34 68 Z" fill="#450a0a" />
                <path d="M 38 82 Q 58 68 78 82 Q 58 95 38 82 Z" fill="#310606" />

                {/* =========================================================================
                    10. PREDATOR SKULL WITH WEBBED FACIAL TISSUE IN MOUTH
                   ========================================================================= */}
                <path d="M 48 20 L -24 5 L 8 -10 L 62 8 Z" fill="#991b1b" />

                {/* Webbed Mouth Facial Tissue (Connecting upper & lower jaw back) */}
                <path d="M 28 20 Q 20 28 8 36 Q 22 38 28 20 Z" fill="#b91c1c" opacity="0.85" />

                {/* Snout */}
                <polygon points="-24,5 -8,-1 5,-7 -17,0" fill="#7f1d1d" />
                <ellipse cx="-12" cy="2" rx="4" ry="2.2" fill="#260404" />

                {/* Lower Jaw */}
                <path d="M 38 34 L -26 18 L 8 42 Z" fill="#7f1d1d" />

                {/* Inner Mouth */}
                <polygon points="30,28 -18,16 6,34" fill="#450a0a" />

                {/* Fangs */}
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

                {/* =========================================================================
                    11. LIGHTNING HORNS BEHIND THE HEAD (Jagged bolt shape pointing back)
                   ========================================================================= */}
                <g className="lightning-horns" transform="translate(42, 6)">
                  {/* Lightning Horn 1 (Gracefully sweeps back with jagged edges) */}
                  <path d="M 0 0 L -25 -28 L -15 -28 L -38 -55 L -10 -35 L -20 -35 Z" fill="#450a0a" />
                  {/* Lightning Horn 2 */}
                  <path d="M 6 -4 L -19 -32 L -9 -32 L -32 -59 L -4 -39 L -14 -39 Z" fill="#7f1d1d" transform="translate(4, -2)" />
                </g>

                {/* Spines */}
                <polygon points="42,8 55,-4 58,10" fill="#7f1d1d" />
                <polygon points="30,18 12,14 26,26" fill="#991b1b" />
                <polygon points="38,16 22,8 34,22" fill="#450a0a" />

                {/* Eye */}
                <ellipse cx="28" cy="4" rx="8" ry="5" fill="#f59e0b" />
                <polygon points="28,-1 30,4 28,9 26,4" fill="#000000" />
                <circle cx="25" cy="2" r="1.8" fill="#ffffff" />
                <polygon points="18,-2 38,0 36,3 20,1" fill="#260404" />
              </g>

              {/* =========================================================================
                  12. FRONT CLAW ARM & TALONS (BIGGER)
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
