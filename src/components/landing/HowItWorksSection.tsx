import { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, ClipboardList, FolderPlus, UserRoundCog } from "lucide-react";

const WORKFLOW_STEPS = [
  {
    label: "Profile",
    title: "Tell us how you work",
    details: ["Skills", "Software", "Weekly capacity", "Work preferences"],
  },
  {
    label: "Project",
    title: "Create or join a project",
    details: ["Create a new room", "Join using a project code"],
  },
  {
    label: "Brief",
    title: "Add the brief",
    details: ["Choose a framework", "Add the project brief", "Set the deadline"],
  },
  {
    label: "AI plan",
    title: "Review the AI plan",
    details: ["Suggested phases", "Tasks and effort", "Owners and milestones"],
  },
  {
    label: "Progress",
    title: "Do the work. Show the work.",
    details: ["Complete tasks", "Attach evidence", "Review contribution", "Track progress"],
  },
] as const;

const STEP_ICONS = [UserRoundCog, FolderPlus, BriefcaseBusiness, ClipboardList, CheckCircle2] as const;

function WorkflowPreview({ step }: { step: number }) {
  const item = WORKFLOW_STEPS[step];
  const Icon = STEP_ICONS[step];

  return (
    <div className={`landing-workflow-preview is-step-${step + 1}`} aria-live="polite">
      <header><span>0{step + 1} / {item.label}</span><Icon aria-hidden="true" /></header>
      <h3>{item.title}</h3>
      <div className="landing-workflow-window">
        {step === 0 ? <><div className="landing-profile-demo"><span className="landing-avatar is-pink">Q</span><div><strong>Your project profile</strong><small>Saved once. Reused for fair planning.</small></div></div><div className="landing-skill-chips"><span>Research</span><span>Figma</span><span>8 hrs / week</span></div></> : null}
        {step === 1 ? <><div className="landing-room-choice"><div><span>+</span><strong>Create a room</strong></div><div><span>#</span><strong>Join with a code</strong></div></div><p className="landing-code-demo">ROOM CODE <strong>5Y4UUZ</strong></p></> : null}
        {step === 2 ? <><div className="landing-brief-demo"><span>Project brief</span><strong>Create and test an inclusive student-service prototype.</strong></div><div className="landing-brief-meta"><span>Nonlinear design</span><span>Due 14 Sep</span></div></> : null}
        {step === 3 ? <><div className="landing-plan-phase"><span>01</span><div><strong>Discover</strong><small>2 tasks · 1 milestone</small></div></div><div className="landing-plan-phase"><span>02</span><div><strong>Prototype</strong><small>3 tasks · Huy</small></div></div><div className="landing-plan-phase"><span>03</span><div><strong>Test</strong><small>3 tasks · Quinn</small></div></div></> : null}
        {step === 4 ? <><div className="landing-proof-demo"><CheckCircle2 aria-hidden="true" /><div><strong>Prototype walkthrough</strong><small>Evidence attached · ready for review</small></div></div><div className="landing-demo-progress"><span style={{ width: "78%" }} /></div><p className="landing-progress-caption">Project progress <strong>78%</strong></p></> : null}
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-workflow-step]");
    if (!items?.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
      if (visible) setActiveStep(Number((visible.target as HTMLElement).dataset.workflowStep ?? 0));
    }, { rootMargin: "-30% 0px -48%", threshold: [0.2, 0.55, 0.8] });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="landing-how landing-chapter" id="how-it-works" aria-labelledby="landing-how-title">
      <header className="landing-how-heading" data-reveal><p className="landing-section-number">04 / How it works</p><h2 id="landing-how-title">From brief to done.</h2><p>Your project moves through one shared flow.</p></header>
      <div className="landing-how-layout">
        <ol className="landing-workflow-steps" ref={listRef}>
          {WORKFLOW_STEPS.map((item, index) => (
            <li className={activeStep === index ? "is-active" : ""} data-workflow-step={index} key={item.label} aria-current={activeStep === index ? "step" : undefined}>
              <span className="landing-workflow-number">0{index + 1}</span>
              <div><small>{item.label}</small><h3>{item.title}</h3><ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></div>
              <div className="landing-workflow-mobile-preview"><WorkflowPreview step={index} /></div>
            </li>
          ))}
        </ol>
        <div className="landing-workflow-sticky" data-reveal><WorkflowPreview step={activeStep} /></div>
      </div>
    </section>
  );
}
