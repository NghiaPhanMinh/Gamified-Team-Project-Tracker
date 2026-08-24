import { useState } from "react";
import { FrameworkLibrary } from "../frameworks/FrameworkLibrary";
import type { BuiltInFramework } from "../../data/frameworks";

export function ResourcesPage() {
  const [frameworkSeed, setFrameworkSeed] = useState<BuiltInFramework | null>(null);

  return (
    <section className="resources-page" aria-labelledby="resources-title" style={{ width: "min(100%, 1180px)", margin: "0 auto" }}>
      <header className="focused-page-heading">
        <div>
          <p className="kicker">Frameworks &amp; Guidance</p>
          <h1 className="display-heading" id="resources-title">Resources &amp; Framework Library</h1>
          <p>Explore built-in methodology templates, phase structures, and project workflow guidance.</p>
        </div>
      </header>

      <div className="resources-content-body" style={{ marginTop: "1.5rem" }}>
        <FrameworkLibrary onDuplicate={setFrameworkSeed} />
      </div>
    </section>
  );
}
