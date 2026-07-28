import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const timestamp = v.number();

export default defineSchema({
  users: defineTable({
    displayName: v.string(),
    email: v.optional(v.string()),
    avatarColor: v.string(),
    createdAt: timestamp,
  }).index("by_email", ["email"]),
  teams: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    members: v.array(v.id("users")),
    createdAt: timestamp,
  }).index("by_invite_code", ["inviteCode"]),
  projects: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    overallDeadline: v.optional(timestamp),
    createdAt: timestamp,
  }).index("by_team", ["teamId"]),
  bosses: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    totalScope: v.number(),
    remainingHP: v.number(),
    deadline: timestamp,
    status: v.union(v.literal("active"), v.literal("defeated"), v.literal("survived")),
    createdAt: timestamp,
    resolvedAt: v.optional(timestamp),
  }).index("by_project", ["projectId"]),
  goblins: defineTable({
    bossId: v.id("bosses"),
    title: v.string(),
    ownerId: v.id("users"),
    verifierId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("submitted"), v.literal("verified"), v.literal("rejected")),
    proofText: v.optional(v.string()),
    proofStorageId: v.optional(v.id("_storage")),
    proofUrl: v.optional(v.string()),
    weight: v.number(),
    verifierComment: v.optional(v.string()),
    submittedAt: v.optional(timestamp),
    verifiedAt: v.optional(timestamp),
  }).index("by_boss", ["bossId"]).index("by_verifier_status", ["verifierId", "status"]),
  activityLog: defineTable({
    projectId: v.id("projects"),
    actorId: v.id("users"),
    action: v.string(),
    detail: v.optional(v.string()),
    timestamp,
  }).index("by_project_time", ["projectId", "timestamp"]),
});
