import { useMemo } from "react";

export function LandscapeSky() {
  // Deterministic seeds for cloud horizontal & vertical offsets per session
  const farClouds = useMemo(() => [
    { id: 1, x: 20, y: 15, scale: 1.1 },
    { id: 2, x: 220, y: 35, scale: 0.85 },
    { id: 3, x: 440, y: 10, scale: 1.0 },
    { id: 4, x: 680, y: 40, scale: 0.9 },
    { id: 5, x: 920, y: 25, scale: 1.15 },
  ], []);

  const nearClouds = useMemo(() => [
    { id: 1, x: 80, y: 20, scale: 1.2 },
    { id: 2, x: 400, y: 45, scale: 0.95 },
    { id: 3, x: 750, y: 15, scale: 1.3 },
  ], []);

  return (
    <>
      {/* Layer 0: Sky Blue Canvas */}
      <div className="landscape-layer layer-0-sky" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          <rect width="1000" height="400" fill="#4ca0fe" />
        </svg>
      </div>

      {/* Layer 1: Far Clouds */}
      <div className="landscape-layer layer-1-far-clouds" aria-hidden="true">
        <div className="cloud-far-wrapper">
          <svg viewBox="0 0 1200 120" width="100%" height="100%">
            {farClouds.map((cloud) => (
              <use
                key={cloud.id}
                href="#cloud-cluster-1"
                x={cloud.x}
                y={cloud.y}
                transform={`scale(${cloud.scale})`}
                opacity="0.65"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Layer 2: Near Clouds */}
      <div className="landscape-layer layer-2-near-clouds" aria-hidden="true">
        <div className="cloud-near-wrapper">
          <svg viewBox="0 0 1200 140" width="100%" height="100%">
            {nearClouds.map((cloud) => (
              <use
                key={cloud.id}
                href="#cloud-cluster-2"
                x={cloud.x}
                y={cloud.y}
                transform={`scale(${cloud.scale})`}
                opacity="0.9"
              />
            ))}
          </svg>
        </div>
      </div>
    </>
  );
}
