import { Check, X } from "lucide-react";

export function SubscriptionComparisonValue({
  className,
  value,
}: {
  className: string;
  value: string;
}) {
  if (value === "Included") {
    return (
      <span
        aria-label="Included"
        className={`${className} ${className}--included`}
        role="img"
      >
        <Check aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    );
  }

  if (value === "—") {
    return (
      <span
        aria-label="Not included"
        className={`${className} ${className}--not-included`}
        role="img"
      >
        <X aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }

  return value;
}
