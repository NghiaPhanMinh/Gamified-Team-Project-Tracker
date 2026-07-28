export default function Dragon({ hpPercent = 100, size = 230, className = "" }) {
  const hurt = hpPercent < 45;
  const body = hpPercent <= 0 ? "#787485" : hurt ? "#a84e5b" : "#8e405c";
  return (
    <svg className={`mascot mascot-dragon ${hurt ? "dragon-hurt" : ""} ${className}`} width={size} height={size} viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dragon boss mascot">
      <ellipse cx="130" cy="202" rx="93" ry="10" fill="#33283C" opacity=".11" />
      <path d="M74 97L13 47L31 117L77 127" fill="#C27D55" stroke="#633644" strokeWidth="5" strokeLinejoin="round" />
      <path d="M186 97L247 47L229 117L183 127" fill="#C27D55" stroke="#633644" strokeWidth="5" strokeLinejoin="round" />
      <path d="M74 152C55 169 42 180 20 173C42 199 83 180 95 162" stroke="#633644" strokeWidth="9" strokeLinecap="round" />
      <path d="M90 80C91 50 108 30 130 30C152 30 169 50 170 80V142C170 171 153 188 130 188C107 188 90 171 90 142V80Z" fill={body} stroke="#633644" strokeWidth="5" />
      <circle cx="130" cy="79" r="39" fill="#A95166" stroke="#633644" strokeWidth="5" />
      <path d="M101 58L106 31L124 53M159 58L154 31L136 53" fill="#EDC36B" stroke="#633644" strokeWidth="5" strokeLinejoin="round" />
      <path d="M128 76L179 88L129 104" fill="#C46E5C" stroke="#633644" strokeWidth="5" strokeLinejoin="round" />
      <path d="M114 75L111 84M143 75L146 84" stroke="#2E2637" strokeWidth="6" strokeLinecap="round" />
      <path d="M112 123C123 130 137 130 148 123" stroke="#633644" strokeWidth="5" strokeLinecap="round" />
      <path d="M118 129L122 140L127 131L132 140L137 129" stroke="#FFF4D1" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="130" cy="153" r="9" fill="#EDC36B" opacity={hpPercent > 0 ? 1 : .4} />
    </svg>
  );
}
