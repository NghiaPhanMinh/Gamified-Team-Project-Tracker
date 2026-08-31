import { ArrowDown } from "lucide-react";

import { BrandLogo } from "../brand/BrandLogo";

export function LandingHero() {
  return (
    <section className="landing-hero" id="top" aria-labelledby="landing-hero-title">
      <div className="landing-hero-copy">
        <p className="landing-hero-eyebrow">Group projects, without the guessing game.</p>
        <h1 id="landing-hero-title" aria-label="Make the work feel shared.">
          <span className="landing-hero-line">Make the work</span>
          <span className="landing-hero-hook">
            feel shared.
            <svg
              className="landing-hero-sketch"
              viewBox="0 0 420 132"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M25 68C17 32 87 10 207 12C323 14 399 37 396 68C393 102 321 118 202 112C88 107 30 94 25 68" />
              <path d="M18 64C30 23 111 5 225 13C345 21 411 45 391 79C373 109 292 116 181 108C76 101 11 87 18 64" />
            </svg>
          </span>
        </h1>
        <a className="landing-scroll-cue" href="#purpose">
          Scroll to see how <ArrowDown aria-hidden="true" />
        </a>
      </div>

      <div className="landing-hero-visual" aria-label="MayLamDi brand">
        <span className="landing-hero-shape landing-hero-shape--pink" aria-hidden="true" />
        <span className="landing-hero-shape landing-hero-shape--blue" aria-hidden="true" />
        <BrandLogo className="landing-hero-logo" />
        <span className="landing-hero-tag landing-hero-tag--fair">fairness-first</span>
        <span className="landing-hero-tag landing-hero-tag--live">realtime</span>
        <span className="landing-hero-tag landing-hero-tag--control">human control</span>
      </div>
    </section>
  );
}
