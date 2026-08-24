import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Swords,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { gameAudio } from "../../../lib/gameAudio";
import { LandscapeSky } from "./LandscapeSky";
import { LandscapeTerrain } from "./LandscapeTerrain";
import { LandscapeVillage } from "./LandscapeVillage";
import { LandscapeGoblins } from "./LandscapeGoblins";
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

  const sampleGoblins = [
    { id: "tut1", memberId: "tut1", memberName: "You", goblinState: "active" as const, isDefeated: false },
    { id: "tut2", memberId: "tut2", memberName: "Teammate", goblinState: "active" as const, isDefeated: false },
  ];

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
      {/* 1. ACTUAL IN-GAME BACKGROUND: REAL SKY & TERRAIN */}
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        <LandscapeSky />
      </div>

      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
        <LandscapeTerrain />
      </div>

      {/* 2. REAL GAMEPLAY ELEMENTS PER STEP (NOT COVERED UP) */}

      {/* Step 1 & Step 4: Real Village */}
      {(step === 1 || step === 4) && (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}>
          <LandscapeVillage
            villageHpPercent={100}
            villageName={villageName}
            villageHpBarPos={{ x: 0, y: 0 }}
            villageHpBarWidth={200}
            villageHpBarHeight={18}
            villageHpBarScale={1}
          />
        </div>
      )}

      {/* Step 2 & Step 4: Real Daily Goblins */}
      {(step === 2 || step === 4) && (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3 }}>
          <LandscapeGoblins goblins={sampleGoblins} />
        </div>
      )}

      {/* Step 3 & Step 4: Real Dragon Boss */}
      {(step === 3 || step === 4) && (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 4 }}>
          {/* Boss HP Bar for Tutorial */}
          <div
            style={{
              position: "absolute",
              right: "22%",
              top: "60px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: "var(--font-heading), sans-serif",
                marginBottom: "2px",
              }}
            >
              {bossName}
            </span>
            <div
              style={{
                width: "160px",
                height: "16px",
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
              <span style={{ position: "relative", zIndex: 2, fontSize: "0.58rem", fontWeight: 800, color: "#fff" }}>
                80 / 100 HP (80%)
              </span>
            </div>
          </div>

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

      {/* 3. STEP 4 ONLY: PROPER ACTION MENU FLOW VISUAL (CENTERED) */}
      {step === 4 && (
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            background: "#fffded",
            border: "3px solid #101517",
            boxShadow: "5px 5px 0 #101517",
            borderRadius: "14px",
            padding: "14px 20px",
            maxWidth: "520px",
            width: "90%",
            animation: "tutorialPopIn 0.3s ease forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <Zap size={18} color="#7c3aed" />
            <span style={{ fontSize: "0.88rem", fontWeight: 900, fontFamily: "var(--font-heading), sans-serif", color: "#101517" }}>
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
                fontSize: "0.78rem",
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

            {/* Branching Arrows */}
            <ArrowRight size={18} color="#101517" />

            {/* Sub-options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <div
                style={{
                  background: "#dcfce7",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.74rem", fontWeight: 900, color: "#15803d" }}>👹 Daily Goblin</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#334155" }}>Submit Daily Proof</span>
              </div>

              <div
                style={{
                  background: "#fee2e2",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.74rem", fontWeight: 900, color: "#b91c1c" }}>🐉 Dragon Boss</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#334155" }}>Submit Task Evidence</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TOP BAR (Step indicator & Skip) */}
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

      {/* 5. SINGLE COMPACT BOTTOM EXPLAINER CARD (Clean & Uncluttered) */}
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
        {/* Step Title & Objective */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
          </div>

          {/* Quick Stat Badges for Step 1 */}
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
