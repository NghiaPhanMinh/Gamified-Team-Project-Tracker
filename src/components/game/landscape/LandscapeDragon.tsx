export type CustomShape = {
  id: string;
  name: string;
  type: "circle" | "ellipse" | "rect" | "polygon" | "path";
  fill: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
  points: string;
  d: string;
  rotate: number;
};

type LandscapeDragonProps = {
  bossHpPercent: number; // 0 to 100
  isDefeated: boolean;
  offsets?: Record<string, { x: number; y: number; rotate: number }>;
  onSelectPart?: (partId: string) => void;
  selectedPart?: string | null;
  animationsEnabled?: boolean;
  customShapes?: CustomShape[];
  fills?: Record<string, string>;
  deletedShapes?: Record<string, boolean>;
  onStartDragShape?: (shapeId: string, clientX: number, clientY: number) => void;
};

export function LandscapeDragon({
  bossHpPercent,
  isDefeated,
  offsets,
  onSelectPart,
  selectedPart,
  animationsEnabled = true,
  customShapes = [],
  fills = {},
  deletedShapes = {},
  onStartDragShape,
}: LandscapeDragonProps) {
  // Anchor dragon on far-right end of the 1000x400 viewBox canvas (x = 730 to 930)
  const damageClearedFraction = (100 - bossHpPercent) / 100;
  const dragonX = 730 + damageClearedFraction * 60;

  // Helper function to build SVG attributes (translate, rotate, hover, highlight, selection, dragging, fills)
  function getShapeProps(shapeId: string, defaultFill?: string, defaultStroke?: string, defaultStrokeWidth?: number) {
    const isSelected = selectedPart === shapeId;
    const offset = offsets?.[shapeId] || { x: 0, y: 0, rotate: 0 };
    return {
      fill: fills[shapeId] ?? defaultFill,
      onClick: (e: React.MouseEvent) => {
        if (onSelectPart) {
          e.stopPropagation();
          onSelectPart(shapeId);
        }
      },
      onMouseDown: (e: React.MouseEvent) => {
        if (e.shiftKey && onStartDragShape) {
          e.preventDefault();
          e.stopPropagation();
          if (onSelectPart) onSelectPart(shapeId);
          onStartDragShape(shapeId, e.clientX, e.clientY);
        }
      },
      style: {
        cursor: onSelectPart ? "pointer" : "inherit",
        pointerEvents: (onSelectPart ? "auto" : "none") as any,
      },
      stroke: isSelected ? "#ffd700" : defaultStroke,
      strokeWidth: isSelected ? 3 : defaultStrokeWidth,
      transform: `translate(${offset.x}, ${offset.y}) rotate(${offset.rotate ?? 0})`,
    };
  }

  return (
    <div
      className="landscape-layer layer-8-dragon"
      style={{ pointerEvents: (onSelectPart ? "auto" : "none") as any }}
      aria-label={`Epic Rigged Western Red Dragon (${bossHpPercent}% HP left)`}
    >
      <svg
        viewBox="0 0 1000 400"
        width="100%"
        height="100%"
        style={{ pointerEvents: (onSelectPart ? "auto" : "none") as any }}
      >
        {/* Dragon Group anchored on Far-Right End */}
        <g
          transform={`translate(${dragonX}, 130)`}
          className={`dragon-group ${isDefeated ? "dragon-defeated" : ""}`}
          style={{ opacity: isDefeated ? 0.35 : 1 }}
        >
          {/* Hovering animation tag */}
          <g>
            {animationsEnabled && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 0,-14; 0,0"
                dur="3.2s"
                repeatCount="indefinite"
              />
            )}

            {/* --- MASTER-LEVEL ANATOMICAL DRAGON --- */}
            <g transform="scale(0.68)">

              {/* =========================================================================
                  1. LEFT / BACK SWEEPING BAT WING
                 ========================================================================= */}
              <g className="dragon-back-wing" transform-origin="120 110">
                {animationsEnabled && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0; -15; 0"
                    dur="1.8s"
                    repeatCount="indefinite"
                    additive="sum"
                  />
                )}
                {/* Wing Membrane Panels */}
                {!deletedShapes["backWing_membrane1"] && <path d="M 120 110 Q 180 -40 320 -70 Q 250 10 210 70 Q 160 50 120 110 Z" {...getShapeProps("backWing_membrane1", "#7f1d1d")} />}
                {!deletedShapes["backWing_membrane2"] && <path d="M 320 -70 Q 270 20 230 85 Q 180 80 120 110 Q 200 10 320 -70 Z" {...getShapeProps("backWing_membrane2", "#991b1b")} />}
                {!deletedShapes["backWing_membrane3"] && <path d="M 230 85 Q 180 40 120 110 Q 170 80 230 85 Z" {...getShapeProps("backWing_membrane3", "#450a0a")} />}

                {/* Wing Finger Bone Struts */}
                {!deletedShapes["backWing_strut1"] && <path d="M 120 110 Q 220 -20 320 -70" strokeLinecap="round" {...getShapeProps("backWing_strut1", "none", "#b91c1c", 5)} />}
                {!deletedShapes["backWing_strut2"] && <path d="M 120 110 Q 185 10 230 85" strokeLinecap="round" {...getShapeProps("backWing_strut2", "none", "#b91c1c", 4)} />}

                {/* Wing Joint & Claw */}
                {!deletedShapes["backWing_joint"] && <circle cx="320" cy="-70" r="5" {...getShapeProps("backWing_joint", "#f97316")} />}
                {!deletedShapes["backWing_claw"] && <polygon points="320,-70 334,-84 324,-58" {...getShapeProps("backWing_claw", "#ea580c")} />}
              </g>

              {/* =========================================================================
                  2. RIGHT / FRONT SWEEPING BAT WING
                 ========================================================================= */}
              <g className="dragon-front-wing" transform-origin="110 115">
                {animationsEnabled && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0; 15; 0"
                    dur="1.8s"
                    repeatCount="indefinite"
                    additive="sum"
                  />
                )}
                {/* Front Membrane Panels */}
                {!deletedShapes["frontWing_membrane1"] && <path d="M 110 115 Q 10 -40 -80 -60 Q 0 15 50 80 Q 80 60 110 115 Z" {...getShapeProps("frontWing_membrane1", "#991b1b")} />}
                {!deletedShapes["frontWing_membrane2"] && <path d="M -80 -60 Q -10 35 30 100 Q 70 85 130 125 Z" {...getShapeProps("frontWing_membrane2", "#7f1d1d")} />}
                {!deletedShapes["frontWing_membrane3"] && <path d="M 30 100 Q 65 60 130 125 Q 75 95 30 100 Z" {...getShapeProps("frontWing_membrane3", "#450a0a")} />}

                {/* Front Bone Struts */}
                {!deletedShapes["frontWing_strut1"] && <path d="M 110 115 Q 20 10 -80 -60" strokeLinecap="round" {...getShapeProps("frontWing_strut1", "none", "#b91c1c", 5)} />}
                {!deletedShapes["frontWing_strut2"] && <path d="M 110 115 Q 50 30 30 100" strokeLinecap="round" {...getShapeProps("frontWing_strut2", "none", "#991b1b", 4)} />}

                {/* Wrist Joint & Claw */}
                {!deletedShapes["frontWing_joint"] && <circle cx="-70" cy="-50" r="5" {...getShapeProps("frontWing_joint", "#f97316")} />}
                {!deletedShapes["frontWing_claw"] && <polygon points="-70,-50 -85,-65 -74,-38" {...getShapeProps("frontWing_claw", "#ea580c")} />}
              </g>

              {/* =========================================================================
                  3. SLIM POINTY TAPERED TAIL
                 ========================================================================= */}
              <g className="dragon-tail">
                {/* Slim Segment 1 */}
                {!deletedShapes["tail_seg1"] && <path d="M 160 150 Q 220 160 255 190 L 240 215 Q 215 190 165 175 Z" {...getShapeProps("tail_seg1", "#7f1d1d")} />}
                {/* Slim Segment 2 */}
                {!deletedShapes["tail_seg2"] && <path d="M 255 190 Q 285 225 265 260 L 245 255 Q 260 235 240 215 Z" {...getShapeProps("tail_seg2", "#991b1b")} />}
                {/* Slim Segment 3 */}
                {!deletedShapes["tail_seg3"] && <path d="M 265 260 Q 240 280 205 270 L 210 255 Q 235 262 245 255 Z" {...getShapeProps("tail_seg3", "#b91c1c")} />}

                {/* Underbelly tail shadow */}
                {!deletedShapes["tail_shadow"] && <path d="M 245 255 Q 235 262 205 270 Q 220 285 245 255 Z" {...getShapeProps("tail_shadow", "#450a0a")} />}

                {/* Barbed tip */}
                {!deletedShapes["tail_barb1"] && <polygon points="205,270 170,290 192,260" {...getShapeProps("tail_barb1", "#dc2626")} />}
                {!deletedShapes["tail_barb2"] && <polygon points="205,270 182,252 196,263" {...getShapeProps("tail_barb2", "#ea580c")} />}
                {!deletedShapes["tail_barb3"] && <polygon points="205,270 188,285 198,272" {...getShapeProps("tail_barb3", "#f97316")} />}

                {/* Tail Spines */}
                {!deletedShapes["tail_spine1"] && <polygon points="230,170 242,158 238,175" {...getShapeProps("tail_spine1", "#dc2626")} />}
                {!deletedShapes["tail_spine2"] && <polygon points="275,215 290,208 280,225" {...getShapeProps("tail_spine2", "#dc2626")} />}
                {!deletedShapes["tail_spine3"] && <polygon points="255,262 268,272 250,268" {...getShapeProps("tail_spine3", "#dc2626")} />}
              </g>

              {/* =========================================================================
                  4. DORSAL SPINE CREST PLATES
                 ========================================================================= */}
              <g className="dragon-dorsal-spines">
                {!deletedShapes["spine1"] && <polygon points="35,42 22,22 42,35" {...getShapeProps("spine1", "#dc2626")} />}
                {!deletedShapes["spine2"] && <polygon points="55,58 45,38 62,52" {...getShapeProps("spine2", "#dc2626")} />}
                {!deletedShapes["spine3"] && <polygon points="80,78 72,58 88,72" {...getShapeProps("spine3", "#dc2626")} />}
                {!deletedShapes["spine4"] && <polygon points="105,98 94,82 110,95" {...getShapeProps("spine4", "#dc2626")} />}
                {!deletedShapes["spine5"] && <polygon points="135,118 122,100 138,114" {...getShapeProps("spine5", "#dc2626")} />}
                {!deletedShapes["spine6"] && <polygon points="165,138 152,120 168,134" {...getShapeProps("spine6", "#dc2626")} />}
                {!deletedShapes["spine7"] && <polygon points="195,152 182,135 198,148" {...getShapeProps("spine7", "#dc2626")} />}
              </g>

              {/* =========================================================================
                  5. BACK HIND LEG
                 ========================================================================= */}
              <g className="dragon-back-leg">
                {/* Quad/Thigh */}
                {!deletedShapes["backLeg_thigh"] && <path d="M 150 145 C 205 160 210 205 185 215 C 145 205 140 180 150 145 Z" {...getShapeProps("backLeg_thigh", "#450a0a")} />}
                {/* Knee */}
                {!deletedShapes["backLeg_knee"] && <circle cx="185" cy="215" r="14" {...getShapeProps("backLeg_knee", "#310606")} />}
                {/* Calf */}
                {!deletedShapes["backLeg_calf"] && <path d="M 185 215 L 165 255 L 140 248 L 170 208 Z" {...getShapeProps("backLeg_calf", "#450a0a")} />}
                {/* Ankle */}
                {!deletedShapes["backLeg_ankle"] && <circle cx="165" cy="255" r="9" {...getShapeProps("backLeg_ankle", "#1c0303")} />}
                {/* Foot */}
                {!deletedShapes["backLeg_foot"] && <path d="M 165 255 L 125 264 L 128 252 L 158 246 Z" {...getShapeProps("backLeg_foot", "#450a0a")} />}
                {/* 3 White Claws */}
                {!deletedShapes["backLeg_claw1"] && <polygon points="125,264 102,276 120,256" {...getShapeProps("backLeg_claw1", "#ffffff")} />}
                {!deletedShapes["backLeg_claw2"] && <polygon points="128,266 108,280 125,258" {...getShapeProps("backLeg_claw2", "#ffffff")} />}
                {!deletedShapes["backLeg_claw3"] && <polygon points="132,268 114,284 130,260" {...getShapeProps("backLeg_claw3", "#ffffff")} />}
              </g>

              {/* =========================================================================
                  6. PROPORTIONATE MUSCULAR TORSO & MULTI-LAYERED CHEST ARMOR
                 ========================================================================= */}
              <g className="dragon-torso">
                {!deletedShapes["torso_base"] && <path d="M 50 110 C 115 65 200 100 185 180 C 145 210 70 195 50 110 Z" {...getShapeProps("torso_base", "#7f1d1d")} />}
                {!deletedShapes["torso_plate1"] && <path d="M 150 135 C 195 150 185 195 140 185 Z" {...getShapeProps("torso_plate1", "#580e0e")} />}
                {!deletedShapes["torso_plate2"] && <path d="M 105 75 C 175 110 175 185 125 195 C 155 155 138 100 105 75 Z" {...getShapeProps("torso_plate2", "#450a0a")} />}

                {/* Chest Plates */}
                {!deletedShapes["torso_chest1"] && <path d="M 58 122 C 92 150 135 145 150 135 Q 130 170 66 152 Z" {...getShapeProps("torso_chest1", "#b91c1c")} />}
                {!deletedShapes["torso_chest2"] && <path d="M 64 132 C 94 158 130 152 142 142 Q 122 174 72 160 Z" {...getShapeProps("torso_chest2", "#dc2626")} />}
                {!deletedShapes["torso_chest3"] && <path d="M 70 142 C 98 165 125 158 135 148 Q 115 178 78 166 Z" {...getShapeProps("torso_chest3", "#ea580c")} />}
                {!deletedShapes["torso_chest4"] && <path d="M 76 152 C 100 170 120 164 128 154 Q 110 182 84 172 Z" {...getShapeProps("torso_chest4", "#f97316")} />}
                {!deletedShapes["torso_chest5"] && <path d="M 82 162 C 102 176 116 170 122 160 Q 106 186 90 178 Z" {...getShapeProps("torso_chest5", "#fef08a")} />}
              </g>

              {/* =========================================================================
                  7. FRONT HIND LEG
                 ========================================================================= */}
              <g className="dragon-front-leg">
                {/* Thigh */}
                {!deletedShapes["frontLeg_thigh"] && <path d="M 145 150 C 195 165 198 210 175 220 C 135 210 132 185 145 150 Z" {...getShapeProps("frontLeg_thigh", "#991b1b")} />}
                {/* Knee */}
                {!deletedShapes["frontLeg_knee"] && <circle cx="175" cy="220" r="14" {...getShapeProps("frontLeg_knee", "#7f1d1d")} />}
                {/* Calf */}
                {!deletedShapes["frontLeg_calf"] && <path d="M 175 220 L 155 260 L 130 252 L 160 212 Z" {...getShapeProps("frontLeg_calf", "#991b1b")} />}
                {/* Ankle */}
                {!deletedShapes["frontLeg_ankle"] && <circle cx="155" cy="260" r="9" {...getShapeProps("frontLeg_ankle", "#580e0e")} />}
                {/* Foot */}
                {!deletedShapes["frontLeg_foot"] && <path d="M 155 260 L 115 270 L 118 258 L 148 252 Z" {...getShapeProps("frontLeg_foot", "#991b1b")} />}
                {/* Claws */}
                {!deletedShapes["frontLeg_claw1"] && <polygon points="115,270 92,284 110,262" {...getShapeProps("frontLeg_claw1", "#ffffff")} />}
                {!deletedShapes["frontLeg_claw2"] && <polygon points="118,272 98,288 114,264" {...getShapeProps("frontLeg_claw2", "#ffffff")} />}
                {!deletedShapes["frontLeg_claw3"] && <polygon points="122,274 104,292 118,266" {...getShapeProps("frontLeg_claw3", "#ffffff")} />}
              </g>

              {/* =========================================================================
                  8. RIGGED FRONT ARM
                 ========================================================================= */}
              <g className="dragon-front-arm">
                {!deletedShapes["frontArm_shoulder"] && <circle cx="95" cy="120" r="15" {...getShapeProps("frontArm_shoulder", "#991b1b")} />}
                {!deletedShapes["frontArm_bicep"] && <path d="M 95 120 L 60 155 L 45 145 L 82 112 Z" {...getShapeProps("frontArm_bicep", "#991b1b")} />}
                {!deletedShapes["frontArm_elbow"] && <circle cx="60" cy="155" r="9" {...getShapeProps("frontArm_elbow", "#7f1d1d")} />}
                {!deletedShapes["frontArm_forearm"] && <path d="M 60 155 L 30 148 L 28 135 L 52 142 Z" {...getShapeProps("frontArm_forearm", "#991b1b")} />}
                {!deletedShapes["frontArm_wrist"] && <circle cx="30" cy="148" r="7" {...getShapeProps("frontArm_wrist", "#7f1d1d")} />}
                {!deletedShapes["frontArm_claw1"] && <polygon points="30,148 10,160 24,142" {...getShapeProps("frontArm_claw1", "#ffffff")} />}
                {!deletedShapes["frontArm_claw2"] && <polygon points="32,150 14,164 26,144" {...getShapeProps("frontArm_claw2", "#ffffff")} />}
              </g>

              {/* =========================================================================
                  9. MUSCULAR S-CURVED NECK & ALIGNED THROAT COLLAR
                 ========================================================================= */}
              <g className="dragon-head-neck">
                {/* S-Neck */}
                {!deletedShapes["neck_base1"] && <path d="M 70 125 Q 35 90 30 55 Q 15 30 52 18 Q 80 38 86 102 Z" {...getShapeProps("neck_base1", "#7f1d1d")} />}
                {!deletedShapes["neck_base2"] && <path d="M 35 90 Q 30 55 15 30 Q 30 35 48 60 Z" {...getShapeProps("neck_base2", "#991b1b")} />}

                {/* Neck Plates */}
                {!deletedShapes["neck_plate1"] && <path d="M 28 50 C 44 42 60 48 68 56 C 54 62 38 58 28 50 Z" {...getShapeProps("neck_plate1", "#580e0e")} />}
                {!deletedShapes["neck_plate2"] && <path d="M 32 64 C 48 56 64 62 72 70 C 58 76 42 72 32 64 Z" {...getShapeProps("neck_plate2", "#450a0a")} />}
                {!deletedShapes["neck_plate3"] && <path d="M 36 78 C 52 70 68 76 76 84 C 62 90 46 86 36 78 Z" {...getShapeProps("neck_plate3", "#310606")} />}

                {/* =========================================================================
                    10. PREDATOR SKULL
                   ========================================================================= */}
                {/* Solid Back-Mouth Cavity */}
                {!deletedShapes["mouth_cavity"] && <path d="M 32 20 L -10 15 L -16 28 L 8 40 L 32 30 Z" {...getShapeProps("mouth_cavity", "#220303")} />}

                {/* Skull Base */}
                {!deletedShapes["skull_base"] && <path d="M 48 20 L -24 5 L 8 -10 L 62 8 Z" {...getShapeProps("skull_base", "#991b1b")} />}

                {/* Webbed Mouth Tissue */}
                {!deletedShapes["mouth_webbing"] && <path d="M 28 20 Q 20 28 8 36 Q 22 38 28 20 Z" opacity="0.85" {...getShapeProps("mouth_webbing", "#b91c1c")} />}

                {/* Snout */}
                {!deletedShapes["snout_base"] && <polygon points="-24,5 -8,-1 5,-7 -17,0" {...getShapeProps("snout_base", "#7f1d1d")} />}
                {!deletedShapes["snout_nostril"] && <ellipse cx="-12" cy="2" rx="4" ry="2.2" {...getShapeProps("snout_nostril", "#260404")} />}

                {/* Lower Jaw */}
                {!deletedShapes["lower_jaw"] && <path d="M 38 34 L -26 18 L 8 42 Z" {...getShapeProps("lower_jaw", "#7f1d1d")} />}

                {/* Upper Jaw Fangs */}
                {!deletedShapes["upper_fang1"] && <polygon points="-16,7 -22,14 -11,9" {...getShapeProps("upper_fang1", "#ffffff")} />}
                {!deletedShapes["upper_fang2"] && <polygon points="-10,8 -14,16 -5,10" {...getShapeProps("upper_fang2", "#ffffff")} />}
                {!deletedShapes["upper_fang3"] && <polygon points="-4,9 -8,17 1,11" {...getShapeProps("upper_fang3", "#ffffff")} />}
                {!deletedShapes["upper_fang4"] && <polygon points="2,10 0,18 7,12" {...getShapeProps("upper_fang4", "#ffffff")} />}
                {!deletedShapes["upper_fang5"] && <polygon points="8,11 6,19 13,13" {...getShapeProps("upper_fang5", "#ffffff")} />}
                {!deletedShapes["upper_fang6"] && <polygon points="14,12 12,20 19,14" {...getShapeProps("upper_fang6", "#ffffff")} />}

                {/* Lower Jaw Fangs */}
                {!deletedShapes["lower_fang1"] && <polygon points="-20,20 -14,12 -15,22" {...getShapeProps("lower_fang1", "#ffffff")} />}
                {!deletedShapes["lower_fang2"] && <polygon points="-12,22 -7,14 -7,24" {...getShapeProps("lower_fang2", "#ffffff")} />}
                {!deletedShapes["lower_fang3"] && <polygon points="-4,24 1,16 1,26" {...getShapeProps("lower_fang3", "#ffffff")} />}
                {!deletedShapes["lower_fang4"] && <polygon points="3,26 8,18 8,28" {...getShapeProps("lower_fang4", "#ffffff")} />}

                {/* CONNECTED JAGGED LIGHTNING HORNS */}
                {!deletedShapes["horn1"] && <path d="M 42 6 L 64 -12 L 54 -14 L 82 -32 L 58 -18 L 66 -16 Z" {...getShapeProps("horn1", "#260404")} />}
                {!deletedShapes["horn2"] && <path d="M 37 2 L 59 -16 L 49 -18 L 77 -36 L 53 -22 L 61 -20 Z" {...getShapeProps("horn2", "#7f1d1d")} />}

                {/* Spines */}
                {!deletedShapes["spine_head1"] && <polygon points="42,8 55,-4 58,10" {...getShapeProps("spine_head1", "#7f1d1d")} />}
                {!deletedShapes["spine_head2"] && <polygon points="30,18 12,14 26,26" {...getShapeProps("spine_head2", "#991b1b")} />}
                {!deletedShapes["spine_head3"] && <polygon points="38,16 22,8 34,22" {...getShapeProps("spine_head3", "#450a0a")} />}

                {/* Eye */}
                {!deletedShapes["eye_base"] && <ellipse cx="28" cy="4" rx="8" ry="5" {...getShapeProps("eye_base", "#f59e0b")} />}
                {!deletedShapes["eye_pupil"] && <polygon points="28,-1 30,4 28,9 26,4" {...getShapeProps("eye_pupil", "#000000")} />}
                {!deletedShapes["eye_specular"] && <circle cx="25" cy="2" r="1.8" {...getShapeProps("eye_specular", "#ffffff")} />}
                {!deletedShapes["eye_brow"] && <polygon points="18,-2 38,0 36,3 20,1" {...getShapeProps("eye_brow", "#260404")} />}
              </g>

              {/* =========================================================================
                  11. FRONT CLAW ARM & TALONS
                 ========================================================================= */}
              <g className="dragon-front-claw">
                {!deletedShapes["frontClaw_arm"] && <path d="M 85 115 L 50 148 L 30 140 Q 60 110 85 115 Z" {...getShapeProps("frontClaw_arm", "#991b1b")} />}
                {!deletedShapes["frontClaw_claw1"] && <polygon points="30,140 15,150 27,136" {...getShapeProps("frontClaw_claw1", "#ffffff")} />}
                {!deletedShapes["frontClaw_claw2"] && <polygon points="33,143 19,154 30,139" {...getShapeProps("frontClaw_claw2", "#ffffff")} />}
                {!deletedShapes["frontClaw_claw3"] && <polygon points="36,146 23,157 33,142" {...getShapeProps("frontClaw_claw3", "#ffffff")} />}
              </g>

              {/* =========================================================================
                  12. CUSTOM SPAWNED SHAPES (Spawned via admin tools to patch holes/gaps)
                 ========================================================================= */}
              {customShapes.map((shape) => {
                if (deletedShapes[shape.id]) return null;
                const shpOffset = offsets?.[shape.id] || { x: 0, y: 0, rotate: 0 };
                const isSelected = selectedPart === shape.id;
                
                const commonProps = {
                  key: shape.id,
                  fill: fills[shape.id] ?? shape.fill,
                  stroke: isSelected ? "#ffd700" : undefined,
                  strokeWidth: isSelected ? 3 : undefined,
                  style: {
                    cursor: onSelectPart ? "pointer" : "inherit",
                    pointerEvents: (onSelectPart ? "auto" : "none") as any,
                  },
                  onClick: (e: React.MouseEvent) => {
                    if (onSelectPart) {
                      e.stopPropagation();
                      onSelectPart(shape.id);
                    }
                  },
                  onMouseDown: (e: React.MouseEvent) => {
                    if (e.shiftKey && onStartDragShape) {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onSelectPart) onSelectPart(shape.id);
                      onStartDragShape(shape.id, e.clientX, e.clientY);
                    }
                  },
                  transform: `translate(${shape.x + shpOffset.x}, ${shape.y + shpOffset.y}) rotate(${shape.rotate + shpOffset.rotate})`,
                };

                switch (shape.type) {
                  case "circle":
                    return <circle cx="0" cy="0" r={shape.rx} {...commonProps} />;
                  case "ellipse":
                    return <ellipse cx="0" cy="0" rx={shape.rx} ry={shape.ry} {...commonProps} />;
                  case "rect":
                    return <rect x={-(shape.width / 2)} y={-(shape.height / 2)} width={shape.width} height={shape.height} rx={shape.rx} ry={shape.ry} {...commonProps} />;
                  case "polygon":
                    return <polygon points={shape.points} {...commonProps} />;
                  case "path":
                    return <path d={shape.d} {...commonProps} />;
                  default:
                    return null;
                }
              })}

            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
