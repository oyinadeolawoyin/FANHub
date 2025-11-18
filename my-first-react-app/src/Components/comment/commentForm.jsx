import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import MentionTextarea from "./mentionTextarea";

function CommentForm({
  postId,
  imageId,
  videoId,
  chapterId,
  storyId,
  tweetId,
  recommendationId, // NEW
  onNewComment,
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
        url = `https://fanhub-server.onrender.com/api/posts/${postId}/comment`;
      else if (imageId)
        url = `https://fanhub-server.onrender.com/api/gallery/images/${imageId}/post-comment`;
      else if (videoId)
        url = `https://fanhub-server.onrender.com/api/gallery/videos/${videoId}/post-comment`;
      else if (chapterId)
        url = `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/post-comment`;
      else if (tweetId)
        url = `https://fanhub-server.onrender.com/api/tweets/${tweetId}/comment`;
      else if (recommendationId) // NEW
        url = `https://fanhub-server.onrender.com/api/recommendations/${recommendationId}/comment`;
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

      onNewComment(data.comment);
      setText("");

      const socialResponse = await fetch(
        `https://fanhub-server.onrender.com/api/users/${user.id}/social/commentpoint`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!socialResponse.ok) {
        const errData = await socialResponse.json();
        setError(errData.message || "Failed to update like points");
      }
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
      className="flex flex-col gap-3 w-full max-w-md p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      aria-label="Comment form"
    >
      <MentionTextarea
        value={text}
        onChange={setText}
        placeholder="Share your thoughts..."
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        aria-label={loading ? "Posting comment..." : "Post your comment"}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
          loading
            ? "bg-blue-300 cursor-not-allowed text-white"
            : "bg-blue-400 hover:bg-blue-500 text-white active:scale-95"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Posting...
          </>
        ) : (
          "Comment"
        )}
      </button>

      {error && (
        <p
          role="alert"
          className="text-red-500 text-sm mt-1"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </form>
  );
}

export default CommentForm;