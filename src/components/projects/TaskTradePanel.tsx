import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";

export function TaskTradePanel({ projectId }: { projectId: Id<"projects"> }) {
  const workspace = useQuery(api.tasks.getWorkspace, { projectId });
  const data = useQuery(api.taskTrades.listForProject, { projectId });
  const requestTrade = useMutation(api.taskTrades.request);
  const resolveTrade = useMutation(api.taskTrades.resolve);
  const [taskId, setTaskId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!workspace || !data) return null;
  const myTradeableTasks = workspace.tasks.filter((task) =>
    task.primaryOwnerProfileId === workspace.currentProfileId &&
    task.acceptanceStatus === "accepted" &&
    !task.isOpenForClaiming &&
    ["todo", "in_progress", "blocked", "changes_requested"].includes(task.status),
  );
  const recipients = workspace.members.filter((member) => member.profileId !== workspace.currentProfileId);

  async function submitRequest() {
    if (!taskId || !recipientId) return;
    setError(null); setIsSaving(true);
    try {
      await requestTrade({ taskId: taskId as Id<"tasks">, requestedToProfileId: recipientId as Id<"userProfiles">, message: message || undefined });
      setTaskId(""); setRecipientId(""); setMessage("");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The trade request could not be sent."));
    } finally { setIsSaving(false); }
  }

  async function resolve(tradeId: Id<"taskTrades">, decision: "accepted" | "declined" | "cancelled") {
    setError(null); setIsSaving(true);
    try { await resolveTrade({ tradeId, decision }); }
    catch (caughtError) { setError(getErrorMessage(caughtError, "The trade request could not be updated.")); }
    finally { setIsSaving(false); }
  }

  return (
    <details className="task-trade-panel">
      <summary>Task trades {data.trades.some((trade) => trade.status === "pending" && trade.requestedToProfileId === data.currentProfileId) ? "· action needed" : ""}</summary>
      <div className="trade-request-form">
        <label><span>My task</span><select value={taskId} onChange={(event) => setTaskId(event.target.value)}><option value="">Choose task</option>{myTradeableTasks.map((task) => <option key={task._id} value={task._id}>{task.title}</option>)}</select></label>
        <label><span>Ask teammate</span><select value={recipientId} onChange={(event) => setRecipientId(event.target.value)}><option value="">Choose teammate</option>{recipients.map((member) => <option key={member.profileId} value={member.profileId}>{member.displayName}</option>)}</select></label>
        <label className="trade-message"><span>Message (optional)</span><input maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Why would this work better?" /></label>
        <button className="secondary-button" type="button" disabled={isSaving || !taskId || !recipientId} onClick={() => void submitRequest()}>Request trade</button>
      </div>
      {data.trades.length ? <ul className="trade-list">{data.trades.map((trade) => (
        <li key={trade._id}>
          <div><strong>{trade.taskTitle}</strong><span>{trade.requesterName} → {trade.recipientName} · {trade.status}</span>{trade.message ? <p>{trade.message}</p> : null}</div>
          {trade.status === "pending" && trade.requestedToProfileId === data.currentProfileId ? <div><button className="primary-button" type="button" disabled={isSaving} onClick={() => void resolve(trade._id, "accepted")}>Accept trade</button><button className="quiet-button" type="button" disabled={isSaving} onClick={() => void resolve(trade._id, "declined")}>Decline</button></div> : null}
          {trade.status === "pending" && trade.requestedByProfileId === data.currentProfileId ? <button className="quiet-button" type="button" disabled={isSaving} onClick={() => void resolve(trade._id, "cancelled")}>Cancel request</button> : null}
        </li>
      ))}</ul> : <p>No trade requests yet.</p>}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </details>
  );
}
