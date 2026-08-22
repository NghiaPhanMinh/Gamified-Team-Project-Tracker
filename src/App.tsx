import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { BrowserRouter, useLocation } from "react-router-dom";

import { AuthenticatedHome } from "./components/auth/AuthenticatedHome";
import { AuthLoadingPage } from "./components/auth/AuthLoadingPage";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { LandingPage } from "./pages/LandingPage";

function AuthenticatedExperience() {
  const location = useLocation();

  if (location.pathname === "/") {
    return <LandingPage isAuthenticated />;
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
        <LandingPage />
      </Unauthenticated>
      <Authenticated>
        <ErrorBoundary>
          <AuthenticatedExperience />
        </ErrorBoundary>
      </Authenticated>
    </BrowserRouter>
  );
}
