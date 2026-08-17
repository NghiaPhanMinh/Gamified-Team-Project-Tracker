type ActiveCombatEvent = {
  id: string;
  attackerName: string;
  damage: number;
  spellType?: string;
  target?: "goblin" | "dragon";
  targetX?: number;
  targetY?: number;
};

type LandscapeFXProps = {
  activeEvent: ActiveCombatEvent | null;
  isVictory: boolean;
};

export function LandscapeFX({ activeEvent, isVictory }: LandscapeFXProps) {
  // Elemental spell type resolution
  const spell = activeEvent?.spellType || "lightning";
  const isLightning = spell === "lightning" || spell === "spark";
  const isFire = spell === "fire";
  const isIce = !isLightning && !isFire; // ice / water / default

  const isGoblinTarget = activeEvent?.target === "goblin";
  const targetX = activeEvent?.targetX ?? (isGoblinTarget ? 535 : 760);
  const targetY = activeEvent?.targetY ?? (isGoblinTarget ? 275 : 185);
  const scaleFactor = isGoblinTarget ? 0.75 : 2.2;

  return (
    <div className="landscape-layer layer-9-fx" aria-hidden="true">
      <div className="ambient-combat-exchange" style={{ opacity: 0.85, position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          {/* =========================================================================
              1. VILLAGE ARROW VOLLEY (Shoots from watchtower x=160, y=210 to center x=500, y=235)
              ========================================================================= */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="160 210; 330 222; 495 235; 495 235"
              keyTimes="0; 0.28; 0.45; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0; 1; 1; 0; 0"
              keyTimes="0; 0.05; 0.43; 0.46; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            {/* 3 Flying Arrows */}
            <line x1="0" y1="0" x2="32" y2="2" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="32,2 24,-2 24,6" fill="#ef4444" />
            <line x1="-15" y1="-12" x2="16" y2="-10" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <polygon points="16,-10 9,-14 9,-6" fill="#ef4444" />
            <line x1="-12" y1="12" x2="18" y2="14" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
            <polygon points="18,14 11,10 11,18" fill="#ef4444" />
          </g>

          {/* =========================================================================
              2. DRAGON SNOUT FIRE BREATH (Spits directly from mouth x=705, y=165 to center x=505, y=235)
              ========================================================================= */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="705 165; 605 200; 505 235; 505 235"
              keyTimes="0; 0.28; 0.45; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0; 1; 1; 0; 0"
              keyTimes="0; 0.05; 0.43; 0.46; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            {/* Pure Vector Geometric Flame Tongues */}
            {/* Core Bright Yellow Fire */}
            <polygon points="-40,0 20,-12 45,0 20,12" fill="#fef08a" />
            {/* Middle Intense Orange Fire */}
            <polygon points="-25,-6 35,-16 55,-4 35,8" fill="#f97316" />
            <polygon points="-25,6 35,-4 55,8 35,16" fill="#f97316" />
            {/* Outer Crimson Ember Flames */}
            <polygon points="-10,-10 40,-22 65,-8 40,2" fill="#dc2626" />
            <polygon points="-10,10 40,-2 65,12 40,22" fill="#dc2626" />
          </g>

          {/* =========================================================================
              3. MID-FIELD CLASH EXPLOSION AT CENTER (x=500, y=235)
              ========================================================================= */}
          <g transform="translate(500, 235)">
            <animate
              attributeName="opacity"
              values="0; 0; 1; 0.8; 0; 0"
              keyTimes="0; 0.43; 0.46; 0.55; 0.62; 1"
              dur="3s"
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              values="0.2; 0.2; 1.5; 0.6; 0"
              keyTimes="0; 0.43; 0.46; 0.55; 0.62; 1"
              dur="3s"
              repeatCount="indefinite"
              additive="sum"
            />
            <circle cx="0" cy="0" r="24" fill="#fef08a" />
            <circle cx="0" cy="0" r="15" fill="#f97316" />
            <polygon points="0,-26 8,-9 26,0 8,9 0,26 -8,9 -26,0 -8,-9" fill="#e11d48" />
          </g>

          {/* =========================================================================
              4. ACTIVE PLAYER ELEMENTAL ATTACK SPELL ANIMATIONS (Lightning, Fire, Ice)
              ========================================================================= */}
          {activeEvent && (
            <g transform={`translate(${targetX}, ${targetY}) scale(${scaleFactor})`}>
              {/* --- LIGHTNING ATTACK: Thundercloud & Jagged Electric Bolt Strike --- */}
              {isLightning && (
                <g>
                  {/* Thunder Storm Cloud */}
                  <g transform="translate(0, -65)">
                    <ellipse cx="-15" cy="0" rx="18" ry="10" fill="#1e293b" />
                    <ellipse cx="12" cy="-2" rx="16" ry="9" fill="#0f172a" />
                    <circle cx="0" cy="-6" r="14" fill="#334155" />
                    {/* Cloud Electric Sparks */}
                    <polygon points="-10,2 -6,8 -8,9 -4,15" fill="#fde047">
                      <animate attributeName="opacity" values="0.2; 1; 0.2" dur="0.3s" repeatCount="indefinite" />
                    </polygon>
                    <polygon points="8,2 12,8 10,9 14,14" fill="#67e8f9">
                      <animate attributeName="opacity" values="1; 0.2; 1" dur="0.35s" repeatCount="indefinite" />
                    </polygon>
                  </g>

                  {/* Jagged Lightning Bolt Strike crashing straight down */}
                  <g>
                    <animate attributeName="opacity" values="0.1; 1; 0.4; 1; 0.2; 1" dur="0.4s" repeatCount="indefinite" />
                    {/* Outer Cyan Lightning Aura */}
                    <polygon
                      points="0,-65 -8,-35 -2,-34 -14,-5 4,-6 -4,22 10,22 2,-8 10,-8 0,-35 6,-35"
                      fill="#38bdf8"
                      opacity="0.75"
                    />
                    {/* Inner Intense Golden Lightning Core */}
                    <polygon
                      points="0,-65 -6,-35 -1,-34 -11,-5 3,-6 -3,20 8,20 1,-8 8,-8 0,-35 4,-35"
                      fill="#fef08a"
                    />
                  </g>

                  {/* Ground Electric Shockwave Burst */}
                  <g transform="translate(0, 18)">
                    <ellipse cx="0" cy="0" rx="22" ry="7" fill="none" stroke="#facc15" strokeWidth="2">
                      <animate attributeName="rx" values="10; 26; 32" dur="0.5s" repeatCount="indefinite" />
                      <animate attributeName="ry" values="3; 8; 10" dur="0.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1; 0.5; 0" dur="0.5s" repeatCount="indefinite" />
                    </ellipse>
                  </g>
                </g>
              )}

              {/* --- FIRE ATTACK: Towering Fire Column & Explosive Blast --- */}
              {isFire && (
                <g>
                  {/* Swirling Flame Pillar */}
                  <g transform="translate(0, 15)">
                    {/* Layer 1: Crimson Base */}
                    <polygon points="-25,0 -16,-45 0,-70 16,-45 25,0 0,-15" fill="#dc2626">
                      <animateTransform attributeName="transform" type="scale" values="1,1; 1.15,1.25; 0.95,1" dur="0.4s" repeatCount="indefinite" />
                    </polygon>
                    {/* Layer 2: Vivid Orange Core */}
                    <polygon points="-18,0 -10,-40 0,-60 10,-40 18,0 0,-10" fill="#f97316">
                      <animateTransform attributeName="transform" type="scale" values="1,1; 0.9,1.15; 1.1,1" dur="0.35s" repeatCount="indefinite" />
                    </polygon>
                    {/* Layer 3: Blazing Yellow Center */}
                    <polygon points="-10,0 -5,-30 0,-48 5,-30 10,0 0,-5" fill="#fef08a">
                      <animateTransform attributeName="transform" type="scale" values="1,1; 1.2,1.3; 1,1" dur="0.3s" repeatCount="indefinite" />
                    </polygon>
                  </g>

                  {/* Flying Burning Fire Sparks */}
                  <polygon points="-18,-50 -14,-56 -12,-52" fill="#fde047">
                    <animate attributeName="transform" type="translate" values="0,0; -10,-20" dur="0.6s" repeatCount="indefinite" />
                  </polygon>
                  <polygon points="18,-45 22,-52 24,-47" fill="#fde047">
                    <animate attributeName="transform" type="translate" values="0,0; 12,-18" dur="0.55s" repeatCount="indefinite" />
                  </polygon>
                </g>
              )}

              {/* --- ICE ATTACK: Blizzard Cloud & Freezing Glacial Crystals --- */}
              {isIce && (
                <g>
                  {/* Frost Blizzard Cloud */}
                  <g transform="translate(0, -60)">
                    <ellipse cx="-12" cy="0" rx="16" ry="8" fill="#e0f2fe" opacity="0.8" />
                    <ellipse cx="12" cy="-2" rx="14" ry="7" fill="#bae6fd" opacity="0.85" />
                    <circle cx="0" cy="-5" r="12" fill="#ffffff" opacity="0.9" />
                    {/* Snowflakes */}
                    <text x="-8" y="14" fill="#38bdf8" fontSize="8">❄</text>
                    <text x="6" y="18" fill="#7dd3fc" fontSize="7">❄</text>
                  </g>

                  {/* Giant Freezing Glacial Ice Spikes */}
                  <g transform="translate(0, 15)">
                    {/* Central Sharp Ice Peak */}
                    <polygon points="-12,0 0,-55 12,0" fill="#7dd3fc" opacity="0.85" />
                    <polygon points="-4,0 0,-55 8,-10" fill="#bae6fd" opacity="0.9" />
                    {/* Left Ice Shard */}
                    <polygon points="-24,0 -16,-38 -6,0" fill="#38bdf8" opacity="0.8" />
                    {/* Right Ice Shard */}
                    <polygon points="6,0 18,-42 26,0" fill="#38bdf8" opacity="0.8" />
                    {/* Front Crystal Facet */}
                    <polygon points="-8,-5 0,-32 8,-5 0,4" fill="#ffffff" opacity="0.85" />
                  </g>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Floating Damage Text */}
      {activeEvent ? (
        <div
          key={activeEvent.id}
          className="floating-damage"
          style={{
            position: "absolute",
            left: `${isGoblinTarget ? 54 : (targetX / 10)}%`,
            top: `${isGoblinTarget ? 50 : 35}%`,
            fontSize: "1.4rem",
            fontWeight: 900,
            color: isLightning ? "#facc15" : isFire ? "#ef4444" : "#38bdf8",
            textShadow: "0 2px 4px #000",
            pointerEvents: "none",
          }}
        >
          -{activeEvent.damage} HP
        </div>
      ) : null}

      {/* Victory Particle Burst on Final Blow */}
      {isVictory ? (
        <svg viewBox="0 0 1000 400" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(800, 80)">
            <circle cx="0" cy="0" r="8" fill="#facc15" opacity="0.8" />
            <polygon points="0,-15 5,-5 15,0 5,5 0,15 -5,5 -15,0 -5,-5" fill="#facc15" />
            <polygon points="-30,-30 -20,-25 -25,-15" fill="#ef4444" />
            <polygon points="30,-40 25,-25 40,-30" fill="#38bdf8" />
          </g>
        </svg>
      ) : null}
    </div>
  );
}
