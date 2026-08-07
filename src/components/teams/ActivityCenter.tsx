import { useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";

type ActivityCenterProps = {
  teamId: Id<"teams">;
};

function localDateTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function actionGlyph(action: string) {
  if (action.includes("review")) return "✓";
  if (action.includes("evidence")) return "+";
  if (action.includes("task") || action.includes("milestone")) return "◆";
  if (action.includes("project") || action.includes("framework")) return "▣";
  if (action.includes("member") || action.includes("team")) return "●";
  return "✦";
}

export function ActivityCenter({ teamId }: ActivityCenterProps) {
  const unread = useQuery(api.activity.getUnreadSummary, { teamId });
  const { results, status, loadMore } = usePaginatedQuery(
    api.activity.list,
    { teamId },
    { initialNumItems: 12 },
  );
  const markAllRead = useMutation(api.activity.markAllRead);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visibleActivities = unreadOnly
    ? results.filter((activity) => activity.isUnread)
    : results;

  async function handleMarkAllRead() {
    setError(null);
    setIsMarking(true);

    try {
      await markAllRead({ teamId });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Notifications could not be marked as read."));
    } finally {
      setIsMarking(false);
    }
  }

  return (
    <section className="activity-center" aria-labelledby="activity-center-title">
      <button
        className="activity-center-toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <small>Realtime team history</small>
          <strong id="activity-center-title">Activity & notifications</strong>
        </span>
        <span className={unread?.count ? "notification-count has-unread" : "notification-count"}>
          {unread === undefined
            ? "…"
            : unread.count === 0
              ? "All read"
              : `${unread.count}${unread.hasMore ? "+" : ""} new`}
        </span>
      </button>

      {isOpen ? (
        <div className="activity-drawer">
          <div className="activity-controls">
            <label>
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(event) => setUnreadOnly(event.target.checked)}
              />
              Unread only
            </label>
            <button
              className="quiet-button"
              type="button"
              disabled={isMarking || unread?.count === 0}
              onClick={() => void handleMarkAllRead()}
            >
              {isMarking ? "Marking…" : "Mark all read"}
            </button>
          </div>
          <p className="notification-scope-note">
            In-app updates only. MayLamDi does not claim to send email, browser, or phone push notifications.
          </p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {status === "LoadingFirstPage" ? (
            <p className="activity-empty" aria-busy="true">Loading team activity…</p>
          ) : visibleActivities.length === 0 ? (
            <p className="activity-empty">
              {unreadOnly ? "No unread team updates." : "No team activity yet."}
            </p>
          ) : (
            <ol className="activity-list" aria-live="polite">
              {visibleActivities.map((activity) => (
                <li
                  key={activity._id}
                  className={activity.isUnread ? "activity-item is-unread" : "activity-item"}
                >
                  <span className="activity-glyph" aria-hidden="true">
                    {actionGlyph(activity.action)}
                  </span>
                  <div>
                    <div className="activity-item-heading">
                      <strong>{activity.title}</strong>
                      {activity.isUnread ? <span>New</span> : null}
                    </div>
                    <p>{activity.detail}</p>
                    <time dateTime={new Date(activity.createdAt).toISOString()}>
                      {localDateTime(activity.createdAt)}{activity.isOwn ? " · You" : ""}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {!unreadOnly && status === "CanLoadMore" ? (
            <button
              className="secondary-button activity-load-more"
              type="button"
              onClick={() => loadMore(12)}
            >
              Load older activity
            </button>
          ) : null}
          {status === "LoadingMore" ? <p className="activity-loading-more">Loading older activity…</p> : null}
        </div>
      ) : null}
    </section>
  );
}
