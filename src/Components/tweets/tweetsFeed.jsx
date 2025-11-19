import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";
import { tags } from "../genre/tags";
import Delete from "../delete/delete";
import Header from "../css/header";
import { useToast, useConfirm, Toast, ConfirmDialog } from "../utils/toast-modal";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Filter,
  MoreVertical,
  Heart,
  MessageSquare,
  BookMarked,
  Edit,
  Trash2,
  Flame,
  TrendingUp,
  Search,
  X,
  Play,
} from "lucide-react";
import "quill/dist/quill.snow.css";
import "../css/quill-theme.css";

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
  const [likeLoadingId, setLikeLoadingId] = useState(null);

  // Modal state
  const [selectedTweet, setSelectedTweet] = useState(null);
  const [showModalComments, setShowModalComments] = useState(false);

  // Toast and Confirm hooks
  const { toast, showToast, closeToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Handle tag from URL
  useEffect(() => {
    const urlTag = searchParams.get("tag") || "";
    setTag(urlTag);
    setPage(0);
    setHasMore(true);
    setTweets([]);
  }, [searchParams]);

  // Reset pagination when filters change
  useEffect(() => {
    setTweets([]);
    setPage(0);
    setHasMore(true);
  }, [tag, sort, id]);

  // Fetch tweets
  useEffect(() => {
    let cancelled = false;
    async function fetchTweets() {
      setError("");
      setLoading(true);
      try {
        const limit = 10;
        const endpoint = single
          ? `${url}/${id}/tweet`
          : `${url}?page=${page}&limit=${limit}&sort=${sort}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`;
        const response = await fetch(endpoint, { credentials: "include" });
        const data = await response.json();
        if (!response.ok) return setError(data.message || "Failed to load tweets.");
        if (single) {
          setTweets([data.tweet || data]);
          setHasMore(false);
          const tweet = data.tweet || data;
          setLibraryStatus({ [tweet.id]: tweet.library?.length > 0 });
        } else {
          const newTweets = data.tweets || data;
          if (!cancelled) {
            setTweets((prev) => (page === 0 ? newTweets : [...prev, ...newTweets]));
            const libraryState = {};
            newTweets.forEach((t) => {
              libraryState[t.id] = t.library?.length > 0;
            });
            setLibraryStatus((prev) => ({ ...prev, ...libraryState }));
            
            if (newTweets.length < limit) setHasMore(false);
          }
        }
      } catch (err) {
        navigate("/error", { state: { message: err.message } });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (hasMore) fetchTweets();
    return () => (cancelled = true);
  }, [page, tag, sort, id]);

  // Fetch trending
  useEffect(() => {
    if (single) return;
    async function fetchTrending() {
      setTrendingLoading(true);
      try {
        const res = await fetch(
          `https://fanhub-server.onrender.com/api/tweets/trending?limit=5&timeframe=${timeframe}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (res.ok) setTrendingTweets(data.topics.tweets || []);
      } catch (err) {
        console.error("Trending fetch failed:", err);
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrending();
  }, [single, timeframe]);

  // Infinite scroll
  useEffect(() => {
    if (loading || single) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
      },
      { threshold: 0.2 }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => el && observer.unobserve(el);
  }, [loading, hasMore, single]);

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

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (!selectedTweet) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedTweet]);

  // Like - FIXED
  async function likeTweet(e, tweetId, isModal = false) {
    if (e) e.preventDefault();
    setLikeLoadingId(tweetId);
    try {
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/${tweetId}/like/love`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to like tweet", "error");
        return;
      }
      const liked = data.message === "Liked!";
      const diff = liked ? 1 : -1;
      setTweets((prev) =>
        prev.map((t) =>
          t.id === tweetId
            ? {
                ...t,
                _count: { ...t._count, likes: (t._count?.likes || 0) + diff },
                likedByCurrentUser: liked,
              }
            : t
        )
      );

      if (isModal && selectedTweet?.id === tweetId) {
        setSelectedTweet({
          ...selectedTweet,
          _count: { ...selectedTweet._count, likes: (selectedTweet._count?.likes || 0) + diff },
          likedByCurrentUser: liked,
        });
      }
    } finally {
      setLikeLoadingId(null);
    }
  }

  // Tag filter handler
  function handleTagChange(selectedTag) {
    const newTag = tag === selectedTag ? "" : selectedTag;
    setTag(newTag);
    setPage(0);
    setHasMore(true);
    setTweets([]);
    if (newTag) setSearchParams({ tag: newTag });
    else setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSortChange(selectedSort) {
    setSort(selectedSort);
    setPage(0);
    setHasMore(true);
  }

  function handleTimeframeChange(e) {
    setTimeframe(e.target.value);
  }

  // Delete tweet - UPDATED WITH CONFIRM DIALOG
  async function handleDelete(tweetId) {
    setDeletingId(tweetId);
    try {
      const message = await Delete(`https://fanhub-server.onrender.com/api/tweets/${tweetId}`);
      setTweets((prev) => prev.filter((t) => Number(t.id) !== Number(tweetId)));
      if (selectedTweet?.id === tweetId) closeModal();
      showToast(message || "Tweet deleted successfully!", "success");
    } catch (err) {
      showToast("Failed to delete tweet. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  // Add/Remove library - FIXED WITH TOAST
  async function addToLibrary(tweetId, isModal = false) {
    setLibraryLoading(tweetId);
    try {
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/${tweetId}/library`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        const newStatus = !libraryStatus[tweetId];
        setLibraryStatus((prev) => ({ ...prev, [tweetId]: newStatus }));

        if (isModal && selectedTweet?.id === tweetId) {
          setSelectedTweet({
            ...selectedTweet,
            library: newStatus ? [{ id: 1 }] : [],
          });
        }
        
        showToast(
          newStatus ? "Added to library!" : "Removed from library",
          "success"
        );
      } else {
        showToast(data.message || "Failed to update library", "error");
      }
    } finally {
      setLibraryLoading(null);
    }
  }

  // Search handlers
  async function handleSearch(e) {
    e.preventDefault();
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/search?query=${search}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) setTweets(data.tweets);
    } finally {
      setSearchLoading(false);
    }
  }

  async function searchByTopic(title) {
    setSearch(title);
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/search?query=${title}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        setTweets(data.tweets);
        setShowTrending(false);
      }
    } finally {
      setSearchLoading(false);
    }
  }

  // Navigate to profile
  const navigateToProfile = (username, userId) => {
    navigate(`/profile/${username}/${userId}/about`);
  };

  if (error && tweets.length === 0) {
    return (
      <div>
        <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="pt-20">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-color transition-colors duration-500">
      {/* Header */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isOpen={toast.isOpen} 
        onClose={closeToast} 
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={closeConfirm}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        description={confirm.description}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Main Layout */}
      <div className="pt-20 flex gap-6 max-w-7xl mx-auto px-4">
        {/* Main Content */}
        <main className="flex-1 max-w-3xl mx-auto lg:mx-0 space-y-6 py-6">
          {/* Search & Filters Bar */}
          {!single && (
            <div className="space-y-4">
              {/* Title and Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-bold gradient-text">Community Feed</h1>
                
                <div className="flex items-center gap-2">
                  {/* Tag Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 bg-card-theme border-theme"
                        aria-label="Filter by tag"
                      >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {tag || "All Tags"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 themed-select-content"
                    >
                      <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {tags.map((t) => (
                        <DropdownMenuItem
                          key={t}
                          onSelect={() => handleTagChange(t)}
                          className={tag === t ? "bg-blue-500/10 text-blue-600 font-semibold" : ""}
                        >
                          {t}
                          {tag === t && (
                            <span className="ml-auto text-blue-600">✓</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                      {tag && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => handleTagChange(tag)}
                            className="text-red-500"
                          >
                            ✕ Clear Filter
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        className="bg-card-theme border-theme"
                        aria-label="Sort options"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">
                          {sort === "recent" ? "Recent" : "Popular"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="themed-select-content">
                      <DropdownMenuItem onSelect={() => handleSortChange("popular")}>
                        Popular
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleSortChange("recent")}>
                        Recent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                    placeholder="Search tweets or authors..."
                    className="pl-10 bg-card-theme border-theme"
                    aria-label="Search tweets"
                  />
                </div>
                <Button onClick={handleSearch} disabled={searchLoading} className="btn">
                  {searchLoading ? "Searching..." : "Search"}
                </Button>
              </div>

              {/* Active Filter Badge */}
              {tag && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-theme bg-blue-500/5">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-theme">
                    Filtered by: <strong>{tag}</strong>
                  </span>
                  <button
                    onClick={() => handleTagChange(tag)}
                    className="ml-auto text-red-500 hover:text-red-600"
                    aria-label="Clear filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Trending for Mobile (TOP) */}
          {!single && (
            <div className="lg:hidden">
              <Card className="border-theme bg-card-theme">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-bold text-lg text-theme">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Trending Topics
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTrending(!showTrending)}
                      aria-expanded={showTrending}
                    >
                      {showTrending ? "Hide" : "Show"}
                    </Button>
                  </div>
                </CardHeader>
                {showTrending && (
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-sm text-theme">Timeframe:</label>
                      <select
                        value={timeframe}
                        onChange={handleTimeframeChange}
                        className="border border-theme rounded-lg px-3 py-2 bg-card-theme text-sm"
                      >
                        <option value="24h">Last 24h</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                      </select>
                    </div>
                    {trendingLoading ? (
                      <p className="text-center text-secondary">Loading trending...</p>
                    ) : trendingTweets.length === 0 ? (
                      <p className="text-center text-secondary">No trending topics</p>
                    ) : (
                      <ul className="space-y-2">
                        {trendingTweets.map((topic, i) => (
                          <li
                            key={i}
                            tabIndex={0}
                            role="button"
                            onClick={() => searchByTopic(topic.title)}
                            className="p-3 rounded-lg bg-theme hover:bg-blue-500/10 transition cursor-pointer border border-transparent hover:border-blue-500/30"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <strong className="text-blue-600">#{i + 1}</strong>
                              <span className="font-semibold text-theme">{topic.title}</span>
                            </div>
                            <div className="text-sm text-secondary flex gap-3">
                              <span>❤️ {topic.likes}</span>
                              <span>💬 {topic.comments}</span>
                              <span>📚 {topic.library}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>
          )}

          {/* Tweets List */}
          <div className="space-y-6">
            {tweets.length === 0 && !loading ? (
              <Card className="border-theme bg-card-theme p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Filter className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-theme">No Tweets Found</h3>
                  <p className="text-secondary">
                    {tag 
                      ? `No tweets found with the tag "${tag}". Try selecting a different tag or clear the filter.`
                      : search
                      ? `No tweets match your search "${search}". Try a different search term.`
                      : "No tweets available at the moment. Check back later!"}
                  </p>
                  {(tag || search) && (
                    <Button 
                      onClick={() => {
                        setTag("");
                        setSearch("");
                        setSearchParams({});
                        setPage(0);
                        setHasMore(true);
                        setTweets([]);
                      }}
                      className="btn mt-4"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              tweets.map((tweet, index) => {
                const isOwner = user?.id === tweet.userId;

                return (
                  <Card
                    key={tweet.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-theme bg-card-theme"
                    role="article"
                    aria-label={`Tweet by ${tweet.user?.username}: ${tweet.title}`}
                  >
                    <CardHeader className="pb-3">
                      {/* User Info & Actions */}
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
                          onClick={() => navigateToProfile(tweet.user.username, tweet.user.id)}
                        >
                          <div className="relative">
                            <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-blue-500 transition-all">
                              <AvatarImage 
                                src={tweet.user?.avatar} 
                                alt={`${tweet.user?.username}'s avatar`}
                              />
                              <AvatarFallback
                                className="bg-blue-600 text-white font-bold"
                                style={{ backgroundColor: "#2563eb" }}
                              >
                                {tweet.user?.username?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            {/* Click indicator */}
                            <div className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                          </div>
                          <div>
                            <p className="font-semibold text-base text-theme group-hover:text-blue-600 transition-colors">
                              {tweet.user?.username || "Unknown"}
                            </p>
                            <p className="text-xs text-secondary">
                              <time dateTime={tweet.uploadedAt}>
                                {new Date(tweet.uploadedAt).toLocaleDateString()}
                              </time>
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
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
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-secondary hover:text-theme"
                                aria-label="Tweet options"
                              >
                                <MoreVertical size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 themed-select-content">
                              {isOwner && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    showConfirm(
                                      "Delete Tweet",
                                      "Are you sure you want to delete this tweet? This action cannot be undone.",
                                      () => handleDelete(tweet.id)
                                    );
                                  }}
                                  disabled={deletingId === tweet.id}
                                  className="text-destructive"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  {deletingId === tweet.id ? "Deleting..." : "Delete"}
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
                      {/* Quill Content */}
                      <div
                        className="ql-editor prose prose-sm sm:prose-base max-w-none"
                        style={{
                          padding: 0,
                          minHeight: "auto",
                          color: "var(--foreground-color)",
                        }}
                        dangerouslySetInnerHTML={{ __html: tweet.content }}
                      />

                      {/* Media */}
                      {tweet.media && (
                        <div className="relative rounded-xl overflow-hidden border-2 border-theme shadow-lg bg-black/5">
                          {tweet.type === "video" ? (
                            <div 
                              className="relative group cursor-pointer" 
                              onClick={() => openModal(tweet)}
                            >
                              <video
                                src={tweet.media}
                                poster={tweet.thumbnail}
                                className="w-full max-h-[500px] object-contain bg-black"
                                preload="metadata"
                                aria-label={`Video: ${tweet.title}`}
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
                              className="w-full max-h-[500px] object-contain cursor-pointer"
                              loading="lazy"
                              onClick={() => openModal(tweet)}
                            />
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {tweet.tags && tweet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Tweet tags">
                          {tweet.tags.map((t) => (
                            <button
                              key={t}
                              onClick={() => handleTagChange(t)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                tag === t
                                  ? "bg-blue-600 text-white shadow-lg"
                                  : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/30"
                              }`}
                              aria-label={`Filter by ${t}`}
                              aria-pressed={tag === t}
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Enhanced Action Buttons - UserTweets Style */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={() => openModal(tweet)}
                          className="action-btn comment"
                          data-tooltip="View Comments"
                          aria-label={`View ${tweet._count?.comments || 0} comments`}
                        >
                          <MessageSquare size={18} className="icon-animate" />
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
              })
            )}

            {/* Infinite scroll observer */}
            {!single && <div ref={observerRef} style={{ height: "1px" }} aria-hidden="true" />}
            {loading && (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden border-theme bg-card-theme p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-full rounded mb-3" />
                    <Skeleton className="h-40 w-full rounded" />
                    <div className="flex items-center gap-4 mt-3">
                      <Skeleton className="h-6 w-16 rounded" />
                      <Skeleton className="h-6 w-16 rounded" />
                      <Skeleton className="h-6 w-16 rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {!hasMore && tweets.length > 0 && (
              <p className="text-center text-muted-foreground py-6">You've reached the end!</p>
            )}
          </div>
        </main>

        {/* Sidebar - Trending Topics (Desktop Only) */}
        {!single && (
          <aside className="hidden lg:block w-80 flex-shrink-0 py-6 sticky top-24 h-fit">
            <Card className="border-theme bg-card-theme">
              <CardHeader className="pb-3">
                <h3 className="flex items-center gap-2 font-bold text-lg text-theme">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Trending Topics
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm text-theme">Timeframe:</label>
                  <select
                    value={timeframe}
                    onChange={handleTimeframeChange}
                    className="border border-theme rounded-lg px-3 py-1 bg-card-theme text-sm"
                  >
                    <option value="24h">Last 24h</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </div>
                {trendingLoading ? (
                  <p className="text-center text-secondary py-4">Loading trending...</p>
                ) : trendingTweets.length === 0 ? (
                  <p className="text-center text-secondary py-4">No trending topics</p>
                ) : (
                  <ul className="space-y-2">
                    {trendingTweets.map((topic, i) => (
                      <li
                        key={i}
                        tabIndex={0}
                        role="button"
                        onClick={() => searchByTopic(topic.title)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            searchByTopic(topic.title);
                          }
                        }}
                        className="p-3 rounded-lg bg-theme hover:bg-blue-500/10 transition cursor-pointer border border-transparent hover:border-blue-500/30"
                        aria-label={`Search for trending topic: ${topic.title}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <strong className="text-blue-600">#{i + 1}</strong>
                          <span className="font-semibold text-theme">{topic.title}</span>
                        </div>
                        <div className="text-sm text-secondary flex gap-3">
                          <span aria-label={`${topic.likes} likes`}>❤️ {topic.likes}</span>
                          <span aria-label={`${topic.comments} comments`}>💬 {topic.comments}</span>
                          <span aria-label={`${topic.library} saves`}>📚 {topic.library}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </aside>
        )}
      </div>

      {/* Fullscreen Modal - UserTweets Style */}
      {selectedTweet && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-card-theme border-b border-theme">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
              onClick={() => navigateToProfile(selectedTweet.user.username, selectedTweet.user.id)}
            >
              <div className="relative">
                <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-blue-500 transition-all">
                  <AvatarImage src={selectedTweet.user?.avatar} />
                  <AvatarFallback 
                    className="bg-blue-600 text-white font-bold flex items-center justify-center"
                    style={{ backgroundColor: "#2563eb" }}
                  >
                    {selectedTweet.user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {/* Click indicator */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-theme font-semibold text-base group-hover:text-blue-600 transition-colors">
                  {selectedTweet.user?.username}
                </span>
                <span className="text-secondary text-xs">
                  <time dateTime={selectedTweet.uploadedAt}>
                    {new Date(selectedTweet.uploadedAt).toLocaleDateString()}
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
                {/* Quill Content in Modal */}
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
                  <div className="flex flex-wrap gap-2">
                    {selectedTweet.tags.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-600 border border-blue-500/30"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            {showModalComments && (
              <div className="mt-6 pt-6 border-t border-theme">
                <h3 className="font-bold text-lg mb-4 text-theme flex items-center gap-2">
                  <MessageSquare size={20} />
                  Comments
                </h3>
                <CommentList
                  tweetId={selectedTweet.id}
                  contentOwnerId={selectedTweet.userId}
                />
              </div>
            )}
          </div>

          {/* Enhanced Action Bar - UserTweets Style */}
          <div className="flex justify-around items-center p-4 border-t border-theme bg-card-theme shadow-lg">
            <button
              onClick={() => setShowModalComments((prev) => !prev)}
              className={`action-btn comment ${showModalComments ? 'success-flash' : ''}`}
              data-tooltip={showModalComments ? "Hide Comments" : "Show Comments"}
              aria-label={showModalComments ? "Hide comments" : "Show comments"}
            >
              <MessageSquare size={22} className="icon-animate" /> 
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

export default TweetFeed;