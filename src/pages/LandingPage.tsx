import { FeatureStory } from "../components/landing/FeatureStory";
import { FinalAuthCTA } from "../components/landing/FinalAuthCTA";
import { HowItWorksSection } from "../components/landing/HowItWorksSection";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingNavigation } from "../components/landing/LandingNavigation";
import { LandingSubscription } from "../components/landing/LandingSubscription";
import { PurposeSection } from "../components/landing/PurposeSection";
import { useLandingReveal } from "../components/landing/useLandingReveal";
import "../styles/landing.css";

type LandingPageProps = {
  isAuthenticated?: boolean;
};

export function LandingPage({ isAuthenticated = false }: LandingPageProps) {
  useLandingReveal();

  return (
    <main className="marketing-shell landing-story">
      <LandingNavigation isAuthenticated={isAuthenticated} />
      <LandingHero />
      <PurposeSection />
      <FeatureStory />
      <HowItWorksSection />
      <LandingSubscription isAuthenticated={isAuthenticated} />
      <FinalAuthCTA isAuthenticated={isAuthenticated} />
    </main>
  );
}
