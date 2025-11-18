import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { Heart, MessageSquare, Trash2, Calendar, Image as ImageIcon, Video as VideoIcon, Plus, Upload } from "lucide-react";
import { Toast, ConfirmDialog, useToast, useConfirm } from "../utils/toast-modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Delete from "../delete/delete";
import UploadMedia from "./uploadMedia";

function MediaList({ mediaType }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  const mediaTypePlural = `${mediaType}s`;
  const apiEndpoint = `https://fanhub-server.onrender.com/api/gallery/${mediaTypePlural}/${user?.id}`;

  useEffect(() => {
    if (!user || !user.id) return;
    fetchMedia();
  }, [user]);

  async function fetchMedia() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiEndpoint, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      
      if (response.status === 500) {
        navigate("/error", { 
          state: { message: data.message || "Process failed" } 
        });
        return;
      } else {
        if (!response.ok && response.status !== 500) {
          setError(data.message);
          return;
        }
      }

      setMediaItems(data[mediaTypePlural]);
    } catch (err) {
      navigate("/error", { 
        state: { message: "Network error: Please check your internet connection." } 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMedia(id) {
    setDeletingId(id);
    try {
      const message = await Delete(
        `https://fanhub-server.onrender.com/api/gallery/${mediaTypePlural}/${id}`
      );
      setMediaItems((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
      showToast(message || `${mediaType} deleted successfully`, 'success');
    } catch (err) {
      showToast(`Failed to delete ${mediaType}`, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    fetchMedia(); // Refresh the list
    showToast(`${mediaType} uploaded successfully!`, 'success');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const StatBadge = ({ icon: Icon, value, color }) => (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/50">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-xs font-medium text-theme">{value}</span>
    </div>
  );

  const renderMediaElement = (item) => {
    if (mediaType === "image") {
      return (
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-secondary group-hover:shadow-xl transition-shadow duration-300">
          <img
            src={item.url}
            alt={item.caption}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      );
    } else if (mediaType === "video") {
      return (
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-secondary">
          <video
            src={item.url}
            controls
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
  };

  const MediaIcon = mediaType === "image" ? ImageIcon : VideoIcon;
  const mediaTypeDisplay = mediaType.charAt(0).toUpperCase() + mediaType.slice(1) + 's';

  return (
    <>
      <Toast {...toast} onClose={closeToast} />
      <ConfirmDialog
        {...confirm}
        onClose={closeConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-card-theme border-theme max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-theme">Upload {mediaType === "image" ? "Image" : "Video"}</DialogTitle>
          </DialogHeader>
          <UploadMedia 
            mediaType={mediaType} 
            onSuccess={handleUploadSuccess}
            isModal={true}
          />
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-theme p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">
                My {mediaTypeDisplay}
              </h1>
              <p className="text-sm sm:text-base text-secondary">
                Manage your {mediaTypePlural} gallery
              </p>
            </div>
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="btn flex items-center gap-2"
              aria-label={`Upload ${mediaType}`}
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Upload {mediaType === "image" ? "Image" : "Video"}</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm sm:text-base text-secondary">Loading {mediaTypePlural}...</p>
              </div>
            </div>
          ) : (
            <div>
              {mediaItems && (
                mediaItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {mediaItems.map((item) =>
                      item.collectionId === null && (
                        <div key={item.id} className="card group">
                          {/* Media Element */}
                          {renderMediaElement(item)}

                          {/* Media Info */}
                          <div className="mt-4">
                            {/* Date */}
                            <div className="flex items-center gap-2 mb-3 text-xs text-secondary">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(item.uploadedAt)}</span>
                            </div>

                            {/* Caption */}
                            <p className="text-theme text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                              {item.caption || `No caption for this ${mediaType}`}
                            </p>

                            {/* Statistics */}
                            <div className="flex gap-2 mb-4">
                              <StatBadge 
                                icon={Heart} 
                                value={item._count?.likes || 0} 
                                color="text-red-400"
                              />
                              <StatBadge 
                                icon={MessageSquare} 
                                value={item._count?.comments || 0} 
                                color="text-blue-400"
                              />
                            </div>

                            {/* Delete Button */}
                            <button
                              type="button"
                              disabled={deletingId === item.id}
                              onClick={() => {
                                showConfirm(
                                  `Delete ${mediaType === "image" ? "Image" : "Video"}`,
                                  `Are you sure you want to delete this ${mediaType}? This action cannot be undone.`,
                                  () => handleDeleteMedia(item.id)
                                );
                              }}
                              className="w-full px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                              aria-label={`Delete ${mediaType}`}
                            >
                              {deletingId === item.id ? (
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
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="card text-center py-12 sm:py-20">
                    <MediaIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-secondary opacity-50" />
                    <p className="text-base sm:text-lg text-secondary mb-2">No {mediaTypePlural} yet</p>
                    <p className="text-xs sm:text-sm text-secondary mb-6">Upload your first {mediaType} to get started</p>
                    <Button 
                      onClick={() => setIsUploadOpen(true)}
                      className="btn"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {mediaType === "image" ? "Image" : "Video"}
                    </Button>
                  </div>
                )
              )}
            </div>
          )}
          
          {error && (
            <div className="card bg-destructive/10 border-destructive/30 mt-4 sm:mt-6">
              <p className="text-destructive text-center text-sm sm:text-base">{error}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MediaList;