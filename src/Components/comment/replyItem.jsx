import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import CommentReplyForm from "./commentReplyForm";
import CommentContent from "./commentContent";
import { useNavigate } from "react-router-dom";
import { Heart, MessageSquare, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function ReplyItem({ 
  reply, 
  commentId, 
  postId, 
  imageId, 
  videoId, 
  chapterId, 
  storyId, 
  tweetId,
  recommendationId, // NEW
  onNewReply,
  onDeleteReply,
  likeComment,
  deleteComment,
  likeLoadingId,
  deletingId,
  level = 0,
  contentOwnerId,
  maxDepth = 2
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
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const navigate = useNavigate();

  const isMaxDepth = level >= maxDepth;
  const marginLeft = level * 1.5;
  const isLiked = localLikes.length > 0;
  const isOwner = reply.user?.username === user?.username || user?.id === contentOwnerId;

  // Update replyCount whenever the reply prop changes
  useEffect(() => {
    setReplyCount(reply._count?.replies || 0);
  }, [reply._count?.replies, reply.id]);

  useEffect(() => {
    if (showNestedReplies && page === 1 && nestedReplies.length === 0) {
      fetchNestedReplies();
    }
  }, [showNestedReplies]);

  useEffect(() => {
    if (page > 1) fetchNestedReplies();
  }, [page]);

  async function fetchNestedReplies() {
    try {
      setLoading(true);
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/comments/${reply.id}/replies?page=${page}&limit=10`,
        { credentials: "include" }
      );
      const data = await res.json();
      console.log("Fetched nested replies for reply", reply.id, ":", data);
      
      if (page === 1) {
        setNestedReplies(data.replies || []);
      } else {
        const newReplies = (data.replies || []).filter(
          r => !nestedReplies.some(existing => existing.id === r.id)
        );
        setNestedReplies(prev => [...prev, ...newReplies]);
      }
      
      // Update reply count from server response
      if (data.pagination?.total !== undefined) {
        setReplyCount(data.pagination.total);
      } else if (data.total !== undefined) {
        setReplyCount(data.total);
      }
      
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching nested replies:", err);
      navigate("/error", { state: { message: "Network error" } });
    } finally {
      setLoading(false);
    }
  }

  function handleNewNestedReply(newReply) {
    setNestedReplies(prev => {
      if (prev.some(r => r.id === newReply.id)) return prev;
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

  async function handleLike() {
    if (isLiking) return;
    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = localLikeCount;
    
    // Optimistic update
    setLocalLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setLocalLikes(isLiked ? [] : [{ id: reply.id, userId: user.id }]);

    try {
      await likeComment(reply.id);
    } catch (error) {
      // Revert on error
      setLocalLikeCount(previousCount);
      setLocalLikes(previousLiked ? [{ id: reply.id, userId: user.id }] : []);
    } finally {
      setTimeout(() => setIsLiking(false), 300);
    }
  }

  async function handleDelete() {
    await deleteComment(reply.id);
    if (onDeleteReply) onDeleteReply(reply.id);
  }

  // Debug log to check replyCount
  console.log(`Reply ${reply.id} at level ${level}: replyCount = ${replyCount}, _count.replies = ${reply._count?.replies}`);

  return (
    <div className="reply-item py-3 relative animate-fadeIn">
      {/* Nested reply indicator line */}
      {level > 0 && (
        <div
          className="absolute top-0 left-5 bottom-0 w-[2px] bg-border/40"
          style={{ marginLeft: `${(level - 1) * 1.5}rem` }}
        />
      )}

      <div className="flex items-start gap-3 relative">
        <Avatar
          className="w-9 h-9 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all z-10"
          onClick={() => navigate(`/profile/${reply.user?.username}/${reply.userId}/about`)}
        >
          {reply.user?.img ? (
            <AvatarImage src={reply.user.img} alt={`${reply.user.username} avatar`} />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground font-bold">
              {reply.user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-2 justify-between flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <strong
                className="cursor-pointer hover:underline text-theme text-sm"
                onClick={() => navigate(`/profile/${reply.user?.username}/${reply.userId}/about`)}
              >
                {reply.user?.username}
              </strong>
              <span className="text-xs text-secondary">
                {new Date(reply.uploadedAt).toLocaleDateString()}
              </span>
            </div>

            {isOwner && (
              <div className="relative">
                <button
                  className="p-1 rounded hover:bg-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent transition-colors"
                  onClick={() => setShowDeleteDropdown(prev => !prev)}
                  aria-label="More options"
                >
                  <MoreVertical className="w-4 h-4 text-secondary" />
                </button>
                {showDeleteDropdown && (
                  <ul className="absolute right-0 mt-1 w-28 bg-card-theme border border-border rounded shadow-lg z-20 animate-fadeIn">
                    <li>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-hover-bg rounded transition-colors"
                        disabled={deletingId === reply.id}
                        onClick={handleDelete}
                      >
                        {deletingId === reply.id ? "Deleting..." : "Delete"}
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Content with Clickable Mentions */}
          <CommentContent 
            content={reply.content} 
            mentions={reply.mentions || []}
            className="mt-1 text-theme text-sm break-words leading-relaxed"
          />

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs text-secondary flex-wrap">
            <button
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isLiked 
                  ? "text-red-500 bg-red-50 dark:bg-red-900/20" 
                  : "hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              } ${isLiking ? 'scale-110' : ''}`}
              onClick={handleLike}
              disabled={likeLoadingId === reply.id || isLiking}
            >
              <Heart 
                className={`w-4 h-4 transition-all duration-300 ${
                  isLiked ? 'fill-current scale-110' : ''
                } ${isLiking ? 'animate-ping-once' : ''}`}
              />
              <span className="font-medium">{localLikeCount}</span>
            </button>

            {/* Show Reply button only if not at max depth */}
            {!isMaxDepth && (
              <button
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-secondary transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent"
                style={{ color: '#3b82f6' }}
                onClick={() => setShowReplyForm(prev => !prev)}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">{showReplyForm ? 'Cancel' : 'Reply'}</span>
              </button>
            )}

            {/* View Replies button - Show at ALL levels when replyCount > 0 */}
            {replyCount > 0 && (
              <button
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary transition-colors font-medium"
                onClick={() => setShowNestedReplies(prev => !prev)}
              >
                {isMaxDepth && !showNestedReplies
                  ? `💬 View conversation (${replyCount})`
                  : showNestedReplies 
                    ? "Hide Replies" 
                    : `View Replies (${replyCount})`}
              </button>
            )}
          </div>

          {/* Reply Form - Only show if not at max depth */}
          {showReplyForm && !isMaxDepth && (
            <div className="mt-3 animate-fadeIn">
              <CommentReplyForm
                commentId={reply.id}
                postId={postId}
                imageId={imageId}
                videoId={videoId}
                chapterId={chapterId}
                storyId={storyId}
                tweetId={tweetId}
                recommendationId={recommendationId} // NEW
                onNewReply={handleNewNestedReply}
              />
            </div>
          )}

          {/* Nested Replies */}
          {showNestedReplies && (
            <div className={`replies-section mt-3 ${isMaxDepth ? 'pl-0 border-l-0' : 'pl-3 border-l-2 border-border/30'}`}>
              {loading && <p className="text-xs text-secondary animate-pulse">Loading replies...</p>}
              
              {/* Show info for flattened replies at max depth */}
              {isMaxDepth && nestedReplies.length > 0 && (
                <p className="text-xs text-secondary mb-3 italic">
                  💬 Continuing conversation with @{reply.user?.username}
                </p>
              )}

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
                  recommendationId={recommendationId} // NEW
                  onNewReply={onNewReply}
                  onDeleteReply={handleDeleteNestedReply}
                  likeComment={likeComment}
                  deleteComment={deleteComment}
                  likeLoadingId={likeLoadingId}
                  deletingId={deletingId}
                  level={isMaxDepth ? maxDepth : level + 1}
                  contentOwnerId={contentOwnerId}
                  maxDepth={maxDepth}
                />
              ))}

              {!loading && page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="mt-3 text-xs font-medium hover:underline transition-colors"
                  style={{ color: '#3b82f6' }}
                >
                  Load more replies →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );   
}

export default ReplyItem;