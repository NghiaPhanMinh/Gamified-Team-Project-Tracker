import { useMemo, useState } from "react";

import { BUILT_IN_FRAMEWORKS } from "../../data/frameworks";

export function FrameworkLibrary() {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState(
    BUILT_IN_FRAMEWORKS[0].id,
  );
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

  return (
    <section className="framework-library" aria-labelledby="framework-title">
      <div className="framework-library-heading">
        <div>
          <p className="kicker">Seven built-in frameworks</p>
          <h2 id="framework-title">A strong structure, never a straitjacket.</h2>
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

      <div
        className="framework-picker"
        role="group"
        aria-label="Built-in framework templates"
      >
        {BUILT_IN_FRAMEWORKS.map((framework, index) => (
          <button
            key={framework.id}
            className={`framework-picker-card framework-accent-${framework.accent}`}
            type="button"
            aria-pressed={framework.id === selectedFramework.id}
            onClick={() => setSelectedFrameworkId(framework.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{framework.shortName}</strong>
            <small>
              {framework.phases.length}{" "}
              {framework.phases.length === 1 ? "phase" : "phases"}
            </small>
          </button>
        ))}
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

        <ol className="framework-phase-list">
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
        </ol>

        <div className="framework-preview-note">
          Built-in templates are read-only starting points. Team-owned custom
          copies will be added in the next framework phase.
        </div>
      </article>
    </section>
  );
}
