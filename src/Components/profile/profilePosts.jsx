import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../auth/authContext";
import { useParams, useNavigate } from "react-router-dom";
import CreatePost from "../post/createPost";
import CommentList from "../comment/commentList";
import Delete from "../delete/delete";
import Header from "../css/header";
import { 
  Heart, 
  MessageCircle, 
  Search, 
  Loader2, 
  X, 
  MoreVertical,
  Trash2,
  Edit,
  Play,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog, useConfirm } from "../utils/toast-modal";

function ProfilePosts() {
  const { id, username } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [reloadPosts, setReloadPosts] = useState(false);
  const [visibleComments, setVisibleComments] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  
  // Modal state
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModalComments, setShowModalComments] = useState(false);

  // Infinite scroll pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const postsPerPage = 5;

  // Intersection Observer ref
  const observer = useRef();

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    async function fetchPosts() {
      setError("");
      setLoading(true);

      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/posts/${id}`, {
          method: "GET",
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

        setPosts(data.posts);
        // Check if we have more posts to load
        if (data.posts.length <= postsPerPage) {
          setHasMore(false);
        }
      } catch (err) {
        navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [id, reloadPosts]);

  function handleSearch(e) {
    e.preventDefault();
    if (posts) {
      const results = posts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(results);
      setCurrentPage(1);
    }
  }

  useEffect(() => {
    if (search.trim() === "") {
      setSearchResults([]);
      setCurrentPage(1);
    }
  }, [search]);

  function handlePostCreated() {
    setReloadPosts(prev => !prev);
  }

  // Open/Close Modal
  function openModal(post) {
    setSelectedPost(post);
    setShowModalComments(false);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    setSelectedPost(null);
    setShowModalComments(false);
    document.body.style.overflow = 'unset';
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (!selectedPost) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedPost, posts]);

  // Touch swipe handlers
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (!selectedPost) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  }

  // Next/Prev handlers
  function handleNext() {
    if (!selectedPost) return;
    const displayedPosts = searchResults.length > 0 ? searchResults : posts;
    const index = displayedPosts.findIndex(p => p.id === selectedPost.id);
    const nextIndex = (index + 1) % displayedPosts.length;
    setSelectedPost(displayedPosts[nextIndex]);
    setShowModalComments(false);
  }

  function handlePrev() {
    if (!selectedPost) return;
    const displayedPosts = searchResults.length > 0 ? searchResults : posts;
    const index = displayedPosts.findIndex(p => p.id === selectedPost.id);
    const prevIndex = (index - 1 + displayedPosts.length) % displayedPosts.length;
    setSelectedPost(displayedPosts[prevIndex]);
    setShowModalComments(false);
  }

  // Like handler for modal
  async function likePostModal(e, postId) {
    if (e) e.stopPropagation();
    setError("");
    setLikeLoadingId(postId);

    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/posts/${postId}/like/love`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      const liked = data.message === "Liked!";
      const likeData = liked ? 1 : -1;

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                _count: { ...post._count, likes: (post._count?.likes || 0) + likeData },
                likedByCurrentUser: liked,
              }
        )
      );

      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          _count: { ...selectedPost._count, likes: (selectedPost._count?.likes || 0) + likeData },
          likedByCurrentUser: liked,
        });
      }
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLikeLoadingId(null);
    }
  }

  async function likePost(e, postId) {
    e.preventDefault();
    setError("");
    setLikeLoadingId(postId);

    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/posts/${postId}/like/love`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      const liked = data.message === "Liked!";
      const likeData = liked ? 1 : -1;

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id !== postId
            ? post
            : {
                ...post,
                _count: { ...post._count, likes: (post._count?.likes || 0) + likeData },
                likedByCurrentUser: liked,
              }
        )
      );
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLikeLoadingId(null);
    }
  }

  function toggleComments(postId) {
    const isCurrentlyVisible = visibleComments[postId];
    
    if (!isCurrentlyVisible) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        openModal(post);
        setShowModalComments(true);
      }
    } else {
      setVisibleComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    }
  }

  const { confirm, showConfirm, closeConfirm } = useConfirm();

  async function handleDelete(postId) {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this post? This action cannot be undone.",
      async () => {
        setDeletingId(postId);
        try {
          await Delete(`https://fanhub-server.onrender.com/api/posts/${postId}`);
          setPosts(prev => prev.filter(post => post.id !== postId));
          if (selectedPost && selectedPost.id === postId) {
            closeModal();
          }
        } catch (err) {
          navigate("/error", { state: { message: err.message } });
        } finally {
          setDeletingId(null);
        }
      }
    );
  }

  // Pagination logic
  const displayedPosts = searchResults.length > 0 ? searchResults : posts;
  const currentPosts = displayedPosts.slice(0, currentPage * postsPerPage);
  const hasMoreToShow = currentPosts.length < displayedPosts.length;

  // Infinite scroll with Intersection Observer
  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreToShow) {
          setCurrentPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMoreToShow]
  );

  return (
    <div className="min-h-screen bg-background-color transition-colors duration-500">
      {/* Header */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Content */}
      <main className="pt-20 max-w-3xl mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <div className="space-y-4">
          {/* Search Bar with Touch-Friendly Button */}
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts by title or content..."
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

        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} writerId={id} username={username}/>

        {/* Posts */}
        {loading && currentPosts.length === 0 ? (
          <div className="flex justify-center items-center py-10" role="status" aria-live="polite">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {currentPosts.map((post, index) => {
              const isLast = index === currentPosts.length - 1;
              const isOwner = user?.id === post.userId;

              return (
                <Card 
                  key={post.id} 
                  ref={isLast ? lastPostRef : null}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-theme bg-card-theme"
                  role="article"
                  aria-label={`Post by ${post.user.username}: ${post.title}`}
                >
                  <CardHeader className="pb-3">
                    {/* User Info & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={post.user?.img} 
                            alt={`${post.user?.username}'s avatar`}
                          />
                          <AvatarFallback
                            className="bg-blue-600 text-white font-bold"
                            style={{ backgroundColor: "#2563eb" }}
                          >
                            {post.user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-base text-theme">
                            {post.user.username}
                          </p>
                          <p className="text-xs text-secondary">
                            <time dateTime={post.uploadedAt}>
                              {new Date(post.uploadedAt).toLocaleDateString()}
                            </time>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-secondary hover:text-theme"
                              aria-label="Post options"
                            >
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 themed-select-content">
                            <DropdownMenuItem
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId === post.id}
                              className="text-destructive"
                            >
                              <Trash2 size={16} className="mr-2" />
                              {deletingId === post.id ? "Deleting..." : "Delete Post"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-theme leading-tight mt-4">
                      {post.title}
                    </h2>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Content */}
                    <p className="text-theme">{post.content}</p>

                    {/* Media */}
                    {post.media && (
                      <div className="relative rounded-xl overflow-hidden border-2 border-theme shadow-lg bg-black/5">
                        {post.type === "video" ? (
                          <div 
                            className="relative group cursor-pointer" 
                            onClick={() => openModal(post)}
                          >
                            <video
                              src={post.media}
                              poster={post.thumbnail}
                              className="w-full max-h-96 object-cover"
                              preload="metadata"
                              aria-label={`Video: ${post.title}`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                <Play className="w-12 h-12 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={post.media}
                            alt={post.title}
                            className="w-full max-h-96 object-cover cursor-pointer transition-transform hover:scale-[1.02]"
                            onClick={() => openModal(post)}
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4 pt-4">
                    {/* Enhanced Action Buttons - UserTweets Style */}
                    <div className="flex items-center gap-4 w-full">
                      <button
                        onClick={() => openModal(post)}
                        className="action-btn comment"
                        data-tooltip="View Comments"
                        aria-label={`View ${post._count?.comments || 0} comments`}
                      >
                        <MessageCircle size={18} className="icon-animate" />
                        <span className="count-number">{post._count?.comments || 0}</span>
                      </button>

                      <button
                        onClick={(e) => likePost(e, post.id)}
                        disabled={likeLoadingId === post.id}
                        className={`action-btn like ${post.likedByCurrentUser ? 'liked' : ''} ${likeLoadingId === post.id ? 'loading' : ''}`}
                        data-tooltip={post.likedByCurrentUser ? "Unlike" : "Like"}
                        aria-label={post.likedByCurrentUser ? "Unlike" : "Like"}
                        aria-pressed={post.likedByCurrentUser}
                      >
                        <Heart 
                          size={18} 
                          className="icon-animate"
                          fill={post.likedByCurrentUser ? "currentColor" : "none"} 
                        />
                        <span className="count-number">{post._count?.likes || 0}</span>
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Loading indicator */}
        {loading && currentPosts.length > 0 && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {/* End message */}
        {!hasMoreToShow && currentPosts.length > 0 && (
          <p className="text-center text-gray-500 py-4">You've reached the end!</p>
        )}
        

        {error && <p className="text-red-500 text-center">{error}</p>}
      </main>

      {/* Fullscreen Modal - UserTweets Style */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-card-theme border-b border-theme">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={selectedPost.user.img} 
                  alt={`${selectedPost.user.username}'s avatar`}
                />
                <AvatarFallback
                  className="bg-blue-600 text-white font-bold"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {selectedPost.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-theme font-semibold text-base">
                  {selectedPost.user.username}
                </span>
                <span className="text-secondary text-xs">
                  <time dateTime={selectedPost.uploadedAt}>
                    {new Date(selectedPost.uploadedAt).toLocaleDateString()}
                  </time>
                </span>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="text-secondary hover:text-theme transition-colors"
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
                <h2 id="modal-title" className="text-2xl font-bold text-theme">{selectedPost.title}</h2>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-theme">{selectedPost.content}</p>
              </CardContent>
            </Card>

            {/* Media Card */}
            {selectedPost.media && selectedPost.media !== "" && (
              <Card className="border-theme bg-card-theme mb-3 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    {selectedPost.type === "video" ? (
                      <video
                        key={selectedPost.id}
                        controls
                        className="w-full max-h-[60vh] object-contain bg-black"
                        preload="metadata"
                        poster={selectedPost.thumbnail || ""}
                      >
                        <source src={selectedPost.media} type="video/mp4" />
                        <source src={selectedPost.media} type="video/webm" />
                        <source src={selectedPost.media} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        key={selectedPost.id}
                        src={selectedPost.media}
                        alt={selectedPost.title}
                        className="w-full max-h-[60vh] object-contain bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
                        loading="eager"
                      />
                    )}
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
                  key={`modal-post-${selectedPost.id}`}
                  postId={selectedPost.id}
                  contentOwnerId={selectedPost.userId}
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
              <MessageCircle size={22} className="icon-animate" /> 
              <span className="count-number">{selectedPost._count.comments}</span>
            </button>

            <button
              onClick={(e) => likePostModal(e, selectedPost.id)}
              disabled={likeLoadingId === selectedPost.id}
              className={`action-btn like ${selectedPost.likedByCurrentUser ? 'liked' : ''} ${likeLoadingId === selectedPost.id ? 'loading' : ''}`}
              data-tooltip={selectedPost.likedByCurrentUser ? "Unlike" : "Like"}
              aria-label={selectedPost.likedByCurrentUser ? "Unlike" : "Like"}
              aria-pressed={selectedPost.likedByCurrentUser}
            >
              <Heart
                size={22}
                fill={selectedPost.likedByCurrentUser ? "currentColor" : "none"}
                className={`icon-animate ${selectedPost.likedByCurrentUser ? 'animate-ping-once' : ''}`}
              />
              <span className="count-number">{selectedPost._count?.likes || 0}</span>
            </button>

            {user?.id === selectedPost.userId && (
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingId === selectedPost.id}
                onClick={() => handleDelete(selectedPost.id)}
              >
                {deletingId === selectedPost.id ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={closeConfirm}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        description={confirm.description}
      />
    </div>
  );
}

export default ProfilePosts;