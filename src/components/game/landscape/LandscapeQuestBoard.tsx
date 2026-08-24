import React, { useState } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";

export type QuestTask = Doc<"tasks"> & {
  assigneeName?: string;
  isMine?: boolean;
  isOpen?: boolean;
  isCompleted?: boolean;
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
      title="Click to open Quest Board"
      style={{
        position: "absolute",
        left: "440px",
        top: "122px",
        width: "90px",
        height: "105px",
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "auto",
        cursor: "pointer",
        userSelect: "none",
        transform: isHovered ? "scale(1.05) translateY(-2px)" : "scale(1)",
        transition: "transform 0.15s ease",
      }}
    >
      {/* Medieval Rustic Wooden Notice Board SVG (Pure Vector, No Fake Shadow, No Emoji) */}
      <svg
        viewBox="0 0 90 95"
        width="90"
        height="95"
        style={{ overflow: "visible" }}
      >
        {/* Support Timber Posts Planted in Earth */}
        <rect x="18" y="36" width="7" height="54" rx="1.5" fill="#3b1402" />
        <rect x="65" y="36" width="7" height="54" rx="1.5" fill="#3b1402" />
        {/* Post Highlights */}
        <rect x="20" y="36" width="2" height="54" fill="#5c2406" opacity="0.6" />
        <rect x="67" y="36" width="2" height="54" fill="#5c2406" opacity="0.6" />

        {/* Diagonal Cross Braces */}
        <line x1="21" y1="68" x2="38" y2="48" stroke="#260c01" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="69" y1="68" x2="52" y2="48" stroke="#260c01" strokeWidth="2.5" strokeLinecap="round" />

        {/* Main Weathered Medieval Wooden Board Frame */}
        <rect
          x="10"
          y="16"
          width="70"
          height="48"
          rx="3"
          fill="#5c2406"
        />
        {/* Inner Wooden Notice Planks */}
        <rect
          x="13"
          y="19"
          width="64"
          height="42"
          rx="2"
          fill="#78350f"
        />
        {/* Horizontal Plank Seams */}
        <line x1="13" y1="33" x2="77" y2="33" stroke="#451a03" strokeWidth="1" />
        <line x1="13" y1="47" x2="77" y2="47" stroke="#451a03" strokeWidth="1" />

        {/* Pinned Parchment Scroll / Sticky Notes */}
        {/* Note 1: Top-Left Parchment */}
        <g transform="translate(16, 22) rotate(-3)">
          <rect x="0" y="0" width="26" height="18" rx="1" fill="#fef3c7" />
          <circle cx="13" cy="2" r="1.5" fill="#b91c1c" />
          <line x1="3" y1="7" x2="23" y2="7" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          <line x1="3" y1="11" x2="19" y2="11" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          <line x1="3" y1="15" x2="14" y2="15" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Note 2: Top-Right Parchment */}
        <g transform="translate(48, 23) rotate(4)">
          <rect x="0" y="0" width="25" height="17" rx="1" fill="#fed7aa" />
          <circle cx="12.5" cy="2" r="1.5" fill="#0369a1" />
          <line x1="3" y1="7" x2="22" y2="7" stroke="#9a3412" strokeWidth="1" strokeLinecap="round" />
          <line x1="3" y1="11" x2="17" y2="11" stroke="#9a3412" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Note 3: Bottom Pinned Sheet */}
        <g transform="translate(28, 41) rotate(1)">
          <rect x="0" y="0" width="34" height="17" rx="1" fill="#fef08a" />
          <circle cx="17" cy="2" r="1.5" fill="#15803d" />
          <line x1="4" y1="7" x2="30" y2="7" stroke="#854d0e" strokeWidth="1" strokeLinecap="round" />
          <line x1="4" y1="11" x2="24" y2="11" stroke="#854d0e" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Medieval Timber Shingle Roof Canopy */}
        <polygon
          points="4,16 45,2 86,16"
          fill="#451a03"
        />
        <polygon
          points="6,15 45,3 84,15"
          fill="#feaa01"
        />
        <polygon
          points="45,3 84,15 45,15"
          fill="#ea580c"
          opacity="0.4"
        />
        {/* Shingle Eaves Beam */}
        <rect x="6" y="14" width="78" height="3" rx="1" fill="#2e1002" />

        {/* Small Notice Badge */}
        <rect x="30" y="5" width="30" height="9" rx="2" fill="#2e1002" />
        <text
          x="45"
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

        {/* Small Task Count Pill on Wood Post */}
        {tasksCount > 0 && (
          <g transform="translate(68, 6)">
            <circle cx="6" cy="6" r="6" fill="#ef4444" />
            <text
              x="6"
              y="8.5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="6.5"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              {tasksCount}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
