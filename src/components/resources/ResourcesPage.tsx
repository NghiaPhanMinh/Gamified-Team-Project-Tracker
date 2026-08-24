import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FrameworkLibrary } from "../frameworks/FrameworkLibrary";
import { CustomFrameworkSection } from "../frameworks/CustomFrameworkSection";
import type { BuiltInFramework } from "../../data/frameworks";

export function ResourcesPage() {
  const [frameworkSeed, setFrameworkSeed] = useState<BuiltInFramework | null>(null);
  const rooms = useQuery(api.teams.listMine);
  const activeRoomId = rooms?.[0]?._id;

  return (
    <section className="resources-page" aria-labelledby="resources-title" style={{ width: "100%", margin: "0 auto" }}>
      <header className="focused-page-heading">
        <div>
          <p className="kicker">Frameworks &amp; Guidance</p>
          <h1 className="display-heading" id="resources-title">Resources &amp; Framework Library</h1>
          <p>Explore built-in methodology templates, phase structures, and customize project workflows for your team.</p>
        </div>
      </header>

      <div className="resources-content-body" style={{ marginTop: "1.25rem", display: "grid", gap: "2.5rem" }}>
        <FrameworkLibrary
          onDuplicate={(seed) => {
            setFrameworkSeed(seed);
            setTimeout(() => {
              document.getElementById("customise-framework-section")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          hideHeader
        />

        <div id="customise-framework-section" style={{ paddingTop: "1.5rem", borderTop: "2px dashed color-mix(in srgb, var(--color-text) 22%, transparent)" }}>
          {activeRoomId ? (
            <CustomFrameworkSection
              teamId={activeRoomId}
              currentProfileId={"" as any}
              currentRole="owner"
              seed={frameworkSeed}
              onSeedClosed={() => setFrameworkSeed(null)}
            />
          ) : (
            <section className="custom-framework-section">
              <div className="custom-framework-heading">
                <div>
                  <p className="kicker">Custom Framework Builder</p>
                  <h2 className="display-heading">Customise &amp; Create Framework</h2>
                  <p>Build custom workflow phases or copy built-in templates. Create or join a project room to save team templates.</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
