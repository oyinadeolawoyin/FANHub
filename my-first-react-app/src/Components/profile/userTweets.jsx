import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";
import Delete from "../delete/delete";

function UserTweets() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [tweets, setTweets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleComments, setVisibleComments] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [libraryLoading, setLibraryLoading] = useState(null);
  const [libraryStatus, setLibraryStatus] = useState({});
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const observerRef = useRef(null);

  // Fetch tweets with pagination
  useEffect(() => {
    if (!id || loading || !hasMore || isSearchMode) return;

    async function fetchTweets() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://fanhub-server.onrender.com/api/tweets/${id}?page=${page}&limit=10`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (response.status === 500) {
          navigate("/error", { state: { message: data.message || "Process failed" } });
          return;
        }
        
        if (!response.ok) {
          setError(data.message || "Something went wrong");
          return;
        }

        const newTweets = data.tweets || [];
        setTweets((prev) => [...prev, ...newTweets]);

        // Update library status
        const libraryState = {};
        newTweets.forEach((t) => {
          libraryState[t.id] = t.library?.length > 0;
        });
        setLibraryStatus((prev) => ({ ...prev, ...libraryState }));

        // Check if we've reached the end
        if (page >= data.pagination?.totalPages) {
          setHasMore(false);
        }
      } catch (err) {
        navigate("/error", { state: { message: err.message } });
      } finally {
        setLoading(false);
      }
    }

    fetchTweets();
  }, [id, page, isSearchMode, hasMore, loading, navigate]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore || isSearchMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.2 }
    );

    const currentTarget = observerRef.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [loading, hasMore, isSearchMode]);

  // Toggle comments visibility
  function toggleComments(tweetId) {
    setVisibleComments((prev) => ({
      ...prev,
      [tweetId]: !prev[tweetId],
    }));
  }

  // Delete tweet
   async function handleDelete(id) {
    setDeletingId(id);
    try{
        await Delete(`https://fanhub-server.onrender.com/api/tweets/${id}`);
        setTweets(prev => prev.filter(s => Number(s.id) !== Number(id)));
    } catch(err) {
        navigate("/error", { state: { message:  err.message } });
    } finally {
        setDeletingId(null);
    }
  }

  // Search tweets
  async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;

    setError("");
    setSearchLoading(true);
    setIsSearchMode(true);

    try {
      const params = new URLSearchParams({
        query: search,
        page: 1,
        limit: 20,
      });

      const response = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/search?${params.toString()}`,
        { method: "GET", credentials: "include" }
      );

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Search failed" } });
        return;
      }

      if (!response.ok) {
        setError(data.message || "Search failed");
        return;
      }

      setTweets(data.tweets || []);
      setHasMore(false); // Disable pagination in search mode
    } catch (err) {
      navigate("/error", { state: { message: err.message } });
    } finally {
      setSearchLoading(false);
    }
  }

  // Clear search and reset
  function clearSearch() {
    setSearch("");
    setIsSearchMode(false);
    setTweets([]);
    setPage(1);
    setHasMore(true);
    setError("");
  }

  // Like/unlike tweet
  async function likeTweet(e, tweetId) {
    e.preventDefault();
    setError("");
    setLikeLoadingId(tweetId);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/${tweetId}/like/love`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Like failed" } });
        return;
      }

      if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      const liked = data.message === "Liked!";
      const likeData = liked ? 1 : -1;

      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet.id === tweetId
            ? {
                ...tweet,
                _count: {
                  ...tweet._count,
                  likes: (tweet._count?.likes || 0) + likeData,
                },
                likedByCurrentUser: liked,
              }
            : tweet
        )
      );

      // Update social points if liked
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
          console.error("Failed to update like points:", errData.message);
        }
      }
    } catch (err) {
      navigate("/error", { state: { message: "Network error. Please check your connection." } });
    } finally {
      setLikeLoadingId(null);
    }
  }

  // Add/remove from library
  async function addToLibrary(tweetId) {
    setError("");
    setLibraryLoading(tweetId);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/${tweetId}/library`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Library update failed" } });
        return;
      }

      if (!response.ok) {
        setError(data.message || "Failed to update library");
        return;
      }

      setLibraryStatus((prev) => ({
        ...prev,
        [tweetId]: !prev[tweetId],
      }));
    } catch (err) {
      navigate("/error", { state: { message: err.message } });
    } finally {
      setLibraryLoading(null);
    }
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Tweets</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tweets or authors..."
          style={{ padding: "0.5rem", marginRight: "0.5rem", width: "300px" }}
        />
        <button type="submit" disabled={searchLoading || !search.trim()}>
          {searchLoading ? "Searching..." : "Search"}
        </button>
        {isSearchMode && (
          <button
            type="button"
            onClick={clearSearch}
            style={{ marginLeft: "0.5rem" }}
          >
            Clear Search
          </button>
        )}
      </form>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Empty State */}
      {tweets.length === 0 && !loading && (
        <p>{isSearchMode ? "No tweets found." : "No tweets yet."}</p>
      )}

      {/* Tweets List */}
      {tweets.map((tweet) => (
        <div
          key={tweet.id}
          style={{
            border: "1px solid #ddd",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
          }}
        >
          {/* User Info */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <img
              src={tweet.user?.avatar || "/default-avatar.png"}
              alt="avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "0.5rem" }}
            />
            <strong>{tweet.user?.username || "Unknown"}</strong>
          </div>

          {/* Tweet Content */}
          <Link to={`/tweets/${tweet.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <h3 style={{ margin: "0.5rem 0" }}>{tweet.title || "Untitled"}</h3>
          </Link>

          <p>{tweet.content}</p>

          {/* Media */}
          {tweet.media && (
            <img
              src={tweet.media}
              alt="tweet media"
              style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
            />
          )}

          {/* Tags */}
          {tweet.tags && tweet.tags.length > 0 && (
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              {tweet.tags.join(", ")}
            </p>
          )}

          {/* Actions */}
          <div style={{ marginTop: "0.5rem" }}>
            <button
              onClick={(e) => likeTweet(e, tweet.id)}
              disabled={likeLoadingId === tweet.id}
              style={{ marginRight: "0.5rem" }}
            >
              {tweet.likedByCurrentUser ? "💔 Unlike" : "❤️ Like"}{" "}
              ({tweet._count?.likes || 0})
            </button>

            <button
              onClick={() => toggleComments(tweet.id)}
              style={{ marginRight: "0.5rem" }}
            >
              {visibleComments[tweet.id]
                ? `Hide Comments (${tweet._count?.comments || 0})`
                : `Show Comments (${tweet._count?.comments || 0})`}
            </button>

            <button
              disabled={libraryLoading === tweet.id}
              onClick={() => addToLibrary(tweet.id)}
              style={{ marginRight: "0.5rem" }}
            >
              {libraryLoading === tweet.id
                ? "Loading..."
                : libraryStatus[tweet.id]
                ? "❌ Remove from Library"
                : "📚 Add to Library"}
            </button>

            {/* Edit/Delete (only for tweet owner) */}
            {user?.id === tweet.userId && (
              <>
                <button
                  onClick={() => navigate(`/update-tweet/${tweet.id}`)}
                  style={{ marginRight: "0.5rem" }}
                >
                  Edit
                </button>
                <button
                  disabled={deletingId === tweet.id}
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Are you sure you want to delete this tweet?"
                    );
                    if (confirmed) {
                      handleDelete(tweet.id);
                    }
                  }}
                >
                  {deletingId === tweet.id ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>

          {/* Comments Section */}
          {visibleComments[tweet.id] && (
            <section style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
              <h3>Comments</h3>
              <CommentList tweetId={tweet.id} contentOwnerId={tweet.userId} />
            </section>
          )}
        </div>
      ))}

      {/* Infinite Scroll Observer */}
      {!isSearchMode && <div ref={observerRef} style={{ height: "1px" }} />}

      {/* Loading State */}
      {loading && <p>Loading more tweets...</p>}

      {/* End of List */}
      {!hasMore && tweets.length > 0 && !isSearchMode && <p>No more tweets.</p>}
    </div>
  );
}

export default UserTweets;