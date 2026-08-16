/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as ai from "../ai.js";
import type * as aiContext from "../aiContext.js";
import type * as aiDrafts from "../aiDrafts.js";
import type * as aiUsage from "../aiUsage.js";
import type * as allocation from "../allocation.js";
import type * as auth from "../auth.js";
import type * as availability from "../availability.js";
import type * as battle from "../battle.js";
import type * as customFrameworks from "../customFrameworks.js";
import type * as daily from "../daily.js";
import type * as evidence from "../evidence.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as lib_activityPresentation from "../lib/activityPresentation.js";
import type * as lib_aiPlanValidation from "../lib/aiPlanValidation.js";
import type * as lib_allocationEngine from "../lib/allocationEngine.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_characterValidation from "../lib/characterValidation.js";
import type * as lib_customFrameworkValidation from "../lib/customFrameworkValidation.js";
import type * as lib_evidenceValidation from "../lib/evidenceValidation.js";
import type * as lib_openRouterFallback from "../lib/openRouterFallback.js";
import type * as lib_projectProgress from "../lib/projectProgress.js";
import type * as lib_projectValidation from "../lib/projectValidation.js";
import type * as lib_taskValidation from "../lib/taskValidation.js";
import type * as lib_teamValidation from "../lib/teamValidation.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as taskTrades from "../taskTrades.js";
import type * as tasks from "../tasks.js";
import type * as teams from "../teams.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  ai: typeof ai;
  aiContext: typeof aiContext;
  aiDrafts: typeof aiDrafts;
  aiUsage: typeof aiUsage;
  allocation: typeof allocation;
  auth: typeof auth;
  availability: typeof availability;
  battle: typeof battle;
  customFrameworks: typeof customFrameworks;
  daily: typeof daily;
  evidence: typeof evidence;
  health: typeof health;
  http: typeof http;
  "lib/activityPresentation": typeof lib_activityPresentation;
  "lib/aiPlanValidation": typeof lib_aiPlanValidation;
  "lib/allocationEngine": typeof lib_allocationEngine;
  "lib/auth": typeof lib_auth;
  "lib/characterValidation": typeof lib_characterValidation;
  "lib/customFrameworkValidation": typeof lib_customFrameworkValidation;
  "lib/evidenceValidation": typeof lib_evidenceValidation;
  "lib/openRouterFallback": typeof lib_openRouterFallback;
  "lib/projectProgress": typeof lib_projectProgress;
  "lib/projectValidation": typeof lib_projectValidation;
  "lib/taskValidation": typeof lib_taskValidation;
  "lib/teamValidation": typeof lib_teamValidation;
  profiles: typeof profiles;
  projects: typeof projects;
  taskTrades: typeof taskTrades;
  tasks: typeof tasks;
  teams: typeof teams;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
