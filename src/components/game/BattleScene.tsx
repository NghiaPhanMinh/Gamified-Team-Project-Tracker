import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";

import { SVGDefs } from "./landscape/SVGDefs";
import { LandscapeSky } from "./landscape/LandscapeSky";
import { LandscapeTerrain } from "./landscape/LandscapeTerrain";
import { LandscapeVillage } from "./landscape/LandscapeVillage";
import { LandscapeGoblins } from "./landscape/LandscapeGoblins";
import { LandscapePlayers } from "./landscape/LandscapePlayers";
import { LandscapeDragon } from "./landscape/LandscapeDragon";
import { LandscapeFX } from "./landscape/LandscapeFX";

type BattleSceneProps = { projectId: Id<"projects">; currentPhase?: string; tasksLocked?: boolean };

type OptionalBattleMetrics = {
  goblinsRemaining?: number;
  totalGoblinsForProject?: number;
  isVillageDestroyed?: boolean;
};

function uploadFile(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  return new Promise<Id<"_storage">>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", uploadUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error("The evidence file upload failed."));
        return;
      }
      try {
        const response = JSON.parse(request.responseText) as {
          storageId: Id<"_storage">;
        };
        resolve(response.storageId);
      } catch {
        reject(new Error("The upload response could not be read."));
      }
    });
    request.addEventListener("error", () =>
      reject(new Error("The evidence file upload failed.")),
    );
    request.send(file);
  });
}

const SHAPE_LABELS: Record<string, string> = {
  backWing_membrane1: "🦅 Back Wing Membrane 1",
  backWing_membrane2: "🦅 Back Wing Membrane 2",
  backWing_membrane3: "🦅 Back Wing Membrane 3",
  backWing_strut1: "🦴 Back Wing Bone Strut 1",
  backWing_strut2: "🦴 Back Wing Bone Strut 2",
  backWing_joint: "🟢 Back Wing Joint",
  backWing_claw: "💅 Back Wing Claw",
  frontWing_membrane1: "🦅 Front Wing Membrane 1",
  frontWing_membrane2: "🦅 Front Wing Membrane 2",
  frontWing_membrane3: "🦅 Front Wing Membrane 3",
  frontWing_strut1: "🦴 Front Wing Bone Strut 1",
  frontWing_strut2: "🦴 Front Wing Bone Strut 2",
  frontWing_joint: "🟢 Front Wing Joint",
  frontWing_claw: "💅 Front Wing Claw",
  tail_seg1: "🐍 Tail Segment 1",
  tail_seg2: "🐍 Tail Segment 2",
  tail_seg3: "🐍 Tail Segment 3",
  tail_shadow: "🐍 Tail Shadow Overlay",
  tail_barb1: "⚔️ Tail Barb Tip 1",
  tail_barb2: "⚔️ Tail Barb Tip 2",
  tail_barb3: "⚔️ Tail Barb Tip 3",
  tail_spine1: "🔺 Tail Spine 1",
  tail_spine2: "🔺 Tail Spine 2",
  tail_spine3: "🔺 Tail Spine 3",
  spine1: "🔺 Dorsal Spine 1",
  spine2: "🔺 Dorsal Spine 2",
  spine3: "🔺 Dorsal Spine 3",
  spine4: "🔺 Dorsal Spine 4",
  spine5: "🔺 Dorsal Spine 5",
  spine6: "🔺 Dorsal Spine 6",
  spine7: "🔺 Dorsal Spine 7",
  backLeg_thigh: "🦵 Back Leg Thigh",
  backLeg_knee: "🟢 Back Leg Knee Joint",
  backLeg_calf: "🦵 Back Leg Calf",
  backLeg_ankle: "🟢 Back Leg Ankle Joint",
  backLeg_foot: "🦶 Back Leg Foot",
  backLeg_claw1: "💅 Back Leg Talon 1",
  backLeg_claw2: "💅 Back Leg Talon 2",
  backLeg_claw3: "💅 Back Leg Talon 3",
  torso_base: "🛡️ Torso Main Frame",
  torso_plate1: "🛡️ Torso Muscle Overlay 1",
  torso_plate2: "🛡️ Torso Muscle Overlay 2",
  torso_chest1: "🛡️ Chest Segment Plate 1",
  torso_chest2: "🛡️ Chest Segment Plate 2",
  torso_chest3: "🛡️ Chest Segment Plate 3",
  torso_chest4: "🛡️ Chest Segment Plate 4",
  torso_chest5: "🛡️ Chest Segment Plate 5",
  frontLeg_thigh: "🦵 Front Leg Thigh",
  frontLeg_knee: "🟢 Front Leg Knee Joint",
  frontLeg_calf: "🦵 Front Leg Calf",
  frontLeg_ankle: "🟢 Front Leg Ankle Joint",
  frontLeg_foot: "🦶 Front Leg Foot",
  frontLeg_claw1: "💅 Front Leg Talon 1",
  frontLeg_claw2: "💅 Front Leg Talon 2",
  frontLeg_claw3: "💅 Front Leg Talon 3",
  frontArm_shoulder: "🟢 Shoulder Joint",
  frontArm_bicep: "💪 Muscular Bicep",
  frontArm_elbow: "🟢 Elbow Joint",
  frontArm_forearm: "💪 Forearm Frame",
  frontArm_wrist: "🟢 Wrist Joint",
  frontArm_claw1: "💅 Arm Talon 1",
  frontArm_claw2: "💅 Arm Talon 2",
  neck_base1: "🦒 Neck Segment 1",
  neck_base2: "🦒 Neck Segment 2",
  neck_plate1: "🦒 Neck Plate 1",
  neck_plate2: "🦒 Neck Plate 2",
  neck_plate3: "🦒 Neck Plate 3",
  mouth_cavity: "🕳️ Throat Cavity Backfill",
  skull_base: "💀 Skull Core base",
  mouth_webbing: "🕸️ Mouth Flap Webbing",
  snout_base: "👃 Snout structure",
  snout_nostril: "🕳️ Nostril Cavity",
  lower_jaw: "💀 Lower Jawbone",
  upper_fang1: "🦷 Upper Fang 1",
  upper_fang2: "🦷 Upper Fang 2",
  upper_fang3: "🦷 Upper Fang 3",
  upper_fang4: "🦷 Upper Fang 4",
  upper_fang5: "🦷 Upper Fang 5",
  upper_fang6: "🦷 Upper Fang 6",
  lower_fang1: "🦷 Lower Fang 1",
  lower_fang2: "🦷 Lower Fang 2",
  lower_fang3: "🦷 Lower Fang 3",
  lower_fang4: "🦷 Lower Fang 4",
  horn1: "⚡ Main Lightning Horn (Left)",
  horn2: "⚡ Under Lightning Horn (Right)",
  spine_head1: "🔺 Crest Horn Plate 1",
  spine_head2: "🔺 Crest Horn Plate 2",
  spine_head3: "🔺 Crest Horn Plate 3",
  eye_base: "🟡 Eye Iris",
  eye_pupil: "⚫ Eye Slit Pupil",
  eye_specular: "⚪ Eye Light Specular",
  eye_brow: "😠 Angry Eyebrow Plate",
  frontClaw_arm: "💪 Rigged Claw Arm",
  frontClaw_claw1: "💅 Claw Talon 1",
  frontClaw_claw2: "💅 Claw Talon 2",
  frontClaw_claw3: "💅 Claw Talon 3",
};

export function BattleScene({ projectId, currentPhase, tasksLocked = true }: BattleSceneProps) {
  const state = useQuery(api.battle.getState, { projectId });

  // Modal display toggles
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showAttackChoiceModal, setShowAttackChoiceModal] = useState(false);
  const [showGoblinModal, setShowGoblinModal] = useState(false);
  const [showBossModal, setShowBossModal] = useState(false);

  // Leaderboard data query
  const leaderboardData = useQuery(api.battle.getLeaderboard, { projectId });

  // Workspace data query for tasks & user profiles
  const workspace = useQuery(api.tasks.getWorkspace, { projectId });

  // Goblin Flow state & mutations
  const postDailyEvidence = useMutation((api as any).daily.postDailyEvidence);
  const [goblinText, setGoblinText] = useState("");
  const [goblinImageInput, setGoblinImageInput] = useState("");
  const [goblinImageUrls, setGoblinImageUrls] = useState<string[]>([]);
  const [isSlaying, setIsSlaying] = useState(false);
  const [goblinError, setGoblinError] = useState<string | null>(null);

  // Boss Flow state & mutations
  const generateUploadUrl = useMutation(api.evidence.generateUploadUrl);
  const addEvidence = useMutation(api.evidence.add);
  const chooseReviewer = useMutation(api.tasks.chooseReviewer);
  const submitForReview = useMutation(api.evidence.submitForReview);

  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [evidenceType, setEvidenceType] = useState<"note" | "link" | "image" | "pdf">("note");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bossError, setBossError] = useState<string | null>(null);

  // Dragon Layout Vector Editor Admin States (All individual shapes, moveable panels, pausable animation)
  const [dragonOffsets, setDragonOffsets] = useState<Record<string, { x: number; y: number; rotate: number }>>({
    backWing_membrane1: { x: 0, y: 0, rotate: 0 },
    backWing_membrane2: { x: 0, y: 0, rotate: 0 },
    backWing_membrane3: { x: 0, y: 0, rotate: 0 },
    backWing_strut1: { x: 0, y: 0, rotate: 0 },
    backWing_strut2: { x: 0, y: 0, rotate: 0 },
    backWing_joint: { x: 0, y: 0, rotate: 0 },
    backWing_claw: { x: 0, y: 0, rotate: 0 },
    frontWing_membrane1: { x: 0, y: 0, rotate: 0 },
    frontWing_membrane2: { x: 0, y: 0, rotate: 0 },
    frontWing_membrane3: { x: 0, y: 0, rotate: 0 },
    frontWing_strut1: { x: 0, y: 0, rotate: 0 },
    frontWing_strut2: { x: 0, y: 0, rotate: 0 },
    frontWing_joint: { x: 0, y: 0, rotate: 0 },
    frontWing_claw: { x: 0, y: 0, rotate: 0 },
    tail_seg1: { x: 0, y: 0, rotate: 0 },
    tail_seg2: { x: 0, y: 0, rotate: 0 },
    tail_seg3: { x: 0, y: 0, rotate: 0 },
    tail_shadow: { x: 0, y: 0, rotate: 0 },
    tail_barb1: { x: 0, y: 0, rotate: 0 },
    tail_barb2: { x: 0, y: 0, rotate: 0 },
    tail_barb3: { x: 0, y: 0, rotate: 0 },
    tail_spine1: { x: 0, y: 0, rotate: 0 },
    tail_spine2: { x: 0, y: 0, rotate: 0 },
    tail_spine3: { x: 0, y: 0, rotate: 0 },
    spine1: { x: 0, y: 0, rotate: 0 },
    spine2: { x: 0, y: 0, rotate: 0 },
    spine3: { x: 0, y: 0, rotate: 0 },
    spine4: { x: 0, y: 0, rotate: 0 },
    spine5: { x: 0, y: 0, rotate: 0 },
    spine6: { x: 0, y: 0, rotate: 0 },
    spine7: { x: 0, y: 0, rotate: 0 },
    backLeg_thigh: { x: 0, y: 0, rotate: 0 },
    backLeg_knee: { x: 0, y: 0, rotate: 0 },
    backLeg_calf: { x: 0, y: 0, rotate: 0 },
    backLeg_ankle: { x: 0, y: 0, rotate: 0 },
    backLeg_foot: { x: 0, y: 0, rotate: 0 },
    backLeg_claw1: { x: 0, y: 0, rotate: 0 },
    backLeg_claw2: { x: 0, y: 0, rotate: 0 },
    backLeg_claw3: { x: 0, y: 0, rotate: 0 },
    torso_base: { x: 0, y: 0, rotate: 0 },
    torso_plate1: { x: 0, y: 0, rotate: 0 },
    torso_plate2: { x: 0, y: 0, rotate: 0 },
    torso_chest1: { x: 0, y: 0, rotate: 0 },
    torso_chest2: { x: 0, y: 0, rotate: 0 },
    torso_chest3: { x: 0, y: 0, rotate: 0 },
    torso_chest4: { x: 0, y: 0, rotate: 0 },
    torso_chest5: { x: 0, y: 0, rotate: 0 },
    frontLeg_thigh: { x: 0, y: 0, rotate: 0 },
    frontLeg_knee: { x: 0, y: 0, rotate: 0 },
    frontLeg_calf: { x: 0, y: 0, rotate: 0 },
    frontLeg_ankle: { x: 0, y: 0, rotate: 0 },
    frontLeg_foot: { x: 0, y: 0, rotate: 0 },
    frontLeg_claw1: { x: 0, y: 0, rotate: 0 },
    frontLeg_claw2: { x: 0, y: 0, rotate: 0 },
    frontLeg_claw3: { x: 0, y: 0, rotate: 0 },
    frontArm_shoulder: { x: 0, y: 0, rotate: 0 },
    frontArm_bicep: { x: 0, y: 0, rotate: 0 },
    frontArm_elbow: { x: 0, y: 0, rotate: 0 },
    frontArm_forearm: { x: 0, y: 0, rotate: 0 },
    frontArm_wrist: { x: 0, y: 0, rotate: 0 },
    frontArm_claw1: { x: 0, y: 0, rotate: 0 },
    frontArm_claw2: { x: 0, y: 0, rotate: 0 },
    neck_base1: { x: 0, y: 0, rotate: 0 },
    neck_base2: { x: 0, y: 0, rotate: 0 },
    neck_plate1: { x: 0, y: 0, rotate: 0 },
    neck_plate2: { x: 0, y: 0, rotate: 0 },
    neck_plate3: { x: 0, y: 0, rotate: 0 },
    mouth_cavity: { x: 0, y: 0, rotate: 0 },
    skull_base: { x: 0, y: 0, rotate: 0 },
    mouth_webbing: { x: 0, y: 0, rotate: 0 },
    snout_base: { x: 0, y: 0, rotate: 0 },
    snout_nostril: { x: 0, y: 0, rotate: 0 },
    lower_jaw: { x: 0, y: 0, rotate: 0 },
    upper_fang1: { x: 0, y: 0, rotate: 0 },
    upper_fang2: { x: 0, y: 0, rotate: 0 },
    upper_fang3: { x: 0, y: 0, rotate: 0 },
    upper_fang4: { x: 0, y: 0, rotate: 0 },
    upper_fang5: { x: 0, y: 0, rotate: 0 },
    upper_fang6: { x: 0, y: 0, rotate: 0 },
    lower_fang1: { x: 0, y: 0, rotate: 0 },
    lower_fang2: { x: 0, y: 0, rotate: 0 },
    lower_fang3: { x: 0, y: 0, rotate: 0 },
    lower_fang4: { x: 0, y: 0, rotate: 0 },
    horn1: { x: 0, y: 0, rotate: 0 },
    horn2: { x: 0, y: 0, rotate: 0 },
    spine_head1: { x: 0, y: 0, rotate: 0 },
    spine_head2: { x: 0, y: 0, rotate: 0 },
    spine_head3: { x: 0, y: 0, rotate: 0 },
    eye_base: { x: 0, y: 0, rotate: 0 },
    eye_pupil: { x: 0, y: 0, rotate: 0 },
    eye_specular: { x: 0, y: 0, rotate: 0 },
    eye_brow: { x: 0, y: 0, rotate: 0 },
    frontClaw_arm: { x: 0, y: 0, rotate: 0 },
    frontClaw_claw1: { x: 0, y: 0, rotate: 0 },
    frontClaw_claw2: { x: 0, y: 0, rotate: 0 },
    frontClaw_claw3: { x: 0, y: 0, rotate: 0 },
  });
  const [selectedDragonPart, setSelectedDragonPart] = useState<string | null>(null);
  const [showDragonEditor, setShowDragonEditor] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Custom Fills & Deletions
  const [dragonFills, setDragonFills] = useState<Record<string, string>>({});
  const [deletedShapes, setDeletedShapes] = useState<Record<string, boolean>>({});

  // Spawner states
  const [customShapes, setCustomShapes] = useState<any[]>([]);
  const [spawnerType, setSpawnerType] = useState<"circle" | "ellipse" | "rect" | "polygon" | "path">("circle");
  const [spawnerColor, setSpawnerColor] = useState("#b91c1c");

  // Moveable Panel coords
  const [panelPos, setPanelPos] = useState({ x: 80, y: 80 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  // Direct Shape Drag and Drop
  const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);
  const dragShapeStart = useRef({ mouseX: 0, mouseY: 0, shapeX: 0, shapeY: 0 });

  function handlePanelDragStart(e: React.MouseEvent) {
    setIsDraggingPanel(true);
    dragStartOffset.current = {
      x: e.clientX - panelPos.x,
      y: e.clientY - panelPos.y,
    };
  }

  function handleStartDragShape(shapeId: string, clientX: number, clientY: number) {
    const currentOffset = dragonOffsets[shapeId] || { x: 0, y: 0, rotate: 0 };
    setDraggingShapeId(shapeId);
    dragShapeStart.current = {
      mouseX: clientX,
      mouseY: clientY,
      shapeX: currentOffset.x,
      shapeY: currentOffset.y,
    };
  }

  // Effect to drag Panel & drag individual SVG shapes directly
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDraggingPanel) {
        setPanelPos({
          x: e.clientX - dragStartOffset.current.x,
          y: e.clientY - dragStartOffset.current.y,
        });
      }

      if (draggingShapeId) {
        const dx = e.clientX - dragShapeStart.current.mouseX;
        const dy = e.clientY - dragShapeStart.current.mouseY;
        
        // Calculate viewBox scale relative to actual SVG screen width
        const svgEl = document.querySelector(".layer-8-dragon svg");
        let scaleFactor = 1.5;
        if (svgEl) {
          const rect = svgEl.getBoundingClientRect();
          scaleFactor = (1000 / rect.width) / 0.68;
        }

        setDragonOffsets((prev) => {
          const prevVal = prev[draggingShapeId] || { x: 0, y: 0, rotate: 0 };
          return {
            ...prev,
            [draggingShapeId]: {
              ...prevVal,
              x: Math.round(dragShapeStart.current.shapeX + dx * scaleFactor),
              y: Math.round(dragShapeStart.current.shapeY + dy * scaleFactor),
            },
          };
        });
      }
    }

    function handleMouseUp() {
      setIsDraggingPanel(false);
      setDraggingShapeId(null);
    }

    if (isDraggingPanel || draggingShapeId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPanel, draggingShapeId]);

  function handleAddCustomShape() {
    const id = `custom_${Date.now()}`;
    const newShape = {
      id,
      name: `✨ Custom ${spawnerType.toUpperCase()} (${customShapes.length + 1})`,
      type: spawnerType,
      fill: spawnerColor,
      x: 150,
      y: 150,
      width: 40,
      height: 30,
      rx: spawnerType === "circle" || spawnerType === "ellipse" || spawnerType === "rect" ? 15 : 0,
      ry: spawnerType === "ellipse" ? 10 : 0,
      points: "0,-15 15,15 -15,15",
      d: "M -15 -15 L 15 15",
      rotate: 0,
    };
    setDragonOffsets((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0, rotate: 0 },
    }));
    setCustomShapes((prev) => [...prev, newShape]);
    setSelectedDragonPart(id);
  }

  // Derive eligible reviewers (teammates who are not the current user)
  const eligibleReviewers = useMemo(() => {
    if (!workspace || !workspace.currentProfileId) return [];
    return workspace.members.filter((m) => m.profileId !== workspace.currentProfileId);
  }, [workspace]);

  // Derive tasks available for the current user to submit evidence for
  const myAssignableTasks = useMemo(() => {
    if (!workspace || !workspace.currentProfileId) return [];
    return workspace.tasks.filter(
      (t) =>
        t.primaryOwnerProfileId === workspace.currentProfileId &&
        ["todo", "in_progress", "changes_requested"].includes(t.status)
    );
  }, [workspace]);

  // Goblin verification counters
  const goblinWordCount = goblinText.trim().length > 0 ? goblinText.trim().split(/\s+/).filter(Boolean).length : 0;
  const goblinImageCount = goblinImageUrls.length;
  const isGoblinValid = goblinWordCount >= 20 || goblinImageCount >= 2;

  function handleAddGoblinImage() {
    const trimmed = goblinImageInput.trim();
    if (!trimmed) return;
    setGoblinImageUrls((current) => [...current, trimmed]);
    setGoblinImageInput("");
  }

  function handleRemoveGoblinImage(index: number) {
    setGoblinImageUrls((current) => current.filter((_, i) => i !== index));
  }

  async function handleGoblinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goblinText && goblinImageUrls.length === 0) return;

    setGoblinError(null);
    setIsSlaying(true);

    try {
      await postDailyEvidence({
        projectId,
        text: goblinText,
        imageUrls: goblinImageUrls,
      });
      setGoblinText("");
      setGoblinImageInput("");
      setGoblinImageUrls([]);
      setShowGoblinModal(false);
    } catch (err) {
      setGoblinError(getErrorMessage(err, "Failed to slay goblin."));
    } finally {
      setIsSlaying(false);
    }
  }

  async function handleBossSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTaskId) return;

    setBossError(null);
    setIsSubmittingTask(true);
    setUploadProgress(0);

    const currentTask = workspace?.tasks.find((t) => t._id === selectedTaskId);
    if (!currentTask) {
      setBossError("Selected task not found.");
      setIsSubmittingTask(false);
      return;
    }

    try {
      // 1. Choose reviewer if not already assigned
      if (!currentTask.reviewerProfileId) {
        if (!selectedReviewerId) {
          throw new Error("You must choose a teammate to review your task.");
        }
        await chooseReviewer({
          taskId: selectedTaskId,
          reviewerProfileId: selectedReviewerId as Id<"userProfiles">,
        });
      }

      // 2. Upload file if applicable
      let storageId: Id<"_storage"> | undefined;
      if (evidenceType === "image" || evidenceType === "pdf") {
        if (!evidenceFile) {
          throw new Error("Select a file to upload.");
        }
        // Validation check
        if (evidenceType === "image") {
          if (!new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]).has(evidenceFile.type)) {
            throw new Error("Choose a JPEG, PNG, WebP, or GIF image.");
          }
          if (evidenceFile.size > 5 * 1024 * 1024) {
            throw new Error("Images must be 5 MB or smaller.");
          }
        }
        if (evidenceType === "pdf") {
          if (evidenceFile.type !== "application/pdf") {
            throw new Error("Choose a PDF file.");
          }
          if (evidenceFile.size > 10 * 1024 * 1024) {
            throw new Error("PDF files must be 10 MB or smaller.");
          }
        }

        const uploadUrl = await generateUploadUrl({ taskId: selectedTaskId });
        storageId = await uploadFile(uploadUrl, evidenceFile, setUploadProgress);
      }

      // 3. Add evidence
      await addEvidence({
        taskId: selectedTaskId,
        type: evidenceType,
        note: evidenceNote,
        url: evidenceType === "link" ? evidenceUrl : undefined,
        storageId,
        fileName: evidenceFile?.name,
        contentType: evidenceFile?.type,
        fileSize: evidenceFile?.size,
      });

      // 4. Submit for review
      await submitForReview({ taskId: selectedTaskId });

      // Reset state and close modal
      setSelectedTaskId(null);
      setEvidenceNote("");
      setEvidenceUrl("");
      setEvidenceFile(null);
      setSelectedReviewerId("");
      setUploadProgress(0);
      setShowBossModal(false);
    } catch (err) {
      setBossError(getErrorMessage(err, "Failed to submit evidence."));
    } finally {
      setIsSubmittingTask(false);
    }
  }

  const initialised = useRef(false);
  const latestSeenEventId = useRef<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!state) return;
    const newest = state.events.at(-1)?._id ?? null;
    if (!initialised.current) {
      initialised.current = true;
      latestSeenEventId.current = newest;
      return;
    }
    if (newest && newest !== latestSeenEventId.current) {
      latestSeenEventId.current = newest;
      setActiveEventId(newest);
      const timer = window.setTimeout(() => setActiveEventId(null), 1800);
      return () => window.clearTimeout(timer);
    }
  }, [state]);

  const activeEvent = useMemo(
    () => state?.events.find((event) => event._id === activeEventId) ?? null,
    [state?.events, activeEventId],
  );

  const goblins = useMemo(() => {
    if (!state) return [];
    return state.members.map((member) => ({
      id: member.profileId,
      memberId: member.profileId,
      memberName: member.displayName,
      goblinState: member.hasSubmittedToday ? "ghost" as const : "active" as const,
      isDefeated: member.hasSubmittedToday,
    }));
  }, [state]);

  const players = useMemo(() => {
    if (!state) return [];
    return state.members.map((member) => ({
      profileId: member.profileId,
      displayName: member.displayName,
      characterFill: member.characterFill,
      characterOutline: member.characterOutline,
      isActiveToday: member.hasSubmittedToday,
      isAttacking: activeEvent?.attackerProfileId === member.profileId,
    }));
  }, [state, activeEvent]);

  if (state === undefined) {
    return <section className="battle-loading" aria-busy="true">Preparing the battle scene…</section>;
  }

  const hpPercent = state.maximumHp === 0 ? 100 : Math.round((state.remainingHp / state.maximumHp) * 100);
  const defeated = state.maximumHp > 0 && state.remainingHp === 0;
  const optionalMetrics = state as typeof state & OptionalBattleMetrics;

  const damageClearedFraction = (100 - hpPercent) / 100;
  const dragonX = 730 + damageClearedFraction * 60;

  return (
    <section className={`battle-page ${activeEvent ? "has-new-attack" : ""} ${defeated ? "is-defeated" : ""}`} aria-labelledby="battle-title">
      <SVGDefs />

      <header className="battle-summary">
        <div>
          <p className="kicker">Realtime encounter landscape</p>
          <h3 id="battle-title">{state.project.title}</h3>
        </div>
        <dl>
          <div><dt>Deadline</dt><dd>{state.project.deadline}</dd></div>
          {currentPhase ? <div><dt>Current Phase</dt><dd>{currentPhase}</dd></div> : null}
          <div><dt>Goblins Left</dt><dd>{optionalMetrics.goblinsRemaining ?? 0} / {optionalMetrics.totalGoblinsForProject ?? 0}</dd></div>
          <div><dt>Tasks Left</dt><dd>{state.remainingRequiredTasks}</dd></div>
        </dl>
      </header>

      {/* Main 10-Layer Geometric SVG Landscape Scene */}
      <div className="landscape-scene-container" style={{ position: "relative" }} aria-label="Interactive project encounter scene">
        {/* Leaderboard Overlay Button */}
        <button
          className="rpg-btn-leaderboard"
          onClick={() => setShowLeaderboardModal(true)}
          type="button"
        >
          🏆 Leaderboard
        </button>

        {/* Admin Edit Dragon Layout Overlay Button */}
        <button
          className="rpg-btn-leaderboard"
          style={{ right: "185px", background: "#475569", borderColor: "#94a3b8" }}
          onClick={() => {
            setShowDragonEditor((prev) => !prev);
            if (!selectedDragonPart) {
              setSelectedDragonPart("headNeck");
            }
          }}
          type="button"
        >
          🛠️ Layout Admin
        </button>

        {/* Attack Circular Action Button */}
        <button
          className="rpg-btn-attack-circle"
          onClick={() => setShowAttackChoiceModal(true)}
          type="button"
        >
          ⚔️<br />Attack
        </button>

        {/* Floating Mob-Style Boss HP Bar */}
        <div
          className="boss-hp-mob-style"
          style={{
            left: `${Math.min(92, Math.max(8, (dragonX / 10) - 2.5))}%`
          }}
        >
          <span className="boss-hp-percent-label">DRAGON {hpPercent}% HP</span>
          <div className="boss-hp-mob-track">
            <div
              className="boss-hp-mob-fill"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Layer 0, 1, 2: Sky & Parallax Clouds */}
        <LandscapeSky />

        {/* Layer 3, 4: Section 4 - Top-Down 3/4 Perspective Grassland */}
        <LandscapeTerrain />

        {/* Layer 5: Section 3 & 5 - Grounded Village & Anchored Village HP Bar */}
        <LandscapeVillage villageHpPercent={state.villageHpPercent} />

        {/* Layer 6: Section 8 - Daily Goblins Wave System (1 per active player) */}
        <LandscapeGoblins goblins={goblins} />

        {/* Layer 7: Section 6 - Party Members & Deterministic Game ID Tags */}
        <LandscapePlayers members={players} />

        {/* Layer 8: Section 1 - Medieval Dragon Visuals & Wings */}
        <LandscapeDragon
          bossHpPercent={hpPercent}
          isDefeated={defeated}
          offsets={dragonOffsets as any}
          onSelectPart={setSelectedDragonPart as any}
          selectedPart={selectedDragonPart as any}
          animationsEnabled={animationsEnabled}
          customShapes={customShapes}
          fills={dragonFills}
          deletedShapes={deletedShapes}
          onStartDragShape={handleStartDragShape}
        />

        {/* Layer 9: Section 2 - Cosmetic Combat Exchange (50% Opacity Background Burst) */}
        <LandscapeFX
          activeEvent={activeEvent ? {
            id: activeEvent._id,
            attackerName: activeEvent.attackerName,
            damage: activeEvent.damage,
            spellType: activeEvent.spellType,
          } : null}
          isVictory={defeated}
        />
      </div>

      {/* =========================================================================
          LEADERBOARD MODAL
         ========================================================================= */}
      {showLeaderboardModal && (
        <div className="rpg-modal-backdrop" onClick={() => setShowLeaderboardModal(false)}>
          <div className="rpg-wood-board" onClick={(e) => e.stopPropagation()}>
            <div className="rpg-wood-board-bottom-caps" />
            <h3 className="rpg-board-title">📜 Quest Leaderboard</h3>
            <div className="rpg-parchment-sheet">
              {leaderboardData === undefined ? (
                <p style={{ textAlign: "center" }}>Gathering scrolls...</p>
              ) : leaderboardData.length === 0 ? (
                <p style={{ textAlign: "center" }}>No adventurers have stepped forward yet.</p>
              ) : (
                <table className="rpg-leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Adventurer</th>
                      <th style={{ textAlign: "center" }}>Goblins Slayed</th>
                      <th style={{ textAlign: "center" }}>Quests Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((item, idx) => (
                      <tr key={item.profileId}>
                        <td className="rank">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </td>
                        <td style={{ fontWeight: 700 }}>{item.displayName}</td>
                        <td style={{ textAlign: "center", fontWeight: 800, color: "#c2410c" }}>
                          {item.goblinsKilled}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 800, color: "#166534" }}>
                          {item.tasksCompleted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <button className="rpg-btn-close" type="button" onClick={() => setShowLeaderboardModal(false)}>
              Close Board
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ATTACK TARGET SELECTION CHOICE MODAL
         ========================================================================= */}
      {showAttackChoiceModal && (
        <div className="rpg-modal-backdrop" onClick={() => setShowAttackChoiceModal(false)}>
          <div className="rpg-wood-board" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <div className="rpg-wood-board-bottom-caps" />
            <h3 className="rpg-board-title">⚔️ Choose Target</h3>
            <div className="rpg-grid-options">
              <button
                className="rpg-plaque-btn"
                type="button"
                onClick={() => {
                  setShowAttackChoiceModal(false);
                  setShowGoblinModal(true);
                }}
              >
                <span className="emoji">👹</span>
                <span className="label">Daily Goblin</span>
              </button>
              <button
                className="rpg-plaque-btn"
                type="button"
                onClick={() => {
                  setShowAttackChoiceModal(false);
                  setShowBossModal(true);
                }}
              >
                <span className="emoji">🐉</span>
                <span className="label">The Dragon</span>
              </button>
            </div>
            <button className="rpg-btn-close" type="button" onClick={() => setShowAttackChoiceModal(false)}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SLAY GOBLIN EVIDENCE FLOW MODAL
         ========================================================================= */}
      {showGoblinModal && (
        <div className="rpg-modal-backdrop" onClick={() => setShowGoblinModal(false)}>
          <div className="rpg-wood-board" onClick={(e) => e.stopPropagation()}>
            <div className="rpg-wood-board-bottom-caps" />
            <h3 className="rpg-board-title">👹 Slay Daily Goblin</h3>

            <form onSubmit={handleGoblinSubmit} className="rpg-goblin-form">
              <div className="rpg-parchment-sheet" style={{ marginBottom: 0 }}>
                {goblinError && <p className="form-error" role="alert" style={{ color: "#b91c1c", fontWeight: 800 }}>{goblinError}</p>}

                <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", lineHeight: "1.4" }}>
                  Provide proof of today's work to defeat your daily goblin threat.
                  Requirement: <strong>at least 20 words of notes OR 2 image links</strong>.
                </p>

                <label className="rpg-field-label">
                  <span>Work Accomplishment Details</span>
                  <textarea
                    className="rpg-input-textarea"
                    rows={4}
                    value={goblinText}
                    onChange={(e) => setGoblinText(e.target.value)}
                    placeholder="Enter details of your work today..."
                    required={goblinImageUrls.length === 0}
                  />
                </label>

                {/* Validation Info */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px", marginBottom: "14px" }}>
                  <span className={`rpg-val-tag ${goblinWordCount >= 20 ? "is-valid" : "is-invalid"}`}>
                    📝 {goblinWordCount}/20 words {goblinWordCount >= 20 ? "✓" : ""}
                  </span>
                  <span className={`rpg-val-tag ${goblinImageCount >= 2 ? "is-valid" : "is-invalid"}`}>
                    🖼️ {goblinImageCount}/2 images {goblinImageCount >= 2 ? "✓" : ""}
                  </span>
                </div>

                <label className="rpg-field-label">
                  <span>Attach Image Url</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="url"
                      className="rpg-input-text"
                      style={{ flex: 1 }}
                      value={goblinImageInput}
                      onChange={(e) => setGoblinImageInput(e.target.value)}
                      placeholder="Paste image link..."
                    />
                    <button
                      className="rpg-btn-submit-action"
                      style={{ width: "auto", padding: "0 16px", background: "#8b5a2b" }}
                      type="button"
                      onClick={handleAddGoblinImage}
                    >
                      Attach
                    </button>
                  </div>
                </label>

                {goblinImageUrls.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                    {goblinImageUrls.map((url, idx) => (
                      <div key={idx} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#eeddbb", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700 }}>
                        <span>Image {idx + 1}</span>
                        <button type="button" style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold" }} onClick={() => handleRemoveGoblinImage(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="rpg-btn-submit-action"
                type="submit"
                disabled={isSlaying || (!goblinText && goblinImageUrls.length === 0)}
              >
                {isSlaying ? "Slaying..." : isGoblinValid ? "⚔️ Slay Goblin!" : "Log Evidence (Requires 20 words or 2 images)"}
              </button>

              <button className="rpg-btn-close" type="button" onClick={() => setShowGoblinModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOSS ATTACK QUEST PINNED BOARD MODAL
         ========================================================================= */}
      {showBossModal && (
        <div className="rpg-modal-backdrop" onClick={() => setShowBossModal(false)}>
          <div className="rpg-wood-board" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <div className="rpg-wood-board-bottom-caps" />
            <h3 className="rpg-board-title">🐉 Attack The Dragon (Submit Quests)</h3>

            {bossError && <p className="form-error" role="alert" style={{ color: "#ef4444", fontWeight: 800, textAlign: "center", marginBottom: "12px" }}>{bossError}</p>}

            <div className="rpg-boss-board">
              {myAssignableTasks.length === 0 ? (
                <div className="rpg-no-tasks-alert">
                  🛡️ You do not have any active quests assigned to you!
                  <p style={{ fontWeight: "normal", fontSize: "0.85rem", marginTop: "6px" }}>Go to the project task board below to claim or assign a quest first.</p>
                </div>
              ) : !selectedTaskId ? (
                <>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", textAlign: "center" }}>Select one of your active quests below to submit evidence and deal combat damage to the dragon.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {myAssignableTasks.map((task) => {
                      const creatorName = workspace?.members.find((m) => m?.profileId === task.createdByProfileId)?.displayName ?? "Creator";
                      return (
                        <div
                          key={task._id}
                          className="rpg-parchment-sheet"
                          style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
                          onClick={() => {
                            setSelectedTaskId(task._id);
                            if (task.reviewerProfileId) {
                              setSelectedReviewerId(task.reviewerProfileId);
                            }
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
                        >
                          <h4 className="rpg-note-title">{task.title}</h4>
                          <div className="rpg-note-meta">
                            <span>📅 Due: {task.dueDate}</span>
                            <span>👤 By: {creatorName}</span>
                          </div>
                          <span style={{ fontSize: "0.72rem", background: "#8b5a2b", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                            Select Quest
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <form onSubmit={handleBossSubmit} className="rpg-goblin-form">
                  {(() => {
                    const task = myAssignableTasks.find((t) => t._id === selectedTaskId);
                    if (!task) return null;
                    const creatorName = workspace?.members.find((m) => m?.profileId === task.createdByProfileId)?.displayName ?? "Creator";
                    return (
                      <div className="rpg-parchment-sheet">
                        <button
                          type="button"
                          style={{ position: "absolute", top: "10px", right: "10px", border: "none", background: "transparent", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem" }}
                          onClick={() => setSelectedTaskId(null)}
                        >
                          Change Quest
                        </button>
                        <h4 className="rpg-note-title">{task.title}</h4>
                        <div className="rpg-note-meta" style={{ marginBottom: 0 }}>
                          <span>📅 Due Date: {task.dueDate}</span>
                          <span>👤 Assigned By: {creatorName}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="rpg-parchment-sheet">
                    <label className="rpg-field-label" style={{ marginBottom: "10px" }}>
                      <span>Select Evidence Type</span>
                      <div className="rpg-evidence-tabs">
                        {(["note", "link", "image", "pdf"] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            className={`rpg-evidence-tab ${evidenceType === tab ? "is-active" : ""}`}
                            onClick={() => {
                              setEvidenceType(tab);
                              setEvidenceFile(null);
                            }}
                          >
                            {tab === "note" ? "Short Note" : tab === "link" ? "External Link" : tab === "image" ? "Image File" : "PDF File"}
                          </button>
                        ))}
                      </div>
                    </label>

                    <div className="rpg-evidence-form-container">
                      {evidenceType === "note" && (
                        <label className="rpg-field-label">
                          <span>Progress Note</span>
                          <textarea
                            className="rpg-input-textarea"
                            rows={3}
                            value={evidenceNote}
                            onChange={(e) => setEvidenceNote(e.target.value)}
                            placeholder="Write a short summary of the work..."
                            required
                          />
                        </label>
                      )}

                      {evidenceType === "link" && (
                        <>
                          <label className="rpg-field-label">
                            <span>Link URL</span>
                            <input
                              type="url"
                              className="rpg-input-text"
                              value={evidenceUrl}
                              onChange={(e) => setEvidenceUrl(e.target.value)}
                              placeholder="https://example.com/project-link"
                              required
                            />
                          </label>
                          <label className="rpg-field-label">
                            <span>Optional Progress Note</span>
                            <textarea
                              className="rpg-input-textarea"
                              rows={2}
                              value={evidenceNote}
                              onChange={(e) => setEvidenceNote(e.target.value)}
                              placeholder="Add details about the link..."
                            />
                          </label>
                        </>
                      )}

                      {(evidenceType === "image" || evidenceType === "pdf") && (
                        <>
                          <label className="rpg-field-label">
                            <span>Upload {evidenceType === "image" ? "Image File (Max 5MB)" : "PDF File (Max 10MB)"}</span>
                            <input
                              type="file"
                              accept={evidenceType === "image" ? "image/*" : "application/pdf"}
                              onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                              required
                            />
                          </label>
                          {uploadProgress > 0 && (
                            <div style={{ background: "#eeddbb", height: "14px", borderRadius: "4px", overflow: "hidden", marginTop: "6px" }}>
                              <div style={{ background: "#166534", height: "100%", width: `${uploadProgress}%`, transition: "width 0.2s ease" }} />
                            </div>
                          )}
                          <label className="rpg-field-label" style={{ marginTop: "8px" }}>
                            <span>Optional Progress Note</span>
                            <textarea
                              className="rpg-input-textarea"
                              rows={2}
                              value={evidenceNote}
                              onChange={(e) => setEvidenceNote(e.target.value)}
                              placeholder="Describe the uploaded file..."
                            />
                          </label>
                        </>
                      )}
                    </div>

                    {(() => {
                      const task = myAssignableTasks.find((t) => t._id === selectedTaskId);
                      if (task && !task.reviewerProfileId) {
                        return (
                          <label className="rpg-field-label" style={{ marginTop: "14px" }}>
                            <span>Select Teammate to Review Your Quest</span>
                            <select
                              className="rpg-select"
                              value={selectedReviewerId}
                              onChange={(e) => setSelectedReviewerId(e.target.value)}
                              required
                            >
                              <option value="">-- Select Reviewer --</option>
                              {eligibleReviewers.map((m) => (
                                <option key={m.profileId} value={m.profileId}>
                                  {m.displayName}
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <button
                    className="rpg-btn-submit-action"
                    type="submit"
                    disabled={isSubmittingTask}
                  >
                    {isSubmittingTask ? "Submitting Evidence..." : "⚔️ Submit Quest & Attack!"}
                  </button>

                  <button
                    className="rpg-btn-close"
                    type="button"
                    onClick={() => {
                      setSelectedTaskId(null);
                      setEvidenceNote("");
                      setEvidenceUrl("");
                      setEvidenceFile(null);
                      setSelectedReviewerId("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
            <button className="rpg-btn-close" type="button" onClick={() => setShowBossModal(false)}>
              Close Board
            </button>
          </div>
        </div>
      )}

      {/* Boss HP remains visible in the shared encounter. Task locking is contextual in task details. */}
      <div className="boss-hp-panel">
        {tasksLocked ? (
          <>
            <div><strong>Boss HP</strong><span>{state.remainingHp} / {state.maximumHp} ({hpPercent}%)</span></div>
            <div className="boss-hp-track" role="progressbar" aria-valuemin={0} aria-valuemax={state.maximumHp} aria-valuenow={state.remainingHp}>
              <span style={{ width: `${hpPercent}%` }} />
            </div>
          </>
        ) : (
          <div><strong>Boss HP</strong><span>Undetermined · lock from a task’s allocation details</span></div>
        )}

        {state.members && state.members.length > 0 ? (
          <div className="member-hp-shares" style={{ marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Player Contribution Target</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>Target share: {state.hpSharePerPlayer} HP per player</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
              {state.members.map((member) => {
                const sharePercent = member.targetHpShare > 0 ? Math.min(100, Math.round((member.damageDealt / member.targetHpShare) * 100)) : 0;
                return (
                  <div key={member.profileId} style={{ background: "rgba(255, 255, 255, 0.7)", padding: "0.4rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                      <strong>{member.displayName}</strong>
                      <span style={{ fontWeight: 600, color: member.isShareComplete ? "#15803d" : "#334155" }}>
                        {member.damageDealt}/{member.targetHpShare} HP ({sharePercent}%)
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "rgba(0,0,0,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${sharePercent}%`, height: "100%", background: member.isShareComplete ? "#22c55e" : "#2563eb", borderRadius: "3px", transition: "width 0.3s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {optionalMetrics.isVillageDestroyed ? (
        <section className="failure-panel" style={{ background: "#fef2f2", border: "2px solid #ef4444", padding: "1.5rem", borderRadius: "12px", margin: "1rem 0" }}>
          <p className="card-eyebrow" style={{ color: "#dc2626" }}>Project Failed</p>
          <h3 style={{ color: "#991b1b", margin: "0.2rem 0 0.5rem" }}>The Village Has Been Destroyed!</h3>
          <p style={{ color: "#7f1d1d", margin: 0 }}>Village HP dropped below the 50% failure threshold from missed daily goblin defenses and deadline penalties.</p>
        </section>
      ) : null}

      {defeated ? (
        <section className="victory-panel">
          <p className="card-eyebrow">Project complete</p>
          <h3>The dragon has been repelled!</h3>
          <p>Every required task has been verified. The village is safe. Export the report or archive the project from project settings.</p>
        </section>
      ) : null}

      {/* =========================================================================
          DRAGON LAYOUT ADMIN VECTOR EDITOR PANEL (DRAGGABLE & PHOTOSHOP LAYERS)
         ========================================================================= */}
      {showDragonEditor && (
        <div
          className="rpg-admin-panel"
          style={{
            left: `${panelPos.x}px`,
            top: `${panelPos.y}px`,
            position: "fixed",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="rpg-admin-header"
            onMouseDown={handlePanelDragStart}
            style={{ cursor: "move", userSelect: "none" }}
          >
            <h4>🛠️ Dragon Vector Editor</h4>
            <button className="rpg-admin-close-btn" type="button" onClick={() => setShowDragonEditor(false)}>×</button>
          </div>
          
          <div className="rpg-admin-body">
            {/* Toggle Animation control */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", background: "#0f172a", padding: "8px", borderRadius: "4px" }}>
              <input
                id="toggle-anim"
                type="checkbox"
                checked={animationsEnabled}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
              />
              <label htmlFor="toggle-anim" style={{ fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", color: "#38bdf8" }}>
                Enable Flapping/Hover
              </label>
            </div>

            {/* Custom Shape Spawner */}
            <div style={{ background: "#0f172a", padding: "10px", borderRadius: "6px", marginBottom: "10px", border: "1px solid #334155" }}>
              <h5 style={{ margin: "0 0 6px 0", fontSize: "0.72rem", textTransform: "uppercase", color: "#94a3b8" }}>➕ Spawn Vector Shape</h5>
              <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                <select
                  value={spawnerType}
                  onChange={(e: any) => setSpawnerType(e.target.value)}
                  style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "4px", fontSize: "0.7rem", flex: 1 }}
                >
                  <option value="circle">Circle</option>
                  <option value="ellipse">Ellipse</option>
                  <option value="rect">Rectangle</option>
                  <option value="polygon">Polygon</option>
                  <option value="path">Path</option>
                </select>
                <input
                  type="color"
                  value={spawnerColor}
                  onChange={(e) => setSpawnerColor(e.target.value)}
                  style={{ width: "32px", height: "24px", border: "none", background: "transparent", cursor: "pointer" }}
                />
              </div>
              <button
                type="button"
                className="rpg-admin-action-btn"
                style={{ background: "#16a34a", padding: "6px", fontSize: "0.7rem" }}
                onClick={handleAddCustomShape}
              >
                Spawn Shape
              </button>
            </div>

            <p style={{ fontSize: "0.72rem", margin: "0 0 8px 0", color: "#94a3b8" }}>
              Click any shape on screen or select a layer stack row below to shift and rotate.
            </p>

            {/* Photoshop-style Layer Stack */}
            <div className="rpg-layers-stack" style={{ maxHeight: "250px" }}>
              {(() => {
                const originals = Object.entries(SHAPE_LABELS).map(([key, name]) => ({ key, name }));
                const customs = customShapes.map((s) => ({ key: s.id, name: s.name }));
                const layers = [...customs, ...originals].filter(l => !deletedShapes[l.key]);

                return layers.map((layer) => {
                  const isSelected = selectedDragonPart === layer.key;
                  const offset = dragonOffsets[layer.key] || { x: 0, y: 0, rotate: 0 };
                  
                  return (
                    <div
                      key={layer.key}
                      className={`rpg-layer-row ${isSelected ? "is-selected" : ""}`}
                      onClick={() => setSelectedDragonPart(layer.key)}
                    >
                      <div className="rpg-layer-info">
                        <span className="rpg-layer-name">{layer.name}</span>
                        <span className="rpg-layer-coords">X:{offset.x} Y:{offset.y} R:{offset.rotate}°</span>
                      </div>

                      {isSelected && (
                        <div className="rpg-layer-controls" onClick={(e) => e.stopPropagation()}>
                          <p style={{ fontSize: "0.62rem", color: "#64748b", margin: "0 0 6px 0" }}>
                            💡 Hold <strong>Shift + Drag</strong> the shape on screen to position instantly.
                          </p>

                          {/* Position Coordinates */}
                          <div className="rpg-coords-inputs">
                            <label>
                              X:
                              <input
                                type="number"
                                value={offset.x}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setDragonOffsets((prev) => ({
                                    ...prev,
                                    [layer.key]: { ...prev[layer.key], x: val }
                                  }));
                                }}
                              />
                            </label>
                            <label>
                              Y:
                              <input
                                type="number"
                                value={offset.y}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setDragonOffsets((prev) => ({
                                    ...prev,
                                    [layer.key]: { ...prev[layer.key], y: val }
                                  }));
                                }}
                              />
                            </label>
                          </div>

                          {/* Rotation Input Row */}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                            <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "3px", flex: 1 }}>
                              Rot:
                              <input
                                type="number"
                                style={{ width: "100%", padding: "2px 4px", background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", fontSize: "0.7rem" }}
                                value={offset.rotate ?? 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setDragonOffsets((prev) => ({
                                    ...prev,
                                    [layer.key]: { ...prev[layer.key], rotate: val }
                                  }));
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              className="rpg-dpad-btn"
                              style={{ width: "24px", padding: "2px 0" }}
                              onClick={() => {
                                setDragonOffsets((prev) => ({
                                  ...prev,
                                  [layer.key]: { ...prev[layer.key], rotate: ((prev[layer.key]?.rotate ?? 0) - 5) % 360 }
                                }));
                              }}
                              title="Rotate CCW 5°"
                            >
                              ↺
                            </button>
                            <button
                              type="button"
                              className="rpg-dpad-btn"
                              style={{ width: "24px", padding: "2px 0" }}
                              onClick={() => {
                                setDragonOffsets((prev) => ({
                                  ...prev,
                                  [layer.key]: { ...prev[layer.key], rotate: ((prev[layer.key]?.rotate ?? 0) + 5) % 360 }
                                }));
                              }}
                              title="Rotate CW 5°"
                            >
                              ↻
                            </button>
                          </div>

                          {/* Color Fill Selector */}
                          <div style={{ marginTop: "8px" }}>
                            <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                              Shape Fill Color:
                              <input
                                type="color"
                                style={{ width: "100%", height: "24px", padding: "0", border: "none", background: "transparent", cursor: "pointer" }}
                                value={dragonFills[layer.key] || (layer.key.startsWith("custom_") ? (customShapes.find(s => s.id === layer.key)?.fill || "#b91c1c") : "#7f1d1d")}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (layer.key.startsWith("custom_")) {
                                    setCustomShapes((prev) => prev.map((s) => s.id === layer.key ? { ...s, fill: val } : s));
                                  } else {
                                    setDragonFills((prev) => ({
                                      ...prev,
                                      [layer.key]: val,
                                    }));
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Custom Shape Parameter Modification (Width, height, radius, path) */}
                          {layer.key.startsWith("custom_") && (() => {
                            const cs = customShapes.find((s) => s.id === layer.key);
                            if (!cs) return null;
                            return (
                              <div style={{ display: "grid", gap: "6px", marginTop: "8px", borderTop: "1px solid #334155", paddingTop: "8px" }}>
                                {cs.type === "circle" && (
                                  <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                                    Radius:
                                    <input
                                      type="number"
                                      style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                                      value={cs.rx}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setCustomShapes((prev) => prev.map((s) => s.id === cs.id ? { ...s, rx: val } : s));
                                      }}
                                    />
                                  </label>
                                )}
                                {cs.type === "ellipse" && (
                                  <>
                                    <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                                      Radius X:
                                      <input
                                        type="number"
                                        style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                                        value={cs.rx}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          setCustomShapes((prev) => prev.map((s) => s.id === cs.id ? { ...s, rx: val } : s));
                                        }}
                                      />
                                    </label>
                                    <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                                      Radius Y:
                                      <input
                                        type="number"
                                        style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                                        value={cs.ry}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          setCustomShapes((prev) => prev.map((s) => s.id === cs.id ? { ...s, ry: val } : s));
                                        }}
                                      />
                                    </label>
                                  </>
                                )}
                                {cs.type === "rect" && (
                                  <>
                                    <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                                      Width:
                                      <input
                                        type="number"
                                        style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                                        value={cs.width}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          setCustomShapes((prev) => prev.map((s) => s.id === cs.id ? { ...s, width: val } : s));
                                        }}
                                      />
                                    </label>
                                    <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                                      Height:
                                      <input
                                        type="number"
                                        style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                                        value={cs.height}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          setCustomShapes((prev) => prev.map((s) => s.id === cs.id ? { ...s, height: val } : s));
                                        }}
                                      />
                                    </label>
                                  </>
                                )}
                                {cs.type === "polygon" && (
                                  <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                                    Points:
                                    <input
                                      type="text"
                                      style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                                      value={cs.points}
                                      onChange={(e) => {
                                        setCustomShapes((prev) => prev.map((s) => s.id === cs.id ? { ...s, points: e.target.value } : s));
                                      }}
                                    />
                                  </label>
                                )}
                                {cs.type === "path" && (
                                  <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                                    Path (d):
                                    <input
                                      type="text"
                                      style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                                      value={cs.d}
                                      onChange={(e) => {
                                        setCustomShapes((prev) => prev.map((s) => s.id === cs.id ? { ...s, d: e.target.value } : s));
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            );
                          })()}

                          {/* Delete Element Action */}
                          <button
                            type="button"
                            className="rpg-admin-action-btn reset"
                            style={{ background: "#b91c1c", padding: "4px", fontSize: "0.65rem", marginTop: "8px", width: "100%" }}
                            onClick={() => {
                              if (layer.key.startsWith("custom_")) {
                                setCustomShapes((prev) => prev.filter((s) => s.id !== layer.key));
                              } else {
                                setDeletedShapes((prev) => ({
                                  ...prev,
                                  [layer.key]: true,
                                }));
                              }
                              setSelectedDragonPart(null);
                            }}
                          >
                            🗑️ Delete Object
                          </button>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Code exporter and helper actions */}
            <div className="rpg-admin-actions">
              <button
                type="button"
                className="rpg-admin-action-btn"
                onClick={() => {
                  const exportData = {
                    dragonOffsets,
                    dragonFills,
                    deletedShapes,
                    customShapes,
                  };
                  const codeStr = JSON.stringify(exportData, null, 2);
                  navigator.clipboard.writeText(codeStr);
                  alert("Copied full layout, color overrides & custom shapes config to clipboard!");
                }}
              >
                📋 Copy Layout & Shapes Config
              </button>
              <button
                type="button"
                className="rpg-admin-action-btn reset"
                onClick={() => {
                  if (confirm("Reset all customizations, colors, and coordinates to 0?")) {
                    setDragonOffsets({});
                    setDragonFills({});
                    setDeletedShapes({});
                    setCustomShapes([]);
                    setSelectedDragonPart(null);
                  }
                }}
              >
                🔄 Reset Config
              </button>
            </div>
          </div>
        </div>
      )}

      <details className="combat-log">
        <summary><strong id="combat-log-title">Combat log</strong><span>{state.events.length} verified attacks</span></summary>
        {state.events.length === 0 ? (
          <p>No attacks yet. A submitted task deals damage only after its assigned reviewer verifies it.</p>
        ) : (
          <ol>
            {[...state.events].reverse().map((event) => (
              <li key={event._id}>
                <strong>{event.attackerName} dealt {event.damage} damage</strong>
                <span>{event.reviewerName} verified “{event.taskTitle}” · {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(event.createdAt)}</span>
              </li>
            ))}
          </ol>
        )}
      </details>
    </section>
  );
}
