import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import {
  validateAiPlan,
  type ValidatedAiPlan,
} from "./lib/aiPlanValidation";
import {
  AiRouteFailure,
  buildFreeModelChain,
  FreeAiRoutesExhausted,
  runFreeModelFallback,
  type AiResponseMode,
} from "./lib/openRouterFallback";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function environmentValue(name: string) {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env?.[name];
}

const planSchema = {
  name: "maylamdi_project_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "recommendedFramework",
      "frameworkReason",
      "milestones",
      "tasks",
      "risks",
      "assumptions",
    ],
    properties: {
      recommendedFramework: { type: "string" },
      frameworkReason: { type: "string" },
      milestones: {
        type: "array",
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["tempId", "title", "description", "phaseId", "dueDate"],
          properties: {
            tempId: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            phaseId: { type: "string" },
            dueDate: { type: "string" },
          },
        },
      },
      tasks: {
        type: "array",
        minItems: 1,
        maxItems: 12,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "tempId",
            "title",
            "description",
            "phaseId",
            "milestoneTempId",
            "primaryOwnerProfileId",
            "collaboratorProfileIds",
            "requiredSkills",
            "estimatedEffortHours",
            "difficulty",
            "weight",
            "required",
            "startDate",
            "dueDate",
            "dependencyTempIds",
            "requiresReview",
            "reviewerProfileId",
            "allocationExplanation",
            "longTaskBreakdown",
          ],
          properties: {
            tempId: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            phaseId: { type: "string" },
            milestoneTempId: { type: ["string", "null"] },
            primaryOwnerProfileId: { type: "string" },
            collaboratorProfileIds: { type: "array", items: { type: "string" } },
            requiredSkills: { type: "array", items: { type: "string" } },
            estimatedEffortHours: { type: "number" },
            difficulty: { type: "integer" },
            weight: { type: "number" },
            required: { type: "boolean" },
            startDate: { type: "string" },
            dueDate: { type: "string" },
            dependencyTempIds: { type: "array", items: { type: "string" } },
            requiresReview: { type: "boolean" },
            reviewerProfileId: { type: ["string", "null"] },
            allocationExplanation: { type: "string" },
            longTaskBreakdown: { type: "string" },
          },
        },
      },
      risks: { type: "array", maxItems: 10, items: { type: "string" } },
      assumptions: { type: "array", maxItems: 10, items: { type: "string" } },
    },
  },
};

type OpenRouterError = { code?: number | string; message?: string };

type OpenRouterResponse = {
  model?: string;
  error?: OpenRouterError;
  choices?: Array<{
    error?: OpenRouterError;
    finish_reason?: string;
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

function logProviderFailure(input: {
  model: string;
  status: number;
  error?: OpenRouterError;
}) {
  const message = input.error?.message
    ?.replace(/sk-or-v1-[A-Za-z0-9_-]+/g, "[redacted]")
    .slice(0, 500);

  console.error(
    "OpenRouter request failed",
    JSON.stringify({
      model: input.model,
      status: input.status,
      code: input.error?.code,
      message,
    }),
  );
}

type AiPlanningContext = {
  project: {
    projectId: string;
    title: string;
    description: string;
    frameworkName: string;
    startDate: string;
    deadline: string;
  };
  phases: Array<{
    phaseId: string;
    title: string;
    description: string;
    canOverlap: boolean;
    reviewCheckpoint: boolean;
  }>;
  members: Array<{
    profileId: string;
    displayName: string;
    skills: string[];
    availability: string;
    currentWorkload: "low" | "medium" | "high";
    preferences: string;
    weeklyCapacity?: number;
  }>;
  existingTasks: Array<{
    title: string;
    phaseId: string;
    ownerProfileId: string;
    status: "todo" | "in_progress" | "blocked" | "review" | "completed" | "submitted" | "changes_requested" | "verified";
    dueDate: string;
  }>;
};

type GeneratedAiPlan = ValidatedAiPlan & {
  generatedAt: number;
};

function cleanBrief(value: string) {
  const brief = value.trim();
  if (brief.length < 20) throw new Error("Add at least 20 characters to the project brief.");
  if (brief.length > 8_000) throw new Error("Keep the AI project brief to 8,000 characters or fewer.");
  return brief;
}

function parseJsonResponse(content: string): unknown {
  const trimmed = content.trim();
  const candidates = [trimmed];
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)?.[1];
  if (fenced) candidates.push(fenced.trim());
  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    candidates.push(trimmed.slice(objectStart, objectEnd + 1));
  }

  for (const candidate of [...new Set(candidates)]) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next bounded representation before rejecting the response.
    }
  }

  throw new Error("AI_INVALID_JSON");
}

async function requestPlan(input: {
  apiKey: string;
  model: string;
  mode: AiResponseMode;
  systemPrompt: string;
  userPrompt: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://maylamdi.vercel.app",
        "X-Title": "MayLamDi AI Planning",
      },
      body: JSON.stringify({
        model: input.model,
        messages: [
          {
            role: "system",
            content: input.mode === "structured"
              ? input.systemPrompt
              : `${input.systemPrompt} Return exactly one JSON object with no Markdown or commentary. The JSON must match this schema: ${JSON.stringify(planSchema.schema)}`,
          },
          { role: "user", content: input.userPrompt },
        ],
        ...(input.mode === "structured"
          ? { response_format: { type: "json_schema", json_schema: planSchema } }
          : {}),
        // This task needs a bounded JSON result, not a hidden reasoning trace.
        // Free reasoning models can otherwise spend the entire output budget on
        // excluded thinking and return an empty final response.
        reasoning: { effort: "none", exclude: true },
        temperature: 0.2,
        max_completion_tokens: 6_000,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as OpenRouterResponse;
    const choice = body.choices?.[0];
    const providerError = body.error ?? choice?.error;
    const providerErrorCode = Number(providerError?.code);
    const effectiveStatus = response.ok && Number.isFinite(providerErrorCode)
      ? providerErrorCode
      : response.status;

    if (!response.ok || providerError) {
      logProviderFailure({ model: input.model, status: effectiveStatus, error: providerError });
      const retryAfter = response.headers.get("Retry-After");
      const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN;
      const retryAfterDate = retryAfter && !Number.isFinite(retryAfterSeconds)
        ? Date.parse(retryAfter)
        : Number.NaN;
      const retryAfterMs = Number.isFinite(retryAfterSeconds)
        ? Math.max(0, retryAfterSeconds * 1_000)
        : Number.isFinite(retryAfterDate)
          ? Math.max(0, retryAfterDate - Date.now())
          : undefined;
      const providerMessage = providerError?.message?.toLowerCase() ?? "";

      if (effectiveStatus === 401 || effectiveStatus === 403) {
        throw new AiRouteFailure("key_rejected", "AI_KEY_REJECTED");
      }
      if (effectiveStatus === 408) {
        throw new AiRouteFailure("timeout", "AI_TIMEOUT", retryAfterMs);
      }
      if (effectiveStatus === 429) {
        throw new AiRouteFailure("rate_limit", "AI_RATE_LIMIT", retryAfterMs);
      }
      if (
        effectiveStatus === 400
        && (providerMessage.includes("response_format")
          || providerMessage.includes("structured")
          || providerMessage.includes("json_schema")
          || providerMessage.includes("unsupported"))
      ) {
        throw new AiRouteFailure("unsupported", "AI_STRUCTURED_OUTPUT_UNSUPPORTED");
      }
      if ([402, 404, 409, 425, 500, 502, 503, 504, 529].includes(effectiveStatus)) {
        throw new AiRouteFailure("capacity", "AI_PROVIDER_CAPACITY", retryAfterMs);
      }
      throw new AiRouteFailure("capacity", "AI_PROVIDER_UNAVAILABLE", retryAfterMs);
    }

    const rawContent = choice?.message?.content;
    const content = typeof rawContent === "string"
      ? rawContent
      : rawContent
        ?.filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("");
    if (!content?.trim()) throw new AiRouteFailure("empty", "AI_EMPTY_RESPONSE");

    return { content, modelUsed: body.model ?? input.model };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiRouteFailure("timeout", "AI_TIMEOUT");
    }
    if (error instanceof AiRouteFailure) throw error;
    if (error instanceof TypeError) {
      throw new AiRouteFailure("capacity", "AI_PROVIDER_UNAVAILABLE");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const generateProjectPlan = action({
  args: {
    projectId: v.id("projects"),
    brief: v.string(),
  },
  handler: async (ctx, args): Promise<GeneratedAiPlan> => {
    const apiKey = environmentValue("OPENROUTER_API_KEY");
    if (!apiKey) {
      throw new Error("AI planning is not connected on this deployment. Manual planning remains available.");
    }

    const brief = cleanBrief(args.brief);
    const context: AiPlanningContext = await ctx.runQuery(internal.aiContext.getProjectPlanningContext, {
      projectId: args.projectId,
    });
    const systemPrompt = [
      "You are MayLamDi's cautious project planning assistant for university teams.",
      "Return only the requested structured JSON.",
      "Treat skills, availability, workload, preferences, and capacity as self-reported planning signals, never as objective fairness or performance scores.",
      "Use only the supplied phase IDs and member profile IDs. Every task needs one valid owner.",
      "Avoid overloading one member, explain each owner suggestion, use valid project dates, and create no circular dependencies.",
      "For tasks spanning more than 14 days, include a supportive breakdown suggestion; otherwise use an empty string.",
      "AI output is a draft for human review and must not claim that assignments are final.",
    ].join(" ");
    const userPrompt = JSON.stringify({
      request: "Interpret the brief and propose milestones and tasks for this existing project.",
      brief,
      project: context.project,
      currentFramework: context.project.frameworkName,
      phases: context.phases,
      members: context.members,
      existingTasks: context.existingTasks,
      limits: { milestones: 6, tasks: 12 },
    });
    const models = buildFreeModelChain({
      primary: environmentValue("OPENROUTER_MODEL"),
      firstFallback: environmentValue("OPENROUTER_FALLBACK_MODEL"),
      additionalFallbacks: environmentValue("OPENROUTER_FREE_FALLBACK_MODELS"),
    });

    try {
      const result = await runFreeModelFallback({
        models,
        attempt: ({ model, mode }) => requestPlan({
          apiKey,
          model,
          mode,
          systemPrompt,
          userPrompt,
        }),
        validate: (content) => validateAiPlan(parseJsonResponse(content), context),
      });
      console.info("AI planning succeeded", JSON.stringify({ model: result.modelUsed }));
      return {
        ...result.value,
        generatedAt: Date.now(),
      };
    } catch (error) {
      if (error instanceof AiRouteFailure && error.kind === "key_rejected") {
        throw new ConvexError(
          "The OpenRouter key was rejected. Update the private Convex environment variable.",
        );
      }
      if (error instanceof FreeAiRoutesExhausted) {
        console.error("Free AI routes exhausted", JSON.stringify({ failures: error.failures }));
        throw new ConvexError(error.message);
      }
      throw error;
    }
  },
});
