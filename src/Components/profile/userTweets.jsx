// ============================================
// userTweets.jsx - ENHANCED ACTION BUTTONS
// ============================================
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";
import Delete from "../delete/delete";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Heart,
  BookMarked,
  X,
  Edit,
  Trash2,
  MoreVertical,
  Play,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TagFilter from "../tweets/tagFilter";
import "quill/dist/quill.snow.css";
import "../css/quill-theme.css";

function UserTweets() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tweets, setTweets] = useState([]);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleComments, setVisibleComments] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [libraryLoading, setLibraryLoading] = useState(null);
  const [libraryStatus, setLibraryStatus] = useState({});
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [selectedTweet, setSelectedTweet] = useState(null);
  const [showModalComments, setShowModalComments] = useState(false);

  const observerRef = useRef(null);
  const hasFetched = useRef(false);

  // Fetch tweets (pagination)
  useEffect(() => {
    if (!id || loading || !hasMore || isSearchMode) return;

    async function fetchTweets() {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://fanhub-server.onrender.com/api/tweets/${id}?page=${page}&limit=4`,
          { credentials: "include" }
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Something went wrong");
          return;
        }

        const newTweets = data.tweets || [];
        setTweets((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          return [...prev, ...newTweets.filter((t) => !existingIds.has(t.id))];
        });

        const libraryState = {};
        newTweets.forEach((t) => {
          libraryState[t.id] = t.library?.length > 0;
        });
        setLibraryStatus((prev) => ({ ...prev, ...libraryState }));

        if (page >= data.pagination?.totalPages) setHasMore(false);
      } catch (err) {
        navigate("/error", { state: { message: err.message } });
      } finally {
        setLoading(false);
        hasFetched.current = false;
      }
    }

    fetchTweets();
  }, [id, page, isSearchMode, navigate]);

  // Infinite scroll
  useEffect(() => {
    if (loading || !hasMore || isSearchMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) setPage((prev) => prev + 1);
      },
      { threshold: 0.2 }
    );

    const currentTarget = observerRef.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => currentTarget && observer.unobserve(currentTarget);
  }, [loading, hasMore, isSearchMode]);

  // Modal handlers
  function openModal(tweet) {
    setSelectedTweet(tweet);
    setShowModalComments(false);
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    setSelectedTweet(null);
    setShowModalComments(false);
    document.body.style.overflow = "unset";
  }

  async function handleDelete(tweetId) {
    setDeletingId(tweetId);
    try {
      await Delete(`https://fanhub-server.onrender.com/api/tweets/${tweetId}`);
      setTweets((prev) => prev.filter((s) => Number(s.id) !== Number(tweetId)));
      if (selectedTweet?.id === tweetId) closeModal();
    } catch (err) {
      navigate("/error", { state: { message: err.message } });
    } finally {
      setDeletingId(null);
    }
  }

  async function likeTweet(e, tweetId, isModal = false) {
    e?.preventDefault();
    setLikeLoadingId(tweetId);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/${tweetId}/like/love`,
        { method: "POST", credentials: "include" }
      );
      const data = await response.json();
      if (!response.ok) return;

      const liked = data.message === "Liked!";
      const likeData = liked ? 1 : -1;

      setTweets((prev) =>
        prev.map((tweet) =>
          tweet.id === tweetId
            ? {
                ...tweet,
                _count: { ...tweet._count, likes: (tweet._count?.likes || 0) + likeData },
                likedByCurrentUser: liked,
              }
            : tweet
        )
      );

      if (isModal && selectedTweet?.id === tweetId) {
        setSelectedTweet({
          ...selectedTweet,
          _count: {
            ...selectedTweet._count,
            likes: (selectedTweet._count?.likes || 0) + likeData,
          },
          likedByCurrentUser: liked,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoadingId(null);
    }
  }

  async function addToLibrary(tweetId, isModal = false) {
    setLibraryLoading(tweetId);
    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/${tweetId}/library`,
        { method: "POST", credentials: "include" }
      );
      const data = await response.json();
      if (!response.ok) return;

      const newStatus = !libraryStatus[tweetId];
      setLibraryStatus((prev) => ({ ...prev, [tweetId]: newStatus }));

      if (isModal && selectedTweet?.id === tweetId) {
        setSelectedTweet({
          ...selectedTweet,
          library: newStatus ? [{ id: 1 }] : [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLibraryLoading(null);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (tweets) {
      const results = tweets.filter(
        (tweet) =>
          tweet.title.toLowerCase().includes(search.toLowerCase()) ||
          tweet.content.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(results);
      // **Crucially sets search mode to display results**
      setIsSearchMode(true); 
    }
  }

  useEffect(() => {
    if (search.trim() === "") {
      setSearchResults([]);
      // **Crucially resets search mode to show all tweets**
      setIsSearchMode(false); 
    }
  }, [search]);

  if (loading && tweets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tweets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Search Bar (NEW SECTION) */}
      <div className="space-y-4 max-w-4xl mx-auto px-4 sm:px-0">
        <form onSubmit={handleSearch} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tweets by title or content..."
              className="w-full pr-10 bg-card-theme border-theme"
              aria-label="Search posts"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            size="icon"
            className="flex-shrink-0"
            aria-label="Search"
          >
            <Search size={18} />
          </Button>
        </form>
      </div>

      {/* Empty State */}
      {tweets.length === 0 && !loading && (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg sm:text-xl font-semibold text-theme mb-2">
                {isSearchMode ? "No matching tweets" : "No tweets yet"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isSearchMode
                  ? "Try adjusting your search terms"
                  : "This user hasn't posted any tweets yet"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tweets List */}
      <div className="space-y-6 max-w-4xl mx-auto">
      {(isSearchMode ? searchResults : tweets).map((tweet) => {
          const isOwner = user?.id === tweet.userId;

          return (
            <Card
              key={tweet.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-theme bg-card-theme"
            >
              <CardHeader className="pb-3">
                {/* User Info & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={tweet.user.img} alt={tweet.user.username || "User"} />
                      <AvatarFallback
                        className="bg-blue-600 text-white font-bold flex items-center justify-center"
                        style={{ backgroundColor: "#2563eb" }}
                      >
                        {tweet.user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-base text-theme">
                        {tweet.user?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-secondary">
                        <time dateTime={tweet.uploadedAt}>
                          {new Date(tweet.uploadedAt).toLocaleDateString()}
                        </time>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/update-tweet/${tweet.id}`)}
                        className="h-8 px-3 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                        aria-label="Edit tweet"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-secondary hover:text-theme hover:bg-hover-theme"
                          aria-label="Tweet options"
                        >
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card-theme border-theme text-card-text">
                        {isOwner && (
                          <DropdownMenuItem
                            onClick={() => {
                              if (window.confirm("Delete this tweet?")) handleDelete(tweet.id);
                            }}
                            disabled={deletingId === tweet.id}
                            className="text-destructive"
                          >
                            <Trash2 size={16} className="mr-2" />
                            {deletingId === tweet.id ? "Deleting..." : "Delete Tweet"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-theme leading-tight mt-4">
                  {tweet.title || "Untitled"}
                </h2>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quill Content Display */}
                <div 
                  className="ql-editor prose prose-sm sm:prose-base max-w-none"
                  style={{
                    padding: 0,
                    minHeight: 'auto',
                    color: 'var(--foreground-color)',
                  }}
                  dangerouslySetInnerHTML={{ __html: tweet.content }}
                />

                {/* Media Container */}
                {tweet.media && (
                  <div className="relative rounded-xl overflow-hidden border-2 border-theme shadow-lg bg-black/5">
                    {tweet.type === "video" ? (
                      <div className="relative group">
                        <video
                          src={tweet.media}
                          poster={tweet.thumbnail || undefined}
                          controls
                          className="w-full max-h-[500px] object-contain bg-black"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-blue-600/80 flex items-center justify-center">
                            <Play size={32} className="text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={tweet.media}
                        alt={tweet.title || "Tweet image"}
                        className="w-full max-h-[500px] object-contain bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
                        loading="lazy"
                      />
                    )}
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => openModal(tweet)}
                    className="action-btn comment"
                    data-tooltip="View Comments"
                    aria-label={`View ${tweet._count?.comments || 0} comments`}
                  >
                    <MessageCircle size={18} className="icon-animate" />
                    <span className="count-number">{tweet._count?.comments || 0}</span>
                  </button>

                  <button
                    onClick={(e) => likeTweet(e, tweet.id)}
                    disabled={likeLoadingId === tweet.id}
                    className={`action-btn like ${tweet.likedByCurrentUser ? 'liked' : ''} ${likeLoadingId === tweet.id ? 'loading' : ''}`}
                    data-tooltip={tweet.likedByCurrentUser ? "Unlike" : "Like"}
                    aria-label={tweet.likedByCurrentUser ? "Unlike" : "Like"}
                    aria-pressed={tweet.likedByCurrentUser}
                  >
                    <Heart 
                      size={18} 
                      className="icon-animate"
                      fill={tweet.likedByCurrentUser ? "currentColor" : "none"}
                    />
                    <span className="count-number">{tweet._count?.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => addToLibrary(tweet.id)}
                    disabled={libraryLoading === tweet.id}
                    className={`action-btn library ${libraryStatus[tweet.id] ? 'saved' : ''} ${libraryLoading === tweet.id ? 'loading' : ''}`}
                    data-tooltip={libraryStatus[tweet.id] ? "Saved to Library" : "Save to Library"}
                    aria-label={libraryStatus[tweet.id] ? "Remove from library" : "Save to library"}
                    aria-pressed={libraryStatus[tweet.id]}
                  >
                    <BookMarked 
                      size={18} 
                      className="icon-animate"
                      fill={libraryStatus[tweet.id] ? "currentColor" : "none"}
                    />
                    <span className="hidden sm:inline ml-1 text-sm">
                      {libraryStatus[tweet.id] ? "Saved" : "Save"}
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Infinite scroll observer */}
        {!isSearchMode && <div ref={observerRef} style={{ height: "1px" }} />}
        {loading && <p className="text-center text-muted-foreground">Loading more...</p>}
        {!hasMore && tweets.length > 0 && <p className="text-center text-muted-foreground">You've reached the end!</p>}

        {/* NEW: No results message */}
        {isSearchMode && searchResults.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            No tweets found matching your search term.
          </p>
        )}
      </div>

      {/* Fullscreen Modal */}
      {selectedTweet && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-card-theme border-b border-theme">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedTweet.user.img} />
                <AvatarFallback 
                  className="bg-blue-600 text-white font-bold flex items-center justify-center"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {selectedTweet.user.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-theme font-semibold text-base">
                  {selectedTweet.user?.username}
                </span>
                <span className="text-secondary text-xs">
                  <time dateTime={selectedTweet.createdAt}>
                    {new Date(selectedTweet.createdAt).toLocaleDateString()}
                  </time>
                </span>
              </div>
            </div>
            <button
              className="text-secondary hover:text-theme transition-colors"
              onClick={closeModal}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-card-theme">
            {/* Content Card */}
            <Card className="border-theme bg-card-theme mb-3">
              <CardHeader className="pb-3">
                <h2 className="text-2xl font-bold text-theme">{selectedTweet.title}</h2>
              </CardHeader>
              <CardContent className="pt-0">
                <div 
                  className="ql-editor max-w-none"
                  style={{
                    padding: 0,
                    minHeight: 'auto',
                    color: 'var(--foreground-color)',
                    marginBottom: 0,
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedTweet.content }}
                />
              </CardContent>
            </Card>

            {/* Media Card */}
            {selectedTweet.media && selectedTweet.media !== "" && (
              <Card className="border-theme bg-card-theme mb-3 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    {selectedTweet.type === "video" ? (
                      <video
                        key={selectedTweet.id}
                        controls
                        className="w-full max-h-[60vh] object-contain bg-black"
                        preload="metadata"
                        poster={selectedTweet.thumbnail || ""}
                      >
                        <source src={selectedTweet.media} type="video/mp4" />
                        <source src={selectedTweet.media} type="video/webm" />
                        <source src={selectedTweet.media} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        key={selectedTweet.id}
                        src={selectedTweet.media}
                        alt={selectedTweet.title || "Tweet image"}
                        className="w-full max-h-[60vh] object-contain bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
                        loading="eager"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags Card */}
            {selectedTweet.tags && selectedTweet.tags.length > 0 && (
              <Card className="border-theme bg-card-theme mb-3">
                <CardContent className="pt-4">
                  <TagFilter 
                    tags={selectedTweet.tags} 
                    navigateMode={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            {showModalComments && (
              <div className="mt-6 pt-6 border-t border-theme">
                <h3 className="font-bold text-lg mb-4 text-theme flex items-center gap-2">
                  <MessageCircle size={20} />
                  Comments
                </h3>
                <CommentList
                  tweetId={selectedTweet.id}
                  contentOwnerId={selectedTweet.userId}
                />
              </div>
            )}
          </div>

          {/* Enhanced Action Bar */}
          <div className="flex justify-around items-center p-4 border-t border-theme bg-card-theme shadow-lg">
            <button
              onClick={() => setShowModalComments((prev) => !prev)}
              className={`action-btn comment ${showModalComments ? 'success-flash' : ''}`}
              data-tooltip={showModalComments ? "Hide Comments" : "Show Comments"}
              aria-label={showModalComments ? "Hide comments" : "Show comments"}
            >
              <MessageCircle size={22} className="icon-animate" /> 
              <span className="count-number">{selectedTweet._count?.comments || 0}</span>
            </button>

            <button
              onClick={(e) => likeTweet(e, selectedTweet.id, true)}
              disabled={likeLoadingId === selectedTweet.id}
              className={`action-btn like ${selectedTweet.likedByCurrentUser ? 'liked' : ''} ${likeLoadingId === selectedTweet.id ? 'loading' : ''}`}
              data-tooltip={selectedTweet.likedByCurrentUser ? "Unlike" : "Like"}
              aria-label={selectedTweet.likedByCurrentUser ? "Unlike" : "Like"}
              aria-pressed={selectedTweet.likedByCurrentUser}
            >
              <Heart 
                size={22} 
                className="icon-animate"
                fill={selectedTweet.likedByCurrentUser ? "currentColor" : "none"} 
              />
              <span className="count-number">{selectedTweet._count?.likes || 0}</span>
            </button>

            <button
              onClick={() => addToLibrary(selectedTweet.id, true)}
              disabled={libraryLoading === selectedTweet.id}
              className={`action-btn library ${libraryStatus[selectedTweet.id] ? 'saved' : ''} ${libraryLoading === selectedTweet.id ? 'loading' : ''}`}
              data-tooltip={libraryStatus[selectedTweet.id] ? "Saved to Library" : "Save to Library"}
              aria-label={libraryStatus[selectedTweet.id] ? "Remove from library" : "Save to library"}
              aria-pressed={libraryStatus[selectedTweet.id]}
            >
              <BookMarked 
                size={22} 
                className="icon-animate"
                fill={libraryStatus[selectedTweet.id] ? "currentColor" : "none"} 
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTweets;