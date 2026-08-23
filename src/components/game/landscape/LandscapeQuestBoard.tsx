import React, { useState } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";

export type QuestTask = Doc<"tasks"> & {
  assigneeName?: string;
  isMine?: boolean;
  isOpen?: boolean;
};

type LandscapeQuestBoardProps = {
  tasksCount: number;
  onOpenBoard: () => void;
};

export function LandscapeQuestBoard({
  tasksCount,
  onOpenBoard,
}: LandscapeQuestBoardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="landscape-questboard-layer"
      onClick={onOpenBoard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Click to open Quest Board (Task need to do)"
      style={{
        position: "absolute",
        left: "385px",
        top: "148px",
        width: "115px",
        height: "140px",
        zIndex: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "auto",
        cursor: "pointer",
        userSelect: "none",
        transform: isHovered ? "scale(1.06) translateY(-2px)" : "scale(1)",
        transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* SVG Vector Quest Board */}
      <svg
        viewBox="0 0 115 110"
        width="115"
        height="110"
        style={{ overflow: "visible", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))" }}
      >
        {/* Support Timber Posts Standing in Earth */}
        <rect x="22" y="45" width="8" height="60" rx="2" fill="#451a03" stroke="#101517" strokeWidth="2" />
        <rect x="85" y="45" width="8" height="60" rx="2" fill="#451a03" stroke="#101517" strokeWidth="2" />

        {/* Diagonal Cross Braces */}
        <line x1="26" y1="80" x2="45" y2="60" stroke="#2e1002" strokeWidth="3" strokeLinecap="round" />
        <line x1="89" y1="80" x2="70" y2="60" stroke="#2e1002" strokeWidth="3" strokeLinecap="round" />

        {/* Main Cork/Wood Notice Board Backing */}
        <rect
          x="12"
          y="18"
          width="91"
          height="62"
          rx="6"
          fill="#92400e"
          stroke="#101517"
          strokeWidth="2.5"
        />
        {/* Inner Notice Board Cork Area */}
        <rect
          x="16"
          y="22"
          width="83"
          height="54"
          rx="4"
          fill="#d97706"
          stroke="#78350f"
          strokeWidth="1.5"
        />

        {/* Pinned Vector Sticky Notes */}
        {/* Note 1: Top-Left (Pastel Yellow) */}
        <g transform="translate(20, 26) rotate(-4)">
          <rect x="0" y="0" width="34" height="22" rx="2" fill="#fef08a" stroke="#101517" strokeWidth="1.2" />
          <circle cx="17" cy="2.5" r="2" fill="#ef4444" stroke="#101517" strokeWidth="0.8" />
          <line x1="4" y1="9" x2="30" y2="9" stroke="#713f12" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="14" x2="24" y2="14" stroke="#713f12" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="18" x2="18" y2="18" stroke="#713f12" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Note 2: Top-Right (Pastel Cyan) */}
        <g transform="translate(61, 27) rotate(5)">
          <rect x="0" y="0" width="33" height="21" rx="2" fill="#bae6fd" stroke="#101517" strokeWidth="1.2" />
          <circle cx="16.5" cy="2.5" r="2" fill="#0284c7" stroke="#101517" strokeWidth="0.8" />
          <line x1="4" y1="9" x2="29" y2="9" stroke="#0369a1" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="14" x2="22" y2="14" stroke="#0369a1" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Note 3: Bottom-Left (Pastel Pink) */}
        <g transform="translate(21, 51) rotate(3)">
          <rect x="0" y="0" width="32" height="21" rx="2" fill="#fbcfe8" stroke="#101517" strokeWidth="1.2" />
          <circle cx="16" cy="2.5" r="2" fill="#db2777" stroke="#101517" strokeWidth="0.8" />
          <line x1="4" y1="9" x2="28" y2="9" stroke="#9d174d" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="14" x2="20" y2="14" stroke="#9d174d" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Note 4: Bottom-Right (Pastel Green) */}
        <g transform="translate(59, 50) rotate(-3)">
          <rect x="0" y="0" width="35" height="22" rx="2" fill="#bbf7d0" stroke="#101517" strokeWidth="1.2" />
          <circle cx="17.5" cy="2.5" r="2" fill="#16a34a" stroke="#101517" strokeWidth="0.8" />
          <line x1="4" y1="9" x2="31" y2="9" stroke="#14532d" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="14" x2="24" y2="14" stroke="#14532d" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Wooden Pitched Roof / Shingle Canopy */}
        <polygon
          points="6,18 57.5,2 109,18"
          fill="#feaa01"
          stroke="#101517"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <polygon
          points="57.5,2 109,18 57.5,18"
          fill="#ea580c"
          opacity="0.35"
        />
        {/* Shingle Trim Beam */}
        <rect x="8" y="16" width="99" height="4" rx="1.5" fill="#78350f" stroke="#101517" strokeWidth="1.5" />

        {/* Roof Crest Plaque: QUESTS */}
        <rect x="36" y="5" width="43" height="12" rx="3" fill="#78350f" stroke="#101517" strokeWidth="1.5" />
        <text
          x="57.5"
          y="13.5"
          textAnchor="middle"
          fill="#fef08a"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="0.5"
        >
          📜 QUESTS
        </text>
      </svg>

      {/* High-Contrast Neo-Brutalist Plaque Label Underneath ("Task need to do") */}
      <div
        style={{
          marginTop: "-4px",
          background: "#fff73f",
          color: "#101517",
          border: "2px solid #101517",
          borderRadius: "6px",
          padding: "2px 8px",
          fontSize: "0.62rem",
          fontWeight: 900,
          fontFamily: "var(--font-heading), sans-serif",
          letterSpacing: "0.02em",
          boxShadow: isHovered ? "3px 3px 0 #101517" : "2px 2px 0 #101517",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "box-shadow 0.15s ease",
        }}
      >
        <span>Task need to do</span>
        <span
          style={{
            background: "#101517",
            color: "#fff",
            borderRadius: "10px",
            padding: "0 4px",
            fontSize: "0.55rem",
            fontWeight: 800,
          }}
        >
          {tasksCount}
        </span>
      </div>
    </div>
  );
}
