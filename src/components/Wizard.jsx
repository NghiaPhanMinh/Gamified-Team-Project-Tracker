const spellColors = { fire: "#F27A51", ice: "#78B8DE", thunder: "#E4B94E" };

export default function Wizard({ color = "#7761C7", spell = "fire", size = 112, className = "" }) {
  const gem = spellColors[spell] || spellColors.fire;
  return (
    <svg className={`mascot mascot-wizard ${className}`} width={size} height={size} viewBox="0 0 150 170" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Wizard player mascot">
      <ellipse cx="74" cy="158" rx="42" ry="8" fill="#312A45" opacity=".1" />
      <path d="M112 73L125 27" stroke="#725234" strokeWidth="5" strokeLinecap="round" /><circle cx="126" cy="25" r="8" fill={gem} stroke="#725234" strokeWidth="4" />
      <path d="M39 88L109 88L122 151H25L39 88Z" fill={color} stroke="#392E58" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="74" cy="61" r="28" fill="#E6B594" stroke="#654463" strokeWidth="4" />
      <circle cx="64" cy="62" r="3" fill="#332B40" /><circle cx="84" cy="62" r="3" fill="#332B40" />
      <path d="M43 42L74 7L106 42H43Z" fill="#50418A" stroke="#392E58" strokeWidth="4" strokeLinejoin="round" />
      <path d="M74 7C82 14 86 20 85 27" stroke="#D8C7F6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="74" cy="7" r="7" fill="#F0CB62" stroke="#392E58" strokeWidth="3" />
      <path d="M58 79C68 87 80 87 90 79" stroke="#8F4E5B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
