import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { BrandLogo } from "../components/brand/BrandLogo";
import { ProjectOnboarding } from "../components/projects/ProjectOnboarding";
import { savePendingProjectDraft, type PendingProjectDraft } from "../lib/pendingProjectDraft";

export function GuestProjectCreationPage() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  async function continueWithGoogle(draft: PendingProjectDraft) {
    setAuthError(null);
    savePendingProjectDraft(draft);
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/projects/create?resume=1` : "/projects/create?resume=1";
      await signIn("google", { redirectTo });
    } catch {
      setAuthError("Google sign-in could not start. Your project draft is still saved in this tab, so you can try again.");
      throw new Error("Google sign-in could not start.");
    }
  }

  return (
    <main className="guest-project-shell">
      <header className="guest-project-header">
        <Link to="/" aria-label="MayLamDi landing page"><BrandLogo compact /><span>MayLamDi</span></Link>
        <span>Plan first. Sign in when you create.</span>
      </header>
      {authError ? <p className="form-error guest-project-auth-error" role="alert">{authError}</p> : null}
      <ProjectOnboarding
        mode="create"
        onAuthenticationRequired={continueWithGoogle}
        onCancel={() => navigate("/")}
      />
    </main>
  );
}
