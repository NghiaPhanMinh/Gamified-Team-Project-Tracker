import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Swords,
  Zap,
} from "lucide-react";
import { gameAudio } from "../../../lib/gameAudio";
import { LandscapeSky } from "./LandscapeSky";
import { LandscapeTerrain } from "./LandscapeTerrain";
import { LandscapeVillage } from "./LandscapeVillage";
import { LandscapeDragon } from "./LandscapeDragon";
import { LandscapeQuestBoard } from "./LandscapeQuestBoard";

export type TutorialStep = 1 | 2 | 3 | 4 | 5 | 6;

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

  if (!isOpen) return null;

  const goToStep = (nextStep: TutorialStep) => {
    gameAudio.playTing();
    setStep(nextStep);
  };

  const handleNext = () => {
    if (step === 1) goToStep(2);
    else if (step === 2) goToStep(3);
    else if (step === 3) goToStep(4);
    else if (step === 4) goToStep(5);
    else if (step === 5) goToStep(6);
  };

  const handleBack = () => {
    if (step === 6) goToStep(5);
    else if (step === 5) goToStep(4);
    else if (step === 4) goToStep(3);
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

      {/* STEP 1: REAL IN-GAME VILLAGE CENTERED IN MEADOW */}
      {step === 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
            transform: "translate(36.5%, -18%) scale(0.95)",
          }}
        >
          <LandscapeVillage
            villageHpPercent={100}
            villageName={villageName}
            hideHpBar={true}
          />
        </div>
      )}

      {/* STEP 1: VILLAGE HP BAR (CENTERED DIRECTLY ABOVE VILLAGE) */}
      {step === 1 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48px",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 12,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading), sans-serif",
              color: "#ffffff",
              marginBottom: "3px",
              textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)",
              whiteSpace: "nowrap",
            }}
          >
            {villageName}
          </div>
          <div
            style={{
              width: "150px",
              height: "14px",
              background: "#1e293b",
              borderRadius: "3px",
              border: "1.5px solid #101517",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "#22c55e" }} />
            <span style={{ position: "relative", zIndex: 2, fontSize: "0.58rem", fontWeight: 800, color: "#ffffff" }}>
              100% HP (Healthy)
            </span>
          </div>
        </div>
      )}

      {/* STEP 2: CRISP DAILY GOBLIN CENTERED IN MEADOW */}
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
          {/* Centered at (500, 145), scaled up 3.2x */}
          <g transform="translate(500, 145) scale(3.2)">
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
            transform: "translate(-24%, -12%) scale(0.95)",
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

      {/* STEP 3 BOSS HP BAR (CENTERED DIRECTLY ABOVE DRAGON) */}
      {step === 3 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48px",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 12,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading), sans-serif",
              color: "#ffffff",
              marginBottom: "3px",
              textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)",
              whiteSpace: "nowrap",
            }}
          >
            {bossName}
          </div>
          <div
            style={{
              width: "150px",
              height: "14px",
              background: "#1e293b",
              borderRadius: "3px",
              border: "1.5px solid #101517",
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

      {/* STEP 4: ACTION MENU FLOW (CENTERED IN UPPER MEADOW) */}
      {step === 4 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50px",
            transform: "translateX(-50%)",
            width: "92%",
            maxWidth: "360px",
            pointerEvents: "none",
            zIndex: 30,
          }}
        >
          <div
            className="rpg-action-menu-flow-card"
            style={{
              borderRadius: "10px",
              padding: "8px 12px",
              pointerEvents: "auto",
              animation: "tutorialPopIn 0.3s ease forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <Zap size={14} color="#7c3aed" />
              <span className="rpg-action-flow-title" style={{ fontSize: "0.78rem", fontWeight: 900, fontFamily: "var(--font-heading), sans-serif" }}>
                Action Menu Flow
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%" }}>
              {/* Attack Button */}
              <div
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "1.5px solid #101517",
                  boxShadow: "1.5px 1.5px 0 #101517",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                }}
              >
                <Swords size={13} />
                <span>ATTACK</span>
              </div>

              {/* Branching Arrow */}
              <ArrowRight size={14} color="currentColor" />

              {/* Sub-options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <div
                  className="rpg-action-flow-item is-goblin"
                  style={{
                    borderRadius: "5px",
                    padding: "4px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", fontWeight: 900 }}>Daily Goblin</span>
                  <span style={{ fontSize: "0.64rem", fontWeight: 700 }}>Submit Proof</span>
                </div>

                <div
                  className="rpg-action-flow-item is-dragon"
                  style={{
                    borderRadius: "5px",
                    padding: "4px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", fontWeight: 900 }}>Dragon Boss</span>
                  <span style={{ fontSize: "0.64rem", fontWeight: 700 }}>Submit Evidence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5 & 6: CRISP MEDIEVAL QUEST BOARD IN MIDDLE */}
      {(step === 5 || step === 6) && (
        <svg
          viewBox="0 0 1000 400"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 15,
          }}
        >
          {/* Centered at (500, 125) with 1.6x scale so it is 100% above the bottom card */}
          <g transform="translate(500, 125) scale(1.6)">
            <g transform="translate(-46, -49)">
              {/* Ground Vector Shadow Under Support Posts */}
              <ellipse cx="46" cy="94" rx="44" ry="5.5" fill="#000000" opacity="0.25" />

              {/* Support Timber Posts Planted in Earth */}
              <rect x="18" y="36" width="7.5" height="58" rx="1.5" fill="#3b1402" />
              <rect x="66.5" y="36" width="7.5" height="58" rx="1.5" fill="#3b1402" />
              {/* Post Highlights */}
              <rect x="20" y="36" width="2" height="58" fill="#5c2406" opacity="0.6" />
              <rect x="68.5" y="36" width="2" height="58" fill="#5c2406" opacity="0.6" />

              {/* Diagonal Cross Braces */}
              <line x1="21" y1="72" x2="38" y2="48" stroke="#260c01" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="71" y1="72" x2="54" y2="48" stroke="#260c01" strokeWidth="2.5" strokeLinecap="round" />

              {/* Main Weathered Medieval Wooden Board Frame */}
              <rect x="10" y="16" width="72" height="52" rx="3" fill="#5c2406" />
              {/* Inner Wooden Notice Planks */}
              <rect x="13" y="19" width="66" height="46" rx="2" fill="#78350f" />
              {/* Horizontal Plank Seams */}
              <line x1="13" y1="34" x2="79" y2="34" stroke="#451a03" strokeWidth="1" />
              <line x1="13" y1="50" x2="79" y2="50" stroke="#451a03" strokeWidth="1" />

              {/* Pinned Parchment Scroll / Sticky Notes */}
              {/* Note 1: Top-Left Parchment */}
              <g transform="translate(16, 22) rotate(-3)">
                <rect x="0" y="0" width="27" height="19" rx="1" fill="#fef3c7" />
                <circle cx="13.5" cy="2" r="1.5" fill="#b91c1c" />
                <line x1="3" y1="7" x2="24" y2="7" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
                <line x1="3" y1="11" x2="24" y2="11" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
                <line x1="3" y1="15" x2="15" y2="15" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Note 2: Top-Right Parchment */}
              <g transform="translate(49, 23) rotate(4)">
                <rect x="0" y="0" width="26" height="18" rx="1" fill="#fed7aa" />
                <circle cx="13.5" cy="2" r="1.5" fill="#0369a1" />
                <line x1="3" y1="7" x2="23" y2="7" stroke="#9a3412" strokeWidth="1" strokeLinecap="round" />
                <line x1="3" y1="11" x2="18" y2="11" stroke="#9a3412" strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Note 3: Bottom Pinned Sheet */}
              <g transform="translate(29, 44) rotate(1)">
                <rect x="0" y="0" width="35" height="18" rx="1" fill="#fef08a" />
                <circle cx="17.5" cy="2" r="1.5" fill="#15803d" />
                <line x1="4" y1="7" x2="31" y2="7" stroke="#854d0e" strokeWidth="1" strokeLinecap="round" />
                <line x1="4" y1="11" x2="25" y2="11" stroke="#854d0e" strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Medieval Timber Shingle Roof Canopy */}
              <polygon points="4,16 46,2 88,16" fill="#451a03" />
              <polygon points="6,15 46,3 86,15" fill="#feaa01" />
              <polygon points="46,3 86,15 46,15" fill="#ea580c" opacity="0.4" />
              {/* Shingle Eaves Beam */}
              <rect x="6" y="14" width="80" height="3" rx="1" fill="#2e1002" />

              {/* Small Notice Badge */}
              <rect x="31" y="5" width="30" height="9" rx="2" fill="#2e1002" />
              <text
                x="46"
                y="11.5"
                textAnchor="middle"
                fill="#fde047"
                fontSize="5.5"
                fontWeight="bold"
                fontFamily="serif"
                letterSpacing="0.4"
              >
                QUESTS
              </text>
            </g>
          </g>
        </svg>
      )}

      {/* TOP BAR (Step indicator and Skip) */}
      <div
        className="rpg-tutorial-top-bar"
        style={{
          position: "relative",
          zIndex: 35,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 900,
              fontFamily: "var(--font-heading), sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              background: "#fff73f",
              color: "#101517",
              border: "1.5px solid #101517",
              boxShadow: "1.5px 1.5px 0 #101517",
              padding: "2px 8px",
              borderRadius: "999px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Step {step} of 6
          </span>
          <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
            {([1, 2, 3, 4, 5, 6] as TutorialStep[]).map((s) => (
              <div
                key={s}
                style={{
                  width: "12px",
                  height: "4px",
                  borderRadius: "2px",
                  border: "1px solid #101517",
                  background: s === step ? "#fff73f" : (s < step ? "#4ade80" : "rgba(255,255,255,0.6)"),
                  boxShadow: "1px 1px 0 #101517",
                  transition: "background 0.25s ease",
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          className="rpg-tutorial-skip-btn"
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Skip Tutorial ✕
        </button>
      </div>

      {/* SINGLE COMPACT BOTTOM CARD (Clean, Uncluttered, Fits Mobile & Desktop) */}
      <div className="rpg-tutorial-bottom-card">
        {/* Step Title & Quick Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "4px" }}>
          <span className="rpg-tut-title">
            {step === 1 && `1. Defend ${villageName}`}
            {step === 2 && "2. Daily Goblins"}
            {step === 3 && `3. Dragon Boss (${bossName})`}
            {step === 4 && "4. How to Submit Proof & Attack"}
            {step === 5 && "5. Room Creator (Edit & Create Tasks)"}
            {step === 6 && "6. Room Participant (Tasks, Proof & Reviews)"}
          </span>

          {step === 1 && (
            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
              <span className="rpg-tut-badge rpg-tut-badge-win">
                Win: ≥ 50% HP
              </span>
              <span className="rpg-tut-badge rpg-tut-badge-defeat">
                Defeat: &lt; 50% HP
              </span>
            </div>
          )}

          {step === 5 && (
            <span className="rpg-tut-badge rpg-tut-badge-owner">
              Owner Only
            </span>
          )}

          {step === 6 && (
            <span className="rpg-tut-badge rpg-tut-badge-team">
              Team Flow
            </span>
          )}
        </div>

        {/* Concise Description */}
        <p className="rpg-tut-desc">
          {step === 1 &&
            `Defend the village until the deadline. Keep Village HP at or above 50% to win. Missed deadlines & alive goblins damage the village.`}

          {step === 2 &&
            `Each member gets 1 daily goblin. Submit daily proof of progress to defeat your goblin and prevent village damage.`}

          {step === 3 &&
            `Dragon HP scales with tasks. Completing tasks deals damage. If a task deadline is missed, the damage hits your Village HP.`}

          {step === 4 &&
            `Tap ATTACK anytime to submit Daily Proof (slays your goblin) or Task Evidence (strikes the dragon boss).`}

          {step === 5 &&
            `As Room Owner, create and edit tasks directly from the Quest Board. Customize deadlines, requirements, and dragon damage.`}

          {step === 6 &&
            `Participants click the Quest Board to claim tasks, submit evidence, peer-review submissions, and track team progress.`}
        </p>

        {/* Footer Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px", flexShrink: 0 }}>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="rpg-modern-btn is-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "3px 8px",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  borderRadius: "5px",
                  cursor: "pointer",
                  height: "26px",
                }}
              >
                <ArrowLeft size={12} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rpg-modern-btn is-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 14px",
                  fontSize: "0.74rem",
                  fontWeight: 900,
                  borderRadius: "6px",
                  cursor: "pointer",
                  height: "26px",
                }}
              >
                <span>Next</span>
                <ArrowRight size={13} />
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
                    gap: "3px",
                    padding: "3px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    borderRadius: "6px",
                    cursor: "pointer",
                    height: "26px",
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Again</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="rpg-modern-btn is-goblin"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 14px",
                    fontSize: "0.74rem",
                    fontWeight: 900,
                    borderRadius: "6px",
                    cursor: "pointer",
                    height: "26px",
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>Enter Realm</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
