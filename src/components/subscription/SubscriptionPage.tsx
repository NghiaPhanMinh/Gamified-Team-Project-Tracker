import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

import {
  getSubscriptionPlanLabel,
  type SubscriptionPlan,
} from "../../lib/subscription";

const FREE_FEATURES = [
  "2 active projects",
  "Core teamwork tools",
  "1 AI Project Plan generation per project",
  "1 AI Task Allocation per project",
  "1 AI workload suggestion per project",
  "Manual plan and task editing",
  "Framework library",
  "1 custom framework",
  "Progress and evidence tracking",
  "Basic contribution insights",
  "Basic gamification",
];

const PLUS_FEATURES = [
  "Unlimited active projects",
  "30 AI Actions per month",
  "Regenerate project plans and task allocations",
  "AI workload balancing",
  "AI task reassignment suggestions",
  "AI task breakdown",
  "AI deadline adjustment suggestions",
  "Unlimited custom frameworks",
  "Detailed contribution insights",
  "Full gamification",
  "Contribution report export",
  "Full project history",
];

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
            <p className="subscription-plan-name">Free</p>
            <h2>Get the team moving.</h2>
            <p className="subscription-price"><strong>0₫</strong></p>
          </header>
          <PlanFeatureList features={FREE_FEATURES} />
          <footer>
            <button type="button" disabled>
              {currentPlan === "free" ? "Current plan" : "Included with Plus"}
            </button>
          </footer>
        </article>

        <article className={`subscription-plan-card is-plus ${currentPlan === "plus" ? "is-current" : ""}`}>
          <span className="subscription-flexible-badge"><Sparkles size={16} aria-hidden="true" /> Best for group projects</span>
          <header>
            <p className="subscription-plan-name">MayLamDi+</p>
            <h2>More AI when plans change.</h2>
            <p className="subscription-price"><strong>39K₫</strong><span>/ month</span></p>
            <p className="subscription-semester-price">or 99K₫ / semester</p>
          </header>
          <PlanFeatureList features={PLUS_FEATURES} />
          <footer>
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
