import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CommentReplyForm({ 
  commentId, 
  postId, 
  imageId, 
  videoId, 
  chapterId, 
  storyId, 
  tweetId,
  onNewReply 
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);

    try {
      let url = "";

      // Construct URL based on available IDs
      if (postId) {
        url = `https://fanhub-server.onrender.com/api/posts/${postId}/comments/${commentId}/reply`;
      } else if (imageId) {
        url = `https://fanhub-server.onrender.com/api/gallery/images/${imageId}/comments/${commentId}/reply`;
      } else if (videoId) {
        url = `https://fanhub-server.onrender.com/api/gallery/videos/${videoId}/comments/${commentId}/reply`;
      } else if (chapterId) {
        url = `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/comments/${commentId}/reply`;
      }  else if (tweetId) {
        url = `https://fanhub-server.onrender.com/api/tweets/${tweetId}/comments/${commentId}/reply`;
      } else {
        throw new Error("No valid ID provided");
      }

      const body = { content: text };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        onNewReply(data.reply);
        setText("");
      } else {
        alert(data.message || "Failed to post reply");
      }
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="reply-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        disabled={loading}
        rows={3}
      />
      <button type="submit" disabled={loading || !text.trim()}>
        {loading ? "Replying..." : "Reply"}
      </button>
    </form>
  );
}

export default CommentReplyForm;