import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";
import Header from "../css/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  BookMarked,
  Star,
  Eye,
  User,
  MessageCircle,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Loader2,
} from "lucide-react";

function HomepageCollections() {
  const { id } = useParams();
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState({});
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [visibleComments, setVisibleComments] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showModalComments, setShowModalComments] = useState(false);

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

  // Touch swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (collection) {
      setImages(collection.images);
      setVideos(collection.videos);
    }
  }, [collection]);

  useEffect(() => {
    async function fetchCollection() {
      setError("");
      setLoading(true);
      try {
        const response = await fetch(
          `https://fanhub-server.onrender.com/api/gallery/collections/collection/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.status === 500) {
          navigate("/error", {
            state: { message: data.message || "Process failed" },
          });
          return;
        } else {
          if (!response.ok && response.status !== 500) {
            setError(data.message);
            return;
          }
        }

        setLibraryStatus((prev) => ({
          ...prev,
          [data.collection.id]: data.collection.library?.length > 0,
        }));

        setCollection(data.collection);
        setImages(data.collection.images);
        setVideos(data.collection.videos);
      } catch (err) {
        navigate("/error", { state: { message: err.message } });
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [id]);

  // Combined media for modal navigation
  const allMedia = [
    ...images.map((m) => ({ ...m, type: "image" })),
    ...videos.map((m) => ({ ...m, type: "video" })),
  ];

  // Open/Close modal
  function openModal(media, type) {
    setSelectedMedia({ ...media, type });
    setShowModalComments(false);
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    setSelectedMedia(null);
    setShowModalComments(false);
    document.body.style.overflow = "unset";
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (!selectedMedia) return;
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
  }, [selectedMedia, allMedia]);

  // Touch swipe handlers
  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (!selectedMedia) return;

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
    if (!selectedMedia) return;
    const index = allMedia.findIndex(
      (m) => m.id === selectedMedia.id && m.type === selectedMedia.type
    );
    const nextIndex = (index + 1) % allMedia.length;
    setSelectedMedia(allMedia[nextIndex]);
    setShowModalComments(false);
  }

  function handlePrev() {
    if (!selectedMedia) return;
    const index = allMedia.findIndex(
      (m) => m.id === selectedMedia.id && m.type === selectedMedia.type
    );
    const prevIndex = (index - 1 + allMedia.length) % allMedia.length;
    setSelectedMedia(allMedia[prevIndex]);
    setShowModalComments(false);
  }

  async function likeCollection(e) {
    e.preventDefault();
    setError("");
    setLikeLoading(true);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/gallery/collections/${id}/like/love`,
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
      } else {
        if (!response.ok && response.status !== 500) {
          setError(data.message);
          return;
        }
      }

      setCollection((prev) => {
        const likesData = data.message === "Liked!" ? 1 : -1;
        const userLiked = data.message === "Liked!";

        return {
          ...prev,
          _count: {
            ...prev._count,
            likes: prev._count.likes + likesData,
          },
          likedByCurrentUser: userLiked,
        };
      });

      if (data.message === "Liked!") {
        const socialResponse = await fetch(
          `https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!socialResponse.ok) {
          const errData = await socialResponse.json();
          setError(
            errData.message || "Something went wrong with like points!"
          );
        }
      }
    } catch (err) {
      navigate("/error", { state: { message: err.message } });
    } finally {
      setLikeLoading(false);
    }
  }

  async function addToLibrary(id) {
    setError("");
    setLibraryLoading(true);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/gallery/collection/${id}/readinglist`,
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
      } else {
        if (!response.ok && response.status !== 500) {
          setError(data.message);
          return;
        }
      }

      setLibraryStatus((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } catch (err) {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setLibraryLoading(false);
    }
  }

  async function likeMediaModal(e, name, mediaId) {
    if (e) e.stopPropagation();
    setError("");
    const likeKey = `${name}-${mediaId}`;
    setLikeLoadingId(likeKey);

    try {
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/gallery/${name}/${mediaId}/like/love`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      const liked = data.message === "Liked!";
      const likeChange = liked ? 1 : -1;

      const updateList = (list) =>
        list.map((item) =>
          item.id === mediaId
            ? {
                ...item,
                _count: {
                  ...item._count,
                  likes: (item._count?.likes || 0) + likeChange,
                },
                likedByCurrentUser: liked,
              }
            : item
        );

      if (name === "images") {
        setImages(updateList);
        if (
          selectedMedia &&
          selectedMedia.type === "image" &&
          selectedMedia.id === mediaId
        ) {
          setSelectedMedia({
            ...selectedMedia,
            _count: {
              ...selectedMedia._count,
              likes: (selectedMedia._count?.likes || 0) + likeChange,
            },
            likedByCurrentUser: liked,
          });
        }
      }
      if (name === "videos") {
        setVideos(updateList);
        if (
          selectedMedia &&
          selectedMedia.type === "video" &&
          selectedMedia.id === mediaId
        ) {
          setSelectedMedia({
            ...selectedMedia,
            _count: {
              ...selectedMedia._count,
              likes: (selectedMedia._count?.likes || 0) + likeChange,
            },
            likedByCurrentUser: liked,
          });
        }
      }
    } catch {
      navigate("/error", {
        state: { message: "Network error. Try again later." },
      });
    } finally {
      setLikeLoadingId(null);
    }
  }

  async function likeMedia(e, name, id) {
    e.preventDefault();
    setError("");
    setLikeLoadingId(id);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/like/love`,
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
        setError(data.message || "Failed to like/unlike");
        return;
      }

      const liked = data.message === "Liked!";
      const likeData = liked ? 1 : -1;

      const updateMedia = (prevItems) =>
        prevItems.map((item) => {
          if (item.id !== id) return item;

          return {
            ...item,
            _count: {
              ...item._count,
              likes: item._count.likes + likeData,
            },
            likedByCurrentUser: liked,
          };
        });

      if (name === "images") {
        setImages(updateMedia);
      } else if (name === "videos") {
        setVideos(updateMedia);
      }

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
        state: {
          message: err.message,
        },
      });
    } finally {
      setLikeLoadingId(null);
    }
  }

  // Toggle comments - Fixed to use unique keys
  function toggleComments(mediaType, mediaId) {
    const key = `${mediaType}-${mediaId}`;
    const isCurrentlyVisible = visibleComments[key];

    if (!isCurrentlyVisible) {
      const media =
        mediaType === "image"
          ? images.find((img) => img.id === mediaId)
          : videos.find((vid) => vid.id === mediaId);

      if (media) {
        openModal(media, mediaType);
        setShowModalComments(true);
      }
    } else {
      setVisibleComments((p) => ({ ...p, [key]: !p[key] }));
    }
  }

  if (loading) {
    return (
      <>
        <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}
        >
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 mx-auto animate-spin" style={{ color: "var(--accent-color)" }} />
            <p className="text-lg" style={{ color: "var(--foreground-color)" }}>
              Loading collection...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!collection) {
    return (
      <>
        <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}
        >
          <p style={{ color: "var(--foreground-color)" }}>Collection not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}
      >
        {/* Error Alert */}
        {error && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 mb-4 mt-4">
            <div
              className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg p-4"
              role="alert"
            >
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Collection Header */}
        <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

           {/* Breadcrumb Navigation */}
           <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center space-x-2 text-sm" style={{ color: "var(--secondary-text)" }}>
                  <li>
                      <button 
                          onClick={() => navigate('/homecollections')}
                          className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors"
                          style={{ color: "var(--accent-color)" }}
                      >
                          Visual Stories
                      </button>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                      <span className="font-medium" style={{ color: "var(--foreground-color)" }}>
                          {collection.name}
                      </span>
                  </li>
              </ol>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Left: Cover Image */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <img
                  src={collection.img}
                  alt={`Cover for ${collection.name}`}
                  className="w-full rounded-2xl shadow-2xl object-cover"
                  style={{ 
                      height: "450px",
                      border: "3px solid var(--border-color)"
                  }}
                />

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={likeCollection}
                    disabled={likeLoading}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      collection.likedByCurrentUser ? "ring-2" : ""
                    }`}
                    style={{
                      backgroundColor: collection.likedByCurrentUser
                        ? "#ef4444"
                        : "var(--button-bg)",
                      color: "white",
                    }}
                    aria-label={
                      collection.likedByCurrentUser
                        ? "Unlike collection"
                        : "Like collection"
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        collection.likedByCurrentUser ? "fill-current" : ""
                      }`}
                    />
                    <span className="font-semibold">
                      {collection.likedByCurrentUser ? "Liked" : "Like"}{" "}
                      {collection._count.likes}
                    </span>
                  </Button>

                  <Button
                    disabled={libraryLoading}
                    onClick={() => addToLibrary(collection.id)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      backgroundColor: libraryStatus[collection.id]
                        ? "#f59e0b"
                        : "var(--card-bg)",
                      color: libraryStatus[collection.id]
                        ? "white"
                        : "var(--foreground-color)",
                      border: `2px solid ${
                        libraryStatus[collection.id]
                          ? "#f59e0b"
                          : "var(--border-color)"
                      }`,
                    }}
                    aria-label={
                      libraryStatus[collection.id]
                        ? "Remove from library"
                        : "Add to library"
                    }
                  >
                    <BookMarked
                      className={`w-5 h-5 ${
                        libraryStatus[collection.id] ? "fill-current" : ""
                      }`}
                    />
                    <span className="font-semibold">
                      {libraryLoading
                        ? "Loading..."
                        : libraryStatus[collection.id]
                        ? "In Library"
                        : "Add to Library"}
                    </span>
                  </Button>

                  <Button
                    onClick={() => navigate(`/collections/${collection.id}/reviews`)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--foreground-color)",
                      border: "2px solid var(--border-color)",
                    }}
                    aria-label="View all reviews"
                  >
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">View All Reviews</span>
                  </Button>
                </div>

                {/* Stats */}
                <div
                  className="mt-6 p-4 rounded-xl"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="flex items-center gap-2"
                        style={{ color: "var(--secondary-text)" }}
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                        Views
                      </span>
                      <span
                        className="font-bold"
                        style={{ color: "var(--foreground-color)" }}
                      >
                        {collection._count.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="flex items-center gap-2"
                        style={{ color: "var(--secondary-text)" }}
                      >
                        <span className="text-xl">⭐</span>
                        Reviews
                      </span>
                      <button
                        onClick={() =>
                          navigate(`/collections/${collection.id}/reviews`)
                        }
                        className="font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {collection._count.review || 0}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Collection Info */}
            <div className="lg:col-span-2 space-y-8">
              <header>
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                  style={{ color: "var(--foreground-color)" }}
                >
                  {collection.name}
                </h1>

                <button
                  onClick={() =>
                    navigate(
                      `/profile/${collection.user.username}/${collection.userId}/about`
                    )
                  }
                  className="flex items-center gap-3 text-lg mb-6 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-all"
                  style={{ color: "var(--accent-color)" }}
                  aria-label={`View profile of ${collection.user.username}`}
                >
                  {collection.user.img ? (
                    <img 
                      src={collection.user.img} 
                      alt={`${collection.user.username}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover border-2"
                      style={{ borderColor: "var(--accent-color)" }}
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                      style={{ 
                        borderColor: "var(--accent-color)",
                        backgroundColor: "var(--card-bg)"
                      }}
                    >
                      <User className="w-5 h-5" style={{ color: "var(--accent-color)" }} />
                    </div>
                  )}
                  <span className="font-medium">{collection.user.username}</span>
                </button>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border-color)",
                      color: "var(--foreground-color)",
                    }}
                  >
                    {collection.status}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border-color)",
                      color: "var(--foreground-color)",
                    }}
                  >
                    {collection.age}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border-color)",
                      color: "var(--foreground-color)",
                    }}
                  >
                    {collection.audience}
                  </span>
                </div>
              </header>

              {/* Description */}
              <section aria-labelledby="description-heading">
                <h2
                  id="description-heading"
                  className="text-2xl font-bold mb-4"
                  style={{ color: "var(--foreground-color)" }}
                >
                  Description
                </h2>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: "var(--secondary-text)" }}
                >
                  {collection.description}
                </p>
              </section>

              {/* Genres */}
              <section
                aria-labelledby="genres-heading"
                className="grid sm:grid-cols-2 gap-4"
              >
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "var(--secondary-text)" }}
                  >
                    Primary Genre
                  </h3>
                  <p
                    className="text-lg font-medium"
                    style={{ color: "var(--foreground-color)" }}
                  >
                    {collection.primarygenre}
                  </p>
                </div>
                {collection.secondarygenre && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <h3
                      className="font-semibold mb-2"
                      style={{ color: "var(--secondary-text)" }}
                    >
                      Secondary Genre
                    </h3>
                    <p
                      className="text-lg font-medium"
                      style={{ color: "var(--foreground-color)" }}
                    >
                      {collection.secondarygenre}
                    </p>
                  </div>
                )}
              </section>

              {/* Subgenres - UPDATED WITH SMALLER SIZE */}
              {(collection.primarysubgenre.length > 0 ||
                collection.secondarysubgenre.length > 0) && (
                <section aria-labelledby="subgenres-heading">
                  <h2
                    id="subgenres-heading"
                    className="text-xl font-bold mb-3"
                    style={{ color: "var(--foreground-color)" }}
                  >
                    Subgenres
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...collection.primarysubgenre,
                      ...collection.secondarysubgenre,
                    ].map((subgenre, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium"
                        style={{
                          backgroundColor: "var(--accent-color)",
                          color: "white",
                          opacity: 0.9,
                        }}
                      >
                        {subgenre}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Visual Stories Section */}
          <section aria-labelledby="visual-stories-heading" className="mt-12">
            <div className="mb-6">
              <h2
                id="visual-stories-heading"
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--foreground-color)" }}
              >
                Visual Stories
              </h2>
              <p 
                className="text-base"
                style={{ color: "var(--secondary-text)" }}
              >
                Explore the collection through images and videos that bring the story to life
              </p>
            </div>

            {allMedia.length === 0 ? (
              <div
                className="text-center py-12 p-8 rounded-xl"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <ImageIcon
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  style={{ color: "var(--secondary-text)" }}
                />
                <p className="text-lg font-semibold mb-2" style={{ color: "var(--foreground-color)" }}>
                  No visual stories yet
                </p>
                <p className="text-sm" style={{ color: "var(--secondary-text)" }}>
                  Visual stories will appear here once added to this collection
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allMedia.map((item) => {
                  const isImage = item.type === "image";
                  const commentKey = `${item.type}-${item.id}`;
                  const likeKey = `${isImage ? "images" : "videos"}-${item.id}`;

                  return (
                    <Card
                      key={commentKey}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div
                        className="relative cursor-pointer group"
                        onClick={() => openModal(item, item.type)}
                      >
                        {isImage ? (
                          <img
                            src={item.url}
                            alt={item.caption}
                            className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <>
                            <video
                              src={item.url}
                              className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                              muted
                              playsInline
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-8 h-8 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polygon
                                    points="9.5,7.5 16.5,12 9.5,16.5"
                                    fill="white"
                                  />
                                </svg>
                              </div>
                            </div>
                          </>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                        <div
                          className={`absolute top-3 right-3 ${
                            isImage
                              ? "bg-gradient-to-r from-blue-500 to-blue-600"
                              : "bg-gradient-to-r from-purple-500 to-purple-600"
                          } text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg`}
                        >
                          {isImage ? (
                            <>
                              <ImageIcon size={14} /> Image
                            </>
                          ) : (
                            <>
                              <Video size={14} /> Video
                            </>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        <p className="text-xs text-muted-foreground font-medium">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="font-semibold text-base line-clamp-2">
                          {item.caption}
                        </p>

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComments(item.type, item.id);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                              visibleComments[commentKey]
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-transparent text-blue-600 hover:bg-blue-50"
                            }`}
                          >
                            <MessageCircle
                              size={18}
                              className={
                                visibleComments[commentKey] ? "animate-pulse" : ""
                              }
                            />
                            <span className="font-bold text-base">
                              {item._count.comments}
                            </span>
                            <span className="hidden sm:inline">Comments</span>
                          </button>

                          <button
                            onClick={(e) =>
                              likeMedia(e, isImage ? "images" : "videos", item.id)
                            }
                            disabled={likeLoadingId === item.id}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                              item.likedByCurrentUser
                                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30"
                                : "bg-transparent text-gray-600 hover:bg-red-50 hover:text-red-500"
                            }`}
                          >
                            <Heart
                              size={18}
                              className={`text-red-500 transition-all ${
                                item.likedByCurrentUser
                                  ? "fill-white animate-pulse"
                                  : ""
                              }`}
                            />
                            <span className="font-bold text-base text-red-500">
                              {item._count?.likes || 0}
                            </span>
                            <span className="hidden sm:inline">Likes</span>
                          </button>
                        </div>

                        {visibleComments[commentKey] && (
                          <section className="pt-4 border-t space-y-4">
                            <h4 className="font-bold flex items-center gap-2">
                              <MessageSquare size={18} className="text-blue-500" />
                              Comments
                            </h4>
                            <CommentList
                              key={commentKey}
                              imageId={isImage ? item.id : undefined}
                              videoId={!isImage ? item.id : undefined}
                              contentOwnerId={item.userId}
                            />
                          </section>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Write Review CTA - NEW SECTION */}
          <section className="mt-16 mb-8">
            <div
              className="relative overflow-hidden rounded-2xl p-8 sm:p-12"
              style={{
                background: "linear-gradient(135deg, var(--accent-color) 0%, var(--button-bg) 100%)",
                border: "2px solid var(--border-color)",
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="flex justify-center mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-8 h-8 sm:w-10 sm:h-10 fill-yellow-300 text-yellow-300 animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
                
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                  Share Your Thoughts
                </h2>
                
                <p className="text-white/90 text-base sm:text-lg mb-6 sm:mb-8">
                  Your review helps others discover great content and supports creators
                </p>
                
                <Button
                  onClick={() => navigate(`/collections/${collection.id}/review`)}
                  className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-8 rounded-xl text-base sm:text-lg transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </section>
        </article>

        {/* Modal with Touch Swipe */}
        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              className="fixed top-4 right-4 z-[60] bg-black/70 hover:bg-black/90 p-2.5 rounded-full transition-all"
              aria-label="Close modal"
            >
              <X size={24} className="text-white" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-[60] bg-black/70 hover:bg-black/90 p-3 rounded-full transition-all hidden md:block"
              aria-label="Previous media"
            >
              <ChevronLeft size={28} className="text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] bg-black/70 hover:bg-black/90 p-3 rounded-full transition-all hidden md:block"
              aria-label="Next media"
            >
              <ChevronRight size={28} className="text-white" />
            </button>

            <div
              className="w-full h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-h-full flex flex-col lg:flex-row lg:items-start max-w-7xl mx-auto">
                <div
                  className="w-full lg:w-2/3 bg-black flex items-center justify-center lg:sticky lg:top-0 lg:h-screen p-4"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {selectedMedia.type === "image" ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.caption}
                      className="w-full h-[60vh] lg:h-[85vh] object-contain"
                    />
                  ) : (
                    <video
                      src={selectedMedia.url}
                      controls
                      autoPlay
                      className="w-full h-[60vh] lg:h-[85vh] object-contain"
                    />
                  )}
                </div>

                <div className="w-full lg:w-1/3 bg-background flex flex-col lg:sticky lg:top-0 lg:h-screen lg:max-h-screen">
                  <div className="p-4 lg:p-6 border-b bg-background flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground mb-2">
                      {selectedMedia.type === "image" ? (
                        <>
                          <ImageIcon size={16} /> Image
                        </>
                      ) : (
                        <>
                          <Video size={16} /> Video
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {new Date(selectedMedia.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold text-base lg:text-lg">
                      {selectedMedia.caption}
                    </p>
                  </div>

                  <div className="p-4 lg:p-6 border-b flex flex-wrap items-center gap-2 lg:gap-3 bg-background flex-shrink-0">
                    <Button
                      onClick={() => setShowModalComments(!showModalComments)}
                      size="sm"
                      className={`rounded-full px-3 py-2 flex items-center gap-2 transition-all flex-1 sm:flex-none ${
                        showModalComments
                          ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                      }`}
                    >
                      <MessageCircle size={18} />
                      <span className="font-bold text-base">
                        {selectedMedia._count.comments}
                      </span>
                      <span className="text-xs sm:text-sm">
                        {showModalComments ? "Hide" : "Comments"}
                      </span>
                    </Button>

                    <Button
                      onClick={(e) =>
                        likeMediaModal(
                          e,
                          selectedMedia.type === "image" ? "images" : "videos",
                          selectedMedia.id
                        )
                      }
                      disabled={
                        likeLoadingId ===
                        `${
                          selectedMedia.type === "image" ? "images" : "videos"
                        }-${selectedMedia.id}`
                      }
                      size="sm"
                      className={`rounded-full px-3 py-2 flex items-center gap-2 transition-all flex-1 sm:flex-none ${
                        selectedMedia.likedByCurrentUser
                          ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <Heart
                        size={18}
                        className={`transition-all ${
                          selectedMedia.likedByCurrentUser
                            ? "fill-white animate-pulse"
                            : ""
                        }`}
                      />
                      <span className="font-bold text-base">
                        {selectedMedia._count?.likes || 0}
                      </span>
                      <span className="text-xs sm:text-sm">
                        {selectedMedia.likedByCurrentUser ? "Liked" : "Like"}
                      </span>
                    </Button>
                  </div>

                  <div className="lg:hidden text-center py-2 text-xs text-muted-foreground border-b bg-background/50 flex-shrink-0">
                    ← Swipe to navigate | Keyboard: Arrow keys →
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {showModalComments ? (
                      <div className="space-y-4 pb-4">
                        <h4 className="font-bold text-base lg:text-lg flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
                          <MessageCircle size={20} className="text-blue-500" />
                          Comments
                        </h4>
                        <CommentList
                          key={`modal-${selectedMedia.type}-${selectedMedia.id}`}
                          imageId={
                            selectedMedia.type === "image"
                              ? selectedMedia.id
                              : undefined
                          }
                          videoId={
                            selectedMedia.type === "video"
                              ? selectedMedia.id
                              : undefined
                          }
                          contentOwnerId={selectedMedia.userId}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <div>
                          <MessageSquare
                            size={48}
                            className="mx-auto mb-3 opacity-30"
                          />
                          <p className="text-sm lg:text-base">
                            Click the comments button to view and add comments
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HomepageCollections;