import React from "react";
import { Plus, User } from "lucide-react";
import type { Doc } from "../../../../convex/_generated/dataModel";

export type QuestTask = Doc<"tasks"> & {
  assigneeName?: string;
  isMine?: boolean;
  isOpen?: boolean;
};

type LandscapeQuestBoardProps = {
  tasks: QuestTask[];
  onSelectTask: (task: QuestTask) => void;
  onCreateTask: () => void;
};

const NOTE_COLORS = [
  { bg: "#fef08a", border: "#ca8a04", pin: "#ef4444" }, // Yellow
  { bg: "#bae6fd", border: "#0284c7", pin: "#f97316" }, // Cyan
  { bg: "#fbcfe8", border: "#db2777", pin: "#8b5cf6" }, // Pink
  { bg: "#bbf7d0", border: "#16a34a", pin: "#ef4444" }, // Green
  { bg: "#fed7aa", border: "#ea580c", pin: "#0ea5e9" }, // Orange
];

export function LandscapeQuestBoard({
  tasks,
  onSelectTask,
  onCreateTask,
}: LandscapeQuestBoardProps) {
  const displayTasks = tasks.slice(0, 8);

  return (
    <div
      className="landscape-questboard-layer"
      style={{
        position: "absolute",
        left: "345px",
        top: "145px",
        width: "155px",
        height: "175px",
        zIndex: 18,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {/* Wooden Roof Canopy & Quest Board Header */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "3px 5px",
          background: "#78350f",
          border: "2px solid #101517",
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <span
          style={{
            fontSize: "0.62rem",
            fontWeight: 900,
            color: "#fef08a",
            fontFamily: "var(--font-heading), sans-serif",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          📜 Quests
        </span>

        {/* In-Canvas Create Task Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCreateTask();
          }}
          title="Create New Task"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            background: "#fff73f",
            color: "#101517",
            border: "1.5px solid #101517",
            borderRadius: "4px",
            fontSize: "0.58rem",
            fontWeight: 900,
            padding: "1px 5px",
            cursor: "pointer",
            boxShadow: "1px 1px 0 #101517",
            transition: "transform 0.1s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Plus size={10} strokeWidth={3} />
          <span>New</span>
        </button>
      </div>

      {/* Main Cork/Parchment Board Area */}
      <div
        style={{
          width: "100%",
          height: "128px",
          background: "#d97706",
          border: "2px solid #101517",
          borderTop: "none",
          padding: "4px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          boxShadow: "inset 0 0 8px rgba(0,0,0,0.35)",
        }}
      >
        {tasks.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / span 2",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#fef3c7",
              textAlign: "center",
              fontSize: "0.6rem",
              fontWeight: 700,
              padding: "8px 2px",
            }}
          >
            <span>No quests yet!</span>
            <span style={{ fontSize: "0.55rem", opacity: 0.85 }}>Click '+ New' to post one</span>
          </div>
        ) : (
          displayTasks.map((task, idx) => {
            const colorTheme = NOTE_COLORS[idx % NOTE_COLORS.length];
            const hasAssignee = Boolean(task.assigneeName && task.assigneeName !== "No one" && task.assigneeName !== "Unassigned");
            const assigneeLabel = hasAssignee ? task.assigneeName : "No one";

            return (
              <div
                key={task._id}
                onClick={() => onSelectTask(task)}
                style={{
                  position: "relative",
                  background: colorTheme.bg,
                  border: "1.5px solid #101517",
                  borderRadius: "3px",
                  padding: "6px 3px 3px 3px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "52px",
                  boxShadow: "1.5px 1.5px 0 rgba(0,0,0,0.3)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px) scale(1.04)";
                  e.currentTarget.style.zIndex = "10";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.zIndex = "1";
                }}
              >
                {/* Pushpin Dot */}
                <div
                  style={{
                    position: "absolute",
                    top: "1.5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: colorTheme.pin,
                    border: "0.5px solid #101517",
                  }}
                />

                {/* Task Title (Condensed) */}
                <div
                  style={{
                    fontSize: "0.56rem",
                    fontWeight: 800,
                    color: "#101517",
                    lineHeight: "1.15",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    wordBreak: "break-word",
                  }}
                  title={task.title}
                >
                  {task.title}
                </div>

                {/* Assignee Badge */}
                <div
                  style={{
                    marginTop: "2px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                    background: hasAssignee ? "rgba(16,21,23,0.1)" : "#fee2e2",
                    color: hasAssignee ? "#101517" : "#b91c1c",
                    border: "0.5px solid " + (hasAssignee ? "#101517" : "#ef4444"),
                    borderRadius: "2px",
                    padding: "0.5px 2px",
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  <User size={7} strokeWidth={2.5} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {assigneeLabel}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Board Stand Post and Bottom Label Tag ('Task need to do') */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Wooden Posts */}
        <div style={{ width: "80%", display: "flex", justifyContent: "space-between", height: "8px" }}>
          <div style={{ width: "6px", height: "100%", background: "#451a03", border: "1px solid #101517" }} />
          <div style={{ width: "6px", height: "100%", background: "#451a03", border: "1px solid #101517" }} />
        </div>

        {/* High-Contrast Board Banner Underneath */}
        <div
          style={{
            background: "#fff73f",
            color: "#101517",
            border: "1.5px solid #101517",
            borderRadius: "4px",
            padding: "1px 6px",
            fontSize: "0.58rem",
            fontWeight: 900,
            fontFamily: "var(--font-heading), sans-serif",
            letterSpacing: "0.02em",
            boxShadow: "2px 2px 0 #101517",
            whiteSpace: "nowrap",
          }}
        >
          Task need to do
        </div>
      </div>
    </div>
  );
}
