import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { BrandLogo } from "../brand/BrandLogo";
import { ThemeToggle } from "../theme/ThemeToggle";

export function AuthenticatedHome() {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.getOrNull);
  const ensureProfile = useMutation(api.profiles.ensureCurrent);
  const hasRequestedProfile = useRef(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (profile !== null || hasRequestedProfile.current) {
      return;
    }

    hasRequestedProfile.current = true;
    void ensureProfile().catch(() => {
      setProfileError(
        "Your MayLamDi profile could not be prepared. Please sign out and try again.",
      );
    });
  }, [ensureProfile, profile]);

  if (profileError) {
    return (
      <main className="auth-state-page">
        <BrandLogo />
        <h1>Profile setup needs attention.</h1>
        <p role="alert">{profileError}</p>
        <button
          className="primary-button"
          type="button"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </main>
    );
  }

  if (profile === undefined || profile === null) {
    return (
      <main className="auth-state-page" aria-busy="true">
        <BrandLogo />
        <p className="kicker">Setting up your workspace</p>
        <h1>Making room for your team.</h1>
        <p role="status">Preparing your MayLamDi profile…</p>
      </main>
    );
  }

  return (
    <main className="authenticated-shell">
      <nav className="topbar" aria-label="Authenticated navigation">
        <a className="nav-brand" href="/" aria-label="MayLamDi home">
          <BrandLogo compact />
          <span>MayLamDi</span>
        </a>
        <div className="nav-actions">
          <ThemeToggle />
          <button
            className="secondary-button"
            type="button"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      </nav>

      <section className="welcome-panel">
        <div>
          <p className="kicker">Google account connected</p>
          <h1>Welcome, {profile.displayName}.</h1>
          <p>
            Your private profile is ready. Team creation stays locked until the
            two-account authentication gate is verified.
          </p>
        </div>
        {profile.imageUrl ? (
          <img
            className="profile-image"
            src={profile.imageUrl}
            alt=""
            width="112"
            height="112"
            referrerPolicy="no-referrer"
          />
        ) : (
          <BrandLogo />
        )}
      </section>
    </main>
  );
}
