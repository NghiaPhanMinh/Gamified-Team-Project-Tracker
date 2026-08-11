import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { clearByokSession, getByokSession, setByokSession } from "../../lib/byokSession";

type ProfileTab = "character" | "ai" | "subscription";

const PLANS = [
  { id: "free", name: "Free", price: "0 VND", description: "Every manual planning and collaboration tool, plus one free-model AI plan per project.", features: ["Unlimited manual planning", "Frameworks and team rooms", "Claims, trades, calendar and review", "Battle and basic report", "1 platform AI plan per project"] },
  { id: "plus", name: "Student Plus", price: "49,000 VND / month", description: "Faster AI support for students who want ongoing planning assistance.", features: ["Unlimited AI allocation", "AI brief and task breakdown", "Meeting recommendations", "AI rebalancing", "Enhanced report export"] },
  { id: "pro", name: "Student Pro", price: "99,000 VND / month", description: "Advanced reasoning, risk, scheduling, dependencies, and cross-project insights.", features: ["Everything in Plus", "Advanced risk detection", "Schedule optimisation", "Project comparisons", "Richer contribution reports"] },
] as const;

export function ProfileCenter({ character, roomControl }: { character?: ReactNode; roomControl?: ReactNode }) {
  const subscription = useQuery(api.aiUsage.getCurrent);
  const [tab, setTab] = useState<ProfileTab>("character");
  const initialByok = getByokSession();
  const [useOwnKey, setUseOwnKey] = useState(initialByok !== null);
  const [apiKey, setApiKey] = useState(initialByok?.apiKey ?? "");
  const [model, setModel] = useState(initialByok?.model ?? "google/gemma-3-27b-it:free");
  const [previewTier, setPreviewTier] = useState<"free" | "plus" | "pro">("free");

  useEffect(() => {
    if (useOwnKey && apiKey.trim() && model.trim()) setByokSession({ apiKey, model });
    else clearByokSession();
  }, [apiKey, model, useOwnKey]);

  return (
    <section className="profile-page profile-center" aria-labelledby="profile-page-title">
      <header className="focused-page-heading">
        <div><p className="kicker">Profile</p><h1 className="display-heading" id="profile-page-title">Your MayLamDi settings</h1><p>Character, private session AI, and plan information live here—not in the main navigation.</p></div>
        {roomControl}
      </header>
      <nav className="profile-tabs" aria-label="Profile sections">
        <button type="button" className={tab === "character" ? "is-active" : ""} onClick={() => setTab("character")}>Character</button>
        <button type="button" className={tab === "ai" ? "is-active" : ""} onClick={() => setTab("ai")}>AI Settings</button>
        <button type="button" className={tab === "subscription" ? "is-active" : ""} onClick={() => setTab("subscription")}>Subscription</button>
      </nav>

      {tab === "character" ? character ?? <div className="project-empty"><strong>No room character yet.</strong><p>Create or join a room first. AI Settings and Subscription are still available above.</p></div> : null}

      {tab === "ai" ? (
        <section className="profile-settings-card ai-settings-card" aria-labelledby="ai-settings-title">
          <p className="card-eyebrow">Bring your own key</p><h2 id="ai-settings-title">AI Settings</h2>
          <label className="toggle-field"><input type="checkbox" checked={useOwnKey} onChange={(event) => setUseOwnKey(event.target.checked)} /><span>Use my own AI key</span></label>
          <div className="guided-field-grid">
            <label><span>OpenRouter API key</span><input disabled={!useOwnKey} type="password" autoComplete="off" spellCheck={false} value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="sk-or-v1-…" /></label>
            <label><span>Model ID</span><input disabled={!useOwnKey} value={model} onChange={(event) => setModel(event.target.value)} placeholder="provider/model" /></label>
          </div>
          <p className="ai-security-note">Your API key is used for this session only and is not saved by MayLamDi. It is never added to activity, analytics, or console output. If your request fails, MayLamDi will not silently use paid platform AI.</p>
          <span className={useOwnKey && apiKey.trim() && model.trim() ? "session-key-state is-ready" : "session-key-state"}>{useOwnKey && apiKey.trim() && model.trim() ? "Session key ready" : "Platform routing active"}</span>
        </section>
      ) : null}

      {tab === "subscription" ? (
        <section className="subscription-page" aria-labelledby="subscription-title">
          <p className="card-eyebrow">University MVP preview</p><h2 id="subscription-title">Subscription</h2>
          <p>Your authenticated server entitlement is <strong>{subscription?.tier ?? "free"}</strong>. The controls below preview differences only; no payment processing is configured.</p>
          <div className="pricing-grid">{PLANS.map((plan) => (
            <article key={plan.id} className={previewTier === plan.id ? "is-previewed" : ""}>
              <span>{subscription?.tier === plan.id ? "Current plan" : "Plan preview"}</span><h3>{plan.name}</h3><strong>{plan.price}</strong><p>{plan.description}</p>
              <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              <button className="quiet-button" type="button" onClick={() => setPreviewTier(plan.id)}>Preview {plan.name}</button>
            </article>
          ))}</div>
          {previewTier !== "free" && subscription?.tier === "free" ? <div className="feature-gate-card"><strong>Preview only</strong><p>Payments are not connected for this assignment demo. Manual alternatives remain fully available.</p><button className="quiet-button" type="button" onClick={() => setPreviewTier("free")}>Continue manually</button></div> : null}
        </section>
      ) : null}
    </section>
  );
}
