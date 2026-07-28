import { useQuery } from "convex/react";
import { convexApi } from "../lib/convex";

// Convex keeps this query reactive: any verified hit, submission, or deadline
// resolution invalidates the workspace snapshot for every connected teammate.
export function useLiveWorkspace(teamId) {
  return useQuery(convexApi.workspace.get, teamId ? { teamId } : "skip");
}
