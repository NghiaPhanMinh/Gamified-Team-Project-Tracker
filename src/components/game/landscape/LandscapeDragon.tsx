type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
};

export function LandscapeDragon({ bossHpPercent, isDefeated }: LandscapeDragonProps) {
  // Anchor dragon on far-right end of the 1000x400 viewBox canvas (x = 740 to 940)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const dragonX = 740 + damageClearedFraction * 60;

  return (
    <div className="landscape-layer layer-8-dragon" aria-label={`Epic Medieval Red Dragon (${bossHpPercent}% HP left)`}>
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        {/* Dragon Group anchored on Far-Right End */}
        <g
          transform={`translate(${dragonX}, 150)`}
          className={`dragon-group ${isDefeated ? "dragon-defeated" : ""}`}
          style={{ opacity: isDefeated ? 0.35 : 1 }}
        >
          {/* Gentle Flying Hovering Animation (up and down translate) */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-12; 0,0"
              dur="3.2s"
              repeatCount="indefinite"
            />

            {/* --- EPIC CLASSIC MEDIEVAL RED DRAGON (PURE VECTOR SHAPES, NO PLATYPUS TAIL!) --- */}
            <g transform="scale(0.65)">

              {/* --- BACKGROUND BAT WING 1 (LEFT/BACK WING - BEHIND BODY) --- */}
              <g className="dragon-wing-left">
                {/* Main Wing Membrane */}
                <path
                  d="M 120 100 Q 200 -50 280 -60 Q 230 10 190 60 Q 150 40 120 100 Z"
                  fill="#581c87"
                />
                <path
                  d="M 280 -60 Q 240 -10 200 40 Q 160 30 120 100 Q 180 50 280 -60 Z"
                  fill="#3b0764"
                />
                {/* Bone Struts */}
                <path d="M 120 100 L 280 -60 M 120 100 L 230 10 M 120 100 L 190 60" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
                {/* Wing Claw Spur */}
                <polygon points="280,-60 292,-72 284,-48" fill="#ef4444" />
              </g>

              {/* --- BACKGROUND BAT WING 2 (RIGHT/BACK WING - BEHIND HEAD) --- */}
              <g className="dragon-wing-right">
                <path
                  d="M 110 105 Q 10 -40 -30 -50 Q 20 10 70 70 Q 90 50 110 105 Z"
                  fill="#3b0764"
                />
                <path d="M 110 105 L -30 -50 M 110 105 L 20 10" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="-30,-50 -42,-62 -34,-38" fill="#ef4444" />
              </g>

              {/* --- TAPERED LONG DRAGON TAIL WITH ARROWHEAD SPEAR TIP (NO PLATYPUS TAIL!) --- */}
              <g className="dragon-tail">
                {/* Smooth Tapered S-Curve Tail */}
                <path
                  d="M 170 145 Q 230 150 260 185 Q 280 220 250 240 Q 230 250 220 230 Q 235 210 210 185 Q 180 165 170 145 Z"
                  fill="#7f1d1d"
                />
                {/* Underbelly Tail Tone */}
                <path d="M 250 240 Q 230 250 220 230 Q 235 210 250 240 Z" fill="#991b1b" />
                {/* Sharp Barbed Spear Tail Tip */}
                <polygon points="220,230 195,248 210,220" fill="#dc2626" />
                <polygon points="220,230 200,215 215,225" fill="#ef4444" />
              </g>

              {/* --- BACK DORSAL SPINE PLATES (Along Back Curve) --- */}
              <g className="dragon-spines">
                <polygon points="40,40 30,22 48,34" fill="#dc2626" />
                <polygon points="65,65 58,45 74,58" fill="#dc2626" />
                <polygon points="95,90 90,70 105,84" fill="#dc2626" />
                <polygon points="128,112 125,92 138,106" fill="#dc2626" />
                <polygon points="160,132 158,112 170,126" fill="#dc2626" />
              </g>

              {/* --- BACK HIND LEG & CLAWS --- */}
              <g className="dragon-back-leg">
                <path d="M 155 140 Q 190 170 175 215 L 148 220 Q 130 200 155 140 Z" fill="#450a0a" />
                <polygon points="148,220 132,232 144,215" fill="#ffffff" />
                <polygon points="152,222 138,235 150,217" fill="#ffffff" />
              </g>

              {/* --- MUSCULAR CRIMSON & OBSIDIAN TORSO BODY --- */}
              <path
                d="M 60 110 Q 120 70 185 105 Q 195 170 145 185 Q 75 190 60 110 Z"
                fill="#7f1d1d"
              />

              {/* Chest Scales & Golden Flame Core */}
              <path d="M 70 125 Q 100 155 140 150 Q 120 178 75 160 Z" fill="#dc2626" />
              <path d="M 80 138 Q 105 162 132 156 Q 115 178 85 168 Z" fill="#f59e0b" />

              {/* --- FRONT HIND LEG & TALONS --- */}
              <g className="dragon-front-leg">
                <path d="M 145 140 Q 185 170 165 220 L 138 225 Q 120 200 145 140 Z" fill="#991b1b" />
                <polygon points="138,225 118,238 132,220" fill="#ffffff" />
                <polygon points="142,227 125,241 138,222" fill="#ffffff" />
                <polygon points="146,229 130,243 144,224" fill="#ffffff" />
              </g>

              {/* --- TERRIFYING DRAGON HEAD & SLEEK BACKWARD CURVED HORNS --- */}
              <g className="dragon-head">
                {/* Powerful S-Curved Neck */}
                <path
                  d="M 75 125 Q 40 95 35 60 Q 20 35 55 25 Q 80 45 88 105 Z"
                  fill="#7f1d1d"
                />

                {/* Wedge-Shaped Skull & Predatory Snout */}
                <path
                  d="M 50 28 L -18 12 L 10 -2 L 62 14 Z"
                  fill="#991b1b"
                />

                {/* Protruding Nostril Ridge */}
                <ellipse cx="-6" cy="8" rx="4" ry="2.5" fill="#450a0a" />

                {/* Open Aggressive Lower Jaw */}
                <path
                  d="M 40 42 L -20 26 L 10 50 Z"
                  fill="#7f1d1d"
                />

                {/* Fiery Inner Mouth Cavity */}
                <polygon points="32,36 -12,24 8,38" fill="#450a0a" />

                {/* SHARP FULL SET OF WHITE FANGS (Inside Jaw) */}
                <polygon points="-10,14 -16,22 -5,16" fill="#ffffff" />
                <polygon points="-4,15 -8,24 1,17" fill="#ffffff" />
                <polygon points="2,16 0,25 7,18" fill="#ffffff" />
                <polygon points="8,17 6,26 13,19" fill="#ffffff" />
                <polygon points="14,18 12,27 19,20" fill="#ffffff" />

                <polygon points="-14,26 -8,18 -9,28" fill="#ffffff" />
                <polygon points="-6,28 -1,20 -1,30" fill="#ffffff" />
                <polygon points="1,30 6,22 6,32" fill="#ffffff" />

                {/* TWO SLEEK BACKWARD-CURVED DRAGON HORNS (Classic Medieval Dragon) */}
                <path d="M 42 14 C 28 -8 10 -32 -18 -48 L -8 -52 C 18 -32 34 -4 44 10 Z" fill="#450a0a" />
                <path d="M 50 12 C 38 -10 20 -34 -6 -50 L 2 -54 C 26 -34 42 -6 52 8 Z" fill="#991b1b" />

                {/* FIERCE GLOWING YELLOW/CRIMSON DRAGON EYE WITH SLIT PUPIL */}
                <ellipse cx="32" cy="10" rx="8" ry="5" fill="#f59e0b" />
                <polygon points="32,5 34,10 32,15 30,10" fill="#000000" />
                <circle cx="29" cy="8" r="1.8" fill="#ffffff" />
                {/* Eyebrow Ridge */}
                <polygon points="22,4 42,6 40,9 24,7" fill="#450a0a" />
              </g>

              {/* --- FRONT CLAW ARM & TALONS --- */}
              <g className="dragon-front-arm">
                <path d="M 90 120 L 55 155 L 35 148 Q 65 115 90 120 Z" fill="#991b1b" />
                <polygon points="35,148 20,158 32,144" fill="#ffffff" />
                <polygon points="38,151 24,162 35,147" fill="#ffffff" />
                <polygon points="41,154 28,165 38,150" fill="#ffffff" />
              </g>

            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
