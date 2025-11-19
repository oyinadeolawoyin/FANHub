import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ReplyItem from "./replyItem";

function ReplyList({ 
  commentId, 
  postId, 
  imageId, 
  videoId, 
  chapterId, 
  storyId,
  tweetId,
  recommendationId, // NEW
  likeComment,
  deleteComment,
  likeLoadingId,
  deletingId,
  contentOwnerId
}) {
  const navigate = useNavigate();
  const [replies, setReplies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const limit = 10;

  useEffect(() => { 
    setPage(1); 
    setReplies([]); // Clear replies when commentId changes
  }, [commentId]);
  
  useEffect(() => { 
    fetchReplies(); 
  }, [page, commentId]);

  async function fetchReplies() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://fanhub-server.onrender.com/api/comments/${commentId}/replies?page=${page}&limit=${limit}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message || "Failed to fetch replies");
        return;
      }

      if (page === 1) {
        setReplies(data.replies || []);
      } else {
        const newReplies = (data.replies || []).filter(
          r => !replies.some(existing => existing.id === r.id)
        );
        setReplies(prev => [...prev, ...newReplies]);
      }

      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLoading(false);
    }
  }

  function handleNewReply(newReply) {
    setReplies(prev => {
      if (prev.some(r => r.id === newReply.id)) return prev;
      return [newReply, ...prev];
    });
  }

  function handleDeleteReply(replyId) {
    setReplies(prev => prev.filter(r => r.id !== replyId));
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <p className="text-destructive text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg animate-fadeIn">
          {error}
        </p>
      )}
      
      {replies.length === 0 && !loading && (
        <p className="text-secondary text-sm italic py-2">No replies yet. Be the first to reply!</p>
      )}

      <div className="space-y-0">
        {replies.map((reply, index) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            commentId={commentId}
            postId={postId}
            imageId={imageId}
            videoId={videoId}
            chapterId={chapterId}
            storyId={storyId}
            tweetId={tweetId}
            recommendationId={recommendationId} // NEW
            onNewReply={handleNewReply}
            onDeleteReply={handleDeleteReply}
            likeComment={likeComment}
            deleteComment={deleteComment}
            likeLoadingId={likeLoadingId}
            deletingId={deletingId}
            contentOwnerId={contentOwnerId}
            level={0}
            maxDepth={2} // 0=reply, 1=nested, 2=flat with @mentions
          />
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 animate-fadeIn" role="status" aria-live="polite">
          <Loader2 className="w-5 h-5 animate-spin text-accent" aria-hidden="true" />
          <span className="text-secondary text-sm">Loading replies...</span>
        </div>
      )}

      {!loading && page < totalPages && (
        <button
          onClick={() => setPage(page + 1)}
          className="mt-3 px-4 py-2 rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all hover:scale-105"
          style={{ 
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: '#ffffff',
            boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)'
          }}
        >
          Show more replies →
        </button>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ReplyList;