export function LandscapeTerrain() {
  return (
    <>
      {/* Layer 3: Top 1/4 Sky Horizon & Slate Blue Mountain Ridges */}
      <div className="landscape-layer layer-3-hills" aria-hidden="true">
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" width="100%" height="100%">
          <polygon
            points="0,115 90,82 190,105 320,68 450,100 580,62 710,95 840,72 950,90 1000,78 1000,400 0,400"
            fill="#334155"
            opacity="0.85"
          />
          <polygon
            points="0,120 140,102 280,118 410,88 560,110 720,82 890,108 1000,98 1000,400 0,400"
            fill="#1e293b"
          />
        </svg>
      </div>

      {/* Layer 4: Multi-Layered Meadow & Curvy Winding Path */}
      <div className="landscape-layer layer-4-ground" aria-hidden="true">
        <svg viewBox="0 0 1000 400" width="100%" height="100%">
          <defs>
            {/* Subtle 3-blade Grass Tuft Template */}
            <g id="grass-tuft-dark">
              <polygon points="0,0 -2,-9 0,-6" fill="#14532d" />
              <polygon points="0,0 1,-12 3,-8" fill="#166534" />
              <polygon points="0,0 4,-7 5,-3" fill="#14532d" />
            </g>
            <g id="grass-tuft-light">
              <polygon points="0,0 -2,-9 0,-6" fill="#22c55e" />
              <polygon points="0,0 1,-12 3,-8" fill="#4ade80" />
              <polygon points="0,0 4,-7 5,-3" fill="#22c55e" />
            </g>
            {/* Slate Pebble Template */}
            <g id="slate-pebble">
              <ellipse cx="0" cy="0" rx="4" ry="2.2" fill="#334155" />
              <ellipse cx="-1" cy="-0.6" rx="2.5" ry="1.2" fill="#64748b" />
            </g>
          </defs>

          {/* Background Dark Forest Meadow */}
          <rect x="0" y="100" width="1000" height="300" fill="#166534" />

          {/* Midground Rolling Meadow Band */}
          <path d="M0,170 Q260,145 520,175 T1000,165 L1000,400 L0,400 Z" fill="#15803d" />

          {/* Foreground Rich Vibrant Meadow Band */}
          <path d="M0,230 Q280,210 580,240 T1000,225 L1000,400 L0,400 Z" fill="#16a34a" opacity="0.95" />

          {/* --- Curvy Winding Dirt / Cobblestone Pathway --- */}
          {/* Pathway Outer Dirt Foundation */}
          <path
            d="M960,335 Q740,345 550,305 Q430,282 340,290 Q210,295 125,265"
            stroke="#78350f"
            strokeWidth="24"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          {/* Pathway Middle Track */}
          <path
            d="M960,335 Q740,345 550,305 Q430,282 340,290 Q210,295 125,265"
            stroke="#92400e"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />
          {/* Pathway Worn Center Path */}
          <path
            d="M960,335 Q740,345 550,305 Q430,282 340,290 Q210,295 125,265"
            stroke="#b45309"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* Decorative Slate Rocks along the Pathway and Edges */}
          <use href="#slate-pebble" x="150" y="280" />
          <use href="#slate-pebble" x="180" y="272" />
          <use href="#slate-pebble" x="290" y="302" />
          <use href="#slate-pebble" x="315" y="278" />
          <use href="#slate-pebble" x="480" y="318" />
          <use href="#slate-pebble" x="520" y="292" />
          <use href="#slate-pebble" x="680" y="338" />
          <use href="#slate-pebble" x="720" y="325" />
          <use href="#slate-pebble" x="870" y="355" />

          {/* Decorative Grass Tufts (Subtle, Keeping Visual Hierarchy on Characters) */}
          <use href="#grass-tuft-dark" x="80" y="160" />
          <use href="#grass-tuft-dark" x="220" y="185" />
          <use href="#grass-tuft-dark" x="440" y="170" />
          <use href="#grass-tuft-dark" x="760" y="180" />
          <use href="#grass-tuft-light" x="110" y="240" />
          <use href="#grass-tuft-light" x="270" y="225" />
          <use href="#grass-tuft-light" x="390" y="250" />
          <use href="#grass-tuft-light" x="620" y="235" />
          <use href="#grass-tuft-light" x="810" y="245" />
          <use href="#grass-tuft-light" x="930" y="255" />
          <use href="#grass-tuft-light" x="260" y="340" />
          <use href="#grass-tuft-light" x="420" y="350" />
          <use href="#grass-tuft-light" x="650" y="365" />
        </svg>
      </div>
    </>
  );
}
