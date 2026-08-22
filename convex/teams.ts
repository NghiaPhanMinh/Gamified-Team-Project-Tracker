import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import {
  requireCompleteUserProfile,
  requireTeamMember,
  requireUserProfile,
} from "./lib/auth";
import {
  SPELL_TYPES,
  validateCharacterColours,
} from "./lib/characterValidation";
import {
  assertValidJoinCode,
  generateJoinCode,
  normalizeSharedNote,
  normalizeTeamName,
} from "./lib/teamValidation";

const DEFAULT_CHARACTER_FILL = "#FF8AE7";
const DEFAULT_CHARACTER_OUTLINE = "#121F25";
const MAX_JOIN_CODE_ATTEMPTS = 12;

async function createUniqueJoinCode(
  ctx: MutationCtx,
) {
  for (let attempt = 0; attempt < MAX_JOIN_CODE_ATTEMPTS; attempt += 1) {
    const joinCode = generateJoinCode();
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_join_code", (query) => query.eq("joinCode", joinCode))
      .unique();

    if (existing === null) {
      return joinCode;
    }
  }

  throw new Error("A unique team code could not be created. Please try again.");
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireUserProfile(ctx);
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (indexQuery) =>
        indexQuery.eq("profileId", profile._id),
      )
      .collect();

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);

        if (team === null) {
          return null;
        }

        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (indexQuery) =>
            indexQuery.eq("teamId", team._id),
          )
          .collect();

        return {
          _id: team._id,
          name: team.name,
          role: membership.role,
          memberCount: members.length,
          updatedAt: team.updatedAt,
        };
      }),
    );

    return teams
      .filter((team) => team !== null)
      .sort((first, second) => second.updatedAt - first.updatedAt);
  },
});

export const getWorkspace = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const { membership, profile } = await requireTeamMember(ctx, args.teamId);
    const team = await ctx.db.get(args.teamId);

    if (team === null) {
      throw new Error("This team no longer exists.");
    }

    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (indexQuery) =>
        indexQuery.eq("teamId", args.teamId),
      )
      .collect();
    const members = await Promise.all(
      memberships.map(async (teamMembership) => {
        const memberProfile = await ctx.db.get(teamMembership.profileId);

        if (memberProfile === null) {
          return null;
        }

        return {
          profileId: memberProfile._id,
          displayName: memberProfile.displayName,
          imageUrl: memberProfile.imageUrl,
          role: teamMembership.role,
          joinedAt: teamMembership.joinedAt,
          characterFill: teamMembership.characterFill,
          characterOutline: teamMembership.characterOutline,
          spellType: teamMembership.spellType,
        };
      }),
    );
    const sharedRecord = await ctx.db
      .query("teamSharedRecords")
      .withIndex("by_team", (indexQuery) =>
        indexQuery.eq("teamId", args.teamId),
      )
      .unique();

    return {
      team: {
        _id: team._id,
        name: team.name,
        joinCode: team.joinCode,
        createdAt: team.createdAt,
      },
      currentProfileId: profile._id,
      currentRole: membership.role,
      members: members
        .filter((member) => member !== null)
        .sort((first, second) => first.joinedAt - second.joinedAt),
      sharedRecord:
        sharedRecord === null
          ? null
          : {
              note: sharedRecord.note,
              updatedAt: sharedRecord.updatedAt,
              updatedByProfileId: sharedRecord.updatedByProfileId,
            },
    };
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const profile = await requireCompleteUserProfile(ctx);
    const name = normalizeTeamName(args.name);
    const joinCode = await createUniqueJoinCode(ctx);
    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      name,
      joinCode,
      creatorProfileId: profile._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("teamMembers", {
      teamId,
      profileId: profile._id,
      role: "owner",
      joinedAt: now,
      characterFill: DEFAULT_CHARACTER_FILL,
      characterOutline: DEFAULT_CHARACTER_OUTLINE,
    });
    await ctx.db.insert("teamSharedRecords", {
      teamId,
      note: `${name} is ready to plan together.`,
      updatedByProfileId: profile._id,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      teamId,
      actorProfileId: profile._id,
      action: "team_created",
      metadata: { teamName: name },
      createdAt: now,
    });

    return teamId;
  },
});

export const joinByCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const profile = await requireCompleteUserProfile(ctx);
    const joinCode = assertValidJoinCode(args.code);
    const team = await ctx.db
      .query("teams")
      .withIndex("by_join_code", (query) => query.eq("joinCode", joinCode))
      .unique();

    if (team === null) {
      throw new Error("No team uses that code. Check it and try again.");
    }

    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (query) =>
        query.eq("teamId", team._id).eq("profileId", profile._id),
      )
      .unique();

    if (existingMembership !== null) {
      throw new Error("You are already a member of this team.");
    }

    const now = Date.now();
    await ctx.db.insert("teamMembers", {
      teamId: team._id,
      profileId: profile._id,
      role: "member",
      joinedAt: now,
      characterFill: DEFAULT_CHARACTER_FILL,
      characterOutline: DEFAULT_CHARACTER_OUTLINE,
    });

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_team_and_updated", (query) => query.eq("teamId", team._id))
      .order("desc")
      .take(50);
    const activeProject = projects.find((project) => project.status !== "archived");

    if (activeProject) {
      const existingProjectMember = await ctx.db
        .query("projectMembers")
        .withIndex("by_project_and_user", (query) =>
          query.eq("projectId", activeProject._id).eq("profileId", profile._id),
        )
        .unique();

      if (!existingProjectMember) {
        await ctx.db.insert("projectMembers", {
          projectId: activeProject._id,
          profileId: profile._id,
          skills: [...(profile.skills ?? []), ...(profile.softwareSkills ?? [])],
          availability: "",
          currentWorkload: "medium",
          preferences: "",
          weeklyCapacity: profile.weeklyCapacity,
          availabilityMode: "busy",
          joinedAt: now,
        });
        await ctx.db.patch(activeProject._id, { updatedAt: now });
      }
    }
    await ctx.db.patch(team._id, { updatedAt: now });
    await ctx.db.insert("activityLogs", {
      teamId: team._id,
      actorProfileId: profile._id,
      action: "member_joined",
      metadata: { memberDisplayName: profile.displayName },
      createdAt: now,
    });

    return team._id;
  },
});

export const updateSharedNote = mutation({
  args: {
    teamId: v.id("teams"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await requireTeamMember(ctx, args.teamId);
    const note = normalizeSharedNote(args.note);
    const now = Date.now();
    const existing = await ctx.db
      .query("teamSharedRecords")
      .withIndex("by_team", (query) => query.eq("teamId", args.teamId))
      .unique();

    if (existing === null) {
      await ctx.db.insert("teamSharedRecords", {
        teamId: args.teamId,
        note,
        updatedByProfileId: profile._id,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(existing._id, {
        note,
        updatedByProfileId: profile._id,
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.teamId, { updatedAt: now });
    await ctx.db.insert("activityLogs", {
      teamId: args.teamId,
      actorProfileId: profile._id,
      action: "shared_note_updated",
      metadata: { noteLength: note.length },
      createdAt: now,
    });

    return null;
  },
});

export const updateCharacter = mutation({
  args: {
    teamId: v.optional(v.id("teams")),
    fill: v.string(),
    outline: v.string(),
    spellType: v.optional(
      v.union(
        v.literal(SPELL_TYPES[0]),
        v.literal(SPELL_TYPES[1]),
        v.literal(SPELL_TYPES[2]),
        v.literal(SPELL_TYPES[3]),
        v.literal(SPELL_TYPES[4]),
        v.literal(SPELL_TYPES[5]),
        v.literal(SPELL_TYPES[6]),
        v.literal(SPELL_TYPES[7]),
        v.literal(SPELL_TYPES[8]),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const profile = await requireUserProfile(ctx);
    const colours = validateCharacterColours(args.fill, args.outline);
    const now = Date.now();

    await ctx.db.patch(profile._id, {
      characterFill: colours.fill,
      characterOutline: colours.outline,
      spellType: args.spellType,
      updatedAt: now,
    });

    if (args.teamId) {
      const { membership } = await requireTeamMember(ctx, args.teamId);
      await ctx.db.patch(membership._id, {
        characterFill: colours.fill,
        characterOutline: colours.outline,
        spellType: args.spellType,
      });
      await ctx.db.patch(args.teamId, { updatedAt: now });
      await ctx.db.insert("activityLogs", {
        teamId: args.teamId,
        actorProfileId: profile._id,
        action: "character_changed",
        metadata: {
          characterFill: colours.fill,
          characterOutline: colours.outline,
          spellType: args.spellType,
        },
        createdAt: now,
      });
    } else {
      const memberships = await ctx.db
        .query("teamMembers")
        .withIndex("by_user", (query) => query.eq("profileId", profile._id))
        .collect();

      for (const membership of memberships) {
        await ctx.db.patch(membership._id, {
          characterFill: colours.fill,
          characterOutline: colours.outline,
          spellType: args.spellType,
        });
      }
    }

    return null;
  },
});
