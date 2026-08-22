import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getErrorMessage } from "../../lib/errors";
import { CharacterAvatar } from "../common/CharacterAvatar";

type DailyEvidenceFeedProps = {
  projectId: Id<"projects">;
};

export function DailyEvidenceFeed({ projectId }: DailyEvidenceFeedProps) {
  const posts = useQuery(api.daily.listForProject, { projectId });
  const postMutation = useMutation(api.daily.postDailyEvidence);

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
          <div className="daily-feed-title-row">
            <h3 className="display-heading" id="daily-feed-title">Nhật ký Bằng chứng Hàng ngày</h3>
            <span className="read-only-label">LIVE FEED</span>
          </div>
          <p className="daily-feed-requirement">
            <strong>Yêu cầu tối thiểu:</strong> Từ 20 từ trở lên HOẶC đính kèm từ 2 hình ảnh.
          </p>
        </div>
      </header>

      {/* New Post Form */}
      <form className="daily-post-form" onSubmit={handleSubmit}>
        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <label className="daily-text-field">
          <span className="field-label">Mô tả tiến độ / Bằng chứng làm việc</span>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mô tả kết quả công việc hôm nay (ít nhất 20 từ nếu không đính kèm ảnh)..."
          />
        </label>

        {/* Live Validation Counters */}
        <div className="daily-validation-status-bar">
          <span className={`validation-counter ${wordCount >= 20 ? "is-valid" : ""}`}>
            📝 {wordCount}/20 từ {wordCount >= 20 ? "✓" : ""}
          </span>
          <span className={`validation-counter ${imageCount >= 2 ? "is-valid" : ""}`}>
            🖼️ {imageCount}/2 ảnh {imageCount >= 2 ? "✓" : ""}
          </span>
          {isValidSubmission ? (
            <span className="validation-result-badge is-valid-badge">
              ⚔️ Đã đủ điều kiện thủ thành hôm nay!
            </span>
          ) : (
            <span className="validation-result-badge is-warning-badge">
              ⚠️ Cần từ 20 từ hoặc 2 ảnh để hoàn thành thủ thành
            </span>
          )}
        </div>

        {/* Image Attachment Links Input */}
        <div className="daily-image-input-row">
          <input
            className="daily-image-url-input"
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="Dán URL hình ảnh (ví dụ: link minh chứng)..."
          />
          <button className="secondary-button" type="button" onClick={handleAddImage}>
            Đính kèm ảnh
          </button>
        </div>

        {/* Attached Images List */}
        {imageUrls.length > 0 ? (
          <div className="attached-images-preview">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="attached-image-chip">
                <span>Ảnh {idx + 1}</span>
                <button type="button" onClick={() => handleRemoveImage(idx)} aria-label={`Xóa ảnh ${idx + 1}`}>×</button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="daily-form-actions">
          <button className="primary-button" type="submit" disabled={isPosting || (!text && imageUrls.length === 0)}>
            {isPosting ? "Đang đăng bằng chứng..." : "Đăng bằng chứng"}
          </button>
        </div>
      </form>

      {/* Feed List */}
      <div className="daily-feed-list" aria-label="Team daily evidence log">
        <h4 className="feed-list-title">Hoạt động bằng chứng nhóm</h4>
        {posts === undefined ? (
          <p>Đang tải nhật ký bằng chứng...</p>
        ) : posts.length === 0 ? (
          <p className="empty-feed-notice">Chưa có bằng chứng nào được đăng hôm nay. Hãy là người đầu tiên đăng!</p>
        ) : (
          posts.map((post) => (
            <article key={post._id} className={`daily-feed-card ${post.isValid ? "feed-card-valid" : "feed-card-invalid"}`}>
              <header className="feed-card-header">
                <CharacterAvatar
                  fill={post.authorFill}
                  outline={post.authorOutline}
                  spellType={post.authorSpellType}
                  name={post.authorName}
                  size="sm"
                />
                <span className="feed-author-name">{post.authorName}</span>
                <time className="feed-post-time">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                {post.isValid ? (
                  <span className="feed-status-tag valid-tag">🛡️ Đã hạ Goblin</span>
                ) : (
                  <span className="feed-status-tag invalid-tag">⚠️ Đã ghi nhận (Ngắn)</span>
                )}
              </header>
              <p className="feed-post-text">{post.text}</p>
              {post.imageUrls && post.imageUrls.length > 0 ? (
                <div className="feed-post-images">
                  {post.imageUrls.map((url: string, idx: number) => (
                    <img key={idx} src={url} alt={`Minh chứng ${idx + 1}`} className="feed-image-preview" />
                  ))}
                </div>
              ) : null}
              <footer className="feed-card-footer">
                <span>{post.wordCount} từ · {post.imageCount} hình ảnh</span>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
