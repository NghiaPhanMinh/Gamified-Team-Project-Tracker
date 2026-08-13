import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";

type DailyEvidenceFeedProps = {
  projectId: Id<"projects">;
};

export function DailyEvidenceFeed({ projectId }: DailyEvidenceFeedProps) {
  const posts = useQuery((api as any).daily.listForProject, { projectId });
  const postMutation = useMutation((api as any).daily.postDailyEvidence);

  const [text, setText] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedText = text.trim();
  const wordCount = trimmedText.length > 0 ? trimmedText.split(/\s+/).filter(Boolean).length : 0;
  const imageCount = imageUrls.length;

  // Validation rule: At least 20 words OR at least 2 pictures attached
  const isValidSubmission = wordCount >= 20 || imageCount >= 2;

  function handleAddImage() {
    const trimmed = imageInput.trim();
    if (!trimmed) return;
    setImageUrls((current) => [...current, trimmed]);
    setImageInput("");
  }

  function handleRemoveImage(index: number) {
    setImageUrls((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text && imageUrls.length === 0) return;

    setError(null);
    setIsPosting(true);

    try {
      await postMutation({
        projectId,
        text,
        imageUrls,
      });
      setText("");
      setImageInput("");
      setImageUrls([]);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Failed to post daily evidence."));
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <section className="daily-evidence-feed" aria-labelledby="daily-feed-title">
      <header className="daily-feed-header">
        <div>
          <p className="kicker">Daily Goblin Defense</p>
          <h3 className="display-heading" id="daily-feed-title">Team Daily Evidence Feed</h3>
          <p className="daily-feed-guidance">
            Post your daily work updates to slay your daily goblin. Minimum requirement to defeat today’s goblin: <strong>at least 20 words of text OR 2 pictures attached</strong>.
          </p>
        </div>
      </header>

      {/* New Post Form */}
      <form className="daily-post-form" onSubmit={handleSubmit}>
        <h4>Share Daily Work Evidence</h4>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <label className="daily-text-field">
          <span>Work Description / Progress Notes</span>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you built, researched, or accomplished today (at least 20 words required if no images attached)..."
          />
        </label>

        {/* Live Validation Counters */}
        <div className="daily-validation-status-bar">
          <span className={`validation-counter ${wordCount >= 20 ? "is-valid" : ""}`}>
            📝 {wordCount}/20 words {wordCount >= 20 ? "✓" : ""}
          </span>
          <span className={`validation-counter ${imageCount >= 2 ? "is-valid" : ""}`}>
            🖼️ {imageCount}/2 pictures {imageCount >= 2 ? "✓" : ""}
          </span>
          {isValidSubmission ? (
            <span className="validation-result-badge is-valid-badge">
              ⚔️ Valid Submission — Defeats Today’s Goblin!
            </span>
          ) : (
            <span className="validation-result-badge is-warning-badge">
              ⚠️ Needs 20 words or 2 images to count towards goblin defense
            </span>
          )}
        </div>

        {/* Image Attachment Links Input */}
        <div className="daily-image-input-row">
          <input
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="Paste image URL (e.g. screenshot link)..."
          />
          <button className="secondary-button" type="button" onClick={handleAddImage}>
            Attach image
          </button>
        </div>

        {/* Attached Images List */}
        {imageUrls.length > 0 ? (
          <div className="attached-images-preview">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="attached-image-chip">
                <span>Image {idx + 1}</span>
                <button type="button" onClick={() => handleRemoveImage(idx)}>×</button>
              </div>
            ))}
          </div>
        ) : null}

        <button className="primary-button" type="submit" disabled={isPosting || (!text && imageUrls.length === 0)}>
          {isPosting ? "Posting evidence..." : "Post daily evidence"}
        </button>
      </form>

      {/* Feed List */}
      <div className="daily-feed-list" aria-label="Team daily evidence log">
        <h4 className="feed-list-title">Team Evidence Activity</h4>
        {posts === undefined ? (
          <p>Loading daily evidence feed...</p>
        ) : posts.length === 0 ? (
          <p className="empty-feed-notice">No daily evidence posted yet today. Be the first to post!</p>
        ) : (
          posts.map((post: any) => (
            <article key={post._id} className={`daily-feed-card ${post.isValid ? "feed-card-valid" : "feed-card-invalid"}`}>
              <header className="feed-card-header">
                <span className="feed-author-name">{post.authorName}</span>
                <time className="feed-post-time">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                {post.isValid ? (
                  <span className="feed-status-tag valid-tag">🛡️ Goblin Slayed</span>
                ) : (
                  <span className="feed-status-tag invalid-tag">⚠️ Logged (Short)</span>
                )}
              </header>
              <p className="feed-post-text">{post.text}</p>
              {post.imageUrls && post.imageUrls.length > 0 ? (
                <div className="feed-post-images">
                  {post.imageUrls.map((url: string, idx: number) => (
                    <img key={idx} src={url} alt={`Evidence attachment ${idx + 1}`} className="feed-image-preview" />
                  ))}
                </div>
              ) : null}
              <footer className="feed-card-footer">
                <span>{post.wordCount} words · {post.imageCount} images</span>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
