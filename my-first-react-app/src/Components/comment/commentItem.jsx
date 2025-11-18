import React, { useState } from "react";
import { useAuth } from "../auth/authContext";
import ReplyList from "./replyList";
import CommentReplyForm from "./commentReplyForm";
import CommentContent from "./commentContent";
import { useNavigate } from "react-router-dom";
import { Heart, MessageSquare, MoreVertical } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function CommentItem({
  comment,
  postId,
  imageId,
  videoId,
  chapterId,
  storyId,
  tweetId,
  recommendationId, // NEW
  setComments,
  likeComment,
  deleteComment,
  likeLoadingId,
  deletingId,
  contentOwnerId
}) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLiked, setLocalLiked] = useState(comment.likes?.length > 0);
  const [localLikeCount, setLocalLikeCount] = useState(comment._count?.likes || 0);
  const navigate = useNavigate();

  const isOwner = comment.user?.username === user?.username || user?.id === contentOwnerId;

  function handleNewReply(reply) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? { 
              ...c, 
              _count: {
                ...c._count,
                replies: (c._count?.replies || 0) + 1
              }
            }
          : c
      )
    );
    setShowReplyForm(false);
    setShowReplies(true);
  }

  async function handleLike() {
    if (isLiking) return;
    
    setIsLiking(true);
    const previousLiked = localLiked;
    const previousCount = localLikeCount;
    
    // Optimistic update
    setLocalLiked(!localLiked);
    setLocalLikeCount(prev => localLiked ? prev - 1 : prev + 1);
    
    try {
      await likeComment(comment.id);
    } catch (error) {
      // Revert on error
      setLocalLiked(previousLiked);
      setLocalLikeCount(previousCount);
    } finally {
      setTimeout(() => setIsLiking(false), 300);
    }
  }

  return (
    <div
      className="comment-item border-b border-border py-4 px-2 animate-fadeIn"
      role="region"
      aria-label={`Comment by ${comment.user?.username}`}
    >
      <div className="flex items-start gap-3">
        {/* Commenter Avatar */}
        <Avatar 
          className="w-11 h-11 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          onClick={() => navigate(`/profile/${comment.user?.username}/${comment.userId}/about`)}
        >
          {comment.user?.img ? (
            <AvatarImage src={comment.user.img} alt={`${comment.user.username}'s avatar`} />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground font-bold">
              {comment.user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <strong
                className="cursor-pointer hover:underline text-theme font-semibold"
                onClick={() => navigate(`/profile/${comment.user?.username}/${comment.userId}/about`)}
              >
                {comment.user?.username}
              </strong>
              
              <span className="text-xs text-secondary">
                {new Date(comment.uploadedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Delete Dropdown */}
            {isOwner && (
              <div className="relative ml-auto">
                <button 
                  aria-label="More options"
                  className="p-1 rounded hover:bg-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent transition-colors"
                  onClick={() => setShowDeleteDropdown(prev => !prev)}
                >
                  <MoreVertical className="w-5 h-5 text-secondary" />
                </button>
                {showDeleteDropdown && (
                  <ul className="absolute right-0 mt-1 w-28 bg-card-theme border border-border rounded shadow-lg z-10 animate-fadeIn">
                    <li>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-hover-bg rounded transition-colors"
                        disabled={deletingId === comment.id}
                        onClick={() => deleteComment(comment.id)}
                      >
                        {deletingId === comment.id ? "Deleting..." : "Delete"}
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Comment Content with Clickable Mentions */}
          <CommentContent 
            content={comment.content} 
            mentions={comment.mentions || []}
            className="mt-2 text-theme leading-relaxed"
          />

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-3 text-sm text-secondary">
            {/* Like Button with Animation */}
            <button
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                localLiked 
                  ? "text-red-500 bg-red-50 dark:bg-red-900/20" 
                  : "hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              } ${isLiking ? 'scale-105' : ''}`}
              onClick={handleLike}
              disabled={likeLoadingId === comment.id || isLiking}
              aria-pressed={localLiked}
            >
              <Heart 
                className={`w-5 h-5 transition-all duration-300 ${
                  localLiked ? 'fill-current scale-110' : ''
                } ${isLiking ? 'animate-ping-once' : ''}`}
                aria-hidden="true" 
              />
              <span className="font-medium">{localLikeCount}</span>
              <span className="sr-only">{localLiked ? "Unlike comment" : "Like comment"}</span>
            </button>

            {/* Reply */}
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent"
              style={{ color: '#3b82f6' }}
              onClick={() => setShowReplyForm(prev => !prev)}
            >
              <MessageSquare className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">{showReplyForm ? 'Cancel' : 'Reply'}</span>
            </button>

            {/* Toggle Replies */}
            {comment._count?.replies > 0 && (
              <button
                className="text-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary transition-colors font-medium"
                onClick={() => setShowReplies(prev => !prev)}
              >
                {showReplies ? "Hide Replies" : `View Replies (${comment._count?.replies})`}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 animate-fadeIn">
              <CommentReplyForm
                commentId={comment.id}
                postId={postId}
                imageId={imageId}
                videoId={videoId}
                chapterId={chapterId}
                storyId={storyId}
                tweetId={tweetId}
                recommendationId={recommendationId} // NEW
                onNewReply={handleNewReply}
              />
            </div>
          )}

          {/* Replies Section */}
          {showReplies && (
            <div className="replies-section mt-4 pl-0">
              <ReplyList
                commentId={comment.id}
                postId={postId}
                imageId={imageId}
                videoId={videoId}
                chapterId={chapterId}
                storyId={storyId}
                tweetId={tweetId}
                recommendationId={recommendationId} // NEW
                likeComment={likeComment}
                deleteComment={deleteComment}
                likeLoadingId={likeLoadingId}
                deletingId={deletingId}
                contentOwnerId={contentOwnerId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentItem;