import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function GoogleSignInButton() {
  const { signIn } = useAuthActions();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/home`
          : "/home";
      await signIn("google", { redirectTo });
    } catch {
      setError(
        "Google sign-in could not start. Check the OAuth setup and try again.",
      );
      setIsStarting(false);
    }
  };

  return (
    <div className="sign-in-control">
      <button
        className="primary-button google-sign-in"
        type="button"
        onClick={() => void handleSignIn()}
        disabled={isStarting}
      >
        <span className="google-mark" aria-hidden="true">
          G
        </span>
        {isStarting ? "Opening Google…" : "Continue with Google"}
      </button>
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
