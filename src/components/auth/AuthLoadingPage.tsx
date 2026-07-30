import { BrandLogo } from "../brand/BrandLogo";

export function AuthLoadingPage() {
  return (
    <main className="auth-state-page" aria-busy="true">
      <BrandLogo />
      <p className="kicker">Checking your session</p>
      <h1>Loading MayLamDi.</h1>
      <p role="status">Connecting securely…</p>
    </main>
  );
}
