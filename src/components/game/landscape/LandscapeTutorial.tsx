import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Swords,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Flame,
  Zap,
} from "lucide-react";
import { gameAudio } from "../../../lib/gameAudio";

export type TutorialSceneId = "A" | "B" | "C" | "D" | "E";

interface LandscapeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  villageName?: string;
  bossName?: string;
  onSceneChange?: (scene: TutorialSceneId) => void;
}

export function LandscapeTutorial({
  isOpen,
  onClose,
  villageName = "Town of Last-Minute Hope",
  bossName = "Lord Procrastinax",
  onSceneChange,
}: LandscapeTutorialProps) {
  const [scene, setScene] = useState<TutorialSceneId>("A");
  const [animKey, setAnimKey] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setAnimKey((prev) => prev + 1);
      onSceneChange?.(scene);
    }
  }, [isOpen, scene, onSceneChange]);

  if (!isOpen) return null;

  const handleNext = () => {
    gameAudio.playTing();
    if (scene === "A") setScene("B");
    else if (scene === "B") setScene("C");
    else if (scene === "C") setScene("D");
    else if (scene === "D") setScene("E");
  };

  const handleRestart = () => {
    gameAudio.playTing();
    setScene("A");
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
      className="rpg-tutorial-overlay"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Dynamic Camera Focus Backdrop Overlay (Darkens non-focused areas) */}
      <div
        className={`rpg-tutorial-backdrop scene-${scene.toLowerCase()}`}
        style={{
          position: "absolute",
          inset: 0,
          background:
            scene === "A"
              ? "radial-gradient(circle at 35% 65%, rgba(0,0,0,0.15) 0%, rgba(10,15,28,0.78) 60%)"
              : scene === "C"
              ? "radial-gradient(circle at 45% 70%, rgba(0,0,0,0.1) 0%, rgba(10,15,28,0.8) 55%)"
              : scene === "D"
              ? "radial-gradient(circle at 82% 40%, rgba(0,0,0,0.1) 0%, rgba(10,15,28,0.8) 55%)"
              : scene === "E"
              ? "radial-gradient(circle at 12% 88%, rgba(0,0,0,0.1) 0%, rgba(10,15,28,0.8) 60%)"
              : "rgba(10,15,28,0.65)",
          transition: "background 0.5s ease",
          pointerEvents: "none",
        }}
      />

      {/* Top Scene Progress & Skip Bar */}
      <div
        style={{
          position: "relative",
          zIndex: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              background: "#38bdf8",
              color: "#0f172a",
              padding: "3px 10px",
              borderRadius: "12px",
            }}
          >
            Tutorial {scene === "A" ? "1/5" : scene === "B" ? "2/5" : scene === "C" ? "3/5" : scene === "D" ? "4/5" : "5/5"}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            {(["A", "B", "C", "D", "E"] as TutorialSceneId[]).map((stepId) => (
              <div
                key={stepId}
                style={{
                  width: "24px",
                  height: "4px",
                  borderRadius: "2px",
                  background: stepId === scene ? "#38bdf8" : (stepId < scene ? "#10b981" : "rgba(255,255,255,0.2)"),
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#94a3b8",
            fontSize: "0.75rem",
            padding: "4px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          Skip Tutorial ✕
        </button>
      </div>

      {/* Center Interactive Visual Graphic Callouts */}
      <div
        style={{
          position: "relative",
          zIndex: 60,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          padding: "10px 20px",
        }}
      >
        {/* SCENE A: Side-by-Side Win/Lose 50% Threshold Comparison */}
        {scene === "A" && (
          <div
            key={`scene-a-${animKey}`}
            className="rpg-tutorial-callout scene-a-callout"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              background: "rgba(15, 23, 42, 0.92)",
              border: "1px solid #38bdf8",
              borderRadius: "14px",
              padding: "16px 20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              maxWidth: "560px",
              width: "100%",
              pointerEvents: "auto",
              animation: "tutorialPopIn 0.4s ease forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38bdf8" }}>
              <ShieldCheck size={20} />
              <span style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "0.02em" }}>
                Primary Objective: Defend {villageName}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1", textAlign: "center", lineHeight: "1.4" }}>
              Keep the Village HP <strong>at or above 50%</strong> by the project deadline to win. If it falls below 50%, the realm falls!
            </p>

            {/* Side-by-Side Comparison Panels */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%" }}>
              {/* Win Condition State */}
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1.5px solid #10b981",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#34d399" }}>VICTORY (≥ 50% HP)</span>
                  <CheckCircle2 size={16} color="#34d399" />
                </div>
                <div style={{ background: "#0f172a", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: "85%", height: "100%", background: "#10b981", borderRadius: "5px" }} />
                </div>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>85% HP — Village Stands Strong</span>
              </div>

              {/* Loss Condition State */}
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1.5px solid #ef4444",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f87171" }}>DEFEAT (&lt; 50% HP)</span>
                  <ShieldAlert size={16} color="#f87171" />
                </div>
                <div style={{ background: "#0f172a", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: "30%", height: "100%", background: "#ef4444", borderRadius: "5px" }} />
                </div>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>30% HP — Village Overwhelmed</span>
              </div>
            </div>
          </div>
        )}

        {/* SCENE B: The Threats Arrive */}
        {scene === "B" && (
          <div
            key={`scene-b-${animKey}`}
            className="rpg-tutorial-callout"
            style={{
              background: "rgba(15, 23, 42, 0.92)",
              border: "1px solid #f59e0b",
              borderRadius: "14px",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              maxWidth: "520px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              animation: "tutorialPopIn 0.4s ease forwards",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Swords size={24} color="#fbbf24" />
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "0.9rem", color: "#fbbf24", fontWeight: 800 }}>
                Two Threats Menace the Realm
              </h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                <strong>Daily Goblins</strong> raid your village walls each morning, while <strong>{bossName}</strong> looms in the skies above!
              </p>
            </div>
          </div>
        )}

        {/* SCENE C: Goblin Explainer Callout */}
        {scene === "C" && (
          <div
            key={`scene-c-${animKey}`}
            className="rpg-tutorial-callout"
            style={{
              background: "rgba(15, 23, 42, 0.94)",
              border: "1.5px solid #22c55e",
              borderRadius: "14px",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              maxWidth: "520px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              animation: "tutorialPopIn 0.4s ease forwards",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(34, 197, 94, 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "1.3rem",
              }}
            >
              👺
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "0.88rem", color: "#4ade80", fontWeight: 800 }}>
                Daily Goblins — 1 Per Team Member
              </h4>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                Every player has their own goblin. Slay yours every day by submitting your <strong>Daily Proof of Work</strong> (screenshot, commit link, or progress note).
              </p>
            </div>
          </div>
        )}

        {/* SCENE D: Dragon Boss Explainer Callout */}
        {scene === "D" && (
          <div
            key={`scene-d-${animKey}`}
            className="rpg-tutorial-callout"
            style={{
              background: "rgba(15, 23, 42, 0.94)",
              border: "1.5px solid #ef4444",
              borderRadius: "14px",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              maxWidth: "540px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              animation: "tutorialPopIn 0.4s ease forwards",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Flame size={24} color="#f87171" />
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "0.88rem", color: "#f87171", fontWeight: 800 }}>
                Boss HP = Total Tasks (Two-Way Damage Flow!)
              </h4>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#cbd5e1", lineHeight: 1.4 }}>
                Every project task adds HP to the Dragon. <strong>Finish on time</strong> ➔ Deals damage to the Dragon! <strong>Miss a deadline</strong> ➔ That damage deflects directly into the Village!
              </p>
            </div>
          </div>
        )}

        {/* SCENE E: How to Fight - Branching Attack Flow Diagram */}
        {scene === "E" && (
          <div
            key={`scene-e-${animKey}`}
            className="rpg-tutorial-callout"
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1.5px solid #a855f7",
              borderRadius: "14px",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "580px",
              width: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              pointerEvents: "auto",
              animation: "tutorialPopIn 0.4s ease forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c084fc" }}>
              <Zap size={20} />
              <span style={{ fontSize: "0.92rem", fontWeight: 800 }}>
                How to Fight: The Action Menu Flow
              </span>
            </div>

            {/* Branching Attack Flow Illustration */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
              {/* Step 1: Attack Button */}
              <div
                style={{
                  background: "#b91c1c",
                  color: "#fff",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 0 16px rgba(185, 28, 28, 0.6)",
                  flexShrink: 0,
                }}
              >
                <Swords size={16} />
                <span>ATTACK</span>
              </div>

              {/* Branching Arrows */}
              <ArrowRight size={18} color="#94a3b8" />

              {/* Two Branches */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                {/* Branch 1: Goblin */}
                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid #22c55e",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#4ade80" }}>👹 Daily Goblin</span>
                  <span style={{ fontSize: "0.68rem", color: "#cbd5e1" }}>Submit Daily Progress Proof</span>
                </div>

                {/* Branch 2: Dragon Boss */}
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid #ef4444",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f87171" }}>🐉 Dragon Boss</span>
                  <span style={{ fontSize: "0.68rem", color: "#cbd5e1" }}>Submit Task Completion Proof</span>
                </div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: "0.75rem", color: "#cbd5e1", textAlign: "center" }}>
              Press the circular <strong>Attack</strong> button anytime in battle to open this combat menu!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Visual Novel Dialogue Text Box */}
      <div
        className="rpg-visual-novel-textbox"
        style={{
          position: "relative",
          zIndex: 60,
          margin: "0 16px 16px 16px",
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          border: "2px solid #38bdf8",
          borderRadius: "14px",
          padding: "16px 20px",
          boxShadow: "0 -8px 25px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Speaker Name Tag */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              background: "#0284c7",
              color: "#ffffff",
              fontSize: "0.72rem",
              fontWeight: 800,
              padding: "2px 10px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {scene === "A" && "🏰 Realm Guide • Defending The Village"}
            {scene === "B" && "⚠️ Realm Guide • The Gathering Threats"}
            {scene === "C" && "👹 Realm Guide • Goblin Daily Progress"}
            {scene === "D" && "🐉 Realm Guide • Dragon Tasks & Deadlines"}
            {scene === "E" && "⚔️ Realm Guide • How to Attack & Win"}
          </div>

          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Interactive Realm Walkthrough</span>
        </div>

        {/* Dialogue Script Text */}
        <p
          style={{
            margin: 0,
            fontSize: "0.86rem",
            lineHeight: 1.5,
            color: "#f1f5f9",
            fontWeight: 500,
            minHeight: "42px",
          }}
        >
          {scene === "A" &&
            `Welcome to ${villageName}! Your party's sacred mission is to defend this settlement until the final deadline. If Village Health stays at 50% or higher, your team claims glorious victory. If it falls below 50%, the realm is lost!`}

          {scene === "B" &&
            `Be on your guard! Two distinct threats threaten your progress: a swarm of daily goblins attacking the perimeter wall, and ${bossName} brooding overhead.`}

          {scene === "C" &&
            `Every adventurer in your party is assigned their own personal goblin each morning. To defeat yours, submit a quick Daily Proof (what you worked on today). Slay them all to keep your village undamaged!`}

          {scene === "D" &&
            `The Dragon's Maximum HP grows with every task you create. Complete tasks on time to blast the Dragon with powerful spells. But beware: if a deadline expires without submission, that damage deflects straight into your Village!`}

          {scene === "E" &&
            `Ready to fight? Click the red circular ATTACK button on your screen anytime to choose between submitting your Daily Proof (slaying your goblin) or submitting Task Evidence (striking the dragon)!`}
        </p>

        {/* Footer Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
          {scene !== "E" ? (
            <button
              type="button"
              onClick={handleNext}
              className="rpg-modern-btn is-boss"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                fontSize: "0.82rem",
                fontWeight: 800,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)",
              }}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleRestart}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                  background: "#334155",
                  border: "none",
                  color: "#f1f5f9",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={15} />
                <span>Again</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 22px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.4)",
                }}
              >
                <CheckCircle2 size={16} />
                <span>Got it</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
