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
  goblins?: Array<{ id: string; memberId?: string }>;
};

export function LandscapeFX({ activeEvent, isVictory, goblins = [] }: LandscapeFXProps) {
  // Elemental spell type resolution
  const spell = (activeEvent?.spellType || "lightning").toLowerCase().trim();
  const isAll = spell === "all" || activeEvent?.spellType === "all" || activeEvent?.target === "all";
  const isLightning = isAll || spell === "lightning" || spell === "spark";
  const isFire = isAll || spell === "fire";
  const isIce = isAll || spell === "ice" || spell === "water" || (!isLightning && !isFire);

  const attackTargets = useMemo(() => {
    if (!activeEvent) return [];
    const targets = [];
    const goblinList = goblins.length > 0 ? goblins : [{ id: "g0" }, { id: "g1" }];

    if (activeEvent.target === "goblin" || activeEvent.target === "all" || isAll) {
      goblinList.forEach((goblin, i) => {
        const gx = 490 + i * 45 + 15;
        const gy = 270 + (i % 2) * 12 + 18;
        targets.push({
          id: `goblin-target-${goblin.id || i}`,
          x: gx,
          y: gy,
          scale: 0.85,
        });
      });
    }

    if (activeEvent.target === "dragon" || activeEvent.target === "all" || isAll || !activeEvent.target) {
      targets.push({
        id: "dragon-boss",
        x: activeEvent.targetX ?? 750,
        y: activeEvent.targetY ?? 175,
        scale: 2.2,
      });
    }

    return targets;
  }, [activeEvent, goblins, isAll]);

  return (
    <div className="landscape-layer layer-9-fx" aria-hidden="true">
      <div className="ambient-combat-exchange" style={{ opacity: 0.88, position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          {/* Section 2: Combat Exchange - Background Magical Sparkles */}
          <g>
            {/* Ambient Wizard Sparkles rising across battlefield */}
            <circle cx="340" cy="270" r="1.5" fill="#38bdf8" opacity="0.6">
              <animate attributeName="cy" values="270; 240; 270" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2; 0.8; 0.2" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="380" cy="260" r="2" fill="#facc15" opacity="0.7">
              <animate attributeName="cy" values="260; 230; 260" dur="2.1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8; 0.3; 0.8" dur="2.1s" repeatCount="indefinite" />
            </circle>
            <circle cx="420" cy="275" r="1.5" fill="#f43f5e" opacity="0.5">
              <animate attributeName="cy" values="275; 245; 275" dur="2.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3; 0.9; 0.3" dur="2.7s" repeatCount="indefinite" />
            </circle>

            {/* Ambient Battlefield Floating Embers */}
            <polygon points="560,250 562,246 564,250 562,254" fill="#fb923c" opacity="0.6">
              <animate attributeName="transform" type="translate" values="0,0; -15,-20; -30,-40" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6; 0.9; 0" dur="4s" repeatCount="indefinite" />
            </polygon>
            <polygon points="680,220 682,216 684,220 682,224" fill="#f87171" opacity="0.7">
              <animate attributeName="transform" type="translate" values="0,0; -20,-25; -40,-50" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7; 1; 0" dur="3.5s" repeatCount="indefinite" />
            </polygon>
          </g>

          {/* Section 2: Combat Exchange - Arcane Ground Runes Under Wizard Party */}
          <g transform="translate(370, 310)">
            <ellipse cx="0" cy="0" rx="65" ry="12" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="4 3">
              <animateTransform attributeName="transform" type="rotate" values="0; 360" dur="24s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="0" cy="0" rx="55" ry="9" fill="none" stroke="rgba(250, 204, 21, 0.3)" strokeWidth="1" strokeDasharray="6 4">
              <animateTransform attributeName="transform" type="rotate" values="360; 0" dur="18s" repeatCount="indefinite" />
            </ellipse>
          </g>

          {/* Section 4: Victory Celebration Confetti & Sparkles on Dragon Slay */}
          {isVictory && (
            <g className="victory-celebration">
              {/* Golden Victory Sparkles */}
              <polygon points="760,100 763,108 771,111 763,114 760,122 757,114 749,111 757,108" fill="#facc15">
                <animate attributeName="transform" type="scale" values="1; 1.5; 1" dur="1.2s" repeatCount="indefinite" />
              </polygon>
              <polygon points="820,130 822,136 828,138 822,140 820,146 818,140 812,138 818,136" fill="#38bdf8">
                <animate attributeName="transform" type="scale" values="1.2; 0.8; 1.2" dur="1.5s" repeatCount="indefinite" />
              </polygon>
              <polygon points="710,140 712,145 717,147 712,149 710,154 708,149 703,147 708,145" fill="#4ade80">
                <animate attributeName="transform" type="scale" values="0.8; 1.4; 0.8" dur="1.1s" repeatCount="indefinite" />
              </polygon>

              {/* Colorful Confetti Pieces Showering from Sky */}
              <rect x="730" y="40" width="4" height="7" fill="#f43f5e" rx="1">
                <animate attributeName="y" values="40; 250" dur="2.2s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="rotate" values="0 732 43; 360 732 43" dur="1.8s" repeatCount="indefinite" />
              </rect>
              <rect x="780" y="20" width="5" height="5" fill="#38bdf8" rx="1">
                <animate attributeName="y" values="20; 260" dur="2.5s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="rotate" values="0 782 22; -360 782 22" dur="2s" repeatCount="indefinite" />
              </rect>
              <rect x="830" y="50" width="4" height="6" fill="#facc15" rx="1">
                <animate attributeName="y" values="50; 270" dur="2s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="rotate" values="0 832 53; 360 832 53" dur="1.5s" repeatCount="indefinite" />
              </rect>
              <rect x="690" y="30" width="5" height="6" fill="#a855f7" rx="1">
                <animate attributeName="y" values="30; 240" dur="2.8s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="rotate" values="0 692 33; 360 692 33" dur="2.2s" repeatCount="indefinite" />
              </rect>
            </g>
          )}

          {/* =========================================================================
              ACTIVE PLAYER ELEMENTAL ATTACK SPELL ANIMATIONS (Centered exactly on mob)
              ========================================================================= */}
          {activeEvent && (
            <>
              {attackTargets.map((target) => (
                <g key={target.id} transform={`translate(${target.x}, ${target.y}) scale(${target.scale})`}>
                  {/* --- LIGHTNING ATTACK: Thundercloud, Synced Bolt Strikes & Residual Electricity --- */}
                  {isLightning && (
                    <g>
                      {/* Thunder Storm Cloud */}
                      <g transform="translate(0, -60)">
                        <ellipse cx="-15" cy="0" rx="18" ry="10" fill="#1e293b" />
                        <ellipse cx="12" cy="-2" rx="16" ry="9" fill="#0f172a" />
                        <circle cx="0" cy="-6" r="14" fill="#334155" />
                        {/* Cloud Electric Sparks */}
                        <polygon points="-10,2 -6,8 -8,9 -4,15" fill="#fde047">
                          <animate attributeName="opacity" values="0.2; 1; 0.2" dur="0.22s" repeatCount="indefinite" />
                        </polygon>
                        <polygon points="8,2 12,8 10,9 14,14" fill="#67e8f9">
                          <animate attributeName="opacity" values="1; 0.2; 1" dur="0.28s" repeatCount="indefinite" />
                        </polygon>
                      </g>

                      {/* Main Jagged Lightning Bolt Strike (Centered directly onto mob body) */}
                      <g>
                        <animate
                          attributeName="opacity"
                          values="0; 1; 1; 0.9; 0.4; 0.8; 0.2; 0; 0"
                          keyTimes="0; 0.04; 0.10; 0.16; 0.24; 0.36; 0.52; 0.70; 1"
                          dur="0.88s"
                          repeatCount="indefinite"
                        />
                        {/* Outer Cyan Lightning Aura */}
                        <polygon
                          points="0,-60 -8,-30 -2,-29 -14,-2 4,-3 -4,18 10,18 2,-5 10,-5 0,-30 6,-30"
                          fill="#38bdf8"
                          opacity="0.85"
                        />
                        {/* Inner Intense Golden Lightning Core */}
                        <polygon
                          points="0,-60 -6,-30 -1,-29 -11,-2 3,-3 -3,16 8,16 1,-5 8,-5 0,-30 4,-30"
                          fill="#fef08a"
                        />
                      </g>

                      {/* Residual Post-Strike Electrocution Arcs */}
                      <g>
                        <animate
                          attributeName="opacity"
                          values="0; 0; 1; 0.3; 0.9; 0.2; 0.7; 0.1; 0"
                          keyTimes="0; 0.12; 0.18; 0.28; 0.40; 0.54; 0.68; 0.80; 1"
                          dur="0.88s"
                          repeatCount="indefinite"
                        />
                        <path
                          d="M -12,8 Q -6,2 2,10 Q 10,0 16,6"
                          fill="none"
                          stroke="#67e8f9"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M -8,-6 Q 4,-12 12,-4 Q 18,-14 6,-18"
                          fill="none"
                          stroke="#fde047"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <circle cx="-10" cy="4" r="2" fill="#38bdf8" />
                        <circle cx="14" cy="2" r="2.2" fill="#facc15" />
                        <circle cx="4" cy="-8" r="1.8" fill="#ffffff" />
                      </g>

                      {/* Ground Electric Shockwave Burst */}
                      <g transform="translate(0, 16)">
                        <ellipse cx="0" cy="0" rx="22" ry="7" fill="none" stroke="#facc15" strokeWidth="2.5">
                          <animate attributeName="rx" values="6; 28; 38" dur="0.88s" repeatCount="indefinite" />
                          <animate attributeName="ry" values="2; 9; 12" dur="0.88s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1; 0.8; 0" dur="0.88s" repeatCount="indefinite" />
                        </ellipse>
                      </g>
                    </g>
                  )}

                  {/* --- FIRE ATTACK: Towering Fire Column & Blazing Inferno Centered on Mob --- */}
                  {isFire && (
                    <g>
                      {/* Swirling Flame Pillar Rising from mob's feet */}
                      <g transform="translate(0, 16)">
                        {/* Layer 1: Crimson Base */}
                        <polygon points="-22,0 -15,-45 0,-68 15,-45 22,0 0,-12" fill="#dc2626">
                          <animateTransform attributeName="transform" type="scale" values="1,1; 1.15,1.25; 0.95,1; 1,1" dur="0.4s" repeatCount="indefinite" />
                        </polygon>
                        {/* Layer 2: Vivid Orange Core */}
                        <polygon points="-16,0 -9,-40 0,-58 9,-40 16,0 0,-8" fill="#f97316">
                          <animateTransform attributeName="transform" type="scale" values="1,1; 0.9,1.15; 1.1,1; 1,1" dur="0.35s" repeatCount="indefinite" />
                        </polygon>
                        {/* Layer 3: Blazing Yellow Center */}
                        <polygon points="-9,0 -4,-30 0,-45 4,-30 9,0 0,-4" fill="#fef08a">
                          <animateTransform attributeName="transform" type="scale" values="1,1; 1.2,1.3; 1,1; 1,1" dur="0.3s" repeatCount="indefinite" />
                        </polygon>
                      </g>

                      {/* Flying Burning Fire Sparks */}
                      <polygon points="-18,-45 -14,-51 -12,-47" fill="#fde047">
                        <animate attributeName="transform" type="translate" values="0,0; -12,-25" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1; 0.2; 1" dur="0.5s" repeatCount="indefinite" />
                      </polygon>
                      <polygon points="18,-40 22,-47 24,-42" fill="#fde047">
                        <animate attributeName="transform" type="translate" values="0,0; 14,-22" dur="0.45s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1; 0.2; 1" dur="0.45s" repeatCount="indefinite" />
                      </polygon>
                    </g>
                  )}

                  {/* --- ICE ATTACK: Blizzard Cloud & Glacial Ice Crystals Centered on Mob --- */}
                  {isIce && (
                    <g>
                      {/* Frost Blizzard Cloud */}
                      <g transform="translate(0, -48)">
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

                      {/* Giant Freezing Glacial Ice Spikes (Enveloping mob from feet upwards) */}
                      <g transform="translate(0, 16)">
                        {/* Central Sharp Ice Peak */}
                        <polygon points="-14,0 0,-52 14,0" fill="#7dd3fc" opacity="0.85">
                          <animate attributeName="opacity" values="0.75; 0.95; 0.75" dur="0.7s" repeatCount="indefinite" />
                        </polygon>
                        <polygon points="-5,0 0,-52 9,-8" fill="#bae6fd" opacity="0.9" />
                        {/* Left Ice Shard */}
                        <polygon points="-24,0 -16,-36 -6,0" fill="#38bdf8" opacity="0.8" />
                        {/* Right Ice Shard */}
                        <polygon points="6,0 18,-40 26,0" fill="#38bdf8" opacity="0.8" />
                        {/* Front Crystal Facet */}
                        <polygon points="-8,-6 0,-28 8,-6 0,0" fill="#ffffff" opacity="0.85">
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
              color: isFire ? "#f97316" : isIce ? "#38bdf8" : "#facc15",
              textShadow: "0 0 10px rgba(0,0,0,0.8)",
              pointerEvents: "none",
              zIndex: 30,
            }}
          >
            -{activeEvent.damage} DMG
          </div>
        </>
      )}
    </div>
  );
}
