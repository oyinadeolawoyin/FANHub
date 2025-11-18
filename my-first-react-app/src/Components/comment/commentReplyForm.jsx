import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { Loader2 } from "lucide-react";
import MentionTextarea from "./mentionTextarea";

function CommentReplyForm({ 
  commentId, 
  postId, 
  imageId, 
  videoId, 
  chapterId, 
  storyId, 
  tweetId,
  recommendationId, // NEW
  onNewReply 
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");

    try {
      let url = "";

      if (postId) 
        url = `https://fanhub-server.onrender.com/api/posts/${postId}/comments/${commentId}/reply`;
      else if (imageId) 
        url = `https://fanhub-server.onrender.com/api/gallery/images/${imageId}/comments/${commentId}/reply`;
      else if (videoId) 
        url = `https://fanhub-server.onrender.com/api/gallery/videos/${videoId}/comments/${commentId}/reply`;
      else if (chapterId) 
        url = `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/comments/${commentId}/reply`;
      else if (tweetId) 
        url = `https://fanhub-server.onrender.com/api/tweets/${tweetId}/comments/${commentId}/reply`;
      else if (recommendationId) // NEW
        url = `https://fanhub-server.onrender.com/api/recommendations/${recommendationId}/comments/${commentId}/reply`;
      else throw new Error("No valid ID provided");

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();

      if (res.status === 500) {
        navigate("/error", {
          state: { message: data.message || "Process failed" },
        });
        return;
      } else if (!res.ok) {
        setError(data.message);
        return;
      }

      // Update user's writing points
      const socialResponse = await fetch(
        `https://fanhub-server.onrender.com/api/users/${user.id}/social/commentpoint`,
        { method: "POST", credentials: "include" }
      );

      if (!socialResponse.ok) {
        const errData = await socialResponse.json();
        setError(errData.message || "Failed to update writing points");
      }

      onNewReply(data.reply);
      setText("");
    } catch (err) {
      navigate("/error", {
        state: {
          message: "Network error: Please check your internet connection.",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 w-full max-w-md p-4 rounded-xl border border-border bg-card-theme"
      aria-label="Reply form"
    >
      <MentionTextarea
        value={text}
        onChange={setText}
        placeholder="Share your thoughts..."
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading || !text.trim()}
        aria-label={loading ? "Posting reply..." : "Post your reply"}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
          loading
            ? "bg-accent/50 cursor-not-allowed text-card-foreground"
            : "bg-accent hover:bg-primary text-card-foreground active:scale-95"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Replying...
          </>
        ) : (
          "Reply"
        )}
      </button>

      {error && (
        <p
          role="alert"
          className="text-destructive text-sm mt-1"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </form>
  );
}

export default CommentReplyForm;