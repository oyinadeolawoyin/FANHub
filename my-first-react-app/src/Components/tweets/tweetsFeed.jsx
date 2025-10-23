import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";
import { tags } from "../genre/tags";
import Delete from "../delete/delete";

function TweetFeed({ url, single = false }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [trendingTweets, setTrendingTweets] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [showTrending, setShowTrending] = useState(true);

  const [deletingId, setDeletingId] = useState(null);
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("popular");
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState({}); 
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("7d");

  const { id } = useParams();
  const { user } = useAuth();
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const [visibleComments, setVisibleComments] = useState({});

  // Fetch tweets
  useEffect(() => {
    let cancelled = false;
  
    async function fetchTweets() {
      if (loading || !hasMore) return;
      setError("");
      setLoading(true);
  
      try {
        const limit = 2; // number of tweets per page
        const endpoint = single
          ? `${url}/${id}/tweet`
          : `${url}?page=${page}&limit=${limit}&sort=${sort}${
              tag ? `&tag=${encodeURIComponent(tag)}` : ""
            }`;
  
        const response = await fetch(endpoint, {
          credentials: "include",
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          setError(data.message || "Failed to load tweets.");
          return;
        }
        console.log("tweets", data);
        if (single) {
          setTweets([data.tweet || data]);
          setHasMore(false);
        } else {
          const newTweets = data.tweets || data;

          // Create a new object mapping tweetId → boolean (true if in library)
          const libraryState = {};
          newTweets.forEach((t) => {
            libraryState[t.id] = t.library?.length > 0;
          });

          // Merge with previous state
          setLibraryStatus((prev) => ({ ...prev, ...libraryState }));

          if (cancelled) return;
  
          // Avoid duplicates
          setTweets((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const filtered = newTweets.filter((t) => !existingIds.has(t.id));
            return page === 0 ? filtered : [...prev, ...filtered];
          });
  
          if (newTweets.length < limit) setHasMore(false);
        }
      } catch (err) {
        navigate("/error", {
          state: { message: err.message },
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
  
    fetchTweets();
  
    return () => {
      cancelled = true;
    };
  }, [id, single, page, sort, tag]);

  // Fetch trending tweets (only for non-single view)
  useEffect(() => {
    if (single) return; // Don't fetch trending for single tweet view

    async function fetchTrending() {
      setTrendingLoading(true);
    
      try {
        const endpoint = `https://fanhub-server.onrender.com/api/tweets/trending?page=1&limit=5&timeframe=${timeframe}`;
  
        const response = await fetch(endpoint, {
          credentials: "include",
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          console.error("Failed to load trending tweets:", data.message);
          return;
        }
        
        console.log("trending tweets", data);
        setTrendingTweets(data.tweets || []);
        
      } catch (err) {
        console.error("Error fetching trending:", err);
      } finally {
        setTrendingLoading(false);
      }
    }
  
    fetchTrending();
  }, [single, timeframe]);

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setSearchLoading(true);

    try {
        const params = new URLSearchParams({
        query: search,
        page: 1,
        limit: 5,
        });

        const response = await fetch(`https://fanhub-server.onrender.com/api/tweets/search?${params.toString()}`,
        { method: "GET", credentials: "include" });
        const data = await response.json();

        if (response.status === 500) {
            navigate("/error", { state: { message: data.message || "Process failed" } });
            return;
        } else {
            if (!response.ok && response.status !== 500) {
                setError(data.message); 
                return;
            }
        } 

        console.log("data", data);
        setTweets(data.tweets); // replace instead of appending

        
    } catch (err) {
        navigate("/error", { state: { message:  err.message } });
    } finally {
        setSearchLoading(false);
    }
  }
  
  // Infinite scroll
  useEffect(() => {
    if (loading || single) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
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
  }, [loading, hasMore, single]);

  // Like/unlike tweet
  async function likeTweet(e, id) {
    e.preventDefault();
    setError("");
    setLikeLoadingId(id);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/${id}/like/love`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", {
          state: { message: data.message || "Process failed" },
        });
        return;
      } else if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      const liked = data.message === "Liked!";
      const likeData = liked ? 1 : -1;

      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet.id === id
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
      navigate("/error", {
        state: { message: "Network error. Please check your connection." },
      });
    } finally {
      setLikeLoadingId(null);
    }
  }

  // Toggle comments
  function toggleComments(tweetId) {
    setVisibleComments((prev) => ({
      ...prev,
      [tweetId]: !prev[tweetId],
    }));
  }

  // Handle filters
  function handleTagChange(tag) {
    setTag((prev) => (prev === tag ? "" : tag));
    setPage(0);
    setHasMore(true);
    setTweets([]);
  }

  function handleSortChange(e) {
    setSort(e.target.value);
    setPage(0);
    setHasMore(true);
    setTweets([]);
  }

  function handleTimeframeChange(e) {
    setTimeframe(e.target.value);
  }

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

  async function addToLibrary(id) {
    setError("")
    setLibraryLoading(true);

    try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/tweets/${id}/library`, {
        method: "POST",
        credentials: "include",
        });

        const data = await response.json();
        
        if (response.status === 500) {
            navigate("/error", { state: { message: data.message || "Process failed" } });
            return;
        } else {
            if (!response.ok && response.status !== 500) {
                setError(data.message); 
                return;
            }
        } 
        
        setLibraryStatus((prev) => ({
            ...prev,
            [id]: !prev[id], // switch between true and false
        }));
        
    } catch(err) {
        navigate("/error", { state: { message:  err.message } });
    } finally {
        setLibraryLoading(false);
    }
  }

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!tweets.length && !loading) return <p>No tweets yet.</p>;

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* --- Filters Section --- */}
        {!single && (
          <div style={{ marginBottom: "1rem" }}>
            <h3>Filter by Tag</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTagChange(t)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "12px",
                    border: "1px solid gray",
                    backgroundColor: tag === t ? "#007bff" : "transparent",
                    color: tag === t ? "white" : "black",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <h3 style={{ marginTop: "1rem" }}>Sort by</h3>
            <select
              value={sort}
              onChange={handleSortChange}
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid gray",
                cursor: "pointer",
              }}
            >
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
            </select>

            <button onClick={() => navigate("/create-tweet")}>Tweet</button>
            
            <form onSubmit={(e) => handleSearch(e)}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tweets or authors..."
              />
              <button type="submit" disabled={searchLoading}>
                {searchLoading ? "Loading..." : "Search"}
              </button>
            </form>
          </div>
        )}

        {/* --- Tweets --- */}
        {tweets.map((tweet, index) => (
          <div key={tweet.id} style={{ marginBottom: "1rem", border: "1px solid #ddd", padding: "1rem" }}>
            <div>
              <img
                src={tweet.user?.avatar || "/default-avatar.png"}
                alt="avatar"
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
              <strong>{tweet.user?.username || "Unknown"}</strong>
            </div>

            <Link to={`/tweets/${tweet.id}`}>
              <h3 style={{ margin: "0.5rem 0" }}>{tweet.title || "Untitled"}</h3>
            </Link>

            <p>{tweet.content}</p>
            {tweet.media && <p><img src={tweet.media} alt="" /></p>}
            <p>{tweet.tags?.join(", ")}</p>

            <div>
              <button
                onClick={(e) => likeTweet(e, tweet.id)}
                disabled={likeLoadingId === tweet.id}
              >
                {tweet.likedByCurrentUser ? "💔 Unlike" : "❤️ Like"}{" "}
                {tweet._count?.likes || 0}
              </button>
            </div>
            <button onClick={() => toggleComments(tweet.id)}>
              {visibleComments[tweet.id]
                ? `Hide Comments (${tweet._count.comments})`
                : `Show Comments (${tweet._count.comments})`}
            </button>
            {!single && 
              <button
                disabled={libraryLoading === tweet.id}
                onClick={() => addToLibrary(tweet.id)}
              >
                {libraryLoading === tweet.id
                  ? "Loading..."
                  : libraryStatus[tweet.id]
                  ? "❌ Remove from Library"
                  : "📚 Add to Library"
                }
              </button>
            }
            {user.id === tweet.userId && (
              <div>
                <button onClick={() => navigate(`/update-tweet/${tweet.id}`)}>Edit</button>
                <button type="submit" disabled={deletingId === tweet.id}
                  onClick={() => {
                    const confirmed = window.confirm("Are you sure you want to delete this story?");
                    if (confirmed) {
                      handleDelete(tweet.id);
                    }
                  }}
                >
                  {deletingId === tweet.id ? "Loading..." : "Delete" }
                </button>
              </div>
            )}
            {visibleComments[tweet.id] && (
              <section className="comments-section">
                <h3>Comments</h3>
                <CommentList tweetId={tweet.id} contentOwnerId={tweet.userId} />
              </section>
            )}

            {index === tweets.length - 1 && !single && (
              <div ref={observerRef} style={{ height: "1px" }}></div>
            )}
          </div>
        ))}

        {loading && <p>Loading more tweets...</p>}
        {!hasMore && <p style={{ textAlign: "center" }}>No more tweets to show.</p>}
      </div>

      {/* Trending Sidebar - Only show when not single view */}
      {!single && (
        <div style={{ 
          width: "300px", 
          border: "1px solid #ddd", 
          padding: "1rem",
          position: "sticky",
          top: "1rem",
          height: "fit-content"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>🔥 Trending</h3>
            <button 
              onClick={() => setShowTrending(!showTrending)}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {showTrending ? "−" : "+"}
            </button>
          </div>

          {showTrending && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label>Timeframe: </label>
                <select 
                  value={timeframe} 
                  onChange={handleTimeframeChange}
                  style={{
                    padding: "0.3rem",
                    borderRadius: "4px",
                    border: "1px solid gray",
                    cursor: "pointer",
                  }}
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>

              {trendingLoading ? (
                <p>Loading trending...</p>
              ) : trendingTweets.length === 0 ? (
                <p>No trending tweets</p>
              ) : (
                <div>
                  {trendingTweets.map((tweet, idx) => (
                    <div 
                      key={tweet.id} 
                      style={{ 
                        marginBottom: "1rem", 
                        padding: "0.5rem",
                        border: "1px solid #eee",
                        borderRadius: "4px"
                      }}
                    >
                      <Link to={`/tweets/${tweet.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.3rem" }}>
                          #{idx + 1} · @{tweet.user?.username}
                        </div>
                        <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                          {tweet.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.3rem" }}>
                          ❤️ {tweet._count?.likes || 0} · 💬 {tweet._count?.comments || 0}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TweetFeed;