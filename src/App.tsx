import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

import { AuthenticatedHome } from "./components/auth/AuthenticatedHome";
import { AuthLoadingPage } from "./components/auth/AuthLoadingPage";
import { LandingPage } from "./pages/LandingPage";

export function App() {
  return (
    <>
      <AuthLoading>
        <AuthLoadingPage />
      </AuthLoading>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedHome />
      </Authenticated>
    </>
  );
}
