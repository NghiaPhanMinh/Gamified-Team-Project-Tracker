import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { BrowserRouter } from "react-router-dom";

import { AuthenticatedHome } from "./components/auth/AuthenticatedHome";
import { AuthLoadingPage } from "./components/auth/AuthLoadingPage";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { LandingPage } from "./pages/LandingPage";

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
          <AuthenticatedHome />
        </ErrorBoundary>
      </Authenticated>
    </BrowserRouter>
  );
}
