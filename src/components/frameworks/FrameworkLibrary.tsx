import { useMemo, useState, type CSSProperties } from "react";

import {
  BUILT_IN_FRAMEWORKS,
  type BuiltInFramework,
} from "../../data/frameworks";
import { MAYLAMDI_FRAMEWORK_COLORS } from "../../lib/brandPalette";

type FrameworkLibraryProps = {
  onDuplicate?: (framework: BuiltInFramework) => void;
  hideHeader?: boolean;
};

export function FrameworkLibrary({ onDuplicate, hideHeader = false }: FrameworkLibraryProps) {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState(
    BUILT_IN_FRAMEWORKS[0].id,
  );
  const [query, setQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const selectedFramework =
    BUILT_IN_FRAMEWORKS.find(
      (framework) => framework.id === selectedFrameworkId,
    ) ?? BUILT_IN_FRAMEWORKS[0];
  const phaseNames = useMemo(
    () =>
      new Map(
        selectedFramework.phases.map((frameworkPhase) => [
          frameworkPhase.id,
          frameworkPhase.name,
        ]),
      ),
    [selectedFramework],
  );
  const matchingFrameworks = BUILT_IN_FRAMEWORKS.filter((framework) => {
    const needle = query.trim().toLowerCase();
    return needle === "" || [framework.name, framework.shortName, ...framework.disciplines].some((value) => value.toLowerCase().includes(needle));
  });
  const visibleFrameworks = matchingFrameworks;

  return (
    <section className="framework-library" aria-labelledby="framework-title">
      {!hideHeader ? (
        <div className="framework-library-heading">
          <div>
            <p className="kicker">Seven built-in frameworks</p>
            <h2 className="display-heading" id="framework-title">A strong structure, never a straitjacket.</h2>
            <p>
              Preview typical phases, outputs, skills, dependencies, overlap, and
              review points. Every framework will use the same shared planning
              engine.
            </p>
          </div>
          <span className="version-badge">
            {BUILT_IN_FRAMEWORKS.length} templates · version 1
          </span>
        </div>
      ) : null}

      <div className="framework-library-controls">
        <label><span>Search frameworks or disciplines</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="UX, agile, research…" /></label>
        <span className="version-badge" style={{ margin: 0 }}>{BUILT_IN_FRAMEWORKS.length} templates</span>
      </div>
      <div
        className="framework-picker"
        role="group"
        aria-label="Built-in framework templates"
      >
        {visibleFrameworks.map((framework) => {
          const frameworkIndex = BUILT_IN_FRAMEWORKS.findIndex((item) => item.id === framework.id);
          return (
            <button
              key={framework.id}
              className={`framework-picker-card framework-accent-${framework.accent}`}
              type="button"
              style={{ "--framework-card-color": MAYLAMDI_FRAMEWORK_COLORS[frameworkIndex] } as CSSProperties}
              aria-pressed={framework.id === selectedFramework.id}
              onClick={() => setSelectedFrameworkId(framework.id)}
            >
              <span className="framework-card-number">{String(frameworkIndex + 1).padStart(2, "0")}</span>
              <strong className="framework-card-title">{framework.shortName}</strong>
              <small className="framework-card-meta">
                {framework.phases.length}{" "}
                {framework.phases.length === 1 ? "phase" : "phases"}
                {" · "}{framework.disciplines.slice(0, 2).join(" · ")}
              </small>
            </button>
          );
        })}
      </div>

      <article
        className={`framework-preview framework-accent-${selectedFramework.accent}`}
      >
        <header>
          <div>
            <p className="card-eyebrow">{selectedFramework.shortName}</p>
            <h3>{selectedFramework.name}</h3>
            <p>{selectedFramework.description}</p>
          </div>
          <div className="discipline-tags" aria-label="Useful disciplines">
            {selectedFramework.disciplines.map((discipline) => (
              <span key={discipline}>{discipline}</span>
            ))}
          </div>
        </header>

        <button className="quiet-button framework-detail-toggle" type="button" onClick={() => setShowDetails((current) => !current)}>{showDetails ? "Hide phase details" : "View phase details"}</button>
        {showDetails ? <ol className="framework-phase-list">
          {selectedFramework.phases.map((frameworkPhase, index) => (
            <li key={frameworkPhase.id}>
              <div className="phase-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="phase-details">
                <div className="phase-heading">
                  <h4>{frameworkPhase.name}</h4>
                  <div className="phase-flags">
                    {frameworkPhase.canOverlap ? (
                      <span>Can overlap</span>
                    ) : null}
                    {frameworkPhase.reviewCheckpoint ? (
                      <span>Review point</span>
                    ) : null}
                  </div>
                </div>
                <p>{frameworkPhase.description}</p>
                <div className="phase-meta-grid">
                  <div>
                    <strong>Suggested outputs</strong>
                    <ul>
                      {frameworkPhase.suggestedDeliverables.map(
                        (deliverable) => (
                          <li key={deliverable}>{deliverable}</li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div>
                    <strong>Useful skills</strong>
                    <ul>
                      {frameworkPhase.suggestedSkills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {frameworkPhase.defaultDependencies.length > 0 ? (
                  <p className="dependency-note">
                    Usually follows{" "}
                    {frameworkPhase.defaultDependencies
                      .map(
                        (dependencyId) =>
                          phaseNames.get(dependencyId) ?? dependencyId,
                      )
                      .join(" + ")}
                  </p>
                ) : (
                  <p className="dependency-note">Ready to start independently</p>
                )}
              </div>
            </li>
          ))}
        </ol> : null}

        <div className="framework-preview-note">
          <span>
            Built-in templates stay read-only. Make a team copy when you want
            to rename, reorder, or extend the phases.
          </span>
          <button
            className="primary-button"
            type="button"
            onClick={() => onDuplicate?.(selectedFramework)}
          >
            Copy and customise
          </button>
        </div>
      </article>
    </section>
  );
}
