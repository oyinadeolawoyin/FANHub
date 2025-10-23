import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CommentForm({ postId, imageId, videoId, chapterId, storyId, tweetId, onNewComment }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");

    try {
      let url = "";

      if (postId) url = `https://fanhub-server.onrender.com/api/posts/${postId}/comment`;
      else if (imageId) url = `https://fanhub-server.onrender.com/api/gallery/images/${imageId}/post-comment`;
      else if (videoId) url = `https://fanhub-server.onrender.com/api/gallery/videos/${videoId}/post-comment`;
      else if (chapterId) url = `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/post-comment`
      else if (tweetId) url = `https://fanhub-server.onrender.com/api/tweets/${tweetId}/comment`
      else throw new Error("No valid ID provided");

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to post comment");
        return;
      }

      onNewComment(data.comment);
      setText("");
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Post Comment"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default CommentForm;