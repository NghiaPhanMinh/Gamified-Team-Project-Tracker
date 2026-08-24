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
  goblins?: Array<{ id: string; isDefeated?: boolean }>;
  layerTransforms?: Record<string, { x: number; y: number; scale: number; visible: boolean }>;
};

export function LandscapeFX({ activeEvent, isVictory, goblins, layerTransforms }: LandscapeFXProps) {
  // Elemental spell type resolution
  const spell = activeEvent?.spellType || "lightning";
  const isAll = spell === "all";
  const isLightning = isAll || spell === "lightning" || spell === "spark";
  const isFire = isAll || spell === "fire";
  const isIce = isAll || spell === "ice" || spell === "water" || (!isLightning && !isFire);

  const attackTargets = useMemo(() => {
    if (!activeEvent) return [];

    const goblinLayerX = layerTransforms?.goblins?.x ?? 50;
    const goblinLayerY = layerTransforms?.goblins?.y ?? 0;
    const dragonLayerX = layerTransforms?.dragon?.x ?? 0;
    const dragonLayerY = layerTransforms?.dragon?.y ?? 0;

    const activeGoblinCount = goblins && goblins.length > 0 ? goblins.length : 2;
    const liveGoblinTargets = Array.from({ length: activeGoblinCount }).map((_, idx) => ({
      id: `goblin-${idx}`,
      x: 490 + goblinLayerX + idx * 45 + 15,
      y: 270 + goblinLayerY + (idx % 2) * 12 + 18,
      scale: 0.85,
    }));

    const dragonTarget = {
      id: "dragon-boss",
      x: 730 + dragonLayerX + 70,
      y: 130 + dragonLayerY + 45,
      scale: 2.2,
    };

    if (activeEvent.spellType === "all" || activeEvent.target === "all") {
      return [...liveGoblinTargets, dragonTarget];
    }
    if (activeEvent.target === "goblin") {
      return liveGoblinTargets;
    }
    return [dragonTarget];
  }, [activeEvent, goblins, layerTransforms]);

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
            {/* Arrow Projectile with Trajectory Trail */}
            <g transform="rotate(-15)">
              <line x1="-18" y1="0" x2="6" y2="0" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="6,-3 12,0 6,3" fill="#facc15" />
              <line x1="-24" y1="0" x2="-18" y2="0" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
            </g>
          </g>

          {/* =========================================================================
              2. DRAGON CONTINUOUS FIREBALL SPIT (Spits large fireball from mouth x=680, y=130 towards village center x=160, y=280 every 12s)
              ========================================================================= */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="680 130; 420 205; 160 280; 160 280"
              keyTimes="0; 0.18; 0.30; 1"
              dur="12s"
              repeatCount="indefinite"
            />
            {/* Blazing Comet / Fireball FX */}
            <g transform="rotate(164)">
              {/* Molten Outer Flare */}
              <ellipse cx="0" cy="0" rx="20" ry="10" fill="#ea580c" opacity="0.85" />
              {/* Glowing Core */}
              <ellipse cx="-4" cy="0" rx="14" ry="6" fill="#fde047" />
              {/* Center White Heat */}
              <ellipse cx="-6" cy="0" rx="8" ry="3" fill="#ffffff" />
              {/* Trailing Smoke / Embers */}
              <polygon points="12,-6 32,-3 18,0 36,4 12,6" fill="#dc2626" opacity="0.9" />
              <circle cx="28" cy="-8" r="2.5" fill="#f97316" />
              <circle cx="34" cy="7" r="2" fill="#fde047" />
            </g>
          </g>

          {/* =========================================================================
              3. VICTORY CELEBRATION CONFETTI & SPARKS
              ========================================================================= */}
          {isVictory && (
            <g>
              {/* Confetti Ribbon 1 */}
              <g transform="translate(200, 50)">
                <animateTransform attributeName="transform" type="translate" values="200,20; 200,380" dur="4s" repeatCount="indefinite" />
                <rect width="10" height="6" fill="#f43f5e" transform="rotate(45)">
                  <animateTransform attributeName="transform" type="rotate" values="0; 360" dur="1.2s" repeatCount="indefinite" />
                </rect>
              </g>
              {/* Confetti Ribbon 2 */}
              <g transform="translate(450, 20)">
                <animateTransform attributeName="transform" type="translate" values="450,10; 450,380" dur="3.5s" repeatCount="indefinite" />
                <rect width="8" height="8" fill="#38bdf8" transform="rotate(30)">
                  <animateTransform attributeName="transform" type="rotate" values="0; 360" dur="0.9s" repeatCount="indefinite" />
                </rect>
              </g>
              {/* Confetti Ribbon 3 */}
              <g transform="translate(700, 30)">
                <animateTransform attributeName="transform" type="translate" values="700,15; 700,380" dur="4.2s" repeatCount="indefinite" />
                <circle r="5" fill="#facc15" />
              </g>
              {/* Confetti Ribbon 4 */}
              <g transform="translate(850, 40)">
                <animateTransform attributeName="transform" type="translate" values="850,0; 850,380" dur="3.8s" repeatCount="indefinite" />
                <rect width="12" height="5" fill="#4ade80" transform="rotate(60)">
                  <animateTransform attributeName="transform" type="rotate" values="0; 360" dur="1.5s" repeatCount="indefinite" />
                </rect>
              </g>
            </g>
          )}

          {/* =========================================================================
              4. ACTIVE PLAYER ELEMENTAL ATTACK SPELL ANIMATIONS
              ========================================================================= */}
          {activeEvent && (
            <>
              {attackTargets.map((target) => (
                <g key={target.id} transform={`translate(${target.x}, ${target.y}) scale(${target.scale})`}>
                  {/* --- LIGHTNING ATTACK: Thundercloud, Synced Bolt Strikes & Residual Electricity --- */}
                  {isLightning && (
                    <g>
                      {/* Thunder Storm Cloud */}
                      <g transform="translate(0, -65)">
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

                      {/* Main Jagged Lightning Bolt Strike (Synced with 0.88s audio thunderclap) */}
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
                          points="0,-65 -8,-35 -2,-34 -14,-5 4,-6 -4,22 10,22 2,-8 10,-8 0,-35 6,-35"
                          fill="#38bdf8"
                          opacity="0.85"
                        />
                        {/* Inner Intense Golden Lightning Core */}
                        <polygon
                          points="0,-65 -6,-35 -1,-34 -11,-5 3,-6 -3,20 8,20 1,-8 8,-8 0,-35 4,-35"
                          fill="#fef08a"
                        />
                      </g>

                      {/* Residual Post-Strike Electrocution Arcs (Crackling after the main blast) */}
                      <g>
                        <animate
                          attributeName="opacity"
                          values="0; 0; 1; 0.3; 0.9; 0.2; 0.7; 0.1; 0"
                          keyTimes="0; 0.12; 0.18; 0.28; 0.40; 0.54; 0.68; 0.80; 1"
                          dur="0.88s"
                          repeatCount="indefinite"
                        />
                        <path
                          d="M -12,12 Q -6,6 2,14 Q 10,4 16,10"
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
                        <circle cx="-10" cy="8" r="2" fill="#38bdf8" />
                        <circle cx="14" cy="6" r="2.2" fill="#facc15" />
                        <circle cx="4" cy="-8" r="1.8" fill="#ffffff" />
                      </g>

                      {/* Ground Electric Shockwave Burst (Synced to 0.88s) */}
                      <g transform="translate(0, 18)">
                        <ellipse cx="0" cy="0" rx="22" ry="7" fill="none" stroke="#facc15" strokeWidth="2.5">
                          <animate attributeName="rx" values="6; 28; 38" dur="0.88s" repeatCount="indefinite" />
                          <animate attributeName="ry" values="2; 9; 12" dur="0.88s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1; 0.8; 0" dur="0.88s" repeatCount="indefinite" />
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
                      <g transform="translate(0, -50)">
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

                      {/* Giant Freezing Glacial Ice Spikes (Directly enveloping mob body) */}
                      <g transform="translate(0, 0)">
                        {/* Central Sharp Ice Peak */}
                        <polygon points="-14,14 0,-42 14,14" fill="#7dd3fc" opacity="0.85">
                          <animate attributeName="opacity" values="0.75; 0.95; 0.75" dur="0.7s" repeatCount="indefinite" />
                        </polygon>
                        <polygon points="-5,14 0,-42 9,0" fill="#bae6fd" opacity="0.9" />
                        {/* Left Ice Shard */}
                        <polygon points="-24,14 -16,-28 -6,14" fill="#38bdf8" opacity="0.8" />
                        {/* Right Ice Shard */}
                        <polygon points="6,14 18,-32 26,14" fill="#38bdf8" opacity="0.8" />
                        {/* Front Crystal Facet */}
                        <polygon points="-8,4 0,-22 8,4 0,12" fill="#ffffff" opacity="0.85">
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
              fontFamily: "var(--font-heading), sans-serif",
              color: activeEvent.spellType === "ice" ? "#38bdf8" : activeEvent.spellType === "fire" ? "#f97316" : "#fde047",
              textShadow: "0 0 10px rgba(0,0,0,0.8)",
              pointerEvents: "none",
              zIndex: 30,
              animation: "float-damage-anim 1.5s ease-out forwards",
            }}
          >
            -{activeEvent.damage} DMG!
          </div>
        </>
      )}
    </div>
  );
}
