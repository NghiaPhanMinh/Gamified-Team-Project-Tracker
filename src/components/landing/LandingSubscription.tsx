import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const FREE_FEATURES = [
  "Core teamwork tools",
  "Up to 2 active projects",
  "1 AI plan / project",
  "1 AI allocation / project",
  "Progress & evidence tracking",
];

const PLUS_FEATURES = [
  "Unlimited projects",
  "30 AI Actions / month",
  "Regenerate plans",
  "AI workload balancing",
  "More AI revisions",
  "Detailed contribution insights",
  "Report export",
  "Full project history",
];

function FeatureList({ features }: { features: string[] }) {
  return <ul>{features.map((feature) => <li key={feature}><Check aria-hidden="true" /><span>{feature}</span></li>)}</ul>;
}

function PlanAction({ isAuthenticated, children }: { isAuthenticated: boolean; children: string }) {
  return isAuthenticated
    ? <Link to="/subscription">{children}</Link>
    : <a href="#get-started">{children}</a>;
}

export function LandingSubscription({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="landing-pricing landing-chapter" id="pricing" aria-labelledby="landing-pricing-title">
      <header data-reveal><p className="landing-section-number">05 / Subscription</p><h2 id="landing-pricing-title">Core teamwork stays free.</h2><p>Upgrade only when you want MayLamDi to keep helping with AI.</p></header>
      <div className="landing-pricing-grid">
        <article className="landing-price-card is-free" data-reveal>
          <header><p>Free</p><h3>Get the team moving.</h3><strong>0₫</strong></header>
          <FeatureList features={FREE_FEATURES} />
          <PlanAction isAuthenticated={isAuthenticated}>Start free</PlanAction>
        </article>
        <article className="landing-price-card is-plus" data-reveal>
          <span className="landing-price-badge"><Sparkles aria-hidden="true" /> More AI support</span>
          <header><p>MayLamDi+</p><h3>More help when plans change.</h3><strong>39K₫ <small>/ month</small></strong></header>
          <FeatureList features={PLUS_FEATURES} />
          <PlanAction isAuthenticated={isAuthenticated}>Go Plus</PlanAction>
        </article>
      </div>
    </section>
  );
}
