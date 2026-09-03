import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

import {
  FREE_SUBSCRIPTION_FEATURES,
  PLUS_SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_PLANS,
  getSubscriptionPlanLabel,
  type SubscriptionPlan,
} from "../../lib/subscription";

function PlanFeatureList({ features }: { features: string[] }) {
  return (
    <ul className="subscription-feature-list">
      {features.map((feature) => (
        <li key={feature}>
          <Check size={18} strokeWidth={2.25} aria-hidden="true" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export function SubscriptionPage({ currentPlan }: { currentPlan: SubscriptionPlan }) {
  const navigate = useNavigate();
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);
  const currentPlanLabel = getSubscriptionPlanLabel(currentPlan);

  return (
    <section className="subscription-page-v2" aria-labelledby="subscription-page-title">
      <div style={{ marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="primary-button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            fontSize: "0.95rem",
            background: "#ffe600",
            color: "#101517",
            border: "2.5px solid #101517",
            boxShadow: "4px 4px 0 #101517",
            cursor: "pointer",
            fontWeight: 900,
            borderRadius: "12px",
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} /> Back to Project
        </button>
      </div>
      <header className="subscription-page-heading">
        <div>
          <p className="kicker">Subscription</p>
          <h1 className="display-heading" id="subscription-page-title">Choose the support your team needs.</h1>
          <p>Free keeps the core project experience fully usable. Plus adds more AI support, flexibility, and richer team insights.</p>
        </div>
        <aside className={`subscription-current-plan is-${currentPlan}`} aria-label={`Your current plan is ${currentPlanLabel}`}>
          <span>Your plan</span>
          <strong>{currentPlanLabel}</strong>
          <small>{currentPlan === "plus" ? "30 AI Actions per month" : "1 AI plan + 1 allocation per project"}</small>
        </aside>
      </header>

      <div className="subscription-plan-grid">
        <article className={`subscription-plan-card is-free ${currentPlan === "free" ? "is-current" : ""}`}>
          <header>
            <p className="subscription-plan-name">{SUBSCRIPTION_PLANS.free.name}</p>
            <h2>{SUBSCRIPTION_PLANS.free.heading}</h2>
            <p className="subscription-price"><strong>{SUBSCRIPTION_PLANS.free.price}</strong></p>
          </header>
          <PlanFeatureList features={[...FREE_SUBSCRIPTION_FEATURES]} />
          <footer className="subscription-plan-actions">
            <button type="button" disabled>
              {currentPlan === "free" ? "Current plan" : "Included with Plus"}
            </button>
          </footer>
        </article>

        <article className={`subscription-plan-card is-plus ${currentPlan === "plus" ? "is-current" : ""}`}>
          <span className="subscription-flexible-badge"><Sparkles size={16} aria-hidden="true" /> Best for group projects</span>
          <header>
            <p className="subscription-plan-name">{SUBSCRIPTION_PLANS.plus.name}</p>
            <h2>{SUBSCRIPTION_PLANS.plus.heading}</h2>
            <p className="subscription-price"><strong>{SUBSCRIPTION_PLANS.plus.price}</strong><span>{SUBSCRIPTION_PLANS.plus.cadence}</span></p>
            <p className="subscription-semester-price">{SUBSCRIPTION_PLANS.plus.semesterPrice}</p>
          </header>
          <PlanFeatureList features={[...PLUS_SUBSCRIPTION_FEATURES]} />
          <footer className="subscription-plan-actions">
            {currentPlan === "plus" ? (
              <button type="button" disabled>Current plan</button>
            ) : (
              <button type="button" onClick={() => setUpgradeMessage("Plus checkout is not connected in this assignment demo yet.")}>Upgrade to Plus</button>
            )}
          </footer>
        </article>
      </div>

      {upgradeMessage ? <p className="subscription-upgrade-note" role="status">{upgradeMessage}</p> : null}
      <p className="subscription-core-note"><strong>Core access stays free.</strong> You can still plan projects, manage tasks, track evidence, and collaborate with your team without Plus.</p>
    </section>
  );
}
