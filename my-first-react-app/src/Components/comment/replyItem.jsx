import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import CommentReplyForm from "./commentReplyForm";
import { useNavigate } from "react-router-dom";

function ReplyItem({ 
  reply, 
  commentId, 
  postId, 
  imageId, 
  videoId, 
  chapterId, 
  storyId, 
  tweetId,
  onNewReply,
  onDeleteReply,
  likeComment,
  deleteComment,
  likeLoadingId,
  deletingId,
  level = 0,
  contentOwnerId
}) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showNestedReplies, setShowNestedReplies] = useState(false);
  const [nestedReplies, setNestedReplies] = useState([]);
  const [replyCount, setReplyCount] = useState(reply._count?.replies || 0);
  const [localLikeCount, setLocalLikeCount] = useState(reply._count?.likes || 0);
  const [localLikes, setLocalLikes] = useState(reply.likes || []);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const marginLeft = level * 2; // Indent based on nesting level
  const isLiked = localLikes.length > 0;
  const isOwner = reply.user?.username === user?.username || user?.id === contentOwnerId;

  // Fetch nested replies when "View Replies" is clicked
  useEffect(() => {
    if (showNestedReplies && page === 1 && nestedReplies.length === 0) {
      fetchNestedReplies();
    }
  }, [showNestedReplies]);

  useEffect(() => {
    if (page > 1) {
      fetchNestedReplies();
    }
  }, [page]);

  async function fetchNestedReplies() {
    try {
      setLoading(true);
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/comments/${reply.id}/replies?page=${page}&limit=${limit}`,
        {
          credentials: "include",
        }
      );
      
      const data = await res.json();

      if (page === 1) {
        setNestedReplies(data.replies || []);
      } else {
        // Filter out duplicates before appending
        const newReplies = (data.replies || []).filter(
          newReply => !nestedReplies.some(existing => existing.id === newReply.id)
        );
        setNestedReplies(prev => [...prev, ...newReplies]);
      }

      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLoading(false);
    }
  }

  function handleNewNestedReply(newReply) {
    // Check if reply already exists before adding
    setNestedReplies(prev => {
      const exists = prev.some(r => r.id === newReply.id);
      if (exists) return prev;
      return [newReply, ...prev];
    });
    setReplyCount(prev => prev + 1);
    setShowReplyForm(false);
    setShowNestedReplies(true);
  }

  function handleDeleteNestedReply(replyId) {
    setNestedReplies(prev => prev.filter(r => r.id !== replyId));
    setReplyCount(prev => Math.max(0, prev - 1));
  }

  function handleToggleReplies() {
    setShowNestedReplies(!showNestedReplies);
  }

  async function handleLike() {
    await likeComment(reply.id);
    
    // Update local state optimistically
    setLocalLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setLocalLikes(isLiked ? [] : [{ id: reply.id, userId: user.id }]);
  }

  async function handleDelete() {
    await deleteComment(reply.id);
    // Notify parent to remove this reply
    if (onDeleteReply) {
      onDeleteReply(reply.id);
    }
  }

  return (
    <div className="reply-item" style={{ marginLeft: `${marginLeft}rem` }}>
      <div className="reply-header" onClick={() => navigate(`/profile/${reply?.user?.username}/${reply?.userId}/about`)}>
        <img
          src={reply.user?.img || "/default-avatar.png"}
          alt={reply.user?.username}
          width={30}
          height={30}
        />
        <strong>{reply.user?.username}</strong>
      </div>
      
      <p><span onClick={() => navigate(`/profile/${reply?.receiver?.username}/${reply?.receiver?.id}/about`)}>{reply?.receiver?.username}</span>{reply.content}</p>
      
      <div className="reply-actions">
        <button 
          onClick={handleLike}
          disabled={likeLoadingId === reply.id}
        >
          {isLiked ? "💔 Unlike" : "❤️ Like"} {localLikeCount}
        </button>
        
        <button onClick={() => setShowReplyForm(!showReplyForm)}>
          {showReplyForm ? "Cancel" : "Reply"}
        </button>
        
        {replyCount > 0 && (
          <button onClick={handleToggleReplies}>
            {showNestedReplies 
              ? "Hide Replies" 
              : `View Replies (${replyCount})`}
          </button>
        )}

        {isOwner && (
          <button 
            onClick={handleDelete}
            disabled={deletingId === reply.id}
            style={{ color: 'red' }}
          >
            {deletingId === reply.id ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <CommentReplyForm
          commentId={reply.id}
          postId={postId}
          imageId={imageId}
          videoId={videoId}
          chapterId={chapterId}
          storyId={storyId}
          tweetId={tweetId}
          onNewReply={handleNewNestedReply}
        />
      )}

      {/* Nested Replies */}
      {showNestedReplies && (
        <div className="nested-replies">
          {loading && <p>Loading replies...</p>}
          
          {nestedReplies.map(nestedReply => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              commentId={commentId}
              postId={postId}
              imageId={imageId}
              videoId={videoId}
              chapterId={chapterId}
              storyId={storyId}
              tweetId={tweetId}
              onNewReply={onNewReply}
              onDeleteReply={handleDeleteNestedReply}
              likeComment={likeComment}
              deleteComment={deleteComment}
              likeLoadingId={likeLoadingId}
              deletingId={deletingId}
              level={level + 1}
              contentOwnerId={contentOwnerId}
            />
          ))}

          {!loading && page < totalPages && (
            <button 
              onClick={() => setPage(page + 1)}
              style={{ marginLeft: `${(level + 1) * 2}rem` }}
            >
              Load more replies
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ReplyItem;