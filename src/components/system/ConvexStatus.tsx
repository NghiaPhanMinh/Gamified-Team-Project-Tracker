import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";

export function ConvexStatus() {
  const health = useQuery(api.health.check);

  if (health === undefined) {
    return (
      <span className="connection-status is-connecting" role="status">
        <span className="status-dot" aria-hidden="true" />
        Connecting to the shared workspace…
      </span>
    );
  }

  return (
    <span className="connection-status is-connected" role="status">
      <span className="status-dot" aria-hidden="true" />
      Live workspace connected
    </span>
  );
}
