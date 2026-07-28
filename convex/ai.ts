import { action } from "./_generated/server";
import { v } from "convex/values";

export const suggestSetup = action({
  args: { brief: v.string() },
  handler: async (_ctx, args) => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY is not configured in Convex");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "openrouter/auto:free",
        messages: [{ role: "system", content: "Return JSON only: {title:string,totalScope:number,days:number,goblins:[{title:string,weight:number}]} with realistic university project tasks." }, { role: "user", content: args.brief }],
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) throw new Error(`OpenRouter request failed (${response.status})`);
    const payload = await response.json();
    return JSON.parse(payload.choices?.[0]?.message?.content ?? "{}");
  },
});
