import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReplyItem from "./replyItem";

function ReplyList({ 
  commentId, 
  postId, 
  imageId, 
  videoId, 
  chapterId, 
  storyId,
  tweetId,
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
  const limit = 10;

  // Reset to page 1 when commentId changes
  useEffect(() => {
    setPage(1);
  }, [commentId]);

  // Single useEffect to handle both initial load and pagination
  useEffect(() => {
    fetchReplies();
  }, [commentId, page]);

  async function fetchReplies() {
    try {
      setLoading(true);
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/comments/${commentId}/replies?page=${page}&limit=${limit}`, 
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok && response.status !== 500) {
        console.error("Error fetching replies:", data.message);
        return;
      }
      
      // If page is 1, replace replies (new comment or reset)
      // Otherwise, append for pagination
      if (page === 1) {
        setReplies(data.replies || []);
      } else {
        // Filter out duplicates before appending
        const newReplies = (data.replies || []).filter(
          newReply => !replies.some(existing => existing.id === newReply.id)
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
    // Check if reply already exists before adding
    setReplies(prev => {
      const exists = prev.some(r => r.id === newReply.id);
      if (exists) return prev;
      return [newReply, ...prev];
    });
  }

  function handleDeleteReply(replyId) {
    setReplies(prev => prev.filter(reply => reply.id !== replyId));
  }

  return (
    <div className="replies-container">
      {loading && <p>Loading replies...</p>}
      
      {replies.map(reply => (
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
          onNewReply={handleNewReply}
          onDeleteReply={handleDeleteReply}
          likeComment={likeComment}
          deleteComment={deleteComment}
          likeLoadingId={likeLoadingId}
          deletingId={deletingId}
          contentOwnerId={contentOwnerId}
          level={0}
        />
      ))}

      {!loading && page < totalPages && (
        <button onClick={() => setPage(page + 1)}>
          Load more replies
        </button>
      )}
    </div>
  );
}

export default ReplyList;