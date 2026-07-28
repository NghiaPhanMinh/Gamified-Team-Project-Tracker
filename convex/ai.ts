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
        messages: [{ role: "system", content: "Return JSON only: {title:string,days:number,shares:[{memberLabel:string,weight:number}]} with a realistic university project boss breakdown. Use 2-6 shares, with weights totaling 100." }, { role: "user", content: args.brief }],
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) throw new Error(`OpenRouter request failed (${response.status})`);
    const payload = await response.json();
    return JSON.parse(payload.choices?.[0]?.message?.content ?? "{}");
  },
});
