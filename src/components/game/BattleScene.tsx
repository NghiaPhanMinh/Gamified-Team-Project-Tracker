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
import { LandscapeDragon, DRAGON_ORIGINAL_SHAPES, parseCoordinates } from "./landscape/LandscapeDragon";
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

const LOCAL_STORAGE_KEY = "dragon_editor_config_v4";

const DEFAULT_DRAGON_OFFSETS: Record<string, { x: number; y: number; rotate: number; scale?: number }> = {
  "backWing_membrane1": { "x": 0, "y": 0, "rotate": 0 },
  "backWing_membrane2": { "x": 0, "y": 0, "rotate": 0 },
  "backWing_membrane3": { "x": 0, "y": 0, "rotate": 0 },
  "backWing_strut1": { "x": 0, "y": 0, "rotate": 0 },
  "backWing_strut2": { "x": 0, "y": 0, "rotate": 0 },
  "backWing_joint": { "x": 0, "y": 0, "rotate": 0 },
  "backWing_claw": { "x": 0, "y": 0, "rotate": 0 },
  "frontWing_membrane1": { "x": 0, "y": 0, "rotate": 0 },
  "frontWing_membrane2": { "x": 0, "y": 0, "rotate": 0 },
  "frontWing_membrane3": { "x": 0, "y": 0, "rotate": 0 },
  "frontWing_strut1": { "x": 0, "y": 0, "rotate": 0 },
  "frontWing_strut2": { "x": 0, "y": 0, "rotate": 0 },
  "frontWing_joint": { "x": 0, "y": 0, "rotate": 0 },
  "frontWing_claw": { "x": 0, "y": 0, "rotate": 0 },
  "tail_seg1": { "x": 0, "y": 0, "rotate": 0 },
  "tail_seg2": { "x": 0, "y": 0, "rotate": 0 },
  "tail_seg3": { "x": 0, "y": 0, "rotate": 0 },
  "tail_shadow": { "x": 64, "y": 32, "rotate": 0 },
  "tail_barb1": { "x": 16, "y": -6, "rotate": 0 },
  "tail_barb2": { "x": 0, "y": 0, "rotate": 0 },
  "tail_barb3": { "x": 13, "y": 22, "rotate": 0 },
  "tail_spine1": { "x": 0, "y": 8, "rotate": 0 },
  "tail_spine2": { "x": 0, "y": 0, "rotate": 0 },
  "tail_spine3": { "x": 0, "y": 0, "rotate": 0 },
  "spine1": { "x": 0, "y": 0, "rotate": 0 },
  "spine2": { "x": 0, "y": 0, "rotate": 0 },
  "spine3": { "x": 0, "y": 0, "rotate": 0 },
  "spine4": { "x": 0, "y": 0, "rotate": 0 },
  "spine5": { "x": 0, "y": 0, "rotate": 0 },
  "spine6": { "x": 0, "y": 0, "rotate": 0 },
  "spine7": { "x": 231, "y": -80, "rotate": 60 },
  "backLeg_thigh": { "x": 0, "y": 0, "rotate": 0 },
  "backLeg_knee": { "x": 0, "y": 0, "rotate": 0 },
  "backLeg_calf": { "x": 0, "y": 0, "rotate": 0 },
  "backLeg_ankle": { "x": -12, "y": -15, "rotate": 0 },
  "backLeg_foot": { "x": -9, "y": -9, "rotate": 0 },
  "backLeg_claw1": { "x": -2, "y": 2, "rotate": 0 },
  "backLeg_claw2": { "x": -5, "y": 3, "rotate": 0 },
  "backLeg_claw3": { "x": -10, "y": 8, "rotate": 0 },
  "torso_base": { "x": 0, "y": 0, "rotate": 0 },
  "torso_plate1": { "x": -89, "y": 51, "rotate": 0 },
  "torso_plate2": { "x": 10, "y": -2, "rotate": 0 },
  "torso_chest1": { "x": 0, "y": 0, "rotate": 0 },
  "torso_chest2": { "x": 4, "y": 0, "rotate": 0 },
  "torso_chest3": { "x": 0, "y": 0, "rotate": 0 },
  "torso_chest4": { "x": 0, "y": 0, "rotate": 0 },
  "torso_chest5": { "x": 0, "y": 0, "rotate": 0 },
  "frontLeg_thigh": { "x": 0, "y": 0, "rotate": 0 },
  "frontLeg_knee": { "x": 0, "y": 0, "rotate": 0 },
  "frontLeg_calf": { "x": 9, "y": 7, "rotate": 0 },
  "frontLeg_ankle": { "x": -3, "y": 2, "rotate": 0 },
  "frontLeg_foot": { "x": -1, "y": 7, "rotate": 0 },
  "frontLeg_claw1": { "x": -48, "y": -15, "rotate": 0 },
  "frontLeg_claw2": { "x": -50, "y": 7, "rotate": 0 },
  "frontLeg_claw3": { "x": -50, "y": 25, "rotate": 0 },
  "frontArm_shoulder": { "x": 0, "y": 0, "rotate": 0 },
  "frontArm_bicep": { "x": -92, "y": 87, "rotate": 0 },
  "frontArm_elbow": { "x": -26, "y": -43, "rotate": 0, "scale": 1.25 },
  "frontArm_forearm": { "x": -10, "y": 3, "rotate": 0 },
  "frontArm_wrist": { "x": -12, "y": -5, "rotate": 0 },
  "frontArm_claw1": { "x": -59, "y": -17, "rotate": 0 },
  "frontArm_claw2": { "x": -38, "y": -2, "rotate": 0 },
  "neck_base1": { "x": 0, "y": 0, "rotate": 0 },
  "neck_base2": { "x": 45, "y": 112, "rotate": -160 },
  "neck_plate1": { "x": 0, "y": 0, "rotate": 0 },
  "neck_plate2": { "x": 0, "y": 0, "rotate": 0 },
  "neck_plate3": { "x": 0, "y": 0, "rotate": 0 },
  "mouth_cavity": { "x": 13, "y": -4, "rotate": 0 },
  "skull_base": { "x": 0, "y": 0, "rotate": 0 },
  "mouth_webbing": { "x": 0, "y": 0, "rotate": 0 },
  "snout_base": { "x": 0, "y": 0, "rotate": 0 },
  "snout_nostril": { "x": 0, "y": 0, "rotate": 0 },
  "lower_jaw": { "x": 0, "y": 0, "rotate": 0 },
  "upper_fang1": { "x": 0, "y": 0, "rotate": 0 },
  "upper_fang2": { "x": 0, "y": 0, "rotate": 0 },
  "upper_fang3": { "x": 0, "y": 0, "rotate": 0 },
  "upper_fang4": { "x": 0, "y": 0, "rotate": 0 },
  "upper_fang5": { "x": 0, "y": 0, "rotate": 0 },
  "upper_fang6": { "x": 0, "y": 0, "rotate": 0 },
  "lower_fang1": { "x": 5, "y": -1, "rotate": 0 },
  "lower_fang2": { "x": 4, "y": -1, "rotate": 0 },
  "lower_fang3": { "x": 3, "y": -3, "rotate": 0 },
  "lower_fang4": { "x": 2, "y": -2, "rotate": 0 },
  "horn1": { "x": 0, "y": 0, "rotate": 0 },
  "horn2": { "x": 0, "y": 0, "rotate": 0 },
  "spine_head1": { "x": 0, "y": 0, "rotate": 0 },
  "spine_head2": { "x": -54, "y": 27, "rotate": 0 },
  "spine_head3": { "x": -81, "y": 13, "rotate": 0 },
  "eye_base": { "x": -3, "y": 3, "rotate": 0 },
  "eye_pupil": { "x": -5, "y": 3, "rotate": 0 },
  "eye_specular": { "x": -5, "y": 4, "rotate": 0 },
  "eye_brow": { "x": 0, "y": 0, "rotate": 0 },
  "frontClaw_arm": { "x": 13, "y": 4, "rotate": 0 },
  "frontClaw_claw1": { "x": -14, "y": 1, "rotate": 0 },
  "frontClaw_claw2": { "x": -16, "y": 5, "rotate": 0 },
  "frontClaw_claw3": { "x": -13, "y": 4, "rotate": 0 },
  "custom_1786872953815": { "x": -269, "y": -119, "rotate": 0 },
  "custom_1786873091485": { "x": -123, "y": -127, "rotate": 260 },
  "custom_1786873263651": { "x": -92, "y": -132, "rotate": 80, "scale": 1.05 },
  "custom_1786873460613": { "x": -85, "y": -127, "rotate": 70, "scale": 1 },
  "custom_1786978504240": { "x": 0, "y": 0, "rotate": 0, "scale": 1 },
  "custom_1786978550424": { "x": 0, "y": 0, "rotate": 0, "scale": 100 },
  "custom_1786978786209": { "x": 33, "y": -29, "rotate": 0, "scale": 0.45 },
  "custom_1786978835140": { "x": 0, "y": 0, "rotate": 0, "scale": 2.4 },
  "custom_178697881829": { "x": 0, "y": 0, "rotate": 0, "scale": 1 },
  "custom_1786979572697": { "x": -71, "y": -129, "rotate": -15, "scale": 1 },
  "custom_1786979651336": { "x": -116, "y": -162, "rotate": 0, "scale": 1 },
  "custom_1786980002439": { "x": -67, "y": -107, "rotate": 80, "scale": 1.05 },
  "custom_1786980030730": { "x": -98, "y": -102, "rotate": 260, "scale": 1 },
  "custom_1786980038964": { "x": -92, "y": -148, "rotate": 0, "scale": 0.9 },
  "custom_1786980109541": { "x": -76, "y": -155, "rotate": 0, "scale": 0.9 },
  "custom_1786980127871": { "x": -65, "y": -161, "rotate": 0, "scale": 0.9 },
  "custom_1786980243010": { "x": -124, "y": -101, "rotate": 0, "scale": 0.75 },
  "custom_1786980264091": { "x": -121, "y": -97, "rotate": 0, "scale": 0.75 },
  "custom_1786980270419": { "x": -118, "y": -92, "rotate": 0, "scale": 0.75 }
};

const DEFAULT_DRAGON_FILLS: Record<string, string> = {
  "frontWing_membrane2": "#2b0808",
  "frontWing_membrane1": "#4a0d0d",
  "frontArm_shoulder": "#9a1d1d",
  "lower_jaw": "#810404",
  "backLeg_thigh": "#2a0404",
  "backLeg_knee": "#1c0202",
  "frontWing_membrane3": "#000000",
  "neck_base1": "#8a1414"
};

const DEFAULT_DELETED_SHAPES: Record<string, boolean> = {
  "horn1": true,
  "horn2": true,
  "spine_head2": true,
  "spine_head3": true,
  "mouth_webbing": true,
  "spine_head1": true,
  "frontArm_bicep": true,
  "frontArm_claw2": true,
  "frontArm_claw1": true,
  "tail_barb3": true,
  "frontLeg_claw1": true,
  "frontLeg_claw2": true,
  "frontLeg_claw3": true,
  "tail_shadow": true,
  "torso_plate1": true,
  "eye_brow": true
};

const DEFAULT_CUSTOM_SHAPES = [
  {
    "id": "custom_1786873091485",
    "name": "✨ Custom POLYGON (2)",
    "type": "polygon" as const,
    "fill": "#9c1111",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "0,-15 15,15 -15,15",
    "d": "M -15 -15 L 15 15",
    "rotate": 0
  },
  {
    "id": "custom_1786873263651",
    "name": "✨ Custom POLYGON (3)",
    "type": "polygon" as const,
    "fill": "#b91c1c",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "0,-15 10,15 -15,20",
    "d": "M -15 -15 L 15 15",
    "rotate": 0
  },
  {
    "id": "custom_1786873460613",
    "name": "✨ Custom POLYGON (4)",
    "type": "polygon" as const,
    "fill": "#e6ac2d",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "0,-20 2,15 -15,15",
    "d": "M -15 -15 L 15 15",
    "rotate": 0
  },
  {
    "id": "custom_1786978550424",
    "name": "✨ Custom CIRCLE (4)",
    "type": "circle" as const,
    "fill": "#b91c1c",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 15,
    "ry": 0,
    "points": "0,-15 15,15 -15,15",
    "d": "M -15 -15 L 15 15",
    "rotate": 0
  },
  {
    "id": "custom_1786978881829",
    "name": "✨ Custom PATH (6)",
    "type": "path" as const,
    "fill": "#b91c1c",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "0,-15 15,15 -15,15",
    "d": "M -15 -15 L 15 15",
    "rotate": 0
  },
  {
    "id": "custom_1786979572697",
    "name": "✨ Duplicate of ✨ Custom POLYGON (4)",
    "type": "polygon" as const,
    "fill": "#e6ac2d",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "-11,-26 -6,8 -26,3",
    "d": "-11,-26 -6,8 -26,3",
    "rotate": 70
  },
  {
    "id": "custom_1786979651336",
    "name": "✨ Custom POLYGON (7)",
    "type": "polygon" as const,
    "fill": "#811212",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "0,-15 15,15 -15,15",
    "d": "M -15 -15 L 15 15",
    "rotate": 0
  },
  {
    "id": "custom_1786980038964",
    "name": "✨ Duplicate of ✨ Custom POLYGON (7)",
    "type": "polygon" as const,
    "fill": "#4e0909",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "-9,10 11,18 -24,17",
    "d": "-9,10 11,18 -24,17",
    "rotate": 0
  },
  {
    "id": "custom_1786980109541",
    "name": "✨ Duplicate of ✨ Duplicate of ✨ Custom POLYGON (7)",
    "type": "polygon" as const,
    "fill": "#a0771c",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "-30,-2 2,-5 -24,17",
    "d": "-30,-2 2,-5 -24,17",
    "rotate": 0
  },
  {
    "id": "custom_1786980127871",
    "name": "✨ Duplicate of ✨ Duplicate of ✨ Duplicate of ✨ Custom POLYGON (7)",
    "type": "polygon" as const,
    "fill": "#a0771c",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "-30,-2 2,-5 -24,17",
    "d": "-30,-2 2,-5 -24,17",
    "rotate": 0
  },
  {
    "id": "custom_1786980243010",
    "name": "✨ Duplicate of 💅 Back Leg Talon 1",
    "type": "polygon" as const,
    "fill": "#a8a8a8",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "125,264 102,276 120,256",
    "d": "125,264 102,276 120,256",
    "rotate": 0
  },
  {
    "id": "custom_1786980264091",
    "name": "✨ Duplicate of ✨ Duplicate of 💅 Back Leg Talon 1",
    "type": "polygon" as const,
    "fill": "#a8a8a8",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "125,264 102,276 120,256",
    "d": "125,264 102,276 120,256",
    "rotate": 0
  },
  {
    "id": "custom_1786980270419",
    "name": "✨ Duplicate of ✨ Duplicate of ✨ Duplicate of 💅 Back Leg Talon 1",
    "type": "polygon" as const,
    "fill": "#b0b0b0",
    "x": 150,
    "y": 150,
    "width": 40,
    "height": 30,
    "rx": 0,
    "ry": 0,
    "points": "125,264 102,276 120,256",
    "d": "125,264 102,276 120,256",
    "rotate": 0
  }
];

const DEFAULT_DRAGON_GEOMETRIES: Record<string, string> = {
  "backWing_membrane1": "M 120 110 Q 180 -40 320 -70 Q 250 10 210 70 Q 160 50 120 110 Z",
  "backWing_membrane2": "M 320 -70 Q 270 20 230 85 Q 180 80 120 110 Q 200 10 320 -70 Z",
  "backWing_membrane3": "M 230 85 Q 180 40 120 110 Q 170 80 230 85 Z",
  "backWing_strut1": "M 120 110 Q 220 -20 320 -70",
  "backWing_strut2": "M 120 110 Q 185 10 230 85",
  "backWing_claw": "320,-70 334,-84 324,-58",
  "frontWing_membrane1": "M 110 115 Q 10 -40 -80 -60 Q 0 15 50 80 Q 80 60 110 115 Z",
  "frontWing_membrane2": "M -80 -60 Q -10 35 30 100 Q 70 85 130 125 Z",
  "frontWing_membrane3": "M 30 100 Q 65 60 130 125 Q 75 95 30 100 Z",
  "frontWing_strut1": "M 110 115 Q 20 10 -80 -60",
  "frontWing_strut2": "M 110 115 Q 50 30 30 100",
  "frontWing_claw": "-70,-50 -85,-65 -74,-38",
  "tail_seg1": "M 160 150 Q 220 160 255 190 L 240 215 Q 215 190 165 175 Z",
  "tail_seg2": "M 255 190 Q 285 225 265 260 L 245 255 Q 260 235 240 215 Z",
  "tail_seg3": "M 265 260 Q 240 280 205 270 L 210 255 Q 235 262 245 255 Z",
  "tail_shadow": "M 245 255 Q 235 262 205 270 Q 220 285 245 255 Z",
  "tail_barb1": "205,270 170,290 192,260",
  "tail_barb2": "205,270 182,252 196,263",
  "tail_barb3": "205,270 188,285 198,272",
  "tail_spine1": "230,170 242,158 238,175",
  "tail_spine2": "275,215 290,208 280,225",
  "tail_spine3": "255,262 268,272 250,268",
  "spine1": "35,42 22,22 42,35",
  "spine2": "55,58 45,38 62,52",
  "spine3": "80,78 72,58 88,72",
  "spine4": "105,98 111,90 110,95",
  "spine5": "135,118 122,100 138,114",
  "spine6": "165,138 152,120 168,134",
  "spine7": "195,152 190,136 203,144",
  "backLeg_thigh": "M 150 145 C 205 160 210 205 185 215 C 145 205 140 180 150 145 Z",
  "backLeg_calf": "M 185 215 L 165 255 L 140 248 L 170 208 Z",
  "backLeg_foot": "M 165 255 L 125 264 L 128 252 L 158 246 Z",
  "backLeg_claw1": "125,264 102,276 120,256",
  "backLeg_claw2": "128,266 108,280 125,258",
  "backLeg_claw3": "132,268 114,284 130,260",
  "torso_base": "M 50 110 C 115 65 200 100 185 180 C 145 210 70 195 50 110 Z",
  "torso_plate1": "M 150 135 C 195 150 185 195 140 185 Z",
  "torso_plate2": "M 136 99 C 193 125 195 220 131 195 C 141 150 161 121 133 98 Z",
  "torso_chest1": "M 58 122 C 92 150 135 145 144 132 Q 130 170 66 152 Z",
  "torso_chest2": "M 64 132 C 72 165 130 152 136 139 Q 122 174 63 155 Z",
  "torso_chest3": "M 66 153 C 98 165 125 158 135 148 Q 115 178 79 165 Z",
  "torso_chest4": "M 70 157 C 95 173 120 164 128 154 Q 110 182 92 177 Z",
  "torso_chest5": "M 76 163 C 102 176 116 170 122 160 Q 108 185 92 178 Z",
  "frontLeg_thigh": "M 145 150 C 195 165 198 210 175 220 C 135 210 132 185 145 150 Z",
  "frontLeg_calf": "M 175 220 L 155 260 L 130 252 L 160 212 Z",
  "frontLeg_foot": "M 155 260 L 115 270 L 118 258 L 148 252 Z",
  "frontLeg_claw1": "115,270 92,284 110,262",
  "frontLeg_claw2": "118,272 98,288 114,264",
  "frontLeg_claw3": "122,274 104,292 118,266",
  "frontArm_bicep": "M 95 120 L 60 155 L 45 145 L 82 112 Z",
  "frontArm_forearm": "M 60 155 L 30 148 L 28 135 L 52 142 Z",
  "frontArm_claw1": "30,148 10,160 24,142",
  "frontArm_claw2": "32,150 14,164 26,144",
  "neck_base1": "M 70 125 Q 35 90 30 55 Q 15 30 52 18 Q 80 38 86 102 Z",
  "neck_base2": "M 35 90 Q 30 55 15 30 Q 30 35 49 61 Z",
  "neck_plate1": "M 28 50 C 44 42 60 48 68 56 C 54 62 38 58 28 50 Z",
  "neck_plate2": "M 32 64 C 48 56 64 62 72 70 C 58 76 42 72 32 64 Z",
  "neck_plate3": "M 36 78 C 52 70 68 76 76 84 C 62 90 46 86 36 78 Z",
  "mouth_cavity": "M 32 20 L -23 10 L -16 28 L 8 40 L 32 30 Z",
  "skull_base": "M 48 20 L -24 5 L 8 -4 L 62 8 Z",
  "mouth_webbing": "M 28 20 Q 20 28 8 36 Q 22 38 28 20 Z",
  "snout_base": "-24,5 -7,2 6,-3 -17,0",
  "lower_jaw": "M 42 27 L -27 14 L 13 41 Z",
  "upper_fang1": "-16,7 -19,15 -10,8",
  "upper_fang2": "-10,8 -14,16 -4,9",
  "upper_fang3": "-4,9 -8,17 1,11",
  "upper_fang4": "2,10 0,18 7,12",
  "upper_fang5": "8,11 6,19 13,13",
  "upper_fang6": "14,12 12,20 19,14",
  "lower_fang1": "-20,20 -13,13 -15,21",
  "lower_fang2": "-12,22 -7,14 -7,24",
  "lower_fang3": "-4,24 1,16 1,26",
  "lower_fang4": "3,26 8,18 9,29",
  "horn1": "M 42 6 L 64 -12 L 54 -14 L 82 -32 L 58 -18 L 66 -16 Z",
  "horn2": "M 37 2 L 59 -16 L 49 -18 L 77 -36 L 53 -22 L 61 -20 Z",
  "spine_head1": "42,8 55,-4 58,10",
  "spine_head2": "30,18 12,14 26,26",
  "spine_head3": "38,16 22,8 34,22",
  "eye_pupil": "28,-1 30,4 28,9 26,4",
  "eye_brow": "21,-3 42,1 37,4 16,2",
  "frontClaw_arm": "M 85 115 L 50 148 L 30 140 Q 60 110 85 115 Z",
  "frontClaw_claw1": "30,140 15,150 27,136",
  "frontClaw_claw2": "33,143 19,154 30,139",
  "frontClaw_claw3": "36,146 23,157 33,142",
  "custom_1786873091485": "0,-15 15,15 -8,16",
  "custom_1786873263651": "-10,-17 7,15 -15,16",
  "custom_1786873460613": "-11,-26 -2,4 -26,7",
  "custom_1786978504240": "M 47 -39 L 72 -24",
  "custom_1786978835140": "M -15 -15 L -41 25",
  "custom_1786978881829": "M -15 -15 L 20 -17",
  "custom_1786979572697": "-8,-26 -6,3 -26,-2",
  "custom_1786979651336": "-9,10 11,18 -24,17",
  "custom_1786980002439": "-14,-12 7,15 -15,16",
  "custom_1786980030730": "0,-15 2,26 -8,16",
  "custom_1786980038964": "-30,-2 2,-5 -24,17",
  "custom_1786980109541": "-34,-2 2,-5 -24,17",
  "custom_1786980127871": "-30,-2 -3,-4 -24,17",
  "custom_1786980243010": "125,264 102,276 120,256",
  "custom_1786980264091": "125,264 102,276 120,256",
  "custom_1786980270419": "125,264 102,276 120,256"
};

const DEFAULT_LAYER_ORDER = [
  "custom_1786978550424",
  "backWing_membrane1",
  "backWing_membrane2",
  "backWing_membrane3",
  "backWing_strut1",
  "backWing_strut2",
  "backWing_joint",
  "backWing_claw",
  "frontWing_membrane1",
  "frontWing_membrane2",
  "frontWing_membrane3",
  "frontWing_strut1",
  "frontWing_strut2",
  "frontWing_joint",
  "frontWing_claw",
  "tail_seg1",
  "tail_seg2",
  "tail_seg3",
  "tail_shadow",
  "tail_barb1",
  "tail_barb2",
  "tail_barb3",
  "tail_spine1",
  "tail_spine2",
  "tail_spine3",
  "spine1",
  "spine2",
  "spine3",
  "spine4",
  "spine5",
  "spine6",
  "spine7",
  "backLeg_thigh",
  "backLeg_knee",
  "backLeg_calf",
  "backLeg_ankle",
  "backLeg_foot",
  "backLeg_claw1",
  "custom_1786980243010",
  "custom_1786980264091",
  "custom_1786980270419",
  "backLeg_claw2",
  "backLeg_claw3",
  "torso_base",
  "torso_plate1",
  "torso_plate2",
  "torso_chest1",
  "torso_chest2",
  "torso_chest3",
  "torso_chest4",
  "torso_chest5",
  "frontLeg_thigh",
  "custom_1786980038964",
  "custom_1786980109541",
  "custom_1786980127871",
  "frontLeg_knee",
  "frontLeg_calf",
  "frontLeg_ankle",
  "frontLeg_foot",
  "frontLeg_claw1",
  "frontLeg_claw2",
  "frontLeg_claw3",
  "frontArm_shoulder",
  "frontArm_bicep",
  "frontArm_forearm",
  "frontArm_wrist",
  "frontArm_claw1",
  "frontArm_claw2",
  "neck_base1",
  "neck_base2",
  "neck_plate1",
  "neck_plate2",
  "neck_plate3",
  "mouth_cavity",
  "skull_base",
  "mouth_webbing",
  "snout_base",
  "snout_nostril",
  "lower_jaw",
  "upper_fang1",
  "upper_fang2",
  "upper_fang3",
  "upper_fang4",
  "upper_fang5",
  "upper_fang6",
  "lower_fang1",
  "lower_fang2",
  "lower_fang3",
  "lower_fang4",
  "horn1",
  "horn2",
  "spine_head1",
  "spine_head2",
  "spine_head3",
  "eye_base",
  "eye_pupil",
  "eye_specular",
  "eye_brow",
  "frontClaw_arm",
  "frontClaw_claw1",
  "frontArm_elbow",
  "frontClaw_claw2",
  "frontClaw_claw3",
  "custom_1786873091485",
  "custom_1786873460613",
  "custom_1786979572697",
  "custom_1786873263651",
  "custom_1786978881829",
  "custom_1786979651336"
];

function loadSavedConfig() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dragonOffsets && parsed.customShapes && parsed.dragonGeometries && parsed.layerOrder) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading config from localStorage:", e);
  }
  return null;
}

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
  const savedConfig = useMemo(() => loadSavedConfig(), []);

  const [dragonOffsets, setDragonOffsets] = useState<Record<string, { x: number; y: number; rotate: number; scale?: number }>>(() => {
    return savedConfig?.dragonOffsets || DEFAULT_DRAGON_OFFSETS;
  });

  const [dragonFills, setDragonFills] = useState<Record<string, string>>(() => {
    return savedConfig?.dragonFills || DEFAULT_DRAGON_FILLS;
  });

  const [deletedShapes, setDeletedShapes] = useState<Record<string, boolean>>(() => {
    return savedConfig?.deletedShapes || DEFAULT_DELETED_SHAPES;
  });

  const [customShapes, setCustomShapes] = useState<any[]>(() => {
    return savedConfig?.customShapes || DEFAULT_CUSTOM_SHAPES;
  });

  const [dragonGeometries, setDragonGeometries] = useState<Record<string, string>>(() => {
    return savedConfig?.dragonGeometries || DEFAULT_DRAGON_GEOMETRIES;
  });

  const [layerOrder, setLayerOrder] = useState<string[]>(() => {
    return savedConfig?.layerOrder || DEFAULT_LAYER_ORDER;
  });

  // Undo/Redo history states
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize history stack on load
  useEffect(() => {
    if (history.length === 0) {
      const initialSnapshot = {
        dragonOffsets: JSON.parse(JSON.stringify(dragonOffsets)),
        dragonFills: JSON.parse(JSON.stringify(dragonFills)),
        deletedShapes: JSON.parse(JSON.stringify(deletedShapes)),
        customShapes: JSON.parse(JSON.stringify(customShapes)),
        dragonGeometries: JSON.parse(JSON.stringify(dragonGeometries)),
        layerOrder: JSON.parse(JSON.stringify(layerOrder)),
      };
      setHistory([initialSnapshot]);
      setHistoryIndex(0);
    }
  }, []);

  function pushHistoryState(
    offsets = dragonOffsets,
    fills = dragonFills,
    deleted = deletedShapes,
    customs = customShapes,
    geoms = dragonGeometries,
    order = layerOrder
  ) {
    const snapshot = {
      dragonOffsets: JSON.parse(JSON.stringify(offsets)),
      dragonFills: JSON.parse(JSON.stringify(fills)),
      deletedShapes: JSON.parse(JSON.stringify(deleted)),
      customShapes: JSON.parse(JSON.stringify(customs)),
      dragonGeometries: JSON.parse(JSON.stringify(geoms)),
      layerOrder: JSON.parse(JSON.stringify(order)),
    };
    
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, snapshot];
    });
    setHistoryIndex((prev) => prev + 1);
  }

  function handleUndo() {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      const snapshot = history[newIdx];
      
      setDragonOffsets(snapshot.dragonOffsets);
      setDragonFills(snapshot.dragonFills);
      setDeletedShapes(snapshot.deletedShapes);
      setCustomShapes(snapshot.customShapes);
      setDragonGeometries(snapshot.dragonGeometries);
      setLayerOrder(snapshot.layerOrder);
      setHistoryIndex(newIdx);
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      const snapshot = history[newIdx];
      
      setDragonOffsets(snapshot.dragonOffsets);
      setDragonFills(snapshot.dragonFills);
      setDeletedShapes(snapshot.deletedShapes);
      setCustomShapes(snapshot.customShapes);
      setDragonGeometries(snapshot.dragonGeometries);
      setLayerOrder(snapshot.layerOrder);
      setHistoryIndex(newIdx);
    }
  }

  function handleDuplicateShape(targetId: string) {
    const id = `custom_${Date.now()}`;
    const isCustom = targetId.startsWith("custom_");
    const origShape = DRAGON_ORIGINAL_SHAPES.find(s => s.id === targetId);
    const custShape = customShapes.find(s => s.id === targetId);
    
    if (!origShape && !custShape) return;
    
    const baseType = isCustom ? custShape!.type : origShape!.type;
    const baseFill = dragonFills[targetId] || (isCustom ? custShape!.fill : origShape!.defaultFill);
    const baseGeom = dragonGeometries[targetId] || (isCustom ? (custShape!.d || custShape!.points) : (origShape!.d || origShape!.points)) || "";
    const targetOffset = dragonOffsets[targetId] || { x: 0, y: 0, rotate: 0, scale: 1 };
    
    const dupShape = {
      id,
      name: `✨ Duplicate of ${isCustom ? custShape!.name : origShape!.name}`,
      type: baseType,
      fill: baseFill,
      x: isCustom ? custShape!.x : 150,
      y: isCustom ? custShape!.y : 150,
      width: isCustom ? (custShape!.width ?? 40) : (origShape!.width ?? 40),
      height: isCustom ? (custShape!.height ?? 30) : (origShape!.height ?? 30),
      rx: isCustom ? (custShape!.rx ?? 0) : (origShape!.rx ?? 0),
      ry: isCustom ? (custShape!.ry ?? 0) : (origShape!.ry ?? 0),
      points: baseGeom,
      d: baseGeom,
      rotate: targetOffset.rotate,
    };
    
    const nextOffsets = {
      ...dragonOffsets,
      [id]: {
        x: targetOffset.x + 25,
        y: targetOffset.y + 25,
        rotate: targetOffset.rotate,
        scale: targetOffset.scale ?? 1,
      }
    };
    
    const nextCustoms = [...customShapes, dupShape];
    const nextGeoms = { ...dragonGeometries, [id]: baseGeom };
    
    const nextOrder = [...layerOrder];
    const targetIdx = nextOrder.indexOf(targetId);
    if (targetIdx !== -1) {
      nextOrder.splice(targetIdx + 1, 0, id);
    } else {
      nextOrder.unshift(id);
    }
    
    setDragonOffsets(nextOffsets);
    setCustomShapes(nextCustoms);
    setDragonGeometries(nextGeoms);
    setLayerOrder(nextOrder);
    setSelectedDragonPart(id);
    
    pushHistoryState(nextOffsets, dragonFills, deletedShapes, nextCustoms, nextGeoms, nextOrder);
  }

  const [selectedDragonPart, setSelectedDragonPart] = useState<string | null>(null);
  const [showDragonEditor, setShowDragonEditor] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Spawner states
  const [spawnerType, setSpawnerType] = useState<"circle" | "ellipse" | "rect" | "polygon" | "path">("circle");
  const [spawnerColor, setSpawnerColor] = useState("#b91c1c");

  // Moveable Panel coords
  const [panelPos, setPanelPos] = useState({ x: 80, y: 80 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  // Moveable Dragon HP Bar Position
  const [dragonHpBarPos, setDragonHpBarPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dragonHpBarPos) return parsed.dragonHpBarPos;
      }
    } catch {}
    return { x: 0, y: 0 };
  });

  // Direct Shape Drag and Drop
  const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);
  const dragShapeStart = useRef({ mouseX: 0, mouseY: 0, shapeX: 0, shapeY: 0 });

  // Vertex Node Dragging
  const [draggingNode, setDraggingNode] = useState<{ shapeId: string; xIdx: number; yIdx: number } | null>(null);
  const dragNodeStart = useRef({ mouseX: 0, mouseY: 0, nodeX: 0, nodeY: 0 });

  // Sync state to localStorage
  useEffect(() => {
    const config = {
      dragonOffsets,
      dragonFills,
      deletedShapes,
      customShapes,
      dragonGeometries,
      layerOrder,
      dragonHpBarPos,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  }, [dragonOffsets, dragonFills, deletedShapes, customShapes, dragonGeometries, layerOrder, dragonHpBarPos]);

  // Scroll selected layer stack row into view automatically
  useEffect(() => {
    if (selectedDragonPart) {
      const el = document.getElementById(`layer-row-${selectedDragonPart}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedDragonPart]);

  function handlePanelDragStart(e: React.MouseEvent) {
    setIsDraggingPanel(true);
    dragStartOffset.current = {
      x: e.clientX - panelPos.x,
      y: e.clientY - panelPos.y,
    };
  }

  function handleStartDragShape(shapeId: string, clientX: number, clientY: number) {
    const currentOffset = dragonOffsets[shapeId] || { x: 0, y: 0, rotate: 0, scale: 1 };
    setDraggingShapeId(shapeId);
    dragShapeStart.current = {
      mouseX: clientX,
      mouseY: clientY,
      shapeX: currentOffset.x,
      shapeY: currentOffset.y,
    };
  }

  function handleStartDragNode(shapeId: string, xIdx: number, yIdx: number, startX: number, startY: number, mouseX: number, mouseY: number) {
    setDraggingNode({ shapeId, xIdx, yIdx });
    dragNodeStart.current = {
      mouseX,
      mouseY,
      nodeX: startX,
      nodeY: startY,
    };
  }

  function handleMoveLayerUp(key: string) {
    const idx = layerOrder.indexOf(key);
    if (idx !== -1 && idx < layerOrder.length - 1) {
      const newOrder = [...layerOrder];
      const temp = newOrder[idx];
      newOrder[idx] = newOrder[idx + 1];
      newOrder[idx + 1] = temp;
      setLayerOrder(newOrder);
      pushHistoryState(dragonOffsets, dragonFills, deletedShapes, customShapes, dragonGeometries, newOrder);
    }
  }

  function handleMoveLayerDown(key: string) {
    const idx = layerOrder.indexOf(key);
    if (idx > 0) {
      const newOrder = [...layerOrder];
      const temp = newOrder[idx];
      newOrder[idx] = newOrder[idx - 1];
      newOrder[idx - 1] = temp;
      setLayerOrder(newOrder);
      pushHistoryState(dragonOffsets, dragonFills, deletedShapes, customShapes, dragonGeometries, newOrder);
    }
  }

  function handleSetLayerIndex(key: string, targetIdx: number) {
    const currentIdx = layerOrder.indexOf(key);
    if (currentIdx === -1) return;
    const validatedIdx = Math.max(0, Math.min(layerOrder.length - 1, targetIdx));
    const newOrder = [...layerOrder];
    const [item] = newOrder.splice(currentIdx, 1);
    newOrder.splice(validatedIdx, 0, item);
    setLayerOrder(newOrder);
    pushHistoryState(dragonOffsets, dragonFills, deletedShapes, customShapes, dragonGeometries, newOrder);
  }

  // Effect to drag Panel, drag individual shapes, and drag nodes
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
        
        const svgEl = document.querySelector(".layer-8-dragon svg");
        let scaleFactor = 1.5;
        if (svgEl) {
          const rect = svgEl.getBoundingClientRect();
          scaleFactor = (1000 / rect.width) / 0.68;
        }

        setDragonOffsets((prev) => {
          const prevVal = prev[draggingShapeId] || { x: 0, y: 0, rotate: 0, scale: 1 };
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

      if (draggingNode) {
        const dx = e.clientX - dragNodeStart.current.mouseX;
        const dy = e.clientY - dragNodeStart.current.mouseY;

        const svgEl = document.querySelector(".layer-8-dragon svg");
        let scaleFactor = 1.5;
        if (svgEl) {
          const rect = svgEl.getBoundingClientRect();
          scaleFactor = (1000 / rect.width) / 0.68;
        }

        setDragonGeometries((prev) => {
          let currentGeom = prev[draggingNode.shapeId];
          if (!currentGeom) {
            const shapeObj = DRAGON_ORIGINAL_SHAPES.find(s => s.id === draggingNode.shapeId)
              || customShapes.find(s => s.id === draggingNode.shapeId);
            currentGeom = shapeObj?.d || shapeObj?.points || "";
          }

          const { tokens } = parseCoordinates(currentGeom);
          if (tokens.length > draggingNode.yIdx) {
            const newX = Math.round(dragNodeStart.current.nodeX + dx * scaleFactor);
            const newY = Math.round(dragNodeStart.current.nodeY + dy * scaleFactor);
            tokens[draggingNode.xIdx] = String(newX);
            tokens[draggingNode.yIdx] = String(newY);
          }

          return {
            ...prev,
            [draggingNode.shapeId]: tokens.join(""),
          };
        });
      }
    }

    function handleMouseUp() {
      if (draggingShapeId || draggingNode) {
        pushHistoryState();
      }
      setIsDraggingPanel(false);
      setDraggingShapeId(null);
      setDraggingNode(null);
    }

    if (isDraggingPanel || draggingShapeId || draggingNode) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPanel, draggingShapeId, draggingNode, customShapes]);

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
    
    const nextOffsets = {
      ...dragonOffsets,
      [id]: { x: 0, y: 0, rotate: 0, scale: 1 }
    };
    const nextCustoms = [...customShapes, newShape];
    const nextGeoms = {
      ...dragonGeometries,
      [id]: spawnerType === "polygon" ? "0,-15 15,15 -15,15" : (spawnerType === "path" ? "M -15 -15 L 15 15" : "")
    };
    const nextOrder = [id, ...layerOrder];

    setDragonOffsets(nextOffsets);
    setCustomShapes(nextCustoms);
    setDragonGeometries(nextGeoms);
    setLayerOrder(nextOrder);
    setSelectedDragonPart(id);

    pushHistoryState(nextOffsets, dragonFills, deletedShapes, nextCustoms, nextGeoms, nextOrder);
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
      const currentMember = state?.members.find((m) => m.profileId === state.currentProfileId);
      setLocalAttack({
        id: `goblin_atk_${Date.now()}`,
        attackerName: currentMember?.displayName || "Adventurer",
        damage: 100,
        spellType: currentMember?.spellType || "lightning",
        target: "goblin",
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
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": evidenceFile.type },
          body: evidenceFile,
        });

        if (!res.ok) throw new Error("Failed to upload evidence file.");
        const json = await res.json();
        storageId = json.storageId;
      }

      // 3. Submit evidence record
      const fileName = evidenceFile?.name;
      const contentType = evidenceFile?.type;
      const fileSize = evidenceFile?.size;

      await addEvidence({
        taskId: selectedTaskId,
        type: evidenceType,
        note: evidenceNote.trim() || undefined,
        url: evidenceUrl.trim() || undefined,
        storageId,
        fileName,
        contentType,
        fileSize,
      });

      // 4. Submit for review
      await submitForReview({ taskId: selectedTaskId });

      const currentMember = state?.members.find((m) => m.profileId === state.currentProfileId);
      setLocalAttack({
        id: `boss_atk_${Date.now()}`,
        attackerName: currentMember?.displayName || "Adventurer",
        damage: currentTask.damage || 50,
        spellType: currentMember?.spellType || "fire",
        target: "dragon",
      });

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

  const [localAttack, setLocalAttack] = useState<{
    id: string;
    attackerName: string;
    damage: number;
    spellType?: string;
    target?: "goblin" | "dragon";
  } | null>(null);

  useEffect(() => {
    if (localAttack) {
      const timer = window.setTimeout(() => setLocalAttack(null), 60000);
      return () => window.clearTimeout(timer);
    }
  }, [localAttack]);

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
      const timer = window.setTimeout(() => setActiveEventId(null), 60000);
      return () => window.clearTimeout(timer);
    }
  }, [state]);

  const activeEvent = useMemo(
    () => state?.events.find((event) => event._id === activeEventId) ?? null,
    [state?.events, activeEventId],
  );

  const combinedActiveEvent = useMemo(() => {
    if (localAttack) return localAttack;
    if (activeEvent) {
      return {
        id: activeEvent._id,
        attackerName: activeEvent.attackerName,
        damage: activeEvent.damage,
        spellType: activeEvent.spellType,
        target: "dragon" as const,
      };
    }
    return null;
  }, [localAttack, activeEvent]);

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
      spellType: member.spellType,
      isActiveToday: member.hasSubmittedToday,
      isAttacking: (combinedActiveEvent?.attackerName === member.displayName || activeEvent?.attackerProfileId === member.profileId),
    }));
  }, [state, activeEvent, combinedActiveEvent]);

  const startStr = workspace?.project?.startDate || (state?.project?.launchedAt ? new Date(state.project.launchedAt).toISOString().split("T")[0] : "");
  const deadlineStr = workspace?.project?.deadline || state?.project?.deadline || "";

  const { totalDays, daysPassed, daysRemaining, progressPercent } = useMemo(() => {
    if (!deadlineStr) return { totalDays: 0, daysPassed: 0, daysRemaining: 0, progressPercent: 0 };
    const end = new Date(`${deadlineStr}T23:59:59Z`).getTime();
    let start = startStr ? new Date(`${startStr}T00:00:00Z`).getTime() : 0;
    if (!start || isNaN(start)) {
      start = end - (14 * 24 * 60 * 60 * 1000);
    }
    const now = Date.now();
    const totalMs = Math.max(1000 * 60 * 60 * 24, end - start);
    const passedMs = Math.max(0, Math.min(totalMs, now - start));
    const tDays = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)));
    const pDays = Math.max(0, Math.min(tDays, Math.floor(passedMs / (1000 * 60 * 60 * 24))));
    const rDays = Math.max(0, tDays - pDays);
    const pct = Math.min(100, Math.max(0, (passedMs / totalMs) * 100));
    return { totalDays: tDays, daysPassed: pDays, daysRemaining: rDays, progressPercent: pct };
  }, [startStr, deadlineStr]);

  const milestoneCheckpoints = useMemo(() => {
    if (!workspace?.milestones || !startStr || !deadlineStr) return [];
    const start = new Date(`${startStr}T00:00:00Z`).getTime();
    const end = new Date(`${deadlineStr}T23:59:59Z`).getTime();
    const totalMs = Math.max(1, end - start);
    return workspace.milestones.map((m) => {
      const mTime = new Date(`${m.dueDate}T23:59:59Z`).getTime();
      const pct = Math.max(0, Math.min(100, ((mTime - start) / totalMs) * 100));
      return {
        id: m._id,
        title: m.title,
        dueDate: m.dueDate,
        status: m.status,
        percent: pct,
      };
    });
  }, [workspace?.milestones, startStr, deadlineStr]);

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

        {/* Floating Mob-Style Boss HP Bar (Intimidating flame outline + moveable position) */}
        <div
          className="boss-hp-mob-style"
          style={{
            left: `calc(${Math.min(92, Math.max(8, (dragonX / 10) - 2.5))}% + ${dragonHpBarPos.x}px)`,
            top: `calc(85px + ${dragonHpBarPos.y}px)`,
          }}
        >
          <div
            className="boss-hp-mob-fill"
            style={{ width: `${hpPercent}%` }}
          />
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
          geometries={dragonGeometries}
          onStartDragNode={handleStartDragNode}
          layerOrder={layerOrder}
        />

        {/* Layer 9: Section 2 - Cosmetic Combat Exchange & Elemental Attacks */}
        <LandscapeFX
          activeEvent={combinedActiveEvent}
          isVictory={defeated}
        />

        {/* Layer 10: Bottom-Middle Plant vs Zombies Style Deadline Progress Bar */}
        <div
          className="pvz-deadline-progress-container"
          style={{
            position: "absolute",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 25,
            width: "min(480px, 52%)",
            background: "rgba(18, 14, 10, 0.88)",
            border: "2.5px solid #78350f",
            borderRadius: "16px",
            padding: "5px 12px 6px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
            userSelect: "none",
            pointerEvents: "auto",
          }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Project timeline: ${daysRemaining} days remaining`}
        >
          {/* Top Info Header */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.68rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading), serif",
              letterSpacing: "0.04em",
              color: "#fef08a",
              textShadow: "0 1px 2px #000",
            }}
          >
            <span>⏳ Day {daysPassed} / {totalDays}</span>
            <span style={{ color: daysRemaining <= 3 ? "#f87171" : "#86efac" }}>
              {daysRemaining === 0 ? "⚠️ DEADLINE TODAY!" : `${daysRemaining} DAYS REMAINING`}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "12px",
              background: "#1c1917",
              border: "1.5px solid #92400e",
              borderRadius: "6px",
              overflow: "visible",
            }}
          >
            {/* Green Progress Fill */}
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(to right, #15803d, #22c55e)",
                borderRadius: "4px",
                transition: "width 0.4s ease",
              }}
            />

            {/* Checkpoint notches for each day */}
            {totalDays > 1 && totalDays <= 45 && Array.from({ length: totalDays - 1 }).map((_, idx) => {
              const dayPct = ((idx + 1) / totalDays) * 100;
              return (
                <div
                  key={`day-tick-${idx}`}
                  style={{
                    position: "absolute",
                    left: `${dayPct}%`,
                    top: "2px",
                    width: "1.5px",
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.25)",
                    pointerEvents: "none",
                  }}
                />
              );
            })}

            {/* Milestone Waves Checkpoints (Red Flag Indicators) */}
            {milestoneCheckpoints.map((mc) => (
              <div
                key={mc.id}
                title={`Wave Milestone: ${mc.title} (Due: ${mc.dueDate})`}
                style={{
                  position: "absolute",
                  left: `${mc.percent}%`,
                  top: "-15px",
                  transform: "translateX(-50%)",
                  fontSize: "12px",
                  cursor: "help",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                  zIndex: 2,
                }}
              >
                🚩
              </div>
            ))}

            {/* Final Target Destination Crown / Trophy */}
            <div
              title={`Final Project Goal: ${deadlineStr}`}
              style={{
                position: "absolute",
                right: "-6px",
                top: "-15px",
                fontSize: "12px",
                cursor: "help",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                zIndex: 2,
              }}
            >
              🏆
            </div>

            {/* Moving Sword Indicator Head */}
            <div
              style={{
                position: "absolute",
                left: `${progressPercent}%`,
                top: "-7px",
                transform: "translateX(-50%)",
                fontSize: "14px",
                pointerEvents: "none",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.9))",
                transition: "left 0.4s ease",
                zIndex: 3,
              }}
            >
              ⚔️
            </div>
          </div>
        </div>
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

              {/* Dedicated Scrollable Combat & Kill Log Box */}
              <div style={{ marginTop: "14px", borderTop: "2px dashed #b45309", paddingTop: "10px" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "0.85rem", color: "#78350f", fontFamily: "var(--font-heading), serif", display: "flex", alignItems: "center", gap: "6px" }}>
                  ⚔️ Combat & Kill Activity Log
                </h4>
                <div
                  style={{
                    maxHeight: "140px",
                    overflowY: "auto",
                    background: "rgba(0, 0, 0, 0.05)",
                    border: "1.5px solid #d97706",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "0.72rem",
                  }}
                >
                  {!state?.events || state.events.length === 0 ? (
                    <p style={{ margin: 0, textAlign: "center", color: "#78350f", fontStyle: "italic", padding: "8px 0" }}>
                      No registered attacks yet. Slay goblins or strike the dragon to log damage!
                    </p>
                  ) : (
                    [...state.events].reverse().map((ev) => {
                      const isGoblin = (ev.damage ?? 0) >= 100 || ev.taskTitle.toLowerCase().includes("goblin") || ev.taskTitle.toLowerCase().includes("daily");
                      const spellIcon = ev.spellType === "fire" ? "🔥" : ev.spellType === "lightning" || ev.spellType === "spark" ? "⚡" : "❄️";
                      return (
                        <div
                          key={ev._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "4px 8px",
                            background: "#fffbeb",
                            border: "1px solid #fef3c7",
                            borderRadius: "4px",
                          }}
                        >
                          <div>
                            <strong style={{ color: "#92400e" }}>{ev.attackerName}</strong>
                            <span style={{ color: "#475569", marginLeft: "4px" }}>
                              cast {spellIcon} on <strong>{isGoblin ? "👹 Goblin" : "🐲 Dragon"}</strong> ({ev.taskTitle})
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 800, color: "#dc2626" }}>
                              -{ev.damage} HP
                            </span>
                            <span style={{ fontSize: "0.62rem", color: "#64748b" }}>
                              {new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "numeric", month: "short", day: "numeric" }).format(ev.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
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
            {/* Toggle Animation & History controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "10px", background: "#0f172a", padding: "8px", borderRadius: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  id="toggle-anim"
                  type="checkbox"
                  checked={animationsEnabled}
                  onChange={(e) => setAnimationsEnabled(e.target.checked)}
                />
                <label htmlFor="toggle-anim" style={{ fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", color: "#38bdf8" }}>
                  Flapping
                </label>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className="rpg-dpad-btn"
                  style={{ padding: "2px 8px", fontSize: "0.7rem", opacity: historyIndex > 0 ? 1 : 0.4, cursor: historyIndex > 0 ? "pointer" : "not-allowed" }}
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo last change"
                >
                  ↩️ Undo
                </button>
                <button
                  type="button"
                  className="rpg-dpad-btn"
                  style={{ padding: "2px 8px", fontSize: "0.7rem", opacity: historyIndex < history.length - 1 ? 1 : 0.4, cursor: historyIndex < history.length - 1 ? "pointer" : "not-allowed" }}
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo next change"
                >
                  ↪️ Redo
                </button>
              </div>
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
              Click/drag shapes directly on screen (hold Shift), or drag blue vertex points to edit shape nodes!
            </p>

            {/* Photoshop-style Layer Stack */}
            <div className="rpg-layers-stack" style={{ maxHeight: "250px" }}>
              {(() => {
                const activeLayers = [...layerOrder]
                  .reverse()
                  .filter((id) => !deletedShapes[id]);

                return activeLayers.map((layerId) => {
                  const isSelected = selectedDragonPart === layerId;
                  const offset = dragonOffsets[layerId] || { x: 0, y: 0, rotate: 0, scale: 1 };
                  const friendlyName = SHAPE_LABELS[layerId] || customShapes.find(s => s.id === layerId)?.name || `✨ Custom Shape (${layerId.slice(-4)})`;
                  
                  return (
                    <div
                      key={layerId}
                      id={`layer-row-${layerId}`}
                      className={`rpg-layer-row ${isSelected ? "is-selected" : ""}`}
                      onClick={() => setSelectedDragonPart(layerId)}
                    >
                      <div className="rpg-layer-info">
                        <span className="rpg-layer-name">{friendlyName}</span>
                        <span className="rpg-layer-coords">X:{offset.x} Y:{offset.y} R:{offset.rotate}° S:{(offset.scale ?? 1).toFixed(2)}x</span>
                      </div>

                      {isSelected && (
                        <div className="rpg-layer-controls" onClick={(e) => e.stopPropagation()}>
                          <p style={{ fontSize: "0.62rem", color: "#64748b", margin: "0 0 6px 0" }}>
                            💡 Drag any blue vertex handles directly on the dragon to shape manually!
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
                                    [layerId]: { ...prev[layerId], x: val }
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
                                    [layerId]: { ...prev[layerId], y: val }
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
                                    [layerId]: { ...prev[layerId], rotate: val }
                                  }));
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              className="rpg-dpad-btn"
                              style={{ width: "24px", padding: "2px 0" }}
                              onClick={() => {
                                const nextVal = ((offset.rotate ?? 0) - 5) % 360;
                                const nextOffsets = {
                                  ...dragonOffsets,
                                  [layerId]: { ...offset, rotate: nextVal }
                                };
                                setDragonOffsets(nextOffsets);
                                pushHistoryState(nextOffsets);
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
                                const nextVal = ((offset.rotate ?? 0) + 5) % 360;
                                const nextOffsets = {
                                  ...dragonOffsets,
                                  [layerId]: { ...offset, rotate: nextVal }
                                };
                                setDragonOffsets(nextOffsets);
                                pushHistoryState(nextOffsets);
                              }}
                              title="Rotate CW 5°"
                            >
                              ↻
                            </button>
                          </div>

                          {/* Scale Controls */}
                          <div style={{ display: "grid", gap: "2px", marginTop: "8px" }}>
                            <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                              <span>Scale:</span>
                              <span>{(offset.scale ?? 1).toFixed(2)}x</span>
                            </label>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                              <input
                                type="range"
                                min="0.2"
                                max="3.0"
                                step="0.05"
                                style={{ flex: 1, accentColor: "#38bdf8" }}
                                value={offset.scale ?? 1}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setDragonOffsets((prev) => ({
                                    ...prev,
                                    [layerId]: { ...prev[layerId], scale: val }
                                  }));
                                }}
                              />
                              <input
                                type="number"
                                min="0.2"
                                max="3.0"
                                step="0.05"
                                style={{ width: "50px", padding: "2px 4px", background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", fontSize: "0.65rem" }}
                                value={offset.scale ?? 1}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 1;
                                  setDragonOffsets((prev) => ({
                                    ...prev,
                                    [layerId]: { ...prev[layerId], scale: val }
                                  }));
                                }}
                              />
                            </div>
                          </div>

                          {/* Layer Depth Reordering */}
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px" }}>
                            <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Order:</span>
                            <button
                              type="button"
                              className="rpg-dpad-btn"
                              style={{ padding: "2px 6px", fontSize: "0.65rem" }}
                              onClick={() => handleMoveLayerUp(layerId)}
                              title="Bring Forward"
                            >
                              ▲ Up
                            </button>
                            <button
                              type="button"
                              className="rpg-dpad-btn"
                              style={{ padding: "2px 6px", fontSize: "0.65rem" }}
                              onClick={() => handleMoveLayerDown(layerId)}
                              title="Send Backward"
                            >
                              ▼ Down
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={layerOrder.length}
                              style={{ width: "45px", padding: "2px 4px", background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", fontSize: "0.65rem" }}
                              value={layerOrder.indexOf(layerId) + 1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                  handleSetLayerIndex(layerId, val - 1);
                                }
                              }}
                            />
                            <span style={{ fontSize: "0.65rem", color: "#64748b" }}>/ {layerOrder.length}</span>
                          </div>

                          {/* Color Fill Selector */}
                          <div style={{ marginTop: "8px" }}>
                            <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                              Shape Fill Color:
                              <input
                                type="color"
                                style={{ width: "100%", height: "24px", padding: "0", border: "none", background: "transparent", cursor: "pointer" }}
                                value={dragonFills[layerId] || (layerId.startsWith("custom_") ? (customShapes.find(s => s.id === layerId)?.fill || "#b91c1c") : (DRAGON_ORIGINAL_SHAPES.find(s => s.id === layerId)?.defaultFill || "#7f1d1d"))}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (layerId.startsWith("custom_")) {
                                    setCustomShapes((prev) => prev.map((s) => s.id === layerId ? { ...s, fill: val } : s));
                                  } else {
                                    setDragonFills((prev) => ({
                                      ...prev,
                                      [layerId]: val,
                                    }));
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Custom Shape Parameters Modifier */}
                          {layerId.startsWith("custom_") && (() => {
                            const cs = customShapes.find((s) => s.id === layerId);
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

                          {/* Duplicate Element Action */}
                          <button
                            type="button"
                            className="rpg-admin-action-btn"
                            style={{ background: "#4f46e5", padding: "4px", fontSize: "0.65rem", marginTop: "8px", width: "100%" }}
                            onClick={() => handleDuplicateShape(layerId)}
                          >
                            👯 Duplicate Object
                          </button>

                          {/* Delete Element Action */}
                          <button
                            type="button"
                            className="rpg-admin-action-btn reset"
                            style={{ background: "#b91c1c", padding: "4px", fontSize: "0.65rem", marginTop: "8px", width: "100%" }}
                            onClick={() => {
                              let nextCustoms = customShapes;
                              let nextOrder = layerOrder;
                              let nextDeleted = deletedShapes;

                              if (layerId.startsWith("custom_")) {
                                nextCustoms = customShapes.filter((s) => s.id !== layerId);
                                nextOrder = layerOrder.filter((id) => id !== layerId);
                                setCustomShapes(nextCustoms);
                                setLayerOrder(nextOrder);
                              } else {
                                nextDeleted = {
                                  ...deletedShapes,
                                  [layerId]: true,
                                };
                                setDeletedShapes(nextDeleted);
                              }
                              setSelectedDragonPart(null);
                              pushHistoryState(dragonOffsets, dragonFills, nextDeleted, nextCustoms, dragonGeometries, nextOrder);
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

            {/* Dragon Boss HP Bar Position Controls */}
            <div style={{ padding: "8px 12px", background: "#0f172a", borderTop: "1px solid #334155", display: "grid", gap: "6px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: "bold", color: "#f97316", display: "flex", alignItems: "center", gap: "4px" }}>
                🔥 Dragon Boss HP Bar Position
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                  Offset X (px):
                  <input
                    type="number"
                    style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                    value={dragonHpBarPos.x}
                    onChange={(e) => setDragonHpBarPos((prev) => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                  />
                </label>
                <label style={{ fontSize: "0.65rem", color: "#94a3b8", display: "grid", gap: "2px" }}>
                  Offset Y (px):
                  <input
                    type="number"
                    style={{ background: "#1e293b", color: "#fff", border: "1px solid #475569", borderRadius: "3px", padding: "2px 4px", fontSize: "0.65rem" }}
                    value={dragonHpBarPos.y}
                    onChange={(e) => setDragonHpBarPos((prev) => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                  />
                </label>
              </div>
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
                    dragonGeometries,
                    layerOrder,
                    dragonHpBarPos,
                  };
                  const codeStr = JSON.stringify(exportData, null, 2);
                  navigator.clipboard.writeText(codeStr);
                  alert("Copied full layout, geometries, fills, HP bar pos & custom shapes config to clipboard!");
                }}
              >
                📋 Copy Layout & Shapes Config
              </button>
              <button
                type="button"
                className="rpg-admin-action-btn reset"
                onClick={() => {
                  if (confirm("Reset all customizations, colors, and coordinates to default?")) {
                    setDragonOffsets(DEFAULT_DRAGON_OFFSETS);
                    setDragonFills(DEFAULT_DRAGON_FILLS);
                    setDeletedShapes(DEFAULT_DELETED_SHAPES);
                    setCustomShapes(DEFAULT_CUSTOM_SHAPES);
                    setDragonGeometries(DEFAULT_DRAGON_GEOMETRIES);
                    setLayerOrder(DEFAULT_LAYER_ORDER);
                    setDragonHpBarPos({ x: 0, y: 0 });
                    setSelectedDragonPart(null);
                    pushHistoryState(
                      DEFAULT_DRAGON_OFFSETS,
                      DEFAULT_DRAGON_FILLS,
                      DEFAULT_DELETED_SHAPES,
                      DEFAULT_CUSTOM_SHAPES,
                      DEFAULT_DRAGON_GEOMETRIES,
                      DEFAULT_LAYER_ORDER
                    );
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
