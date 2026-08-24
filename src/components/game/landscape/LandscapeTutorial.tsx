import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Swords,
  Zap,
  Move,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { gameAudio } from "../../../lib/gameAudio";
import { LandscapeSky } from "./LandscapeSky";
import { LandscapeTerrain } from "./LandscapeTerrain";
import { LandscapeVillage } from "./LandscapeVillage";
import { LandscapeDragon } from "./LandscapeDragon";

export type TutorialStep = 1 | 2 | 3 | 4;

interface LandscapeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  villageName?: string;
  bossName?: string;
  dragonOffsets?: any;
  customShapes?: any[];
  dragonFills?: Record<string, string>;
  deletedShapes?: Record<string, boolean>;
  dragonGeometries?: Record<string, string>;
  layerOrder?: string[];
}

export function LandscapeTutorial({
  isOpen,
  onClose,
  villageName = "Town of Last-Minute Hope",
  bossName = "Lord Procrastinax",
  dragonOffsets = {},
  customShapes = [],
  dragonFills = {},
  deletedShapes = {},
  dragonGeometries = {},
  layerOrder = [],
}: LandscapeTutorialProps) {
  const [step, setStep] = useState<TutorialStep>(1);

  // Position adjustments with persistent localStorage
  const [villagePos, setVillagePos] = useState(() => {
    if (typeof window === "undefined") return { x: 35.5, y: 0 };
    try {
      const saved = localStorage.getItem("rpg_tut_village_pos");
      return saved ? JSON.parse(saved) : { x: 35.5, y: 0 };
    } catch {
      return { x: 35.5, y: 0 };
    }
  });

  const [villageHpPos, setVillageHpPos] = useState(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    try {
      const saved = localStorage.getItem("rpg_tut_village_hp_pos");
      return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });

  const [dragonPos, setDragonPos] = useState(() => {
    if (typeof window === "undefined") return { x: -28, y: -2 };
    try {
      const saved = localStorage.getItem("rpg_tut_dragon_pos");
      return saved ? JSON.parse(saved) : { x: -28, y: -2 };
    } catch {
      return { x: -28, y: -2 };
    }
  });

  const [dragonHpPos, setDragonHpPos] = useState(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    try {
      const saved = localStorage.getItem("rpg_tut_dragon_hp_pos");
      return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });

  const [showNudgePanel, setShowNudgePanel] = useState(false);
  const [nudgeTarget, setNudgeTarget] = useState<"element" | "hp">("hp");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("rpg_tut_village_pos", JSON.stringify(villagePos));
        localStorage.setItem("rpg_tut_village_hp_pos", JSON.stringify(villageHpPos));
        localStorage.setItem("rpg_tut_dragon_pos", JSON.stringify(dragonPos));
        localStorage.setItem("rpg_tut_dragon_hp_pos", JSON.stringify(dragonHpPos));
      } catch {}
    }
  }, [villagePos, villageHpPos, dragonPos, dragonHpPos]);

  if (!isOpen) return null;

  const goToStep = (nextStep: TutorialStep) => {
    gameAudio.playTing();
    setStep(nextStep);
  };

  const handleNext = () => {
    if (step === 1) goToStep(2);
    else if (step === 2) goToStep(3);
    else if (step === 3) goToStep(4);
  };

  const handleBack = () => {
    if (step === 4) goToStep(3);
    else if (step === 3) goToStep(2);
    else if (step === 2) goToStep(1);
  };

  const handleRestart = () => {
    goToStep(1);
  };

  const handleFinish = () => {
    gameAudio.playTing();
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg_tutorial_seen", "true");
    }
    onClose();
  };

  return (
    <div
      className="rpg-tutorial-realm"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        overflow: "hidden",
        borderRadius: "inherit",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
      }}
    >
      {/* 1. AUTHENTIC GAMEPLAY SKY & TERRAIN */}
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        <LandscapeSky />
      </div>

      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
        <LandscapeTerrain />
      </div>

      {/* STEP 1: AUTHENTIC REAL IN-GAME VILLAGE CENTERED IN MIDDLE */}
      {step === 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
            transform: `translate(${villagePos.x}%, ${villagePos.y}%)`,
          }}
        >
          <LandscapeVillage
            villageHpPercent={100}
            villageName={villageName}
            villageHpBarPos={{ x: villageHpPos.x - 355, y: villageHpPos.y - 10 }}
          />
        </div>
      )}

      {/* STEP 2: CRISP DAILY GOBLIN CENTERED & SCALED UP IN MEADOW */}
      {step === 2 && (
        <svg
          viewBox="0 0 1000 400"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {/* Centered at (500, 200), scaled up 4.2x */}
          <g transform="translate(500, 200) scale(4.2)">
            <g transform="translate(-15, -20)">
              {/* Undershadow */}
              <ellipse cx="15" cy="38" rx="14" ry="4" fill="#000000" opacity="0.25" />
              {/* Feet */}
              <rect x="8" y="34" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="18" y="34" width="4" height="4" rx="1" fill="#0f172a" />
              {/* Tunic / Body */}
              <polygon points="7,20 23,20 21,34 9,34" fill="#dc2626" />
              {/* Belt */}
              <rect x="8" y="27" width="14" height="2.5" fill="#451a03" />
              <rect x="13.5" y="26.5" width="3" height="3.5" fill="#facc15" />
              {/* Arms */}
              <polygon points="7,21 2,28 5,30 9,24" fill="#a3e635" />
              <polygon points="23,21 29,26 27,29 21,24" fill="#a3e635" />
              {/* Spear */}
              <line x1="28" y1="36" x2="28" y2="3" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              <polygon points="28,-2 24,5 32,5" fill="#f8fafc" />
              <rect x="26.5" y="5" width="3" height="2" fill="#dc2626" />
              {/* Head */}
              <circle cx="15" cy="12" r="7" fill="#bef264" />
              {/* Big Goblin Pointy Ears */}
              <polygon points="9,10 0,6 8,14" fill="#65a30d" />
              <polygon points="21,10 30,6 22,14" fill="#65a30d" />
              {/* Snout */}
              <polygon points="15,11 13.5,14 16.5,14" fill="#65a30d" />
              {/* Glowing Red Eyes */}
              <circle cx="12.5" cy="10.5" r="1.3" fill="#ff0033" />
              <circle cx="17.5" cy="10.5" r="1.3" fill="#ff0033" />
              {/* Sharp Fangs */}
              <polygon points="13,15 14,15 13.5,17" fill="#ffffff" />
              <polygon points="16,15 17,15 16.5,17" fill="#ffffff" />
            </g>
          </g>
        </svg>
      )}

      {/* STEP 3: AUTHENTIC DRAGON BOSS CENTERED */}
      {step === 3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 3,
            transform: `translate(${dragonPos.x}%, ${dragonPos.y}%)`,
          }}
        >
          <LandscapeDragon
            bossHpPercent={80}
            isDefeated={false}
            offsets={dragonOffsets}
            animationsEnabled={true}
            customShapes={customShapes}
            fills={dragonFills}
            deletedShapes={deletedShapes}
            geometries={dragonGeometries}
            layerOrder={layerOrder}
          />
        </div>
      )}

      {/* STEP 3 BOSS HP BAR (CENTERED ABOVE DRAGON HEAD) */}
      {step === 3 && (
        <div
          style={{
            position: "absolute",
            left: `calc(50% + ${(dragonPos.x + 28) * 6 + dragonHpPos.x}px)`,
            top: `calc(55px + ${dragonPos.y * 3 + dragonHpPos.y}px)`,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading), sans-serif",
              color: "#ffffff",
              marginBottom: "3px",
            }}
          >
            {bossName}
          </div>
          <div
            style={{
              width: "160px",
              height: "15px",
              background: "#1e293b",
              borderRadius: "3px",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, width: "80%", height: "100%", background: "#ef4444" }} />
            <span style={{ position: "relative", zIndex: 2, fontSize: "0.58rem", fontWeight: 800, color: "#ffffff" }}>
              80 / 100 HP (80%)
            </span>
          </div>
        </div>
      )}

      {/* STEP 4: ACTION MENU FLOW (PERFECTLY CENTERED IN VIEWPORT) */}
      {step === 4 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "80px",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <div
            style={{
              background: "#fffded",
              border: "3px solid #101517",
              boxShadow: "5px 5px 0 #101517",
              borderRadius: "14px",
              padding: "16px 22px",
              maxWidth: "460px",
              width: "88%",
              pointerEvents: "auto",
              animation: "tutorialPopIn 0.3s ease forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Zap size={18} color="#7c3aed" />
              <span style={{ fontSize: "0.9rem", fontWeight: 900, fontFamily: "var(--font-heading), sans-serif", color: "#101517" }}>
                Action Menu Flow
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              {/* Attack Button */}
              <div
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <Swords size={16} />
                <span>ATTACK</span>
              </div>

              {/* Branching Arrow */}
              <ArrowRight size={18} color="#101517" />

              {/* Sub-options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                <div
                  style={{
                    background: "#dcfce7",
                    border: "2px solid #101517",
                    boxShadow: "2px 2px 0 #101517",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.76rem", fontWeight: 900, color: "#15803d" }}>👹 Daily Goblin</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#334155" }}>Submit Daily Proof</span>
                </div>

                <div
                  style={{
                    background: "#fee2e2",
                    border: "2px solid #101517",
                    boxShadow: "2px 2px 0 #101517",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.76rem", fontWeight: 900, color: "#b91c1c" }}>🐉 Dragon Boss</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#334155" }}>Submit Task Evidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR (Step indicator, Nudge tool toggle, and Skip) */}
      <div
        style={{
          position: "relative",
          zIndex: 35,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.74rem",
              fontWeight: 900,
              fontFamily: "var(--font-heading), sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              background: "#fff73f",
              color: "#101517",
              border: "2px solid #101517",
              boxShadow: "2px 2px 0 #101517",
              padding: "3px 10px",
              borderRadius: "999px",
            }}
          >
            Step {step} of 4
          </span>
          <div style={{ display: "flex", gap: "5px" }}>
            {([1, 2, 3, 4] as TutorialStep[]).map((s) => (
              <div
                key={s}
                style={{
                  width: "22px",
                  height: "6px",
                  borderRadius: "3px",
                  border: "1.5px solid #101517",
                  background: s === step ? "#fff73f" : (s < step ? "#4ade80" : "rgba(255,255,255,0.5)"),
                  boxShadow: "1px 1px 0 #101517",
                  transition: "background 0.25s ease",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Position Fine-Tuning Nudge Toggle */}
          {(step === 1 || step === 3) && (
            <button
              type="button"
              onClick={() => setShowNudgePanel(!showNudgePanel)}
              style={{
                background: showNudgePanel ? "#fff73f" : "#fffded",
                border: "2px solid #101517",
                boxShadow: "2px 2px 0 #101517",
                color: "#101517",
                fontSize: "0.72rem",
                fontWeight: 900,
                padding: "4px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Fine-tune position"
            >
              <Move size={12} />
              <span>{showNudgePanel ? "Close Nudge" : "Adjust Position"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleFinish}
            style={{
              background: "#fffded",
              border: "2px solid #101517",
              boxShadow: "2px 2px 0 #101517",
              color: "#101517",
              fontSize: "0.75rem",
              fontWeight: 800,
              padding: "4px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Skip Tutorial ✕
          </button>
        </div>
      </div>

      {/* FLOATING POSITION NUDGE CONTROLS (WHEN ADJUST POSITION IS OPEN) */}
      {showNudgePanel && (step === 1 || step === 3) && (
        <div
          style={{
            position: "absolute",
            top: "54px",
            right: "16px",
            zIndex: 45,
            background: "#fffded",
            border: "2px solid #101517",
            boxShadow: "3px 3px 0 #101517",
            borderRadius: "10px",
            padding: "10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "0.72rem",
            fontWeight: 800,
            color: "#101517",
          }}
        >
          {/* Target Toggle */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              type="button"
              onClick={() => setNudgeTarget("element")}
              style={{
                flex: 1,
                padding: "3px 6px",
                borderRadius: "6px",
                border: "1.5px solid #101517",
                background: nudgeTarget === "element" ? "#fff73f" : "#fff",
                fontSize: "0.68rem",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {step === 1 ? "Village" : "Dragon"}
            </button>
            <button
              type="button"
              onClick={() => setNudgeTarget("hp")}
              style={{
                flex: 1,
                padding: "3px 6px",
                borderRadius: "6px",
                border: "1.5px solid #101517",
                background: nudgeTarget === "hp" ? "#fff73f" : "#fff",
                fontSize: "0.68rem",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              HP Bar
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Nudge {nudgeTarget === "element" ? (step === 1 ? "Village" : "Dragon") : "HP Bar"}</span>
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  if (nudgeTarget === "element") setVillagePos({ x: 35.5, y: 0 });
                  else setVillageHpPos({ x: 0, y: 0 });
                } else if (step === 3) {
                  if (nudgeTarget === "element") setDragonPos({ x: -28, y: -2 });
                  else setDragonHpPos({ x: 0, y: 0 });
                }
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#64748b",
              }}
            >
              <RefreshCw size={11} /> Reset
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  if (nudgeTarget === "element") setVillagePos((p: any) => ({ ...p, x: p.x - 1 }));
                  else setVillageHpPos((p: any) => ({ ...p, x: p.x - 5 }));
                } else if (step === 3) {
                  if (nudgeTarget === "element") setDragonPos((p: any) => ({ ...p, x: p.x - 1 }));
                  else setDragonHpPos((p: any) => ({ ...p, x: p.x - 5 }));
                }
              }}
              style={{ padding: "4px 8px", borderRadius: "4px", border: "1.5px solid #101517", background: "#fff", cursor: "pointer" }}
            >
              <ChevronLeft size={13} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    if (nudgeTarget === "element") setVillagePos((p: any) => ({ ...p, y: p.y - 1 }));
                    else setVillageHpPos((p: any) => ({ ...p, y: p.y - 5 }));
                  } else if (step === 3) {
                    if (nudgeTarget === "element") setDragonPos((p: any) => ({ ...p, y: p.y - 1 }));
                    else setDragonHpPos((p: any) => ({ ...p, y: p.y - 5 }));
                  }
                }}
                style={{ padding: "4px 8px", borderRadius: "4px", border: "1.5px solid #101517", background: "#fff", cursor: "pointer" }}
              >
                <ChevronUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    if (nudgeTarget === "element") setVillagePos((p: any) => ({ ...p, y: p.y + 1 }));
                    else setVillageHpPos((p: any) => ({ ...p, y: p.y + 5 }));
                  } else if (step === 3) {
                    if (nudgeTarget === "element") setDragonPos((p: any) => ({ ...p, y: p.y + 1 }));
                    else setDragonHpPos((p: any) => ({ ...p, y: p.y + 5 }));
                  }
                }}
                style={{ padding: "4px 8px", borderRadius: "4px", border: "1.5px solid #101517", background: "#fff", cursor: "pointer" }}
              >
                <ChevronDown size={13} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  if (nudgeTarget === "element") setVillagePos((p: any) => ({ ...p, x: p.x + 1 }));
                  else setVillageHpPos((p: any) => ({ ...p, x: p.x + 5 }));
                } else if (step === 3) {
                  if (nudgeTarget === "element") setDragonPos((p: any) => ({ ...p, x: p.x + 1 }));
                  else setDragonHpPos((p: any) => ({ ...p, x: p.x + 5 }));
                }
              }}
              style={{ padding: "4px 8px", borderRadius: "4px", border: "1.5px solid #101517", background: "#fff", cursor: "pointer" }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* SINGLE COMPACT BOTTOM CARD (Clean, Uncluttered) */}
      <div
        className="rpg-tutorial-bottom-card"
        style={{
          position: "relative",
          zIndex: 35,
          margin: "0 14px 10px 14px",
          background: "#fffded",
          border: "3px solid #101517",
          boxShadow: "4px 4px 0 #101517",
          borderRadius: "12px",
          padding: "10px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {/* Step Title & Quick Badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 900,
              fontFamily: "var(--font-heading), sans-serif",
              color: "#101517",
            }}
          >
            {step === 1 && `1. Defend ${villageName} (Keep HP ≥ 50%)`}
            {step === 2 && "2. Daily Goblins (1 Per Team Member)"}
            {step === 3 && `3. Dragon Boss (${bossName})`}
            {step === 4 && "4. How to Submit Proof & Attack"}
          </span>

          {step === 1 && (
            <div style={{ display: "flex", gap: "6px" }}>
              <span
                style={{
                  background: "#dcfce7",
                  border: "1.5px solid #101517",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#15803d",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                Win: ≥ 50% HP
              </span>
              <span
                style={{
                  background: "#fee2e2",
                  border: "1.5px solid #101517",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#b91c1c",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                Defeat: &lt; 50% HP
              </span>
            </div>
          )}
        </div>

        {/* Concise Description */}
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            lineHeight: 1.4,
            color: "#334155",
            fontWeight: 600,
          }}
        >
          {step === 1 &&
            `Your team's objective is to defend the village until the project deadline. If Village HP stays at or above 50%, your project succeeds. Missed task deadlines and unslayed goblins reduce Village HP.`}

          {step === 2 &&
            `Each team member gets 1 goblin every day. Submit your Daily Proof of Work (progress note or screenshot) to defeat your goblin and protect the village from daily damage.`}

          {step === 3 &&
            `The Dragon's HP scales with all created tasks. Completing tasks on time deals damage to the Dragon. If a task deadline is missed, the damage deflects straight into your Village HP.`}

          {step === 4 &&
            `Click the red ATTACK button anytime to choose between submitting Daily Proof (to slay your goblin) or Task Evidence (to damage the dragon).`}
        </p>

        {/* Footer Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="rpg-modern-btn is-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  borderRadius: "6px",
                  border: "1.5px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rpg-modern-btn is-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 16px",
                  fontSize: "0.78rem",
                  fontWeight: 900,
                  borderRadius: "8px",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  cursor: "pointer",
                }}
              >
                <span>Next</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="rpg-modern-btn is-secondary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "5px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    borderRadius: "8px",
                    border: "2px solid #101517",
                    boxShadow: "2px 2px 0 #101517",
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Again</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="rpg-modern-btn is-goblin"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 18px",
                    fontSize: "0.78rem",
                    fontWeight: 900,
                    borderRadius: "8px",
                    border: "2px solid #101517",
                    boxShadow: "2px 2px 0 #101517",
                    cursor: "pointer",
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Got it!</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
