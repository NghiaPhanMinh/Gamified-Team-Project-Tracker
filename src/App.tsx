import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { BrowserRouter, useLocation } from "react-router-dom";

import { api } from "../convex/_generated/api";
import { AuthenticatedHome } from "./components/auth/AuthenticatedHome";
import { AuthLoadingPage } from "./components/auth/AuthLoadingPage";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { normalizeSubscriptionPlan } from "./lib/subscription";
import { LandingPage } from "./pages/LandingPage";
import { GuestProjectCreationPage } from "./pages/GuestProjectCreationPage";

function UnauthenticatedExperience() {
  const location = useLocation();
  return location.pathname.startsWith("/projects/create")
    ? <GuestProjectCreationPage />
    : <LandingPage />;
}

function AuthenticatedExperience() {
  const location = useLocation();
  const subscription = useQuery(api.aiUsage.getCurrent, location.pathname === "/" ? {} : "skip");

  if (location.pathname === "/") {
    return <LandingPage isAuthenticated currentPlan={subscription ? normalizeSubscriptionPlan(subscription.tier) : undefined} />;
  }

  return <AuthenticatedHome />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthLoading>
        <AuthLoadingPage />
      </AuthLoading>
      <Unauthenticated>
        <UnauthenticatedExperience />
      </Unauthenticated>
      <Authenticated>
        <ErrorBoundary>
          <AuthenticatedExperience />
        </ErrorBoundary>
      </Authenticated>
    </BrowserRouter>
  );
}
