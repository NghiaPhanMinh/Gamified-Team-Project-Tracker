export default function Goblin({ state = "idle", size = 124, className = "" }) {
  return (
    <svg className={`mascot mascot-goblin mascot-${state} ${className}`} width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Goblin mascot">
      <ellipse cx="80" cy="143" rx="45" ry="8" fill="#23362B" opacity=".12" />
      <ellipse cx="45" cy="116" rx="10" ry="21" fill="#74A66F" transform="rotate(20 45 116)" />
      <ellipse cx="115" cy="116" rx="10" ry="21" fill="#74A66F" transform="rotate(-20 115 116)" />
      <rect x="50" y="72" width="60" height="57" rx="20" fill="#78AD72" />
      <ellipse cx="67" cy="135" rx="10" ry="17" fill="#4F805B" />
      <ellipse cx="93" cy="135" rx="10" ry="17" fill="#4F805B" />
      <path d="M39 49C41 31 57 20 80 20C103 20 119 31 121 49V84C121 104 104 117 80 117C56 117 39 104 39 84V49Z" fill="#55935F" />
      <path d="M44 48L21 35L33 70L49 60" fill="#4A8456" stroke="#315D3D" strokeWidth="3" strokeLinejoin="round" />
      <path d="M116 48L139 35L127 70L111 60" fill="#4A8456" stroke="#315D3D" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="63" cy="63" r="11" fill="white" /><circle cx="97" cy="63" r="11" fill="white" />
      <circle cx="65" cy="66" r="4" fill="#202A33" /><circle cx="95" cy="66" r="4" fill="#202A33" />
      <path d="M64 88C72 97 88 97 96 88" stroke="#284A34" strokeWidth="4" strokeLinecap="round" />
      <path d="M73 93L77 87L81 95L85 87L89 93" stroke="#FFF7D6" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
