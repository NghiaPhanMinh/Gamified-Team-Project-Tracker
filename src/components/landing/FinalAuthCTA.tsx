import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { GoogleSignInButton } from "../auth/GoogleSignInButton";

export function FinalAuthCTA({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="landing-final-cta landing-chapter" id="get-started" aria-labelledby="landing-final-title">
      <div className="landing-final-marquee" aria-hidden="true"><span>MAYLAMDI MAYLAMDI MAYLAMDI</span><span>MAYLAMDI MAYLAMDI MAYLAMDI</span></div>
      <div className="landing-final-content" data-reveal>
        <p className="landing-section-number">06 / Start together</p>
        {isAuthenticated ? (
          <><h2 id="landing-final-title">Welcome back.</h2><p>Your projects and contribution trail are ready.</p><Link className="landing-final-projects" to="/projects">Go to Projects <ArrowRight aria-hidden="true" /></Link></>
        ) : (
          <><h2 id="landing-final-title">Ready to stop carrying the team?</h2><p>Start a project, bring your team in, and make the work visible.</p><GoogleSignInButton /><small>Sign in or create an account</small></>
        )}
      </div>
    </section>
  );
}
