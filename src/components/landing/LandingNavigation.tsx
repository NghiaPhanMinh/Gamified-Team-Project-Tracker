import { Link } from "react-router-dom";

import { BrandLogo } from "../brand/BrandLogo";
import { ThemeToggle } from "../theme/ThemeToggle";

export function LandingNavigation({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="landing-navigation">
      <a className="landing-brand" href="#top" aria-label="Return to the top of the MayLamDi landing page">
        <BrandLogo compact />
        <span>MayLamDi</span>
      </a>
      <nav className="landing-nav-links" aria-label="Landing page">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <a href="#pricing">Pricing</a>
      </nav>
      <div className="landing-nav-actions">
        <ThemeToggle />
        {isAuthenticated ? (
          <Link className="landing-nav-cta" to="/projects">Projects</Link>
        ) : (
          <a className="landing-nav-cta" href="#get-started">Sign in</a>
        )}
      </div>
    </header>
  );
}
