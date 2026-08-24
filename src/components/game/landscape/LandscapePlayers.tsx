import { useState } from "react";
import { gameAudio } from "../../../lib/gameAudio";

type PlayerMember = {
  profileId: string;
  displayName: string;
  characterFill?: string;
  characterOutline?: string;
  spellType?: string;
  isActiveToday: boolean;
  isAttacking?: boolean;
};

type LandscapePlayersProps = {
  members: PlayerMember[];
  currentProfileId?: string;
  onSelectElement?: (spellType: MageType) => void;
};

export type MageType = "lightning" | "fire" | "ice";

export function getMageTheme(spellType?: string, profileId: string = "", index: number = 0) {
  let type: MageType = "lightning";
  if (spellType === "fire") type = "fire";
  else if (spellType === "ice" || spellType === "water") type = "ice";
  else if (spellType === "lightning" || spellType === "spark") type = "lightning";
  else {
    // Deterministic random elemental assignment based on player ID & index
    let hash = 0;
    for (let i = 0; i < profileId.length; i++) {
      hash = profileId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const types: MageType[] = ["lightning", "fire", "ice"];
    type = types[Math.abs(hash + index) % types.length];
  }

  if (type === "lightning") {
    return {
      type,
      name: "Lightning Mage",
      robePrimary: "#1e3a8a",
      trim: "#4ca0fe",
      hat: "#172554",
      ribbon: "#fff73f",
      orbCore: "#fff73f",
      orbAccent: "#4ca0fe",
      glowColor: "#fff73f",
    };
  } else if (type === "fire") {
    return {
      type,
      name: "Fire Mage",
      robePrimary: "#991b1b",
      trim: "#feaa01",
      hat: "#450a0a",
      ribbon: "#feaa01",
      orbCore: "#fd39e4",
      orbAccent: "#fff73f",
      glowColor: "#feaa01",
    };
  } else {
    return {
      type,
      name: "Ice Mage",
      robePrimary: "#0369a1",
      trim: "#ff8ae7",
      hat: "#0c4a6e",
      ribbon: "#fffded",
      orbCore: "#4ca0fe",
      orbAccent: "#ffffff",
      glowColor: "#ff8ae7",
    };
  }
}

export function LandscapePlayers({ members, currentProfileId, onSelectElement }: LandscapePlayersProps) {
  const [activeMenuProfileId, setActiveMenuProfileId] = useState<string | null>(null);

  const count = Math.max(1, members.length);
  const startX = 320;
  const availableWidth = 130;
  const spacing = Math.min(45, availableWidth / count);

  const handleElementPick = (e: React.MouseEvent, type: MageType) => {
    e.stopPropagation();
    if (type === "lightning") gameAudio.playLightning(1200);
    else if (type === "fire") gameAudio.playFireBurn(1200);
    else if (type === "ice") gameAudio.playFreeze();

    if (onSelectElement) {
      onSelectElement(type);
    }
    setActiveMenuProfileId(null);
  };

  return (
    <div className="landscape-layer layer-7-players" aria-label="Party members roster">
      <style>{`
        @keyframes mage-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3.5px); }
        }
        @keyframes element-menu-pop {
          0% { transform: translate(15px, 52px) scale(0.6); opacity: 0; }
          100% { transform: translate(15px, 52px) scale(1); opacity: 1; }
        }
        .element-btn-circle {
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .element-btn-circle:hover {
          transform: scale(1.22);
          filter: brightness(1.2);
        }
      `}</style>
      <svg viewBox="0 0 1000 400" width="100%" height="100%">
        <g>
          {members.map((member, index) => {
            const offsetX = startX + index * spacing;
            const offsetY = 265 + (index % 2) * 12;
            const active = member.isActiveToday;
            const mage = getMageTheme(member.spellType, member.profileId, index);
            const isMe = currentProfileId ? member.profileId === currentProfileId : index === 0;
            const isMenuOpen = activeMenuProfileId === member.profileId;

            return (
              <g
                key={member.profileId}
                transform={`translate(${offsetX}, ${offsetY})`}
                className={`player-character ${member.isAttacking ? "is-attacking" : ""}`}
                role="img"
                aria-label={`${member.displayName} (${mage.name}, ${active ? "Active today" : "Idle"})`}
                style={{ cursor: isMe ? "pointer" : "default" }}
                onClick={() => {
                  if (isMe) {
                    setActiveMenuProfileId(isMenuOpen ? null : member.profileId);
                    gameAudio.playTing();
                  }
                }}
              >
                {/* 1. Ground Shadow */}
                <ellipse cx="15" cy="46" rx="14" ry="4.5" fill="rgba(0,0,0,0.22)" stroke="none" />

                {/* 2. Game ID Tag Pill rendered directly above avatar */}
                <g transform="translate(15, -16)">
                  <rect
                    x="-24"
                    y="-12"
                    width="48"
                    height="15"
                    rx="7.5"
                    fill="#0f172a"
                    stroke={isMe ? "#38bdf8" : mage.ribbon}
                    strokeWidth={isMe ? 2 : 1.5}
                  />
                  <text
                    x="0"
                    y="-1.5"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {member.displayName.slice(0, 7)}
                  </text>
                  {isMe && (
                    <polygon points="0,-16 -3,-20 3,-20" fill="#38bdf8" />
                  )}
                </g>

                {/* 3. Mage Avatar with Idle Floating / Breathing Animation */}
                <g
                  style={{
                    animation: "mage-float 2.2s ease-in-out infinite",
                    animationDelay: `${(index * 0.4) % 2.0}s`,
                  }}
                >
                  {/* Flowing Wizard Robe */}
                  <polygon points="6,45 24,45 21,24 9,24" fill={mage.robePrimary} stroke="none" />
                  {/* Robe Hem Trim */}
                  <polygon points="5,45 25,45 24,42 6,42" fill={mage.trim} stroke="none" />
                  {/* Robe Mantle / Cowl */}
                  <polygon points="7,23 23,23 19,30 11,30" fill={mage.trim} stroke="none" />
                  {/* Leather Belt & Rune Buckle */}
                  <rect x="8" y="32" width="14" height="2.5" fill="#1e1b18" stroke="none" />
                  <rect x="13.5" y="31.5" width="3" height="3.5" fill={mage.ribbon} stroke="none" />

                  {/* Wizard Face */}
                  <circle cx="15" cy="18" r="6" fill="#fde68a" stroke="none" />
                  <circle cx="13" cy="18" r="0.9" fill="#0f172a" stroke="none" />
                  <circle cx="17" cy="18" r="0.9" fill="#0f172a" stroke="none" />

                  {/* Conical Wizard Hat */}
                  <ellipse cx="15" cy="14" rx="13" ry="3.5" fill={mage.hat} stroke="none" />
                  <polygon points="7,14 15,0 23,14" fill={mage.hat} stroke="none" />
                  <polygon points="14,2 15,0 18,2 20,4" fill={mage.hat} stroke="none" />
                  <rect x="9" y="11.5" width="12" height="2.5" fill={mage.ribbon} stroke="none" />

                  {/* Wizard Staff */}
                  <line x1="28" y1="45" x2="28" y2="9" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
                  <polygon points="26,11 28,7 30,11" fill="#b45309" stroke="none" />

                  {/* Elemental Staff Crystal Head */}
                  {mage.type === "lightning" && (
                    <g>
                      <circle cx="28" cy="5" r="4" fill={mage.orbCore} stroke="none" />
                      <polygon points="28,1 26.5,5 29.5,5 28,9" fill="#eab308" stroke="none" />
                    </g>
                  )}
                  {mage.type === "fire" && (
                    <g>
                      <polygon points="28,0 24,7 32,7" fill={mage.orbCore} stroke="none" />
                      <circle cx="28" cy="5.5" r="2" fill={mage.orbAccent} stroke="none" />
                    </g>
                  )}
                  {mage.type === "ice" && (
                    <g>
                      <polygon points="28,0 24,5 28,10 32,5" fill={mage.orbCore} stroke="none" />
                      <polygon points="28,2 26,5 28,8 30,5" fill="#ffffff" stroke="none" />
                    </g>
                  )}
                </g>

                {/* 4. POP-OUT ELEMENT SWITCHER MENU (3 Circles: ⚡, 🔥, ❄️) directly under player */}
                {isMenuOpen && (
                  <g
                    style={{
                      animation: "element-menu-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                      pointerEvents: "auto",
                    }}
                  >
                    {/* Background Capsule Pill */}
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
                      height="24"
                      rx="12"
                      fill="#fffded"
                      stroke="#101517"
                      strokeWidth="2"
                      style={{ filter: "drop-shadow(2px 2px 0 #101517)" }}
                    />

                    {/* 1. Lightning Circle Button (⚡) */}
                    <g
                      className="element-btn-circle"
                      transform="translate(-24, 0)"
                      onClick={(e) => handleElementPick(e, "lightning")}
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="8.5"
                        fill="#1e3a8a"
                        stroke={mage.type === "lightning" ? "#fff73f" : "#101517"}
                        strokeWidth={mage.type === "lightning" ? "2.2" : "1.5"}
                      />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9" fill="#fff73f" fontWeight="900">
                        ⚡
                      </text>
                    </g>

                    {/* 2. Fire Circle Button (🔥) */}
                    <g
                      className="element-btn-circle"
                      transform="translate(0, 0)"
                      onClick={(e) => handleElementPick(e, "fire")}
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="8.5"
                        fill="#991b1b"
                        stroke={mage.type === "fire" ? "#feaa01" : "#101517"}
                        strokeWidth={mage.type === "fire" ? "2.2" : "1.5"}
                      />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9" fill="#feaa01" fontWeight="900">
                        🔥
                      </text>
                    </g>

                    {/* 3. Ice Circle Button (❄️) */}
                    <g
                      className="element-btn-circle"
                      transform="translate(24, 0)"
                      onClick={(e) => handleElementPick(e, "ice")}
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="8.5"
                        fill="#0369a1"
                        stroke={mage.type === "ice" ? "#ff8ae7" : "#101517"}
                        strokeWidth={mage.type === "ice" ? "2.2" : "1.5"}
                      />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9" fill="#bae6fd" fontWeight="900">
                        ❄️
                      </text>
                    </g>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
