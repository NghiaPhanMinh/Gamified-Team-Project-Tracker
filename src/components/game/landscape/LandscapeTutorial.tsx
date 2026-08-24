import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Swords,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Flame,
  Zap,
} from "lucide-react";
import { gameAudio } from "../../../lib/gameAudio";
import { LandscapeDragon } from "./LandscapeDragon";

export type TutorialSceneId = "A" | "B" | "C" | "D" | "E";

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
  const [scene, setScene] = useState<TutorialSceneId>("A");
  const [animKey, setAnimKey] = useState<number>(0);

  if (!isOpen) return null;

  const goToScene = (nextScene: TutorialSceneId) => {
    gameAudio.playTing();
    setScene(nextScene);
    setAnimKey((prev) => prev + 1);
  };

  const handleNext = () => {
    if (scene === "A") goToScene("B");
    else if (scene === "B") goToScene("C");
    else if (scene === "C") goToScene("D");
    else if (scene === "D") goToScene("E");
  };

  const handleRestart = () => {
    goToScene("A");
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
        background: "linear-gradient(180deg, #1e3a8a 0%, #0284c7 45%, #15803d 75%, #166534 100%)",
        userSelect: "none",
      }}
    >
      {/* 1. TUTORIAL REALM ATMOSPHERIC SKY & STAGE GROUND */}
      <svg
        viewBox="0 0 1000 400"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          {/* Palisade Log Def */}
          <g id="tut-palisade-log">
            <polygon points="0,8 5,0 10,8 10,45 0,45" fill="#78350f" stroke="#101517" strokeWidth="1" />
            <polygon points="5,0 10,8 10,45 5,45" fill="#5c2406" />
          </g>

          {/* Watchtower Def */}
          <g id="tut-watchtower">
            <rect x="0" y="20" width="30" height="65" fill="#475569" stroke="#101517" strokeWidth="1.5" />
            <rect x="-4" y="14" width="38" height="7" fill="#64748b" stroke="#101517" strokeWidth="1.5" />
            <rect x="-4" y="8" width="8" height="7" fill="#475569" />
            <rect x="11" y="8" width="8" height="7" fill="#475569" />
            <rect x="26" y="8" width="8" height="7" fill="#475569" />
            <polygon points="-6,14 15,-18 36,14" fill="#feaa01" stroke="#101517" strokeWidth="1.5" />
            <polygon points="15,-18 36,14 15,14" fill="#ea580c" opacity="0.4" />
            <line x1="15" y1="-18" x2="15" y2="-32" stroke="#101517" strokeWidth="2" />
            <polygon points="15,-32 28,-26 15,-20" fill="#feaa01" stroke="#101517" strokeWidth="1" />
          </g>

          {/* Tutorial Castle / Village Group */}
          <g id="tut-village-full">
            <ellipse cx="128" cy="268" rx="148" ry="30" fill="#000000" opacity="0.3" />
            <polygon points="18,185 236,185 244,256 10,256" fill="#15803d" stroke="#101517" strokeWidth="2" />
            {Array.from({ length: 20 }).map((_, i) => (
              <use key={`back-log-${i}`} href="#tut-palisade-log" x={24 + i * 10} y="185" />
            ))}
            <use href="#tut-watchtower" x="0" y="160" />
            <use href="#tut-watchtower" x="220" y="160" />

            {/* Left House */}
            <g transform="translate(36, 178)">
              <rect x="6" y="2" width="9" height="26" fill="#475569" stroke="#101517" strokeWidth="1" />
              <rect x="0" y="28" width="46" height="42" fill="#fef3c7" stroke="#101517" strokeWidth="1.5" />
              <rect x="0" y="28" width="4" height="42" fill="#78350f" />
              <rect x="42" y="28" width="4" height="42" fill="#78350f" />
              <polygon points="-6,28 23,2 52,28" fill="#feaa01" stroke="#101517" strokeWidth="1.5" />
              <rect x="17" y="48" width="12" height="22" rx="2" fill="#5c2406" />
              <rect x="6" y="34" width="8" height="8" fill="#facc15" stroke="#101517" strokeWidth="1" />
            </g>

            {/* Center Great Hall */}
            <g transform="translate(90, 168)">
              <rect x="0" y="30" width="70" height="54" fill="#fef3c7" stroke="#101517" strokeWidth="1.5" />
              <polygon points="-8,30 35,-6 78,30" fill="#feaa01" stroke="#101517" strokeWidth="2" />
              <rect x="25" y="48" width="20" height="36" rx="3" fill="#5c2406" stroke="#101517" strokeWidth="1.5" />
              <rect x="10" y="36" width="10" height="12" rx="2" fill="#facc15" stroke="#101517" strokeWidth="1" />
              <rect x="50" y="36" width="10" height="12" rx="2" fill="#facc15" stroke="#101517" strokeWidth="1" />
            </g>

            {/* Right Forge */}
            <g transform="translate(168, 185)">
              <rect x="0" y="24" width="42" height="38" fill="#fef3c7" stroke="#101517" strokeWidth="1.5" />
              <polygon points="-4,24 21,4 46,24" fill="#feaa01" stroke="#101517" strokeWidth="1.5" />
              <rect x="14" y="38" width="14" height="24" rx="2" fill="#5c2406" />
            </g>

            {/* Front Wall */}
            {Array.from({ length: 6 }).map((_, i) => (
              <use key={`front-l-${i}`} href="#tut-palisade-log" x={15 + i * 10} y="244" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <use key={`front-r-${i}`} href="#tut-palisade-log" x={175 + i * 10} y="244" />
            ))}
          </g>

          {/* Tutorial Goblin Def */}
          <g id="tut-goblin">
            <ellipse cx="15" cy="36" rx="14" ry="4" fill="#000000" opacity="0.3" />
            <rect x="8" y="32" width="4" height="5" rx="1" fill="#0f172a" />
            <rect x="18" y="32" width="4" height="5" rx="1" fill="#0f172a" />
            <polygon points="7,18 23,18 21,33 9,33" fill="#dc2626" stroke="#101517" strokeWidth="1" />
            <rect x="8" y="25" width="14" height="2.5" fill="#451a03" />
            <rect x="13.5" y="24.5" width="3" height="3.5" fill="#facc15" />
            <polygon points="7,19 2,26 5,28 9,22" fill="#bef264" />
            <polygon points="23,19 29,24 27,27 21,22" fill="#bef264" />
            <line x1="28" y1="36" x2="28" y2="3" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="28,-4 23,4 33,4" fill="#f8fafc" stroke="#101517" strokeWidth="1" />
            <circle cx="15" cy="11" r="7.5" fill="#bef264" stroke="#101517" strokeWidth="1.2" />
            <polygon points="9,9 0,5 8,13" fill="#65a30d" stroke="#101517" strokeWidth="1" />
            <polygon points="21,9 30,5 22,13" fill="#65a30d" stroke="#101517" strokeWidth="1" />
            <circle cx="12.5" cy="9.5" r="1.5" fill="#ff0033" />
            <circle cx="17.5" cy="9.5" r="1.5" fill="#ff0033" />
            <polygon points="13,14 14,14 13.5,16" fill="#ffffff" />
            <polygon points="16,14 17,14 16.5,16" fill="#ffffff" />
          </g>
        </defs>

        {/* Ambient Floating Sun & Clouds in Tutorial Realm */}
        <circle cx="880" cy="80" r="45" fill="#fef08a" opacity="0.6" />
        <ellipse cx="180" cy="70" rx="60" ry="18" fill="#ffffff" opacity="0.35" />
        <ellipse cx="740" cy="110" rx="80" ry="22" fill="#ffffff" opacity="0.3" />

        {/* Stage Hills */}
        <path d="M -20,290 Q 250,220 500,270 T 1020,260 L 1020,400 L -20,400 Z" fill="#16a34a" />
        <path d="M -20,320 Q 300,270 650,310 T 1020,300 L 1020,400 L -20,400 Z" fill="#15803d" />

        {/* =====================================================================
            SCENE MANIFESTATIONS (Objects Manifest in Center Stage)
            ===================================================================== */}

        {/* SCENE A: The Village manifests in the center */}
        {scene === "A" && (
          <g key={`tut-manifest-a-${animKey}`} className="tutorial-assembling-village" transform="translate(370, 75) scale(1.1)">
            <use href="#tut-village-full" />
          </g>
        )}

        {/* SCENE B: The Two Threats manifest across the world */}
        {scene === "B" && (
          <g key={`tut-manifest-b-${animKey}`}>
            {/* Village on Left */}
            <g transform="translate(130, 95) scale(0.95)">
              <use href="#tut-village-full" />
            </g>

            {/* Goblin Threat in Center */}
            <g className="tutorial-assembling-goblins" transform="translate(480, 160) scale(2.4)">
              <use href="#tut-goblin" />
            </g>

            {/* Dragon Boss Threat on Right */}
            <g className="tutorial-assembling-dragon" transform="translate(680, 60) scale(0.75)">
              <LandscapeDragon
                bossHpPercent={100}
                isDefeated={false}
                offsets={dragonOffsets}
                animationsEnabled={true}
                customShapes={customShapes}
                fills={dragonFills}
                deletedShapes={deletedShapes}
                geometries={dragonGeometries}
                layerOrder={layerOrder}
              />
            </g>
          </g>
        )}

        {/* SCENE C: The Daily Goblin manifests in the center */}
        {scene === "C" && (
          <g key={`tut-manifest-c-${animKey}`} className="tutorial-assembling-goblins" transform="translate(460, 85) scale(3.5)">
            <use href="#tut-goblin" />
          </g>
        )}

        {/* SCENE D: Lord Procrastinax manifests in the center */}
        {scene === "D" && (
          <g key={`tut-manifest-d-${animKey}`} className="tutorial-assembling-dragon" transform="translate(440, 50) scale(1.15)">
            <LandscapeDragon
              bossHpPercent={85}
              isDefeated={false}
              offsets={dragonOffsets}
              animationsEnabled={true}
              customShapes={customShapes}
              fills={dragonFills}
              deletedShapes={deletedShapes}
              geometries={dragonGeometries}
              layerOrder={layerOrder}
            />
          </g>
        )}
      </svg>

      {/* 2. TOP TUTORIAL NAVIGATION & PROGRESS BAR */}
      <div
        style={{
          position: "relative",
          zIndex: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.75rem",
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
            Tutorial {scene === "A" ? "1/5" : scene === "B" ? "2/5" : scene === "C" ? "3/5" : scene === "D" ? "4/5" : "5/5"}
          </span>
          <div style={{ display: "flex", gap: "5px" }}>
            {(["A", "B", "C", "D", "E"] as TutorialSceneId[]).map((stepId) => (
              <div
                key={stepId}
                style={{
                  width: "22px",
                  height: "6px",
                  borderRadius: "3px",
                  border: "1.5px solid #101517",
                  background: stepId === scene ? "#fff73f" : (stepId < scene ? "#4ade80" : "rgba(255,255,255,0.4)"),
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
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Skip Tutorial ✕
        </button>
      </div>

      {/* 3. CENTER NEOBRUTALIST EXPLAINER CARDS */}
      <div
        style={{
          position: "relative",
          zIndex: 60,
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "6px 16px",
          pointerEvents: "none",
        }}
      >
        {/* SCENE A: Side-by-Side Win/Lose Comparison Card in website style */}
        {scene === "A" && (
          <div
            key={`callout-a-${animKey}`}
            style={{
              background: "#fffded",
              border: "3px solid #101517",
              boxShadow: "4px 4px 0 #101517",
              borderRadius: "14px",
              padding: "12px 18px",
              maxWidth: "520px",
              width: "100%",
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              animation: "tutorialPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#101517" }}>
              <ShieldCheck size={20} color="#0284c7" />
              <span style={{ fontSize: "0.92rem", fontWeight: 900, fontFamily: "var(--font-heading), sans-serif" }}>
                Primary Objective: Defend {villageName}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: "0.8rem", color: "#334155", lineHeight: 1.35 }}>
              Your party must protect this settlement until the final deadline! If Village HP stays <strong>at or above 50%</strong>, you win. Below 50% is a defeat!
            </p>

            {/* Side-by-Side Comparison Panels */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* Win Condition State */}
              <div
                style={{
                  background: "#dcfce7",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 900, color: "#15803d" }}>VICTORY (≥ 50% HP)</span>
                  <CheckCircle2 size={15} color="#15803d" />
                </div>
                <div style={{ background: "#ffffff", border: "1.5px solid #101517", height: "10px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "85%", height: "100%", background: "#22c55e" }} />
                </div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#166534" }}>85% HP — Village Defended</span>
              </div>

              {/* Loss Condition State */}
              <div
                style={{
                  background: "#fee2e2",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 900, color: "#b91c1c" }}>DEFEAT (&lt; 50% HP)</span>
                  <ShieldAlert size={15} color="#b91c1c" />
                </div>
                <div style={{ background: "#ffffff", border: "1.5px solid #101517", height: "10px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "30%", height: "100%", background: "#ef4444" }} />
                </div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#991b1b" }}>30% HP — Village Overwhelmed</span>
              </div>
            </div>
          </div>
        )}

        {/* SCENE B: The Two Threats Arrive */}
        {scene === "B" && (
          <div
            key={`callout-b-${animKey}`}
            style={{
              background: "#fffded",
              border: "3px solid #101517",
              boxShadow: "4px 4px 0 #101517",
              borderRadius: "14px",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "500px",
              animation: "tutorialPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                background: "#ffedd5",
                border: "2px solid #101517",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Swords size={20} color="#ea580c" />
            </div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", fontSize: "0.86rem", color: "#101517", fontWeight: 900 }}>
                Two Threats Menace The Realm
              </h4>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#475569", lineHeight: 1.35 }}>
                <strong>Daily Goblins</strong> raid your walls each morning, while <strong>{bossName}</strong> threatens from the skies above!
              </p>
            </div>
          </div>
        )}

        {/* SCENE C: Goblin Explainer Callout */}
        {scene === "C" && (
          <div
            key={`callout-c-${animKey}`}
            style={{
              background: "#fffded",
              border: "3px solid #101517",
              boxShadow: "4px 4px 0 #101517",
              borderRadius: "14px",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "480px",
              animation: "tutorialPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                background: "#dcfce7",
                border: "2px solid #101517",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "1.2rem",
              }}
            >
              👺
            </div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", fontSize: "0.86rem", color: "#15803d", fontWeight: 900 }}>
                Daily Goblins — 1 Per Adventurer
              </h4>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#334155", lineHeight: 1.35 }}>
                Slay yours every day by submitting your <strong>Daily Proof of Work</strong> (progress note or screenshot). Defeated goblins cannot damage your village!
              </p>
            </div>
          </div>
        )}

        {/* SCENE D: Dragon Boss Explainer Callout */}
        {scene === "D" && (
          <div
            key={`callout-d-${animKey}`}
            style={{
              background: "#fffded",
              border: "3px solid #101517",
              boxShadow: "4px 4px 0 #101517",
              borderRadius: "14px",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              maxWidth: "520px",
              animation: "tutorialPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                background: "#fee2e2",
                border: "2px solid #101517",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Flame size={20} color="#dc2626" />
            </div>
            <div>
              <h4 style={{ margin: "0 0 2px 0", fontSize: "0.86rem", color: "#b91c1c", fontWeight: 900 }}>
                Boss HP = Total Tasks (Two-Way Damage Flow!)
              </h4>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#334155", lineHeight: 1.35 }}>
                Every task created adds to the Dragon's HP. <strong>Finish on time</strong> ➔ Deals damage to the Dragon! <strong>Miss a deadline</strong> ➔ Damage deflects straight into your Village!
              </p>
            </div>
          </div>
        )}

        {/* SCENE E: How to Fight - Branching Action Flow Illustration */}
        {scene === "E" && (
          <div
            key={`callout-e-${animKey}`}
            style={{
              background: "#fffded",
              border: "3px solid #101517",
              boxShadow: "4px 4px 0 #101517",
              borderRadius: "14px",
              padding: "12px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "540px",
              width: "100%",
              pointerEvents: "auto",
              animation: "tutorialPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#7c3aed" }}>
              <Zap size={18} />
              <span style={{ fontSize: "0.88rem", fontWeight: 900, fontFamily: "var(--font-heading), sans-serif", color: "#101517" }}>
                How to Fight: The Action Menu Flow
              </span>
            </div>

            {/* Branching Flow Preview */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
              {/* Step 1: Attack Button */}
              <div
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <Swords size={15} />
                <span>ATTACK</span>
              </div>

              {/* Arrow */}
              <ArrowRight size={16} color="#101517" />

              {/* Two Branches */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                <div
                  style={{
                    background: "#dcfce7",
                    border: "2px solid #101517",
                    boxShadow: "2px 2px 0 #101517",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#15803d" }}>👹 Daily Goblin</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#101517" }}>Submit Daily Proof</span>
                </div>

                <div
                  style={{
                    background: "#fee2e2",
                    border: "2px solid #101517",
                    boxShadow: "2px 2px 0 #101517",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#b91c1c" }}>🐉 Dragon Boss</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#101517" }}>Submit Task Evidence</span>
                </div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 600, color: "#475569", textAlign: "center" }}>
              Click the red circular <strong>Attack</strong> button anytime on your screen to perform these actions!
            </p>
          </div>
        )}
      </div>

      {/* 4. BOTTOM VISUAL NOVEL DIALOGUE BOX (Strictly inside game container) */}
      <div
        className="rpg-visual-novel-dialogue"
        style={{
          position: "relative",
          zIndex: 60,
          margin: "0 14px 12px 14px",
          background: "#fffded",
          border: "3px solid #101517",
          boxShadow: "4px 4px 0 #101517",
          borderRadius: "12px",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Speaker Name Tag */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              background: "#fff73f",
              color: "#101517",
              border: "1.5px solid #101517",
              fontSize: "0.72rem",
              fontWeight: 900,
              fontFamily: "var(--font-heading), sans-serif",
              padding: "2px 8px",
              borderRadius: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {scene === "A" && "🏰 Realm Guide • Defending The Village"}
            {scene === "B" && "⚠️ Realm Guide • The Gathering Threats"}
            {scene === "C" && "👹 Realm Guide • Goblin Daily Progress"}
            {scene === "D" && "🐉 Realm Guide • Dragon Tasks & Deadlines"}
            {scene === "E" && "⚔️ Realm Guide • How to Attack & Win"}
          </div>

          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b" }}>Interactive Realm Walkthrough</span>
        </div>

        {/* Dialogue Script Text */}
        <p
          style={{
            margin: 0,
            fontSize: "0.82rem",
            lineHeight: 1.45,
            color: "#101517",
            fontWeight: 600,
            minHeight: "36px",
          }}
        >
          {scene === "A" &&
            `Welcome to ${villageName}! Your party's sacred mission is to defend this settlement until the project deadline. Keep Village HP at or above 50% to claim victory! If it falls below 50%, the realm falls!`}

          {scene === "B" &&
            `Be on your guard! Two threats menace your realm: a horde of daily goblins raiding the palisade, and ${bossName} brooding overhead.`}

          {scene === "C" &&
            `Every adventurer in your team is assigned their own personal goblin each morning. Submit your Daily Proof of work to slay your goblin and protect your village from damage!`}

          {scene === "D" &&
            `The Dragon's HP grows with every task created. Finish tasks on time to blast the Dragon with damage! But beware: if a deadline expires without submission, that damage deflects straight into your Village!`}

          {scene === "E" &&
            `Ready to fight? Click the red circular ATTACK button on your screen anytime to choose between submitting your Daily Proof (slaying your goblin) or submitting Task Evidence (striking the dragon)!`}
        </p>

        {/* Footer Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
          {scene !== "E" ? (
            <button
              type="button"
              onClick={handleNext}
              className="rpg-modern-btn is-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 16px",
                fontSize: "0.8rem",
                fontWeight: 900,
                borderRadius: "8px",
                border: "2px solid #101517",
                boxShadow: "2px 2px 0 #101517",
                cursor: "pointer",
              }}
            >
              <span>Next</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleRestart}
                className="rpg-modern-btn is-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  borderRadius: "8px",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={14} />
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
                  padding: "6px 18px",
                  fontSize: "0.8rem",
                  fontWeight: 900,
                  borderRadius: "8px",
                  border: "2px solid #101517",
                  boxShadow: "2px 2px 0 #101517",
                  cursor: "pointer",
                }}
              >
                <CheckCircle2 size={15} />
                <span>Got it!</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
