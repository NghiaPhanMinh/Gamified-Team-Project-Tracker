type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
};

export function LandscapeDragon({ bossHpPercent, isDefeated }: LandscapeDragonProps) {
  // Anchor dragon on far-right end of the 1000x400 viewBox canvas (x = 740 to 940, y = 160 to 300)
  // HP clears: shifts slightly right on repel (from x=740 at 100% HP to x=820 at 0% HP)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const dragonX = 740 + damageClearedFraction * 70;

  return (
    <div className="landscape-layer layer-8-dragon" aria-label={`Medieval dragon raiding village (${bossHpPercent}% HP left)`}>
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <g
          transform={`translate(${dragonX}, 160)`}
          className={`dragon-group ${isDefeated ? "dragon-defeated" : ""}`}
          style={{ opacity: isDefeated ? 0.35 : 1 }}
        >
          {/* Dragon Scaled to Balanced Medieval Size (Width ~190, Height ~150) */}
          <g transform="scale(0.65)" className="medieval-dragon-svg">

            {/* --- BACKGROUND WING 1: Left Bat Wing (BEHIND Body & Head Z-layer) --- */}
            <g className="dragon-wing-left" transform="translate(10, -10)">
              <path
                d="M 130 100 L 260 -25 L 230 25 Q 205 35 180 70 Q 150 80 130 100 Z"
                fill="#0b0f17"
                stroke="#020617"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <line x1="130" y1="100" x2="260" y2="-25" stroke="#334155" strokeWidth="3" />
              <polygon points="260,-25 274,-35 262,-15" fill="#ef4444" stroke="#020617" strokeWidth="1.5" />
            </g>

            {/* --- BACKGROUND WING 2: Right Bat Wing (BEHIND Head Z-layer) --- */}
            <g className="dragon-wing-right" transform="translate(-25, -15)">
              <path
                d="M 140 105 L 10 -20 L 50 30 Q 80 65 110 95 Z"
                fill="#1e293b"
                stroke="#020617"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <line x1="140" y1="105" x2="10" y2="-20" stroke="#020617" strokeWidth="3" />
              <polygon points="10,-20 0,-28 8,-12" fill="#ef4444" stroke="#020617" strokeWidth="1.5" />
            </g>

            {/* --- Seamless Reattached Barbed Tail --- */}
            <g className="dragon-tail">
              <path
                d="M 190 150 C 240 155 275 175 265 215 C 255 240 215 235 200 205"
                fill="none"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path d="M 235 160 Q 260 175 268 200" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <path d="M 200 205 Q 190 195 182 203 Q 192 213 200 205 Z" fill="#ef4444" stroke="#020617" strokeWidth="2" />
            </g>

            {/* --- Back Spine Spikes --- */}
            <path
              d="M 42 22 Q 52 35 75 75 Q 110 100 165 112 Q 210 135 240 165"
              fill="none"
              stroke="#ef4444"
              strokeWidth="7"
              strokeDasharray="7 5"
              strokeLinecap="round"
            />

            {/* --- Back Leg --- */}
            <path d="M 185 155 Q 215 185 200 215 L 175 220" fill="none" stroke="#0f172a" strokeWidth="15" strokeLinecap="round" />

            {/* --- Main Torso Body --- */}
            <path
              d="M 75 125 Q 130 90 200 125 Q 215 175 160 190 Q 95 195 75 125 Z"
              fill="#1e293b"
              stroke="#020617"
              strokeWidth="4.5"
            />
            {/* Chest Scales */}
            <path d="M 85 140 Q 115 170 155 165" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            <path d="M 95 155 Q 120 180 150 176" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

            {/* --- Front Hind Leg --- */}
            <g className="dragon-front-leg">
              <path d="M 170 155 Q 205 185 190 220 L 160 225" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
              <path d="M 160 225 Q 148 234 140 238" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 164 227 Q 155 237 148 242" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* --- Menacing Dragon Head, Snout, Mouth & Horns (FOREGROUND 100% VISIBLE) --- */}
            <g className="dragon-head-group">
              {/* Thick Neck */}
              <path
                d="M 90 140 Q 48 110 40 68 Q 20 45 60 38 Q 92 60 102 120 Z"
                fill="#1e293b"
                stroke="#020617"
                strokeWidth="4.5"
              />

              {/* Protruding Snout & Upper Jaw */}
              <path
                d="M 50 42 L -6 24 L 20 12 L 64 30 Z"
                fill="#1e293b"
                stroke="#020617"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {/* Open Lower Jaw */}
              <path
                d="M 42 54 L -10 38 L 18 62 Z"
                fill="#1e293b"
                stroke="#020617"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Flame Cavity */}
              <polygon points="36,46 0,32 14,48" fill="#7f1d1d" />

              {/* Curved Fangs Inside Mouth */}
              <path d="M 6 28 Q 4 35 8 34" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M 14 30 Q 12 38 16 36" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M 22 32 Q 20 40 24 38" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />

              {/* Head Horns */}
              <path d="M 45 28 C 30 10 10 -10 -2 -22 C 14 -10 28 3 42 20 Z" fill="#ef4444" stroke="#020617" strokeWidth="2.5" />
              <path d="M 54 26 C 44 6 26 -16 12 -28 C 28 -16 44 2 52 18 Z" fill="#ef4444" stroke="#020617" strokeWidth="2.5" />

              {/* Slitted Glowing Eye */}
              <ellipse cx="36" cy="22" rx="8" ry="6" fill="#f59e0b" stroke="#020617" strokeWidth="2" />
              <ellipse cx="36" cy="22" rx="2" ry="5" fill="#020617" />
              <circle cx="34" cy="20" r="1.8" fill="#fff" />
            </g>

            {/* --- Front Claw Arm --- */}
            <g className="dragon-front-arm">
              <path d="M 105 140 L 72 175 L 50 168" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 50 168 Q 38 174 34 180" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 53 171 Q 42 179 38 186" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
            </g>

          </g>
        </g>
      </svg>
    </div>
  );
}
