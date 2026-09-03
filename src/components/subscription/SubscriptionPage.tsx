import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

import { SubscriptionComparisonValue } from "./SubscriptionComparisonValue";
import {
  SUBSCRIPTION_COMPARISON_ROWS,
  SUBSCRIPTION_PLANS,
  getSubscriptionPlanLabel,
  type SubscriptionPlan,
} from "../../lib/subscription";

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

      <div className="subscription-comparison" role="table" aria-label="MayLamDi subscription plan comparison">
        <div className="subscription-comparison-row subscription-comparison-head" role="row">
          <div className="subscription-comparison-feature" role="columnheader">
            <span>Compare plans</span>
            <small>Keep the core project experience free, then add more AI room.</small>
          </div>
          <div className="subscription-comparison-plan subscription-comparison-plan--free" role="columnheader">
            <strong>{SUBSCRIPTION_PLANS.free.name}</strong>
            <span>{SUBSCRIPTION_PLANS.free.heading}</span>
            <small>{SUBSCRIPTION_PLANS.free.price}</small>
          </div>
          <div className="subscription-comparison-plan subscription-comparison-plan--plus" role="columnheader">
            <strong>{SUBSCRIPTION_PLANS.plus.name}<Sparkles size={16} aria-hidden="true" /></strong>
            <span>{SUBSCRIPTION_PLANS.plus.heading}</span>
            <small><span className="subscription-comparison-price-value">{SUBSCRIPTION_PLANS.plus.price}</span> {SUBSCRIPTION_PLANS.plus.cadence}</small>
          </div>
        </div>

        {SUBSCRIPTION_COMPARISON_ROWS.map((row) => (
          <div className="subscription-comparison-row" key={row.label} role="row">
            <div className="subscription-comparison-feature" role="rowheader">
              <strong>{row.label}</strong>
              <small>{row.detail}</small>
            </div>
            <div className="subscription-comparison-value subscription-comparison-value--free" role="cell">
              <span className="subscription-comparison-value-label">Free</span>
              <strong><SubscriptionComparisonValue className="subscription-comparison-symbol" value={row.free} /></strong>
            </div>
            <div className="subscription-comparison-value subscription-comparison-value--plus" role="cell">
              <span className="subscription-comparison-value-label">MayLamDi+</span>
              <strong><SubscriptionComparisonValue className="subscription-comparison-symbol" value={row.plus} /></strong>
            </div>
          </div>
        ))}

        <div className="subscription-comparison-row subscription-comparison-actions" role="row">
          <div className="subscription-comparison-feature" role="rowheader">
            <strong>Choose your starting point</strong>
            <small>Core teamwork stays available for every team.</small>
          </div>
          <div className="subscription-comparison-value subscription-comparison-value--free" role="cell">
            <span className="subscription-comparison-value-label">Free</span>
            <button type="button" disabled>
              {currentPlan === "free" ? "Current plan" : "Included with Plus"}
            </button>
          </div>
          <div className="subscription-comparison-value subscription-comparison-value--plus" role="cell">
            <span className="subscription-comparison-value-label">MayLamDi+</span>
            {currentPlan === "plus" ? (
              <button type="button" disabled>Current plan</button>
            ) : (
              <button type="button" onClick={() => setUpgradeMessage("Plus checkout is not connected in this assignment demo yet.")}>Upgrade to Plus</button>
            )}
          </div>
        </div>
      </div>

      {upgradeMessage ? <p className="subscription-upgrade-note" role="status">{upgradeMessage}</p> : null}
      <p className="subscription-core-note"><strong>Core access stays free.</strong> You can still plan projects, manage tasks, track evidence, and collaborate with your team without Plus.</p>
    </section>
  );
}
