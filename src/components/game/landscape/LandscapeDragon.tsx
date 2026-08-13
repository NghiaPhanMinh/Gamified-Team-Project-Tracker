type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
};

export function LandscapeDragon({ bossHpPercent, isDefeated }: LandscapeDragonProps) {
  // Anchor dragon on far-right end of the 1000x400 viewBox canvas (x = 740 to 940)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const dragonX = 740 + damageClearedFraction * 60;

  return (
    <div className="landscape-layer layer-8-dragon" aria-label={`Terrifying medieval western dragon (${bossHpPercent}% HP left)`}>
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
              values="0,0; 0,-14; 0,0"
              dur="3.2s"
              repeatCount="indefinite"
            />

            {/* --- TERRIFYING WESTERN DRAGON (PURE VECTOR SHAPES WITHOUT OUTLINES) --- */}
            <g transform="scale(0.7)">

              {/* --- HUGE WESTERN BAT WING 1 (LEFT/BACK WING) --- */}
              <g className="dragon-wing-left" transform="translate(10, -20)">
                {/* Sprawling Wing Membrane */}
                <path
                  d="M 130 110 L 290 -45 C 240 -15 210 25 190 60 C 160 30 140 75 130 110 Z"
                  fill="#1e1b4b"
                />
                <path
                  d="M 290 -45 C 240 10 190 70 130 110"
                  fill="#2e1065"
                />
                {/* Wing Bone Finger Struts */}
                <path d="M 130 110 L 290 -45 L 230 35 L 180 80 Z" fill="#312e81" opacity="0.6" />
                {/* Sharp Wing Claw Tip */}
                <polygon points="290,-45 306,-58 292,-32" fill="#dc2626" />
              </g>

              {/* --- HUGE WESTERN BAT WING 2 (RIGHT/BACK WING) --- */}
              <g className="dragon-wing-right" transform="translate(-30, -25)">
                <path
                  d="M 140 115 L -20 -35 C 30 0 70 45 110 100 Z"
                  fill="#0f172a"
                />
                <path d="M -20 -35 L 45 25 L 90 80 Z" fill="#1e293b" opacity="0.7" />
                <polygon points="-20,-35 -34,-48 -22,-22" fill="#dc2626" />
              </g>

              {/* --- BARBED TAIL (Seamless Vector Base) --- */}
              <g className="dragon-tail">
                <path
                  d="M 180 155 C 235 160 280 185 270 225 C 255 255 210 245 195 210 Q 185 195 180 155 Z"
                  fill="#1e1b4b"
                />
                <polygon points="270,225 295,245 275,255 255,235" fill="#dc2626" />
              </g>

              {/* --- BACK DORSAL SPINES (No Outlines) --- */}
              <g className="dragon-dorsal-spines">
                <polygon points="50,30 40,10 60,25" fill="#dc2626" />
                <polygon points="75,55 68,35 85,50" fill="#dc2626" />
                <polygon points="105,80 100,60 118,75" fill="#dc2626" />
                <polygon points="140,105 138,85 152,100" fill="#dc2626" />
                <polygon points="175,130 178,110 188,125" fill="#dc2626" />
              </g>

              {/* --- BACK HIND LEG & SHARP CLAWS --- */}
              <g className="dragon-back-leg">
                <path d="M 175 150 Q 215 185 195 225 L 165 230 Q 145 210 175 150 Z" fill="#0f172a" />
                <polygon points="165,230 148,242 160,225" fill="#f8fafc" />
                <polygon points="170,232 156,246 167,227" fill="#f8fafc" />
              </g>

              {/* --- MAIN MUSCULAR TORSO BODY --- */}
              <path
                d="M 70 120 C 130 80 205 115 195 185 C 150 205 90 200 70 120 Z"
                fill="#312e81"
              />

              {/* Chest Scales (No Outlines) */}
              <path d="M 80 135 C 110 165 150 160 165 150 Q 140 185 85 170 Z" fill="#dc2626" />
              <path d="M 90 148 C 115 172 145 168 155 160 Q 135 188 95 178 Z" fill="#f59e0b" />

              {/* --- FRONT HIND LEG & TALON CLAWS --- */}
              <g className="dragon-front-leg">
                <path d="M 160 150 Q 200 185 180 230 L 150 235 Q 135 210 160 150 Z" fill="#1e1b4b" />
                <polygon points="150,235 130,248 145,230" fill="#ffffff" />
                <polygon points="155,237 138,252 152,232" fill="#ffffff" />
                <polygon points="160,239 146,254 158,234" fill="#ffffff" />
              </g>

              {/* --- TERRIFYING PREDATOR HEAD & DEER-LIKE ANTLER HORNS --- */}
              <g className="dragon-head">
                {/* Muscular Neck */}
                <path
                  d="M 85 135 C 45 105 35 65 55 35 C 85 55 98 115 85 135 Z"
                  fill="#312e81"
                />

                {/* Upper Skull & Protruding Snout */}
                <path
                  d="M 55 38 L -15 18 L 15 5 L 68 24 Z"
                  fill="#1e1b4b"
                />

                {/* Protruding Nostril Ridge */}
                <ellipse cx="-4" cy="14" rx="4" ry="2.5" fill="#090d16" />

                {/* Open Aggressive Lower Jaw */}
                <path
                  d="M 45 52 L -18 34 L 12 60 Z"
                  fill="#1e1b4b"
                />

                {/* Fiery Inner Mouth Cavity */}
                <polygon points="38,44 -10,32 10,46" fill="#991b1b" />

                {/* SHARP FULL SET OF WHITE TEETH (Inside Mouth Jaw Line) */}
                {/* Upper Jaw Teeth */}
                <polygon points="-8,20 -14,28 -3,22" fill="#ffffff" />
                <polygon points="-2,21 -6,30 3,23" fill="#ffffff" />
                <polygon points="4,22 1,31 9,24" fill="#ffffff" />
                <polygon points="10,23 8,32 15,25" fill="#ffffff" />
                <polygon points="16,24 14,33 21,26" fill="#ffffff" />
                <polygon points="22,25 20,34 27,27" fill="#ffffff" />

                {/* Lower Jaw Teeth */}
                <polygon points="-12,33 -6,25 -7,35" fill="#ffffff" />
                <polygon points="-4,35 1,27 1,37" fill="#ffffff" />
                <polygon points="3,37 8,29 8,39" fill="#ffffff" />
                <polygon points="10,39 15,31 15,41" fill="#ffffff" />

                {/* DEER-LIKE BRANCHING ANTLER HORNS (Top of Head) */}
                <g className="deer-antler-horns">
                  {/* Horn 1 (Main Beam & Tines) */}
                  <path d="M 48 24 C 32 4 12 -18 -8 -34 L -2 -38 C 18 -22 36 2 48 24 Z" fill="#7f1d1d" />
                  {/* Tine 1 */}
                  <polygon points="25,-8 10,-24 18,-12" fill="#dc2626" />
                  {/* Tine 2 */}
                  <polygon points="5,-22 -10,-38 -2,-28" fill="#dc2626" />

                  {/* Horn 2 (Secondary Beam & Tines) */}
                  <path d="M 58 22 C 46 2 28 -20 8 -36 L 14 -40 C 32 -24 48 0 58 22 Z" fill="#991b1b" />
                  {/* Tine 1 */}
                  <polygon points="36,-8 22,-24 30,-12" fill="#ef4444" />
                  {/* Tine 2 */}
                  <polygon points="18,-22 2,-38 10,-28" fill="#ef4444" />
                </g>

                {/* ANGRY GLOWING CRIMSON/YELLOW EYE WITH SLITTED PUPIL */}
                <ellipse cx="38" cy="18" rx="9" ry="6" fill="#f59e0b" />
                <polygon points="38,11 40,18 38,25 36,18" fill="#000000" />
                <circle cx="35" cy="16" r="2" fill="#ffffff" />
                {/* Angry Eyebrow Ridge */}
                <polygon points="26,11 48,13 46,16 28,14" fill="#0f172a" />
              </g>

              {/* --- FRONT ARM & TALONS --- */}
              <g className="dragon-front-arm">
                <path d="M 100 135 L 65 170 L 42 162 Q 75 130 100 135 Z" fill="#1e1b4b" />
                <polygon points="42,162 26,172 38,158" fill="#ffffff" />
                <polygon points="45,165 30,177 42,161" fill="#ffffff" />
                <polygon points="48,168 34,180 45,164" fill="#ffffff" />
              </g>

            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
