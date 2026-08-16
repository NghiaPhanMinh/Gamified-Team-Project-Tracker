import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { getErrorMessage } from "../../lib/errors";
import { clearByokSession, getByokSession, setByokSession } from "../../lib/byokSession";

const SKILL_CATEGORIES = {
  Creative: [
    "Graphic Design", "Illustration", "Typography", "Layout", "Branding",
    "UI Design", "UX Design", "Interaction Design", "Photography", "Videography",
    "Video Editing", "Motion Graphics", "2D Animation", "3D Animation",
    "Storyboarding", "Sound Design", "Scriptwriting",
  ],
  "Research / Strategy": [
    "User Research", "Market Research", "Academic Research", "Competitor Analysis",
    "Data Analysis", "Survey Design", "Interviewing", "Strategy", "Campaign Planning",
  ],
  General: [
    "Writing", "Copywriting", "Presentation", "Public Speaking", "Communication",
    "Organisation", "Project Management", "Leadership", "Documentation",
  ],
} as const;

const SOFTWARE_SKILLS = [
  "Photoshop", "Illustrator", "InDesign", "Figma", "After Effects", "Premiere Pro",
  "Blender", "Maya", "Cinema 4D", "Procreate", "DaVinci Resolve", "HTML/CSS",
  "JavaScript", "React", "GitHub", "Excel", "PowerPoint", "Canva",
];

const RECOMMENDED_SKILLS = [
  "Communication", "Organisation", "Project Management", "Presentation",
  "User Research", "UI Design", "UX Design", "Writing",
];
const ALL_GENERAL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

const CAPACITY_OPTIONS = [
  { value: 4, label: "Under 5 hours" },
  { value: 8, label: "5–10 hours" },
  { value: 13, label: "10–15 hours" },
  { value: 18, label: "15–20 hours" },
  { value: 24, label: "20+ hours" },
] as const;

function toggleInList(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function SkillPicker({
  skills,
  softwareSkills,
  onSkillsChange,
  onSoftwareSkillsChange,
}: {
  skills: string[];
  softwareSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  onSoftwareSkillsChange: (skills: string[]) => void;
}) {
  const [mode, setMode] = useState<"recommended" | "search" | "all" | "other">("recommended");
  const [query, setQuery] = useState("");
  const [other, setOther] = useState("");
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return [...ALL_GENERAL_SKILLS, ...SOFTWARE_SKILLS]
      .filter((skill) => skill.toLowerCase().includes(normalized))
      .slice(0, 12);
  }, [query]);

  function toggle(skill: string) {
    if (SOFTWARE_SKILLS.includes(skill as (typeof SOFTWARE_SKILLS)[number])) {
      onSoftwareSkillsChange(toggleInList(softwareSkills, skill));
    } else {
      onSkillsChange(toggleInList(skills, skill));
    }
  }

  function addOther() {
    const cleaned = other.trim().replace(/\s+/g, " ").slice(0, 60);
    if (!cleaned || skills.some((skill) => skill.toLowerCase() === cleaned.toLowerCase())) return;
    onSkillsChange([...skills, cleaned]);
    setOther("");
  }

  const choices = mode === "recommended"
    ? RECOMMENDED_SKILLS
    : mode === "search"
      ? searchResults
      : [];

  const tabLabels = {
    recommended: "⭐ Recommended",
    search: "🔍 Search",
    all: "📚 View All",
    other: "✏️ Custom Skill",
  } as const;

  const categoryIcons: Record<string, string> = {
    Creative: "🎨 Creative",
    "Research / Strategy": "📊 Research & Strategy",
    General: "💬 General & Soft Skills",
    Software: "💻 Software & Tools",
  };

  return (
    <div className="profile-skill-picker">
      <div className="profile-skill-toolbar" role="tablist" aria-label="Skill picker views">
        {(["recommended", "search", "all", "other"] as const).map((item) => (
          <button key={item} type="button" role="tab" aria-selected={mode === item} className={mode === item ? "is-active" : ""} onClick={() => setMode(item)}>
            {tabLabels[item]}
          </button>
        ))}
      </div>

      {mode === "search" ? (
        <label className="profile-skill-search">
          <span>Type to search skills & tools</span>
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Figma, React, Copywriting, Market Research…" />
        </label>
      ) : null}

      {mode === "other" ? (
        <div className="profile-other-skill">
          <label>
            <span>Add custom skill</span>
            <input
              value={other}
              maxLength={60}
              placeholder="e.g. Motion Graphics, Motion Capture…"
              onChange={(event) => setOther(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addOther();
                }
              }}
            />
          </label>
          <button className="primary-button add-custom-skill-btn" type="button" onClick={addOther}>+ Add Custom Skill</button>
        </div>
      ) : null}

      {mode === "all" ? (
        <div className="profile-skill-categories">
          {Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => (
            <section key={category} className="skill-category-block">
              <h4 className="skill-category-title">{categoryIcons[category] ?? category}</h4>
              <div className="profile-skill-options">
                {categorySkills.map((skill) => (
                  <button key={skill} type="button" className={skills.includes(skill) ? "is-selected" : ""} aria-pressed={skills.includes(skill)} onClick={() => toggle(skill)}>
                    {skills.includes(skill) ? "✓ " : ""}{skill}
                  </button>
                ))}
              </div>
            </section>
          ))}
          <section className="skill-category-block">
            <h4 className="skill-category-title">{categoryIcons["Software"]}</h4>
            <div className="profile-skill-options">
              {SOFTWARE_SKILLS.map((skill) => (
                <button key={skill} type="button" className={softwareSkills.includes(skill) ? "is-selected" : ""} aria-pressed={softwareSkills.includes(skill)} onClick={() => toggle(skill)}>
                  {softwareSkills.includes(skill) ? "✓ " : ""}{skill}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {mode === "recommended" || mode === "search" ? (
        <div className="profile-skill-options">
          {choices.length ? choices.map((skill) => {
            const selected = skills.includes(skill) || softwareSkills.includes(skill);
            return (
              <button key={skill} type="button" className={selected ? "is-selected" : ""} aria-pressed={selected} onClick={() => toggle(skill)}>
                {selected ? "✓ " : ""}{skill}
              </button>
            );
          }) : <p className="no-skills-found">{mode === "search" ? "Type a skill or tool name to search." : "No recommendations available."}</p>}
        </div>
      ) : null}

      {skills.length > 0 || softwareSkills.length > 0 ? (
        <div className="selected-skills-container">
          <div className="selected-skills-header">
            <span className="selected-skills-title">🎯 Your Selected Skills ({skills.length + softwareSkills.length})</span>
            <span className="selected-skills-hint">Click any skill chip below to remove</span>
          </div>
          <div className="selected-profile-skills" aria-live="polite">
            {[...skills, ...softwareSkills].map((skill) => (
              <button key={skill} type="button" onClick={() => toggle(skill)} title="Click to remove">
                {skill}<span aria-hidden="true"> ×</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProfileCenter({
  character,
  roomControl,
  setupRequired = false,
}: {
  character?: ReactNode;
  roomControl?: ReactNode;
  setupRequired?: boolean;
}) {
  const profile = useQuery(api.profiles.getOrNull);
  const saveProfile = useMutation(api.profiles.saveCurrent);
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [softwareSkills, setSoftwareSkills] = useState<string[]>(profile?.softwareSkills ?? []);
  const [weeklyCapacity, setWeeklyCapacity] = useState(profile?.weeklyCapacity ?? 8);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileHydrated = useRef(false);
  const initialByok = getByokSession();
  const [useOwnKey, setUseOwnKey] = useState(initialByok !== null);
  const [apiKey, setApiKey] = useState(initialByok?.apiKey ?? "");
  const [model, setModel] = useState(initialByok?.model ?? "google/gemma-3-27b-it:free");

  /* Realtime profile data arrives after the first render; hydrate once without
     overwriting edits made while the save request is in flight. */
  useEffect(() => {
    if (!profile || profileHydrated.current) return;
    profileHydrated.current = true;
    setSkills(profile.skills ?? []);
    setSoftwareSkills(profile.softwareSkills ?? []);
    setWeeklyCapacity(profile.weeklyCapacity ?? 8);
  }, [profile]);

  useEffect(() => {
    if (useOwnKey && apiKey.trim() && model.trim()) setByokSession({ apiKey, model });
    else clearByokSession();
  }, [apiKey, model, useOwnKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      await saveProfile({ skills, softwareSkills, weeklyCapacity });
      setMessage("Profile saved. Project creation and joining are now unlocked.");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Your profile could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  const totalSteps = 3;
  const isSkillsReady = skills.length + softwareSkills.length > 0;
  const completedSteps = 1 + (isSkillsReady ? 1 : 0) + (weeklyCapacity ? 1 : 0);
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <section className="profile-page profile-center" aria-labelledby="profile-page-title">
      <header className="focused-page-heading profile-stepper-heading">
        <div className="profile-header-main">
          <p className="kicker">{setupRequired ? "🔒 Onboarding Required" : "⚙️ Profile Settings"}</p>
          <h1 className="display-heading" id="profile-page-title">
            {setupRequired ? "Complete Your Profile to Unlock Rooms" : "How You Work"}
          </h1>
          <p className="profile-header-subtext">
            Complete 3 simple steps so MayLamDi can allocate fair workloads and prevent team burnout.
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="profile-progress-container" aria-label="Profile completion progress">
          <div className="profile-progress-meta">
            <span className="profile-progress-label">PROFILE PROGRESS</span>
            <span className="profile-progress-percent">{completedSteps}/{totalSteps} STEPS READY ({progressPercent}%)</span>
          </div>
          <div className="profile-progress-track">
            <div className="profile-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {roomControl}
      </header>

      <form className="profile-setup-form" onSubmit={submit}>
        {/* Step 1: Account Identity */}
        <section className="profile-basic-card profile-step-card" aria-labelledby="basic-profile-title">
          <div className="profile-card-header-row">
            <span className="profile-step-badge is-completed">✓ STEP 1</span>
            <span className="card-eyebrow">Google Account</span>
            <span className="profile-status-pill is-verified">Verified</span>
          </div>
          <div className="profile-identity">
            {profile?.imageUrl ? <img src={profile.imageUrl} alt="" /> : <span className="member-avatar">{profile?.displayName.slice(0, 1).toUpperCase()}</span>}
            <div>
              <h2 id="basic-profile-title">{profile?.displayName}</h2>
              <span>{profile?.email}</span>
            </div>
          </div>
          {character ? (
            <details className="compact-character-settings"><summary>Customise my character</summary>{character}</details>
          ) : (
            <p className="profile-character-note"><span>ℹ️</span> Character customisation unlocks after joining a room.</p>
          )}
        </section>

        {/* Step 2: Skills & Tools */}
        <section className={`profile-settings-card profile-step-card ${!isSkillsReady ? "is-attention" : ""}`} aria-labelledby="work-profile-title">
          <div className="profile-card-header-row">
            <span className={`profile-step-badge ${isSkillsReady ? "is-completed" : "is-active"}`}>
              {isSkillsReady ? "✓ STEP 2" : "STEP 2"}
            </span>
            <span className="card-eyebrow">Core Competencies</span>
          </div>

          <div className="profile-title-with-badge">
            <h2 id="work-profile-title">What skills do you bring to your team?</h2>
            {!isSkillsReady ? (
              <span className="skill-req-badge is-missing">⚠️ Required: Pick at least 1 skill</span>
            ) : (
              <span className="skill-req-badge is-ready">✓ {skills.length + softwareSkills.length} skill(s) selected</span>
            )}
          </div>
          <p className="card-description">Select your main skills and tools so MayLamDi's allocation engine can assign suitable tasks.</p>
          <SkillPicker skills={skills} softwareSkills={softwareSkills} onSkillsChange={setSkills} onSoftwareSkillsChange={setSoftwareSkills} />
        </section>

        {/* Step 3: Weekly Capacity */}
        <section className="profile-settings-card profile-step-card" aria-labelledby="capacity-title">
          <div className="profile-card-header-row">
            <span className="profile-step-badge is-completed">✓ STEP 3</span>
            <span className="card-eyebrow">Weekly Availability</span>
          </div>
          <h2 id="capacity-title">How much time can you commit each week?</h2>
          <p className="card-description">Used to balance project workloads across your team and prevent teammate burnout.</p>
          <div className="capacity-options">
            {CAPACITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={weeklyCapacity === option.value ? "is-selected" : ""}
                aria-pressed={weeklyCapacity === option.value}
                onClick={() => setWeeklyCapacity(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Step 4: Final Action Card */}
        <section className="profile-submit-card">
          <div className="profile-submit-info">
            <span className="profile-step-badge is-final">FINAL STEP</span>
            <h3>Save & Unlock Team Rooms</h3>
            <p>{isSkillsReady ? "All steps ready! Click below to save your profile." : "Please select at least 1 skill in Step 2 before saving."}</p>
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {message ? <p className="form-success" role="status">{message}</p> : null}
          <button className="primary-button profile-save-button" type="submit" disabled={isSaving}>
            {isSaving ? "Saving profile…" : "✓ Save Profile & Unlock App"}
          </button>
        </section>
      </form>

      {!setupRequired ? (
        <div className="profile-context-settings">
          <details className="profile-secondary-settings">
            <summary>Subscription</summary>
            <section className="profile-settings-card"><p className="card-eyebrow">Current plan</p><h2>Free assignment demo</h2><p>Manual planning remains unlimited. AI assistance stays optional and uses free routes only.</p></section>
          </details>
          <details className="profile-secondary-settings">
            <summary>AI settings</summary>
            <section className="profile-settings-card ai-settings-card">
            <label className="toggle-field"><input type="checkbox" checked={useOwnKey} onChange={(event) => setUseOwnKey(event.target.checked)} /><span>Use my own AI key for this session</span></label>
            <div className="guided-field-grid"><label><span>OpenRouter API key</span><input disabled={!useOwnKey} type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} /></label><label><span>Model ID</span><input disabled={!useOwnKey} value={model} onChange={(event) => setModel(event.target.value)} /></label></div>
            <p className="ai-security-note">This key stays in this browser session and is never stored with your profile.</p>
            </section>
          </details>
        </div>
      ) : null}
    </section>
  );
}
