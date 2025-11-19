import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Eye,
  Heart,
  MessageSquare,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Video as VideoIcon,
  FileImage,
  Library,
  Film
} from "lucide-react";
import Delete from "../delete/delete";
import { Toast, useToast, ConfirmDialog, useConfirm } from "../utils/toast-modal";

function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingType, setDeletingType] = useState(null);
  
  const { toast, showToast, closeToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  useEffect(() => {
    if (collection) {
      setImages(collection.images || []);
      setVideos(collection.videos || []);
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

        setCollection(data.collection);
      } catch (err) {
        navigate("/error", {
          state: {
            message: "Network error: Please check your internet connection.",
          },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [id]);

  async function handleDeleteImage(id) {
    setDeletingId(id);
    setDeletingType("image");
    try {
      await Delete(`https://fanhub-server.onrender.com/api/gallery/images/${id}`);
      setImages((prev) => prev.filter((s) => Number(s.id) !== Number(id)));
      showToast("Image deleted successfully!", "success");
    } catch (err) {
      navigate("/error", {
        state: {
          message: "Network error: Please check your internet connection.",
        },
      });
    } finally {
      setDeletingId(null);
      setDeletingType(null);
    }
  }

  async function handleDeleteVideo(id) {
    setDeletingId(id);
    setDeletingType("video");
    try {
      await Delete(`https://fanhub-server.onrender.com/api/gallery/videos/${id}`);
      setVideos((prev) => prev.filter((s) => Number(s.id) !== Number(id)));
      showToast("Video deleted successfully!", "success");
    } catch (err) {
      navigate("/error", {
        state: {
          message: "Network error: Please check your internet connection.",
        },
      });
    } finally {
      setDeletingId(null);
      setDeletingType(null);
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-theme p-4 sm:p-6">
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
      />
      
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="card bg-destructive/10 border-destructive/30 mb-6">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-secondary text-sm sm:text-base">
                Loading collection...
              </p>
            </div>
          </div>
        ) : (
          collection && (
            <div>
              {/* Header */}
              <div className="card mb-8 p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0 mx-auto lg:mx-0">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden bg-secondary">
                      <img
                        src={collection.img}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                          {collection.name}
                        </h1>
                        <p className="text-secondary text-sm sm:text-base">
                          {collection.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                          collection.status === "PUBLISHED"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {collection.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs sm:text-sm font-medium">
                        {collection.primarygenre}
                      </span>
                      <span className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-xs sm:text-sm font-medium">
                        {collection.secondarygenre}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-secondary mb-2">SUBGENRES</p>
                      <div className="flex flex-wrap gap-2">
                        {collection.primarysubgenre?.map((subgenre, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-secondary rounded-md text-xs text-theme"
                          >
                            {subgenre}
                          </span>
                        ))}
                        {collection.secondarysubgenre?.map((subgenre, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-secondary rounded-md text-xs text-theme"
                          >
                            {subgenre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-secondary rounded-lg text-xs sm:text-sm text-theme">
                        {collection.audience}
                      </span>
                      <span className="px-3 py-1.5 bg-secondary rounded-lg text-xs sm:text-sm text-theme">
                        {collection.age}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-theme">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                      <Eye className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-secondary">Views</p>
                        <p className="text-lg font-bold text-theme">
                          {collection._count.views}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                      <Heart className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-xs text-secondary">Likes</p>
                        <p className="text-lg font-bold text-theme">
                          {collection._count.likes}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-xs text-secondary">Reviews</p>
                        <p className="text-lg font-bold text-theme">
                          {collection._count.review?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                      <Library className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-secondary">Library</p>
                        <p className="text-lg font-bold text-theme">
                          {collection._count.library}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <main className="space-y-8">
                {images.length === 0 && videos.length === 0 ? (
                  <div className="card text-center py-20">
                    <div className="flex gap-4 justify-center mb-4">
                      <FileImage className="w-10 h-10 sm:w-12 sm:h-12 text-secondary opacity-50" />
                      <Film className="w-10 h-10 sm:w-12 sm:h-12 text-secondary opacity-50" />
                    </div>
                    <p className="text-base sm:text-lg text-secondary mb-2">
                      No media yet
                    </p>
                    <p className="text-xs sm:text-sm text-secondary">
                      Upload images or videos to this collection
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Images */}
                    {images.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <ImageIcon className="w-5 h-5 text-primary" />
                          <h2 className="text-lg sm:text-xl font-bold text-theme">
                            Images ({images.length})
                          </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {images.map((image) => (
                            <div key={image.id} className="card group">
                              <div className="relative w-full h-52 sm:h-64 rounded-xl overflow-hidden bg-secondary mb-4">
                                <img
                                  src={image.url}
                                  alt={image.caption}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>

                              <div className="flex items-center justify-between mb-2 text-xs text-secondary">
                                <div className="flex items-center gap-2">
                                  <Heart className="w-3.5 h-3.5 text-red-400" />
                                  <span>{image._count?.likes || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                                  <span>{image._count?.comments || 0}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-2 text-xs text-secondary">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(image.uploadedAt)}</span>
                              </div>

                              <p className="text-theme text-sm mb-3 line-clamp-2">
                                {image.caption || "No caption"}
                              </p>

                              <button
                                type="button"
                                disabled={
                                  deletingType === "image" && deletingId === image.id
                                }
                                onClick={() => {
                                  showConfirm(
                                    "Delete Image",
                                    "Are you sure you want to delete this image? This action cannot be undone.",
                                    () => handleDeleteImage(image.id)
                                  );
                                }}
                                className="w-full px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                              >
                                {deletingType === "image" && deletingId === image.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Videos */}
                    {videos.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <VideoIcon className="w-5 h-5 text-red-400" />
                          <h2 className="text-lg sm:text-xl font-bold text-theme">
                            Videos ({videos.length})
                          </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {videos.map((video) => (
                            <div key={video.id} className="card">
                              <div className="relative w-full h-52 sm:h-64 rounded-xl overflow-hidden bg-secondary mb-4">
                                <video
                                  src={video.url}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex items-center justify-between mb-2 text-xs text-secondary">
                                <div className="flex items-center gap-2">
                                  <Heart className="w-3.5 h-3.5 text-red-400" />
                                  <span>{video._count?.likes || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                                  <span>{video._count?.comments || 0}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-2 text-xs text-secondary">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(video.uploadedAt)}</span>
                              </div>

                              <p className="text-theme text-sm mb-3 line-clamp-2">
                                {video.caption || "No caption"}
                              </p>

                              <button
                                type="button"
                                disabled={
                                  deletingType === "video" && deletingId === video.id
                                }
                                onClick={() => {
                                  showConfirm(
                                    "Delete Video",
                                    "Are you sure you want to delete this video? This action cannot be undone.",
                                    () => handleDeleteVideo(video.id)
                                  );
                                }}
                                className="w-full px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                              >
                                {deletingType === "video" && deletingId === video.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </main>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default CollectionPage;