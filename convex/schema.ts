import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const teamRole = v.union(v.literal("owner"), v.literal("member"));
const spellType = v.union(
  v.literal("spark"),
  v.literal("shield"),
  v.literal("focus"),
  v.literal("bloom"),
);
const activityAction = v.union(
  v.literal("team_created"),
  v.literal("member_joined"),
  v.literal("shared_note_updated"),
  v.literal("character_changed"),
  v.literal("framework_created"),
  v.literal("framework_updated"),
);
const customFrameworkPhase = v.object({
  key: v.string(),
  name: v.string(),
  description: v.string(),
  isOptional: v.boolean(),
  suggestedDeliverables: v.array(v.string()),
  suggestedSkills: v.array(v.string()),
  canOverlap: v.boolean(),
  defaultDependencyKeys: v.array(v.string()),
  reviewCheckpoint: v.boolean(),
});

export default defineSchema({
  ...authTables,
  userProfiles: defineTable({
    authUserId: v.id("users"),
    displayName: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_user_id", ["authUserId"])
    .index("by_email", ["email"]),
  teams: defineTable({
    name: v.string(),
    joinCode: v.string(),
    creatorProfileId: v.id("userProfiles"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_join_code", ["joinCode"])
    .index("by_creator", ["creatorProfileId"]),
  teamMembers: defineTable({
    teamId: v.id("teams"),
    profileId: v.id("userProfiles"),
    role: teamRole,
    joinedAt: v.number(),
    characterFill: v.string(),
    characterOutline: v.string(),
    spellType: v.optional(spellType),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["profileId"])
    .index("by_team_and_user", ["teamId", "profileId"]),
  teamSharedRecords: defineTable({
    teamId: v.id("teams"),
    note: v.string(),
    updatedByProfileId: v.id("userProfiles"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_team", ["teamId"]),
  customFrameworks: defineTable({
    teamId: v.id("teams"),
    creatorProfileId: v.id("userProfiles"),
    name: v.string(),
    description: v.string(),
    phases: v.array(customFrameworkPhase),
    sourceBuiltInId: v.optional(v.string()),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_updated", ["teamId", "updatedAt"])
    .index("by_creator", ["creatorProfileId"]),
  activityLogs: defineTable({
    teamId: v.id("teams"),
    actorProfileId: v.id("userProfiles"),
    action: activityAction,
    metadata: v.object({
      teamName: v.optional(v.string()),
      memberDisplayName: v.optional(v.string()),
      noteLength: v.optional(v.number()),
      characterFill: v.optional(v.string()),
      characterOutline: v.optional(v.string()),
      spellType: v.optional(spellType),
      customFrameworkId: v.optional(v.id("customFrameworks")),
      frameworkName: v.optional(v.string()),
    }),
    createdAt: v.number(),
  })
    .index("by_team_and_time", ["teamId", "createdAt"])
    .index("by_actor_and_time", ["actorProfileId", "createdAt"]),
});
