import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Book, Image as ImageIcon, Trash2, Loader2, Inbox, MessageSquare, Video as VideoIcon, FileText, CheckCircle2, Circle } from "lucide-react";
import { useAuth } from "../auth/authContext";
import Header from "../css/header";
import Footer from "../css/footer";
import { Toast, useToast, ConfirmDialog, useConfirm } from "../utils/toast-modal";
import { CompletionModal } from "../utils/completion-modal";

function Library() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [libraryLoadingId, setLibraryLoadingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  // Completion modal state
  const [completionModal, setCompletionModal] = useState({
    isOpen: false,
    itemName: "",
    itemAuthor: "",
    itemId: null,
    itemType: null // 'story' or 'collection'
  });

  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  
  const { toast, showToast, closeToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    setLoading(true);
    setError("");

    async function fetchLibrary() {
      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/users/library`, {
          method: "GET",
          credentials: "include",
        });
        
        const data = await response.json(); 
        
        if (response.status === 500) {
          navigate("/error", { state: { message: data.message || "Process failed" } });
          return;
        } else {
          if (!response.ok) {
            setError(data.message); 
            return;
          }
        }

        const uniqueLibrary = data.library.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                (t.tweetId && t.tweetId === item.tweetId) ||
                (t.storyId && t.storyId === item.storyId) ||
                (t.collectionId && t.collectionId === item.collectionId)
            )
        );

        setLibrary(uniqueLibrary);
      } catch (err) {
        navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, [navigate]);

  async function addToLibrary(itemId, name, libraryItemId, itemName) {
    setError("");
    setLibraryLoadingId(itemId);

    try {
      const path =
        name === "stories"
          ? `https://fanhub-server.onrender.com/api/stories/${itemId}/readinglist`
          : name === "collections"
          ? `https://fanhub-server.onrender.com/api/gallery/collection/${itemId}/readinglist`
          : name === "tweets"
          ? `https://fanhub-server.onrender.com/api/tweets/${itemId}/library`
          : null;

      const response = await fetch(path, {
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
          showToast(data.message || "Failed to remove from library", "error");
          return;
        }
      }

      setLibrary((prev) => prev.filter((list) => Number(list.id) !== Number(libraryItemId)));
      showToast(`"${itemName}" removed from library`, "success");
    } catch (err) {
      showToast("Failed to remove from library", "error");
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setLibraryLoadingId(null);
    }
  }

  // ✅ NEW: Mark item as complete
  async function markAsComplete(libraryItemId, itemName, itemAuthor, storyId, collectionId) {
    setCompletingId(libraryItemId);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/users/library/${libraryItemId}/complete`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to mark as complete", "error");
        return;
      }

      // Update local state
      setLibrary((prev) =>
        prev.map((item) =>
          item.id === libraryItemId
            ? { ...item, completed: true, completedAt: new Date().toISOString() }
            : item
        )
      );

      // ✅ Use the actual IDs returned from the backend
      const actualStoryId = data.library?.actualStoryId || storyId;
      const actualCollectionId = data.library?.actualCollectionId || collectionId;

      // Show completion modal
      setCompletionModal({
        isOpen: true,
        itemName: data.library?.contentTitle || itemName,
        itemAuthor: data.library?.contentAuthor || itemAuthor,
        itemId: actualStoryId || actualCollectionId,
        itemType: actualStoryId ? "story" : "collection"
      });

    } catch (err) {
      showToast("Failed to mark as complete", "error");
    } finally {
      setCompletingId(null);
    }
  }

  // ✅ NEW: Unmark item as complete
  async function unmarkAsComplete(libraryItemId) {
    setCompletingId(libraryItemId);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/users/library/${libraryItemId}/complete`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to unmark", "error");
        return;
      }

      setLibrary((prev) =>
        prev.map((item) =>
          item.id === libraryItemId
            ? { ...item, completed: false, completedAt: null }
            : item
        )
      );

      showToast("Marked as incomplete", "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setCompletingId(null);
    }
  }

  // ✅ NEW: Handle sharing to tweets
  function handleShareToTweets() {
    setCompletionModal({ ...completionModal, isOpen: false });
    navigate("/create-tweet", {
      state: {
        prefilledContent: `Just finished reading "${completionModal.itemName}"! ${completionModal.itemAuthor ? `by ${completionModal.itemAuthor}` : ""} Highly recommend! 📚✨`,
        contentId: completionModal.itemId,
        contentType: completionModal.itemType
      }
    });
  }

  // ✅ NEW: Handle adding to recommendation list
  function handleAddToRecommendation() {
    setCompletionModal({ ...completionModal, isOpen: false });
    navigate("/dashboard/recommendation list", {
      state: {
        preselectedStory: completionModal.itemId,
        storyName: completionModal.itemName
      }
    });
  }

  const tweets = library?.filter((item) => item.tweetId != null) || [];
  const storiesAndCollections =
    library?.filter((item) => item.primarygenre) || [];

  return (
    <div className="min-h-screen flex flex-col bg-theme">
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={closeToast}
      />
      
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={closeConfirm}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        description={confirm.description}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* ✅ NEW: Completion Modal */}
      <CompletionModal
        isOpen={completionModal.isOpen}
        onClose={() => setCompletionModal({ ...completionModal, isOpen: false })}
        itemName={completionModal.itemName}
        itemAuthor={completionModal.itemAuthor}
        onShareToTweets={handleShareToTweets}
        onAddToRecommendation={handleAddToRecommendation}
      />
      
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="h-20"></div>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-theme flex items-center gap-3">
              <Book className="w-8 h-8 text-[#2563eb]" aria-hidden="true" />
              My Library
            </h1>
            <p className="text-secondary mt-2">Your saved stories, collections, and tweets</p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
              aria-live="polite"
            >
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
              <Loader2 className="w-12 h-12 text-[#2563eb] animate-spin mb-4" aria-hidden="true" />
              <p className="text-secondary text-lg">Loading your library...</p>
            </div>
          )}

          {!loading && library && (
            <>
              {library.length > 0 ? (
                <div className="space-y-12">
                  {storiesAndCollections.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-theme mb-6 flex items-center gap-2">
                        <Book className="w-6 h-6 text-[#2563eb]" aria-hidden="true" />
                        Stories & Collections
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {storiesAndCollections.map((item) => (
                          <article
                            key={item.id}
                            className="card group focus-within:ring-2 focus-within:ring-[#2563eb] focus-within:ring-offset-2"
                          >
                            <div
                              onClick={() => {
                                if (item.storyId) navigate(`/stories/${item.storyId}`);
                                if (item.collectionId) navigate(`/gallery/${item.collectionId}`);
                              }}
                              className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-gray-100 dark:bg-gray-800 cursor-pointer"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  if (item.storyId) navigate(`/stories/${item.storyId}`);
                                  if (item.collectionId) navigate(`/gallery/${item.collectionId}`);
                                }
                              }}
                              aria-label={`View ${item.name}`}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                              
                              {/* ✅ NEW: Completion Badge */}
                              {item.completed && (
                                <div className="absolute top-2 left-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded shadow-lg">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completed
                                  </span>
                                </div>
                              )}
                              
                              <div className="absolute top-2 right-2">
                                {item.storyId !== null ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2563eb] text-white text-xs font-medium rounded">
                                    <Book className="w-3 h-3" aria-hidden="true" />
                                    Story
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
                                    <ImageIcon className="w-3 h-3" aria-hidden="true" />
                                    Collection
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h3
                                onClick={() => {
                                  if (item.storyId) navigate(`/stories/${item.storyId}`);
                                  if (item.collectionId) navigate(`/gallery/${item.collectionId}`);
                                }}
                                className="text-lg font-semibold text-theme line-clamp-2 cursor-pointer hover:text-[#2563eb] transition-colors"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    if (item.storyId) navigate(`/stories/${item.storyId}`);
                                    if (item.collectionId) navigate(`/gallery/${item.collectionId}`);
                                  }
                                }}
                              >
                                {item.name}
                              </h3>

                              {item.description && (
                                <p className="text-secondary text-sm line-clamp-2">{item.description}</p>
                              )}

                              {item.tags && (
                                <div className="flex flex-wrap gap-1">
                                  {item.tags
                                    .split(",")
                                    .slice(0, 3)
                                    .map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded text-secondary"
                                      >
                                        {tag.trim()}
                                      </span>
                                    ))}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs text-secondary">
                                {item.status && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                    {item.status}
                                  </span>
                                )}
                                {item.completedAt ? (
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    ✓ {new Date(item.completedAt).toLocaleDateString()}
                                  </span>
                                ) : item.uploadedAt ? (
                                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                                ) : null}
                              </div>

                              {/* ✅ NEW: Complete/Uncomplete Button */}
                              <div className="pt-2 space-y-2">
                                {!item.completed ? (
                                  <button
                                    disabled={completingId === item.id}
                                    onClick={() => {
                                      const itemType = item.storyId ? "story" : "collection";
                                      const contentId = item.storyId || item.collectionId;
                                      markAsComplete(item.id, item.name, item.description, item.storyId, item.collectionId);
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                    aria-label={`Mark ${item.name} as complete`}
                                  >
                                    {completingId === item.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {completingId === item.id ? "Marking..." : "Mark as Complete"}
                                  </button>
                                ) : (
                                  <button
                                    disabled={completingId === item.id}
                                    onClick={() => unmarkAsComplete(item.id)}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                    aria-label={`Unmark ${item.name} as complete`}
                                  >
                                    {completingId === item.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    ) : (
                                      <Circle className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {completingId === item.id ? "Updating..." : "Mark Incomplete"}
                                  </button>
                                )}

                                {/* Remove Button */}
                                {item.storyId !== null && (
                                  <button
                                    disabled={libraryLoadingId === item.storyId}
                                    onClick={() => {
                                      showConfirm(
                                        "Remove from Library",
                                        `Are you sure you want to remove "${item.name}" from your library?`,
                                        () => addToLibrary(item.storyId, "stories", item.id, item.name)
                                      );
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                    aria-label={`Remove ${item.name} from library`}
                                  >
                                    {libraryLoadingId === item.storyId ? (
                                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {libraryLoadingId === item.storyId ? "Removing..." : "Remove"}
                                  </button>
                                )}

                                {item.collectionId !== null && (
                                  <button
                                    disabled={libraryLoadingId === item.collectionId}
                                    onClick={() => {
                                      showConfirm(
                                        "Remove from Library",
                                        `Are you sure you want to remove "${item.name}" from your library?`,
                                        () => addToLibrary(item.collectionId, "collections", item.id, item.name)
                                      );
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                    aria-label={`Remove ${item.name} from library`}
                                  >
                                    {libraryLoadingId === item.collectionId ? (
                                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                                    )}
                                    {libraryLoadingId === item.collectionId ? "Removing..." : "Remove"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}

                  {tweets.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-theme mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-[#2563eb]" aria-hidden="true" />
                        Saved Tweets
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tweets.map((item) => (
                          <article
                            key={item.id}
                            className="card group focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 overflow-hidden"
                          >
                            {/* Media Preview Section */}
                            {item.media && (
                              <div
                                onClick={() => item.tweetId && navigate(`/tweets/${item.tweetId}`)}
                                className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer mb-4"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    item.tweetId && navigate(`/tweets/${item.tweetId}`);
                                  }
                                }}
                                aria-label={`View tweet: ${item.name}`}
                              >
                                {item.type === "video" ? (
                                  <>
                                    {/* Video Thumbnail */}
                                    <img
                                      src={item.media.replace(/\.[^/.]+$/, '') + '_thumbnail.jpg'} // Try to load thumbnail
                                      alt=""
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      loading="lazy"
                                      onError={(e) => {
                                        // Fallback to placeholder if thumbnail doesn't exist
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="hidden w-full h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                                      <VideoIcon className="w-16 h-16 text-gray-400" aria-hidden="true" />
                                    </div>
                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-[#2563eb] border-b-8 border-b-transparent ml-1"></div>
                                      </div>
                                    </div>
                                    {/* Video Badge */}
                                    <div className="absolute top-2 right-2">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded shadow-lg">
                                        <VideoIcon className="w-3 h-3" aria-hidden="true" />
                                        Video
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Image */}
                                    <img
                                      src={item.media}
                                      alt=""
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      loading="lazy"
                                    />
                                    {/* Image Badge */}
                                    <div className="absolute top-2 right-2">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded shadow-lg">
                                        <ImageIcon className="w-3 h-3" aria-hidden="true" />
                                        Image
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Content Section */}
                            <div
                              onClick={() => item.tweetId && navigate(`/tweets/${item.tweetId}`)}
                              className="cursor-pointer"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  item.tweetId && navigate(`/tweets/${item.tweetId}`);
                                }
                              }}
                              aria-label={`View tweet: ${item.name}`}
                            >
                              {/* Title */}
                              <h3 className="text-lg font-semibold text-theme line-clamp-2 mb-2 group-hover:text-[#2563eb] transition-colors">
                                {item.name}
                              </h3>

                              {/* Description (Quill HTML Content) */}
                              {item.description && (
                                <div 
                                  className="tweet-content text-secondary text-sm line-clamp-3 mb-3"
                                  dangerouslySetInnerHTML={{ __html: item.description }}
                                  style={{
                                    wordBreak: 'break-word',
                                    overflow: 'hidden'
                                  }}
                                />
                              )}

                              {/* Tags */}
                              {item.tags && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {item.tags
                                    .split(",")
                                    .slice(0, 3)
                                    .map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded text-secondary"
                                      >
                                        {tag.trim()}
                                      </span>
                                    ))}
                                </div>
                              )}

                              {/* Date */}
                              {item.uploadedAt && (
                                <p className="text-xs text-secondary">
                                  {new Date(item.uploadedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            {/* Remove Button */}
                            <div className="mt-4">
                              {item.tweetId !== null && (
                                <button
                                  disabled={libraryLoadingId === item.tweetId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showConfirm(
                                      "Remove from Library",
                                      `Are you sure you want to remove "${item.name}" from your library?`,
                                      () => addToLibrary(item.tweetId, "tweets", item.id, item.name)
                                    );
                                  }}
                                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                  aria-label={`Remove tweet: ${item.name} from library`}
                                >
                                  {libraryLoadingId === item.tweetId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                  )}
                                  {libraryLoadingId === item.tweetId ? "Removing..." : "Remove"}
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Inbox className="w-20 h-20 text-gray-300 dark:text-gray-700 mb-4" aria-hidden="true" />
                  <h2 className="text-2xl font-semibold text-theme mb-2">Your library is empty</h2>
                  <p className="text-secondary mb-6 max-w-md">
                    Start adding stories, collections, and tweets to your library to access them quickly later.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button onClick={() => navigate("/homestories")} className="btn">
                      Browse Stories
                    </button>
                    <button
                      onClick={() => navigate("/tweets")}
                      className="px-6 py-3 border-2 border-[#2563eb] text-[#2563eb] rounded-lg font-medium hover:bg-[#2563eb]/10 transition-colors"
                    >
                      Browse Tweets
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Library;