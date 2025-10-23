import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentItem from "./commentItem";
import CommentForm from "./commentForm";

function CommentList({ postId, imageId, videoId, chapterId, storyId, tweetId, contentOwnerId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const limit = 10;

  // Reset page when content changes
  useEffect(() => {
    setPage(1);
  }, [postId, imageId, videoId, chapterId, tweetId]);

  // Fetch comments when page changes or content changes
  useEffect(() => {
    fetchComments();
  }, [page, postId, imageId, videoId, chapterId, tweetId]);

  async function fetchComments() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(postId && { postId }),
        ...(imageId && { imageId }),
        ...(videoId && { videoId }),
        ...(chapterId && { chapterId }),
        ...(tweetId && { tweetId }),
      });

      const res = await fetch(`https://fanhub-server.onrender.com/api/comments?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      // If page is 1, replace comments (new content or reset)
      // Otherwise, append for pagination
      if (page === 1) {
        setComments(data.comments || []);
      } else {
        // Filter out duplicates before appending
        const newComments = (data.comments || []).filter(
          newComment => !comments.some(existing => existing.id === newComment.id)
        );
        setComments(prev => [...prev, ...newComments]);
      }

      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      navigate("/error", { state: { message: err.message } });
    } finally {
      setLoading(false);
    }
  }

  function handleNewComment(newComment) {
    // Check if comment already exists before adding
    setComments((prev) => {
      const exists = prev.some(c => c.id === newComment.id);
      if (exists) return prev;
      return [newComment, ...prev];
    });
  }

  async function likeComment(commentId) {
    setLikeLoadingId(commentId);
    setError("");

    try {
      let url = "";
      
      if (postId) {
        url = `https://fanhub-server.onrender.com/api/posts/${postId}/comments/${commentId}/like/love`;
      } else if (imageId) {
        url = `https://fanhub-server.onrender.com/api/gallery/images/${imageId}/comments/${commentId}/like/love`;
      } else if (videoId) {
        url = `https://fanhub-server.onrender.com/api/gallery/videos/${videoId}/comments/${commentId}/like/love`;
      } else if (chapterId) {
        url = `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/comments/${commentId}/like/love`;
      } else if (tweetId) {
        url = `https://fanhub-server.onrender.com/api/tweets/${tweetId}/comments/${commentId}/like/love`;
      }
      else {
        throw new Error("No valid ID provided");
      }

      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message);
        return;
      }

      // Determine if liked or unliked
      const liked = data.message === "Liked!";
      const likeData = liked ? 1 : -1;

      // Update comment state
      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id !== commentId) return comment;

          return {
            ...comment,
            _count: {
              ...comment._count,
              likes: (comment._count?.likes || 0) + likeData,
            },
            likes: liked ? [{ id: data.like?.id, userId: user.id }] : [],
          };
        })
      );

      // Give points only when liked
      if (liked) {
        const socialResponse = await fetch(
          `https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!socialResponse.ok) {
          const errData = await socialResponse.json();
          setError(errData.message || "Failed to update like points");
        }
      }
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLikeLoadingId(null);
    }
  }

  async function deleteComment(commentId) {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    setDeletingId(commentId);
    setError("");

    try {
      let url = "";
      
      if (postId) {
        url = `https://fanhub-server.onrender.com/api/posts/${postId}/comments/${commentId}`;
      } else if (imageId) {
        url = `https://fanhub-server.onrender.com/api/gallery/images/${imageId}/comments/${commentId}`;
      } else if (videoId) {
        url = `https://fanhub-server.onrender.com/api/gallery/videos/${videoId}/comments/${commentId}`;
      } else if (chapterId) {
        url = `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/comments/${commentId}`;
      }  else if (tweetId) {
        url = `https://fanhub-server.onrender.com/api/tweets/${tweetId}/comments/${commentId}`;
      } else {
        throw new Error("No valid ID provided");
      }

      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message);
        return;
      }

      // Remove comment from state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="comments-container">
      <CommentForm
        postId={postId}
        imageId={imageId}
        videoId={videoId}
        chapterId={chapterId}
        storyId={storyId}
        tweetId={tweetId}
        onNewComment={handleNewComment}
      />
      {error && <p className="error">{error}</p>}
      {comments.length === 0 && !loading && <p>No comments yet.</p>}
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          postId={postId}
          imageId={imageId}
          videoId={videoId}
          chapterId={chapterId}
          storyId={storyId} 
          tweetId={tweetId}
          setComments={setComments}
          likeComment={likeComment}
          deleteComment={deleteComment}
          likeLoadingId={likeLoadingId}
          deletingId={deletingId}
          contentOwnerId={contentOwnerId}
        />
      ))}

      {loading && <p>Loading comments...</p>}

      {/* Show More Button */}
      {!loading && page < totalPages && (
        <button onClick={() => setPage(page + 1)} className="show-more-btn">
          Show more comments
        </button>
      )}
    </div>
  );
}

export default CommentList;