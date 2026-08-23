import { Link, useLocation } from "react-router-dom";

import {
  getSubscriptionNavLabel,
  getSubscriptionPlanLabel,
  type SubscriptionPlan,
} from "../../lib/subscription";

export function SubscriptionNavItem({ plan }: { plan: SubscriptionPlan }) {
  const location = useLocation();
  const planLabel = getSubscriptionNavLabel(plan);
  const accessiblePlanLabel = getSubscriptionPlanLabel(plan);

  return (
    <Link
      className={`subscription-nav-item is-${plan}`}
      to="/subscription"
      aria-label={`Subscription plan: ${accessiblePlanLabel}`}
      aria-current={location.pathname.startsWith("/subscription") ? "page" : undefined}
    >
      <span className="subscription-nav-label">Subscription</span>
      <span className="subscription-nav-plan">{planLabel}</span>
    </Link>
  );
}
