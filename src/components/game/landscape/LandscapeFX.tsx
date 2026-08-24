import { useMemo } from "react";

type ActiveCombatEvent = {
  id: string;
  attackerName: string;
  damage: number;
  spellType?: string;
  target?: "goblin" | "dragon" | "all";
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
  const isAll = spell === "all";
  const isLightning = isAll || spell === "lightning" || spell === "spark";
  const isFire = isAll || spell === "fire";
  const isIce = isAll || spell === "ice" || spell === "water" || (!isLightning && !isFire);

  const attackTargets = useMemo(() => {
    if (!activeEvent) return [];
    if (activeEvent.spellType === "all" || activeEvent.target === "all") {
      return [
        { id: "goblin-0", x: 505, y: 290, scale: 0.85 },
        { id: "goblin-1", x: 550, y: 302, scale: 0.85 },
        { id: "goblin-2", x: 595, y: 290, scale: 0.85 },
        { id: "goblin-3", x: 640, y: 302, scale: 0.85 },
        { id: "dragon-boss", x: 750, y: 175, scale: 2.2 },
      ];
    }
    if (activeEvent.target === "goblin") {
      return [
        {
          id: "goblin-target",
          x: activeEvent.targetX ?? 505,
          y: activeEvent.targetY ?? 290,
          scale: 0.85,
        },
      ];
    }
    return [
      {
        id: "dragon-boss",
        x: activeEvent.targetX ?? 750,
        y: activeEvent.targetY ?? 175,
        scale: 2.2,
      },
    ];
  }, [activeEvent]);

  return (
    <div className="landscape-layer layer-9-fx" aria-hidden="true">
      <div className="ambient-combat-exchange" style={{ opacity: 0.88, position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          {/* =========================================================================
              1. VILLAGE ARROW VOLLEY (Fires every 10s upwards from watchtower x=160, y=210 to sky intercept x=475, y=150)
              ========================================================================= */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="160 210; 310 180; 475 150; 475 150"
              keyTimes="0; 0.12; 0.20; 1"
              dur="10s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0; 1; 1; 0; 0"
              keyTimes="0; 0.02; 0.19; 0.21; 1"
              dur="10s"
              repeatCount="indefinite"
            />
            {/* Arrows tilted upwards pointing towards the dragon fire intercept */}
            <g transform="rotate(-11)">
              {/* Lead Arrow */}
              <line x1="0" y1="0" x2="34" y2="0" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="34,0 26,-4 26,4" fill="#ef4444" />
              {/* Flanking Arrow Top */}
              <line x1="-15" y1="-10" x2="18" y2="-10" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <polygon points="18,-10 11,-14 11,-6" fill="#ef4444" />
              {/* Flanking Arrow Bottom */}
              <line x1="-12" y1="10" x2="20" y2="10" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
              <polygon points="20,10 13,6 13,14" fill="#ef4444" />
            </g>
          </g>

          {/* =========================================================================
              2. DRAGON SNOUT FIRE BREATH (Fires every 10s straight from mouth x=705, y=160 to sky intercept x=475, y=150)
              ========================================================================= */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="705 160; 590 155; 475 150; 475 150"
              keyTimes="0; 0.12; 0.20; 1"
              dur="10s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0; 1; 1; 0; 0"
              keyTimes="0; 0.02; 0.19; 0.21; 1"
              dur="10s"
              repeatCount="indefinite"
            />
            {/* Clean Vector Flame Stream pointing forward towards left */}
            <g>
              {/* Core Yellow Fire */}
              <polygon points="0,0 -35,-10 -60,0 -35,10" fill="#fef08a" />
              {/* Vivid Orange Body */}
              <polygon points="15,-6 -25,-15 -50,-4 -20,6" fill="#f97316" />
              <polygon points="15,6 -25,-4 -50,6 -20,15" fill="#f97316" />
              {/* Outer Crimson Flames */}
              <polygon points="30,-8 -15,-20 -40,-6 -10,3" fill="#dc2626" />
              <polygon points="30,8 -15,-3 -40,10 -10,18" fill="#dc2626" />
            </g>
          </g>

          {/* =========================================================================
              3. HIGH SKY CLASH EXPLOSION AT INTERCEPT POINT (x=475, y=150) (Every 10s)
              ========================================================================= */}
          <g transform="translate(475, 150)">
            <animate
              attributeName="opacity"
              values="0; 0; 1; 0.9; 0; 0"
              keyTimes="0; 0.19; 0.21; 0.28; 0.34; 1"
              dur="10s"
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              values="0.2; 0.2; 1.6; 0.8; 0"
              keyTimes="0; 0.19; 0.21; 0.28; 0.34; 1"
              dur="10s"
              repeatCount="indefinite"
              additive="sum"
            />
            <circle cx="0" cy="0" r="26" fill="#fef08a" />
            <circle cx="0" cy="0" r="16" fill="#f97316" />
            <polygon points="0,-28 8,-10 28,0 8,10 0,28 -8,10 -28,0 -8,-10" fill="#e11d48" />
          </g>

          {/* =========================================================================
              4. ACTIVE PLAYER ELEMENTAL ATTACK SPELL ANIMATIONS
              ========================================================================= */}
          {activeEvent && (
            <>
              {attackTargets.map((target) => (
                <g key={target.id} transform={`translate(${target.x}, ${target.y}) scale(${target.scale})`}>
                  {/* --- LIGHTNING ATTACK: Thundercloud & Repeating Electric Bolt Strikes --- */}
                  {isLightning && (
                    <g>
                      {/* Thunder Storm Cloud */}
                      <g transform="translate(0, -65)">
                        <ellipse cx="-15" cy="0" rx="18" ry="10" fill="#1e293b" />
                        <ellipse cx="12" cy="-2" rx="16" ry="9" fill="#0f172a" />
                        <circle cx="0" cy="-6" r="14" fill="#334155" />
                        {/* Cloud Electric Sparks */}
                        <polygon points="-10,2 -6,8 -8,9 -4,15" fill="#fde047">
                          <animate attributeName="opacity" values="0.2; 1; 0.2" dur="0.25s" repeatCount="indefinite" />
                        </polygon>
                        <polygon points="8,2 12,8 10,9 14,14" fill="#67e8f9">
                          <animate attributeName="opacity" values="1; 0.2; 1" dur="0.3s" repeatCount="indefinite" />
                        </polygon>
                      </g>

                      {/* Jagged Lightning Bolt Strike crashing straight down */}
                      <g>
                        <animate attributeName="opacity" values="0.1; 1; 0.3; 1; 0.2; 1; 0.1" dur="0.5s" repeatCount="indefinite" />
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
                          <animate attributeName="rx" values="10; 26; 34" dur="0.5s" repeatCount="indefinite" />
                          <animate attributeName="ry" values="3; 8; 11" dur="0.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1; 0.6; 0" dur="0.5s" repeatCount="indefinite" />
                        </ellipse>
                      </g>
                    </g>
                  )}

                  {/* --- FIRE ATTACK: Towering Fire Column & Continuous Blazing Inferno --- */}
                  {isFire && (
                    <g>
                      {/* Swirling Flame Pillar */}
                      <g transform="translate(0, 15)">
                        {/* Layer 1: Crimson Base */}
                        <polygon points="-25,0 -16,-45 0,-70 16,-45 25,0 0,-15" fill="#dc2626">
                          <animateTransform attributeName="transform" type="scale" values="1,1; 1.15,1.25; 0.95,1; 1,1" dur="0.4s" repeatCount="indefinite" />
                        </polygon>
                        {/* Layer 2: Vivid Orange Core */}
                        <polygon points="-18,0 -10,-40 0,-60 10,-40 18,0 0,-10" fill="#f97316">
                          <animateTransform attributeName="transform" type="scale" values="1,1; 0.9,1.15; 1.1,1; 1,1" dur="0.35s" repeatCount="indefinite" />
                        </polygon>
                        {/* Layer 3: Blazing Yellow Center */}
                        <polygon points="-10,0 -5,-30 0,-48 5,-30 10,0 0,-5" fill="#fef08a">
                          <animateTransform attributeName="transform" type="scale" values="1,1; 1.2,1.3; 1,1; 1,1" dur="0.3s" repeatCount="indefinite" />
                        </polygon>
                      </g>

                      {/* Flying Burning Fire Sparks */}
                      <polygon points="-18,-50 -14,-56 -12,-52" fill="#fde047">
                        <animate attributeName="transform" type="translate" values="0,0; -12,-25" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1; 0.2; 1" dur="0.5s" repeatCount="indefinite" />
                      </polygon>
                      <polygon points="18,-45 22,-52 24,-47" fill="#fde047">
                        <animate attributeName="transform" type="translate" values="0,0; 14,-22" dur="0.45s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1; 0.2; 1" dur="0.45s" repeatCount="indefinite" />
                      </polygon>
                    </g>
                  )}

                  {/* --- ICE ATTACK: Blizzard Cloud & Glacial Ice Crystals --- */}
                  {isIce && (
                    <g>
                      {/* Frost Blizzard Cloud */}
                      <g transform="translate(0, -60)">
                        <ellipse cx="-12" cy="0" rx="16" ry="8" fill="#e0f2fe" opacity="0.8" />
                        <ellipse cx="12" cy="-2" rx="14" ry="7" fill="#bae6fd" opacity="0.85" />
                        <circle cx="0" cy="-5" r="12" fill="#ffffff" opacity="0.9" />
                        {/* Ice Shards falling */}
                        <polygon points="-8,10 -6,14 -8,18 -10,14" fill="#38bdf8">
                          <animate attributeName="opacity" values="0.3; 1; 0.3" dur="0.6s" repeatCount="indefinite" />
                        </polygon>
                        <polygon points="6,14 8,18 6,22 4,18" fill="#7dd3fc">
                          <animate attributeName="opacity" values="1; 0.3; 1" dur="0.5s" repeatCount="indefinite" />
                        </polygon>
                      </g>

                      {/* Giant Freezing Glacial Ice Spikes */}
                      <g transform="translate(0, 15)">
                        {/* Central Sharp Ice Peak */}
                        <polygon points="-12,0 0,-55 12,0" fill="#7dd3fc" opacity="0.85">
                          <animate attributeName="opacity" values="0.75; 0.95; 0.75" dur="0.7s" repeatCount="indefinite" />
                        </polygon>
                        <polygon points="-4,0 0,-55 8,-10" fill="#bae6fd" opacity="0.9" />
                        {/* Left Ice Shard */}
                        <polygon points="-24,0 -16,-38 -6,0" fill="#38bdf8" opacity="0.8" />
                        {/* Right Ice Shard */}
                        <polygon points="6,0 18,-42 26,0" fill="#38bdf8" opacity="0.8" />
                        {/* Front Crystal Facet */}
                        <polygon points="-8,-5 0,-32 8,-5 0,4" fill="#ffffff" opacity="0.85">
                          <animate attributeName="opacity" values="0.7; 1; 0.7" dur="0.4s" repeatCount="indefinite" />
                        </polygon>
                      </g>
                    </g>
                  )}
                </g>
              ))}
            </>
          )}
        </svg>
      </div>

      {/* Floating Damage Text on Dragon and Goblins */}
      {activeEvent && (
        <>
          <div
            key={activeEvent.id + "-boss"}
            className="floating-damage"
            style={{
              position: "absolute",
              left: "75%",
              top: "35%",
              fontSize: "1.4rem",
              fontWeight: 900,
              color: isLightning ? "#facc15" : isFire ? "#ef4444" : "#38bdf8",
              textShadow: "0 2px 4px #000",
              pointerEvents: "none",
            }}
          >
            -{activeEvent.damage} HP
          </div>
          <div
            key={activeEvent.id + "-goblin"}
            className="floating-damage"
            style={{
              position: "absolute",
              left: "54%",
              top: "52%",
              fontSize: "1.1rem",
              fontWeight: 900,
              color: isLightning ? "#facc15" : isFire ? "#ef4444" : "#38bdf8",
              textShadow: "0 2px 4px #000",
              pointerEvents: "none",
            }}
          >
            -100 HP
          </div>
        </>
      )}

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
