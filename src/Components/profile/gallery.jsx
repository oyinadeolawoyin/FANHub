// ============================================
// GALLERY.JSX - Touch Swipe Navigation + Infinite Scroll Pagination + Touch-Friendly Search
// ============================================
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  MessageCircle,
  Heart,
  Video,
  Image as ImageIcon,
  Search,
  X,
  Loader2,
} from "lucide-react";

function Gallery() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [videoSearchResults, setVideoSearchResults] = useState([]);
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [visibleComments, setVisibleComments] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showModalComments, setShowModalComments] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 items per page (2 rows of 3 in grid)

  // Touch swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Intersection Observer ref
  const observer = useRef();

  // ✅ Load media
  useEffect(() => {
    async function fetchMedias() {
      setError("");
      setLoading(true);
      try {
        const [imagesRes, videosRes] = await Promise.all([
          fetch(`https://fanhub-server.onrender.com/api/gallery/images/${id}`, { credentials: "include" }),
          fetch(`https://fanhub-server.onrender.com/api/gallery/videos/${id}`, { credentials: "include" }),
        ]);
        const [dataImages, dataVideos] = await Promise.all([
          imagesRes.json(),
          videosRes.json(),
        ]);

        if (!imagesRes.ok || !videosRes.ok) {
          setError(dataImages.message || dataVideos.message || "Failed to load gallery");
          return;
        }

        setImages(dataImages.images);
        setVideos(dataVideos.videos);
      } catch {
        navigate("/error", {
          state: { message: "Network error: Please check your connection." },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchMedias();
  }, [id, navigate]);

  // Reset pagination when search changes
  useEffect(() => {
    if (search.trim() === "") {
      setImageSearchResults([]);
      setVideoSearchResults([]);
      setCurrentPage(1);
    }
  }, [search]);

  // ✅ Combined all media for modal navigation
  const allMedia = [
    ...images.map((m) => ({ ...m, type: "image" })),
    ...videos.map((m) => ({ ...m, type: "video" })),
  ];

  // ✅ Combine media for display with pagination
  const displayImages = imageSearchResults.length ? imageSearchResults : images;
  const displayVideos = videoSearchResults.length ? videoSearchResults : videos;
  
  const allDisplayMedia = [
    ...displayImages.filter(img => img.collectionId == null).map(m => ({ ...m, type: "image" })),
    ...displayVideos.filter(vid => vid.collectionId === null).map(m => ({ ...m, type: "video" })),
  ];

  // Paginate the displayed media
  const currentMedia = allDisplayMedia.slice(0, currentPage * itemsPerPage);
  const hasMoreToShow = currentMedia.length < allDisplayMedia.length;

  // ✅ Open / Close modal
  function openModal(media, type) {
    setSelectedMedia({ ...media, type });
    setShowModalComments(false);
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
    setSelectedMedia(null);
    setShowModalComments(false);
    document.body.style.overflow = 'unset';
  }

  // ✅ Keyboard navigation inside modal
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

  // ✅ Touch swipe handlers
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

  // ✅ Next / Prev handlers
  function handleNext() {
    if (!selectedMedia) return;
    const index = allMedia.findIndex((m) => m.id === selectedMedia.id && m.type === selectedMedia.type);
    const nextIndex = (index + 1) % allMedia.length;
    setSelectedMedia(allMedia[nextIndex]);
    setShowModalComments(false);
  }

  function handlePrev() {
    if (!selectedMedia) return;
    const index = allMedia.findIndex((m) => m.id === selectedMedia.id && m.type === selectedMedia.type);
    const prevIndex = (index - 1 + allMedia.length) % allMedia.length;
    setSelectedMedia(allMedia[prevIndex]);
    setShowModalComments(false);
  }

  // ✅ Search
  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) {
      setImageSearchResults([]);
      setVideoSearchResults([]);
      setCurrentPage(1);
      return;
    }
    const imageResults = images.filter((i) =>
      i.caption.toLowerCase().includes(search.toLowerCase())
    );
    const videoResults = videos.filter((v) =>
      v.caption.toLowerCase().includes(search.toLowerCase())
    );
    setImageSearchResults(imageResults);
    setVideoSearchResults(videoResults);
    setCurrentPage(1);
  }

  // ✅ Clear search
  function clearSearch() {
    setSearch("");
    setImageSearchResults([]);
    setVideoSearchResults([]);
    setCurrentPage(1);
  }

  // ✅ Like handler for modal
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
        if (selectedMedia && selectedMedia.type === "image" && selectedMedia.id === mediaId) {
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
        if (selectedMedia && selectedMedia.type === "video" && selectedMedia.id === mediaId) {
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

  // ✅ Like handler for gallery
  async function likeMedia(e, name, mediaId) {
    e.preventDefault();
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

      if (name === "images") setImages(updateList);
      if (name === "videos") setVideos(updateList);
    } catch {
      navigate("/error", {
        state: { message: "Network error. Try again later." },
      });
    } finally {
      setLikeLoadingId(null);
    }
  }

  // ✅ Toggle comments
  function toggleComments(mediaType, mediaId) {
    const key = `${mediaType}-${mediaId}`;
    const isCurrentlyVisible = visibleComments[key];
    
    if (!isCurrentlyVisible) {
      const media = mediaType === "image" 
        ? images.find(img => img.id === mediaId)
        : videos.find(vid => vid.id === mediaId);
      
      if (media) {
        openModal(media, mediaType);
        setShowModalComments(true);
      }
    } else {
      setVisibleComments((p) => ({ ...p, [key]: !p[key] }));
    }
  }

  // 🔹 Infinite scroll with Intersection Observer
  const lastMediaRef = useCallback(
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

  if (loading && currentMedia.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Enhanced Search with Touch-Friendly Button */}
      <form onSubmit={handleSearch} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by caption..."
            className="w-full pr-10"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
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

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      <GalleryList
        media={currentMedia}
        likeMedia={likeMedia}
        likeLoadingId={likeLoadingId}
        toggleComments={toggleComments}
        visibleComments={visibleComments}
        openModal={openModal}
        lastMediaRef={lastMediaRef}
      />

      {/* Loading indicator for infinite scroll */}
      {loading && currentMedia.length > 0 && (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* End of gallery message */}
      {!hasMoreToShow && currentMedia.length > 0 && (
        <p className="text-center text-muted-foreground py-4">You've reached the end!</p>
      )}

      {/* ✅ Modal with Touch Swipe */}
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
                      <><ImageIcon size={16} /> Image</>
                    ) : (
                      <><Video size={16} /> Video</>
                    )}
                    <span>•</span>
                    <span>{new Date(selectedMedia.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-semibold text-base lg:text-lg">{selectedMedia.caption}</p>
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
                    <span className="font-bold text-base">{selectedMedia._count.comments}</span>
                    <span className="text-xs sm:text-sm">
                      {showModalComments ? "Hide" : "Comments"}
                    </span>
                  </Button>

                  <Button
                    onClick={(e) => likeMediaModal(e, selectedMedia.type === "image" ? "images" : "videos", selectedMedia.id)}
                    disabled={likeLoadingId === `${selectedMedia.type === "image" ? "images" : "videos"}-${selectedMedia.id}`}
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
                        selectedMedia.likedByCurrentUser ? "fill-white animate-pulse" : ""
                      }`}
                    />
                    <span className="font-bold text-base">{selectedMedia._count?.likes || 0}</span>
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
                        imageId={selectedMedia.type === "image" ? selectedMedia.id : undefined}
                        videoId={selectedMedia.type === "video" ? selectedMedia.id : undefined}
                        contentOwnerId={selectedMedia.userId}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                      <div>
                        <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm lg:text-base">Click the comments button to view and add comments</p>
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
  );
}

// ✅ Gallery List Component with Pagination Support
function GalleryList({
  media,
  likeMedia,
  likeLoadingId,
  toggleComments,
  visibleComments,
  openModal,
  lastMediaRef,
}) {
  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No media in gallery yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {media.map((item, index) => {
        const isImage = item.type === "image";
        const commentKey = `${item.type}-${item.id}`;
        const likeKey = `${isImage ? "images" : "videos"}-${item.id}`;
        const isLast = index === media.length - 1;

        return (
          <Card
            key={`${item.type}-${item.id}`}
            ref={isLast ? lastMediaRef : null}
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
                        <polygon points="9.5,7.5 16.5,12 9.5,16.5" fill="white" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
              <div className={`absolute top-3 right-3 ${isImage ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg`}>
                {isImage ? <><ImageIcon size={14} /> Image</> : <><Video size={14} /> Video</>}
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
                  onClick={() => toggleComments(item.type, item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                    visibleComments[commentKey]
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-transparent text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <MessageCircle 
                    size={18} 
                    className={visibleComments[commentKey] ? "animate-pulse" : ""}
                  />
                  <span className="font-bold text-base">{item._count.comments}</span>
                  <span className="hidden sm:inline">Comments</span>
                </button>

                <button
                  onClick={(e) => likeMedia(e, isImage ? "images" : "videos", item.id)}
                  disabled={likeLoadingId === likeKey}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                    item.likedByCurrentUser
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-transparent text-gray-600 hover:bg-red-50 hover:text-red-500"
                  }`}
                >
                  <Heart
                    size={18}
                    className={`text-red-500 transition-all ${
                      item.likedByCurrentUser ? "fill-white animate-pulse" : ""
                    }`}
                  />
                  <span className="font-bold text-base text-red-500">{item._count?.likes || 0}</span>
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
  );
}

export default Gallery;