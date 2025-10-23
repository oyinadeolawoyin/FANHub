import React, { useState } from "react";
import { useAuth } from "../auth/authContext";
import ReplyList from "./replyList";
import CommentReplyForm from "./commentReplyForm";
import { useNavigate } from "react-router-dom";

function CommentItem({
  comment,
  postId,
  imageId,
  videoId,
  chapterId,
  storyId,
  tweetId,
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
  const navigate = useNavigate();

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

  const isLiked = comment.likes?.length > 0;
  const isOwner = comment.user?.username === user?.username || user?.id === contentOwnerId;

  return (
    <div className="comment-item">
      <div className="comment-header" onClick={() => navigate(`/profile/${comment?.user?.username}/${comment?.userId}/about`)}>
        <img
          src={comment.user?.img || "/default-avatar.png"}
          alt={comment.user?.username}
          width={35}
          height={35}
        />
        <strong>{comment.user?.username}</strong>
      </div>

      <p><span onClick={() => navigate(`/profile/${comment?.receiver?.username}/${comment?.receiver?.id}/about`)}>{comment?.receiver?.username}</span>{comment.content}</p>

      <div className="comment-actions">
        <button 
          onClick={() => likeComment(comment.id)}
          disabled={likeLoadingId === comment.id}
        >
          {isLiked ? "💔 Unlike" : "❤️ Like"} {comment._count?.likes || 0}
        </button>
        
        <button onClick={() => setShowReplyForm(!showReplyForm)}>
          {showReplyForm ? "Cancel Reply" : "Reply"}
        </button>
        
        <button onClick={() => setShowReplies((prev) => !prev)}>
          {showReplies
            ? "Hide Replies"
            : `View Replies (${comment._count?.replies || 0})`}
        </button>

        {isOwner && (
          <button 
            onClick={() => deleteComment(comment.id)}
            disabled={deletingId === comment.id}
            style={{ color: 'red' }}
          >
            {deletingId === comment.id ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <CommentReplyForm
          commentId={comment.id}
          postId={postId}
          imageId={imageId}
          videoId={videoId}
          chapterId={chapterId}
          storyId={storyId}
          tweetId={tweetId}
          onNewReply={handleNewReply}
        />
      )}

      {/* Replies Section */}
      {showReplies && (
        <div className="replies-section">
          <ReplyList 
            commentId={comment.id}
            postId={postId}
            imageId={imageId}
            videoId={videoId}
            chapterId={chapterId}
            storyId={storyId}
            tweetId={tweetId}
            likeComment={likeComment}
            deleteComment={deleteComment}
            likeLoadingId={likeLoadingId}
            deletingId={deletingId}
            contentOwnerId={contentOwnerId}
          />
        </div>
      )}
    </div>
  );
}

export default CommentItem;