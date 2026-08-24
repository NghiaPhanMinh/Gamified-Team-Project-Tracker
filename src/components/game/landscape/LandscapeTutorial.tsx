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

      {/* 2. INDEPENDENT TUTORIAL CANVAS ELEMENTS (CENTERED) */}
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
        <defs>
          {/* Palisade Timber Log */}
          <g id="tut2-palisade-log">
            <polygon points="0,8 5,0 10,8 10,45 0,45" fill="#78350f" />
            <polygon points="5,0 10,8 10,45 5,45" fill="#5c2406" />
          </g>

          {/* Watchtower */}
          <g id="tut2-watchtower">
            <rect x="0" y="20" width="30" height="65" fill="#475569" />
            <line x1="0" y1="35" x2="30" y2="35" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="50" x2="30" y2="50" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="65" x2="30" y2="65" stroke="#334155" strokeWidth="1" />
            <line x1="15" y1="20" x2="15" y2="35" stroke="#334155" strokeWidth="1" />
            <line x1="8" y1="35" x2="8" y2="50" stroke="#334155" strokeWidth="1" />
            <line x1="22" y1="35" x2="22" y2="50" stroke="#334155" strokeWidth="1" />
            <line x1="15" y1="50" x2="15" y2="65" stroke="#334155" strokeWidth="1" />
            <rect x="13" y="38" width="4" height="10" rx="2" fill="#0f172a" />
            <rect x="-4" y="14" width="38" height="7" fill="#64748b" />
            <rect x="-4" y="8" width="8" height="7" fill="#475569" />
            <rect x="11" y="8" width="8" height="7" fill="#475569" />
            <rect x="26" y="8" width="8" height="7" fill="#475569" />
            <polygon points="-6,14 15,-18 36,14" fill="#feaa01" />
            <polygon points="15,-18 36,14 15,14" fill="#ea580c" opacity="0.4" />
            <line x1="15" y1="-18" x2="15" y2="-32" stroke="#334155" strokeWidth="2" />
            <polygon points="15,-32 28,-26 15,-20" fill="#feaa01" />
          </g>

          {/* Full Medieval Village */}
          <g id="tut2-village">
            <ellipse cx="128" cy="268" rx="148" ry="32" fill="#000000" opacity="0.25" />
            <polygon points="18,185 236,185 244,256 10,256" fill="#17a738" />
            {Array.from({ length: 20 }).map((_, i) => (
              <use key={`bg-log-${i}`} href="#tut2-palisade-log" x={24 + i * 10} y="185" />
            ))}
            <use href="#tut2-watchtower" x="0" y="160" />
            <use href="#tut2-watchtower" x="220" y="160" />
            {Array.from({ length: 5 }).map((_, i) => (
              <use key={`l-log-${i}`} href="#tut2-palisade-log" x={15 - i * 1.2} y={195 + i * 9} />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <use key={`r-log-${i}`} href="#tut2-palisade-log" x={233 + i * 1.2} y={195 + i * 9} />
            ))}

            {/* Cottage 1 */}
            <g transform="translate(36, 178)">
              <rect x="6" y="2" width="9" height="26" fill="#475569" />
              <g transform="translate(10.5, 2)">
                <circle cx="0" cy="0" r="4.5" fill="#f1f5f9" className="village-smoke-1" />
                <circle cx="0" cy="0" r="5.8" fill="#e2e8f0" className="village-smoke-2" />
              </g>
              <rect x="0" y="28" width="46" height="42" fill="#fef3c7" />
              <rect x="0" y="28" width="4" height="42" fill="#78350f" />
              <rect x="42" y="28" width="4" height="42" fill="#78350f" />
              <polygon points="-6,28 23,2 52,28" fill="#feaa01" />
              <rect x="17" y="48" width="12" height="22" rx="2" fill="#5c2406" />
              <rect x="6" y="34" width="8" height="8" rx="1" fill="#fde047" stroke="#78350f" strokeWidth="1" />
            </g>

            {/* Great Hall */}
            <g transform="translate(94, 142)">
              <rect x="52" y="10" width="10" height="30" fill="#475569" />
              <g transform="translate(57, 10)">
                <circle cx="0" cy="0" r="5.2" fill="#f1f5f9" className="village-smoke-2" />
              </g>
              <rect x="0" y="38" width="68" height="74" fill="#fef3c7" />
              <rect x="0" y="38" width="5" height="74" fill="#78350f" />
              <rect x="63" y="38" width="5" height="74" fill="#78350f" />
              <polygon points="-8,38 34,-12 76,38" fill="#feaa01" />
              <polygon points="34,-12 76,38 34,38" fill="#ea580c" opacity="0.35" />
              <path d="M 23,80 Q 34,68 45,80 L 45,112 L 23,112 Z" fill="#451a03" />
              <rect x="10" y="52" width="12" height="15" rx="2" fill="#fde047" stroke="#78350f" strokeWidth="1" />
              <rect x="46" y="52" width="12" height="15" rx="2" fill="#fde047" stroke="#78350f" strokeWidth="1" />
            </g>

            {/* Cottage 2 */}
            <g transform="translate(170, 182)">
              <rect x="28" y="2" width="8" height="24" fill="#475569" />
              <rect x="0" y="24" width="44" height="42" fill="#fef3c7" />
              <rect x="0" y="24" width="4" height="42" fill="#78350f" />
              <rect x="40" y="24" width="4" height="42" fill="#78350f" />
              <polygon points="-4,24 22,0 48,24" fill="#feaa01" />
              <rect x="15" y="44" width="12" height="22" rx="2" fill="#5c2406" />
            </g>

            {/* Front Wall */}
            {Array.from({ length: 6 }).map((_, i) => (
              <use key={`fl-log-${i}`} href="#tut2-palisade-log" x={15 + i * 10} y="244" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <use key={`fr-log-${i}`} href="#tut2-palisade-log" x={175 + i * 10} y="244" />
            ))}
          </g>

          {/* Crisp Daily Goblin */}
          <g id="tut2-goblin-body">
            <ellipse cx="15" cy="38" rx="14" ry="4" fill="#000000" opacity="0.25" />
            <rect x="8" y="34" width="4" height="4" rx="1" fill="#0f172a" />
            <rect x="18" y="34" width="4" height="4" rx="1" fill="#0f172a" />
            <polygon points="7,20 23,20 21,34 9,34" fill="#dc2626" />
            <rect x="8" y="27" width="14" height="2.5" fill="#451a03" />
            <rect x="13.5" y="26.5" width="3" height="3.5" fill="#facc15" />
            <polygon points="7,21 2,28 5,30 9,24" fill="#a3e635" />
            <polygon points="23,21 29,26 27,29 21,24" fill="#a3e635" />
            <line x1="28" y1="36" x2="28" y2="3" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <polygon points="28,-2 24,5 32,5" fill="#f8fafc" />
            <rect x="26.5" y="5" width="3" height="2" fill="#dc2626" />
            <circle cx="15" cy="12" r="7" fill="#bef264" />
            <polygon points="9,10 0,6 8,14" fill="#65a30d" />
            <polygon points="21,10 30,6 22,14" fill="#65a30d" />
            <polygon points="15,11 13.5,14 16.5,14" fill="#65a30d" />
            <circle cx="12.5" cy="10.5" r="1.3" fill="#ff0033" />
            <circle cx="17.5" cy="10.5" r="1.3" fill="#ff0033" />
            <polygon points="13,15 14,15 13.5,17" fill="#ffffff" />
            <polygon points="16,15 17,15 16.5,17" fill="#ffffff" />
          </g>
        </defs>

        {/* STEP 1: VILLAGE CENTERED IN THE MIDDLE (x = 500) */}
        {step === 1 && (
          <g transform="translate(370, 0)">
            <use href="#tut2-village" />
          </g>
        )}

        {/* STEP 2: GOBLIN IN THE CENTER OF THE MEADOW (x = 500, y = 160) */}
        {step === 2 && (
          <g transform="translate(470, 140) scale(2.2)" style={{ animation: "goblin-breath 2s ease-in-out infinite" }}>
            <use href="#tut2-goblin-body" />
          </g>
        )}
      </svg>

      {/* STEP 1 VILLAGE HP BAR (CENTERED ABOVE VILLAGE) */}
      {step === 1 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "85px",
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
            {villageName}
          </div>
          <div
            style={{
              width: "150px",
              height: "14px",
              background: "#1e293b",
              borderRadius: "3px",
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", background: "#22c55e" }} />
            <span style={{ position: "relative", zIndex: 2, fontSize: "0.58rem", fontWeight: 800, color: "#ffffff" }}>
              100% HP
            </span>
          </div>
        </div>
      )}

      {/* STEP 3: DRAGON BOSS CENTERED (x = 500) */}
      {step === 3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 3,
            transform: "translate(-230px, -15px)",
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

      {/* STEP 3 BOSS HP BAR (CENTERED ABOVE DRAGON) */}
      {step === 3 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "60px",
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

      {/* STEP 4: ACTION MENU FLOW (PERFECTLY CENTERED ON SCREEN) */}
      {step === 4 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "24%",
            transform: "translateX(-50%)",
            zIndex: 30,
            background: "#fffded",
            border: "3px solid #101517",
            boxShadow: "5px 5px 0 #101517",
            borderRadius: "14px",
            padding: "14px 20px",
            maxWidth: "480px",
            width: "88%",
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

      {/* TOP BAR (Step indicator & Skip) */}
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
