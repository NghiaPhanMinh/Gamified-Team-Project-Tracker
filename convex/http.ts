import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

http.route({
  path: "/api/telemetry/dashboard",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }),
});

http.route({
  path: "/api/telemetry/dashboard",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const funnel = await ctx.runQuery(api.telemetry.getFunnelStats, { flowName: "project_creation" });
    const insights = await ctx.runQuery(api.telemetry.getUserInsightsAndTeamFit, {});
    const briefs = await ctx.runQuery(api.telemetry.getRecentProjectBriefs, {});
    const bugs = await ctx.runQuery(api.telemetry.getBugLogs, {});
    const rooms = await ctx.runQuery(api.telemetry.getActiveRoomsAndMembers, {});
    const locations = await ctx.runQuery(api.telemetry.getLastUserLocations, {});

    return new Response(
      JSON.stringify({
        funnel,
        insights,
        briefs,
        bugs,
        rooms,
        locations,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      },
    );
  }),
});

http.route({
  path: "/api/telemetry/archive",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }),
});

http.route({
  path: "/api/telemetry/archive",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const archive = await ctx.runQuery(api.telemetry.getHistoricalArchive, {});
    return new Response(JSON.stringify(archive), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    });
  }),
});

export default http;
