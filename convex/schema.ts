import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const timestamp = v.number();
const shareStatus = v.union(v.literal("pending"), v.literal("submitted"), v.literal("verified"), v.literal("rejected"));

export default defineSchema({
  users: defineTable({
    displayName: v.string(),
    email: v.string(),
    avatarColor: v.string(),
    spell: v.string(),
    createdAt: timestamp,
  }).index("by_email", ["email"]),
  teams: defineTable({
    name: v.string(),
    joinCode: v.string(),
    members: v.array(v.id("users")),
    createdAt: timestamp,
  }).index("by_join_code", ["joinCode"]),
  bosses: defineTable({
    teamId: v.id("teams"),
    title: v.string(),
    deadline: timestamp,
    partyMemberIds: v.array(v.id("users")),
    status: v.union(v.literal("active"), v.literal("defeated"), v.literal("survived")),
    createdAt: timestamp,
    resolvedAt: v.optional(timestamp),
  }).index("by_team", ["teamId"]),
  bossShares: defineTable({
    bossId: v.id("bosses"),
    memberId: v.id("users"),
    verifierId: v.id("users"),
    weight: v.number(),
    status: shareStatus,
    pdfUrl: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")),
    verifierComment: v.optional(v.string()),
    submittedAt: v.optional(timestamp),
    verifiedAt: v.optional(timestamp),
  }).index("by_boss", ["bossId"]).index("by_verifier_status", ["verifierId", "status"]),
  goblinLogs: defineTable({
    teamId: v.id("teams"),
    bossId: v.id("bosses"),
    memberId: v.id("users"),
    note: v.optional(v.string()),
    proofUrl: v.optional(v.string()),
    loggedAt: timestamp,
  }).index("by_boss_time", ["bossId", "loggedAt"]),
  activityLog: defineTable({
    teamId: v.id("teams"),
    actorId: v.id("users"),
    action: v.string(),
    detail: v.optional(v.string()),
    timestamp,
  }).index("by_team_time", ["teamId", "timestamp"]),
});
