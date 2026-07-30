import { useState } from "react";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({
  className = "",
  compact = false,
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`brand-logo-fallback ${className}`.trim()}>
        MayLamDi
      </span>
    );
  }

  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/assets/maylamdi-logo.png"
      alt="MayLamDi logo"
      width={compact ? 48 : 180}
      height={compact ? 48 : 180}
      onError={() => setFailed(true)}
    />
  );
}
