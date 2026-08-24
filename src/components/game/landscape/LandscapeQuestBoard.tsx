import React, { useState } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";

export type QuestTask = Doc<"tasks"> & {
  assigneeName?: string;
  isMine?: boolean;
  isOpen?: boolean;
  isCompleted?: boolean;
};

type LandscapeQuestBoardProps = {
  hasNotification?: boolean;
  notificationCount?: number;
  tasksCount?: number;
  onOpenBoard: () => void;
};

export function LandscapeQuestBoard({
  hasNotification = false,
  notificationCount = 0,
  tasksCount = 0,
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
        left: "44%",
        top: "28%",
        width: "10.8%",
        aspectRatio: "108 / 124",
        maxWidth: "115px",
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "auto",
        cursor: "pointer",
        userSelect: "none",
        transform: isHovered ? "translate(-50%, -50%) scale(1.06) translateY(-2px)" : "translate(-50%, -50%) scale(1)",
        transition: "transform 0.15s ease",
      }}
    >
      {/* Medieval Rustic Wooden Notice Board SVG (Pure Vector with Ground Vector Shadow, No Emoji) */}
      <svg
        viewBox="0 0 92 98"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        {/* Ground Vector Shadow Under Support Posts (No drop shadow filter, flat vector ellipse) */}
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
        <rect
          x="10"
          y="16"
          width="72"
          height="52"
          rx="3"
          fill="#5c2406"
        />
        {/* Inner Wooden Notice Planks */}
        <rect
          x="13"
          y="19"
          width="66"
          height="46"
          rx="2"
          fill="#78350f"
        />
        {/* Horizontal Plank Seams */}
        <line x1="13" y1="34" x2="79" y2="34" stroke="#451a03" strokeWidth="1" />
        <line x1="13" y1="50" x2="79" y2="50" stroke="#451a03" strokeWidth="1" />

        {/* Pinned Parchment Scroll / Sticky Notes */}
        {/* Note 1: Top-Left Parchment */}
        <g transform="translate(16, 22) rotate(-3)">
          <rect x="0" y="0" width="27" height="19" rx="1" fill="#fef3c7" />
          <circle cx="13.5" cy="2" r="1.5" fill="#b91c1c" />
          <line x1="3" y1="7" x2="24" y2="7" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          <line x1="3" y1="11" x2="20" y2="11" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          <line x1="3" y1="15" x2="15" y2="15" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Note 2: Top-Right Parchment */}
        <g transform="translate(49, 23) rotate(4)">
          <rect x="0" y="0" width="26" height="18" rx="1" fill="#fed7aa" />
          <circle cx="13" cy="2" r="1.5" fill="#0369a1" />
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
        <polygon
          points="4,16 46,2 88,16"
          fill="#451a03"
        />
        <polygon
          points="6,15 46,3 86,15"
          fill="#feaa01"
        />
        <polygon
          points="46,3 86,15 46,15"
          fill="#ea580c"
          opacity="0.4"
        />
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

        {/* Prominent Red Circle Notification (Enlarged & Only Shown when User has Incomplete Tasks) */}
        {hasNotification && (
          <g transform="translate(70, 0)">
            <circle cx="8.5" cy="8.5" r="8.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <text
              x="8.5"
              y="11.5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="8"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              {notificationCount > 0 ? (notificationCount > 99 ? "99+" : notificationCount) : "!"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
